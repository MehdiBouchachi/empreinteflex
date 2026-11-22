import { Pool } from 'pg';
import nodemailer from 'nodemailer';
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:3,application_name:'empreinteflex-worker'});
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
let running=true;
process.on('SIGTERM',()=>{running=false});process.on('SIGINT',()=>{running=false});
async function expireReservations(){
  // One short transaction per order. Lock order before its reservations, same order as API.
  const ids=(await pool.query(`SELECT DISTINCT oi.order_id id FROM stock_reservations r
    JOIN order_items oi ON oi.id=r.order_item_id JOIN orders o ON o.id=oi.order_id
    WHERE r.state='ACTIVE' AND r.expires_at IS NOT NULL AND r.expires_at<now()
      AND o.status='PENDING' LIMIT 20`)).rows;
  for(const {id} of ids){
    const c=await pool.connect();
    try{
      await c.query('BEGIN');
      const o=(await c.query('SELECT status FROM orders WHERE id=$1 FOR UPDATE',[id])).rows[0];
      if(o?.status==='PENDING'){
        const rs=(await c.query(`SELECT r.* FROM stock_reservations r JOIN order_items oi ON oi.id=r.order_item_id
          WHERE oi.order_id=$1 AND r.state='ACTIVE' AND r.expires_at<now() ORDER BY r.location_id,r.variant_id FOR UPDATE OF r`,[id])).rows;
        if(rs.length){
          // Never expire if the order has already started payment processing (none in this cash-on-delivery MVP).
          const all=(await c.query(`SELECT COUNT(*)::int cnt FROM stock_reservations r JOIN order_items oi ON oi.id=r.order_item_id WHERE oi.order_id=$1 AND r.state='ACTIVE'`,[id])).rows[0];
          if(all.cnt!==rs.length){await c.query('ROLLBACK');continue;}
          for(let i=0;i<rs.length;i++){
            const r=rs[i];
            const updated=await c.query(`UPDATE stock_balances SET reserved=reserved-$3,updated_at=now() WHERE location_id=$1 AND variant_id=$2 AND reserved >= $3`,[r.location_id,r.variant_id,r.quantity]);
            if(!updated.rowCount) throw new Error('Stock reservation mismatch');
            await c.query(`INSERT INTO stock_movements(location_id,variant_id,event_type,event_id,event_line,delta_reserved)
              VALUES($1,$2,'RESERVATION_EXPIRED',$3,$4,$5)`,[r.location_id,r.variant_id,id,i,-r.quantity]);
            await c.query("UPDATE stock_reservations SET state='RELEASED' WHERE id=$1",[r.id]);
          }
          await c.query("UPDATE orders SET status='EXPIRED',updated_at=now() WHERE id=$1",[id]);
        }
      }
      await c.query('COMMIT');
    } catch(e){await c.query('ROLLBACK');console.error('Reservation expiry error',id,e);}
    finally{c.release();}
  }
}
async function sendOutbox(){
  const c=await pool.connect();
  let events:any[]=[];
  try{
    await c.query('BEGIN');
    events=(await c.query(`SELECT * FROM outbox_events WHERE state IN ('PENDING','RETRY','PROCESSING') AND next_attempt_at<=now()
      AND (locked_until IS NULL OR locked_until<now()) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 10`)).rows;
    for(const e of events) await c.query("UPDATE outbox_events SET state='PROCESSING',locked_until=now()+interval '2 minutes',attempts=attempts+1 WHERE id=$1",[e.id]);
    await c.query('COMMIT');
  } catch(err){await c.query('ROLLBACK');throw err;}finally{c.release();}
  for(const e of events){
    try{
      let address=e.payload?.email;
      if(!address && e.payload?.customerId){
        address=(await pool.query('SELECT email FROM customers WHERE id=$1',[e.payload.customerId])).rows[0]?.email;
      }
      let state='SENT';
      if(!address){state='SKIPPED';}
      else if(!process.env.SMTP_HOST){state='BLOCKED';console.warn('SMTP not configured; notification blocked for event',e.id);}
      else {
        const smtp=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined});
        await smtp.sendMail({from:process.env.SMTP_FROM,to:address,
          subject:e.event_type==='contact.submitted'?`Empreinte Flex · Contact: ${e.payload.sender}`:`Empreinte Flex · ${e.event_type}`,
          replyTo:e.event_type==='contact.submitted'?e.payload.replyTo:undefined,
          text:e.event_type==='contact.submitted'?`Contact: ${e.payload.sender} (${e.payload.replyTo})\n\n${e.payload.message}`:`Votre commande ${e.payload?.number||''} a été mise à jour. Contactez Empreinte Flex pour toute question.`});
      }
      await pool.query('UPDATE outbox_events SET state=$2,locked_until=NULL WHERE id=$1',[e.id,state]);
    }catch(err){
      console.error('Outbox processing failed',e.id,err);
      await pool.query(`UPDATE outbox_events SET state=CASE WHEN attempts>=8 THEN 'FAILED' ELSE 'RETRY' END,
        next_attempt_at=now()+make_interval(mins=>LEAST(120,POWER(2,LEAST(attempts,7))::int)),locked_until=NULL WHERE id=$1`,[e.id]);
    }
  }
}
async function main(){
  while(running){
    try{await expireReservations();await sendOutbox();}
    catch(err){console.error('Worker tick failed',err);}
    await pause(15000);
  }
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1)});
