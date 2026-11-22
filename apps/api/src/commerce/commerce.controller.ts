import { Controller, Get, Post, Req, Body, Param, Query, Headers, UseGuards, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PoolClient } from 'pg';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { Database } from '../db/database';
import { AuthService, Identity } from '../auth/auth.service';
import { SessionGuard } from '../auth/session.guard';
import { withIdempotency } from '../platform/idempotency';
import { stockForVariants, changeStock } from '../platform/stock';
import { assertPositiveItems, digest, orderNumber, priceMinor, qty, safeMoney, token, uuid, validate } from '../platform/utils';

const line=z.object({variantId:uuid,quantity:qty});
const cart=z.array(line).min(1).max(30);
const posSchema=z.object({locationId:uuid,customerId:uuid.nullable().optional(),items:cart,payment:z.object({method:z.literal('CASH'),amountMinor:priceMinor})});
const checkoutSchema=z.object({items:cart,customer:z.object({fullName:z.string().min(2).max(120),email:z.string().email().nullable().optional(),phone:z.string().min(5).max(40)}),shippingAddress:z.object({wilaya:z.string().min(2).max(100),city:z.string().min(2).max(100),addressLine:z.string().min(5).max(240)}).nullable().optional(),deliveryMethod:z.enum(['DELIVERY','PICKUP'])});
const allowedRoles=['SELLER','LOCATION_MANAGER','COMPANY_ADMIN'];

async function itemsWithPrice(c:PoolClient, items:z.infer<typeof cart>) {
  assertPositiveItems(items);
  const map=await stockForVariants(c,items.map(i=>i.variantId));
  const sorted=[...items].sort((a,b)=>a.variantId.localeCompare(b.variantId));
  return sorted.map(x=>{
    const row=map.get(x.variantId);
    if(!row) throw new ConflictException('Product variant is not available');
    const unit=safeMoney(row.amount_minor);
    const total=unit*x.quantity;
    if(!Number.isSafeInteger(total)) throw new BadRequestException('Amount exceeds supported range');
    return { ...x, sku:row.sku as string, name:row.name as string, unitPriceMinor:unit, lineTotalMinor:total,
      configuration:{widthMm:row.width_mm,lengthMm:row.length_mm,heightMm:row.height_mm,attributes:row.attributes} };
  });
}
async function writeItems(c:PoolClient, orderId:string, items:Awaited<ReturnType<typeof itemsWithPrice>>) {
  const rows: { id:string;variantId:string;quantity:number }[]=[];
  for(const line of items){
    const r=(await c.query(`INSERT INTO order_items(order_id,variant_id,sku_snapshot,name_snapshot,configuration_snapshot,qty,unit_price_minor,line_total_minor)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,[orderId,line.variantId,line.sku,line.name,JSON.stringify(line.configuration),line.quantity,line.unitPriceMinor,line.lineTotalMinor])).rows[0];
    rows.push({id:r.id,variantId:line.variantId,quantity:line.quantity});
  }
  return rows;
}
async function outbox(c:PoolClient,event:string,orderId:string,data:any){
  await c.query('INSERT INTO outbox_events(event_type,aggregate_id,payload) VALUES($1,$2,$3)',[event,orderId,JSON.stringify(data)]);
}
async function audit(c:PoolClient,actorId:string|null,locationId:string|null,action:string,orderId:string,metadata:any={}){
  await c.query('INSERT INTO audit_logs(actor_id,location_id,action,subject_type,subject_id,metadata) VALUES($1,$2,$3,\'order\',$4,$5)',[actorId,locationId,action,orderId,JSON.stringify(metadata)]);
}
async function orderDetail(c:PoolClient,orderId:string){
  const order=(await c.query('SELECT * FROM orders WHERE id=$1',[orderId])).rows[0];
  if(!order) throw new NotFoundException('Order not found');
  const lines=(await c.query('SELECT id,sku_snapshot,name_snapshot,configuration_snapshot,qty,unit_price_minor,line_total_minor FROM order_items WHERE order_id=$1 ORDER BY id',[orderId])).rows;
  return {...order,total_minor:Number(order.total_minor),items:lines.map(l=>({...l,unit_price_minor:Number(l.unit_price_minor),line_total_minor:Number(l.line_total_minor)}))};
}

@Controller('v1/pos') @UseGuards(SessionGuard)
export class PosController {
  constructor(private db:Database,private auth:AuthService){}
  @Post('sales') async sell(@Req() req:Request,@Body() body:unknown,@Headers('idempotency-key') key:string){
    const b=validate(posSchema,body);const u:Identity=(req as any).identity;
    this.auth.require(u,allowedRoles,b.locationId);
    return this.db.tx(async c=>withIdempotency(c,`pos:${u.id}`,key,b,async()=>{
      const location=(await c.query('SELECT id FROM locations WHERE id=$1 AND active AND kind=\'SHOWROOM\'',[b.locationId])).rows[0];
      if(!location) throw new NotFoundException('Active showroom not found');
      if(b.customerId){
        const admin=this.auth.can(u,['COMPANY_ADMIN']);
        const customer=await c.query(`SELECT id FROM customers WHERE id=$1 AND ($2::boolean OR created_location_id=$3 OR EXISTS(
          SELECT 1 FROM orders WHERE customer_id=$1 AND sales_location_id=$3))`,[b.customerId,admin,b.locationId]);
        if(!customer.rowCount) throw new ForbiddenException('Customer unavailable at this location');
      }
      const lines=await itemsWithPrice(c,b.items);
      const total=lines.reduce((sum,l)=>sum+l.lineTotalMinor,0);
      if(!Number.isSafeInteger(total)) throw new BadRequestException('Order exceeds safe amount');
      if(b.payment.amountMinor<total) throw new BadRequestException('Cash tender is below total');
      const number=orderNumber();
      const order=(await c.query(`INSERT INTO orders(order_number,channel_code,status,payment_status,customer_id,created_by,sales_location_id,customer_snapshot,total_minor)
        VALUES($1,'POS','FULFILLED','PAID',$2,$3,$4,$5,$6) RETURNING id`,[number,b.customerId??null,u.id,b.locationId,JSON.stringify({walkIn:!b.customerId}),total])).rows[0];
      const orderLines=await writeItems(c,order.id,lines);
      for(let i=0;i<orderLines.length;i++){
        const l=orderLines[i];
        await changeStock(c,{locationId:b.locationId,variantId:l.variantId,onHand:-l.quantity,reserved:0,eventType:'POS_SALE',eventId:order.id,eventLine:i,actorId:u.id});
      }
      await c.query(`INSERT INTO payments(order_id,method,state,amount_minor) VALUES($1,'CASH','CONFIRMED',$2)`,[order.id,total]);
      const fulfillment=(await c.query(`INSERT INTO fulfillments(order_id,source_location_id,status,method) VALUES($1,$2,'FULFILLED','PICKUP') RETURNING id`,[order.id,b.locationId])).rows[0];
      for(const l of orderLines) await c.query('INSERT INTO fulfillment_items(fulfillment_id,order_item_id,quantity) VALUES($1,$2,$3)',[fulfillment.id,l.id,l.quantity]);
      await audit(c,u.id,b.locationId,'POS_SALE',order.id);
      await outbox(c,'order.pos',order.id,{number,total,customerId:b.customerId??null});
      return {id:order.id,orderNumber:number,status:'FULFILLED',paymentStatus:'PAID',totalMinor:total,cashTenderedMinor:b.payment.amountMinor,changeMinor:b.payment.amountMinor-total,currency:'DZD',items:lines};
    }));
  }
}
@Controller('v1/checkout')
export class CheckoutController {
  constructor(private db:Database,private auth:AuthService){}
  @Post('orders') async place(@Req() req:Request,@Body() body:unknown,@Headers('idempotency-key') key:string){
    const b=validate(checkoutSchema,body);
    if(b.deliveryMethod==='DELIVERY'&&!b.shippingAddress) throw new BadRequestException('Delivery address required');
    const u=await this.auth.identity(req).catch(()=>null);
    return this.db.tx(async c=>withIdempotency(c,`checkout:${u?.id??'guest'}`,key,b,async()=>{
      const lines=await itemsWithPrice(c,b.items);
      const total=lines.reduce((sum,l)=>sum+l.lineTotalMinor,0);
      if(!Number.isSafeInteger(total)) throw new BadRequestException('Order exceeds safe amount');
      // MVP: fulfill a complete online order from ONE location, preferably warehouse.
      // A future allocation policy can distribute its order lines over several locations.
      const candidates=(await c.query("SELECT id FROM locations WHERE active ORDER BY (kind='WAREHOUSE') DESC,name")).rows;
      let locationId:string|null=null;
      for(const candidate of candidates){
        const stock=(await c.query('SELECT variant_id,on_hand-reserved available FROM stock_balances WHERE location_id=$1 AND variant_id=ANY($2::uuid[])',[candidate.id,lines.map(l=>l.variantId)])).rows;
        const m=new Map(stock.map(x=>[x.variant_id,Number(x.available)]));
        if(lines.every(l=>(m.get(l.variantId)??0)>=l.quantity)){locationId=candidate.id;break;}
      }
      if(!locationId) throw new ConflictException('Requested combination is out of stock');
      let customerId:string;
      if(u?.customerId){ customerId=u.customerId; }
      else {
        customerId=(await c.query('INSERT INTO customers(full_name,email,phone) VALUES($1,$2,$3) RETURNING id',[b.customer.fullName,b.customer.email??null,b.customer.phone])).rows[0].id;
      }
      const tracking=token();const number=orderNumber();
      const order=(await c.query(`INSERT INTO orders(order_number,channel_code,status,payment_status,customer_id,customer_snapshot,shipping_snapshot,total_minor,tracking_token_hash)
        VALUES($1,'ONLINE','PENDING','UNPAID',$2,$3,$4,$5,$6) RETURNING id`,[number,customerId,JSON.stringify(b.customer),JSON.stringify({method:b.deliveryMethod,address:b.shippingAddress??null}),total,digest(tracking)])).rows[0];
      const orderLines=await writeItems(c,order.id,lines);
      for(let i=0;i<orderLines.length;i++){
        const l=orderLines[i];
        await changeStock(c,{locationId,variantId:l.variantId,onHand:0,reserved:l.quantity,eventType:'ONLINE_RESERVE',eventId:order.id,eventLine:i});
        await c.query(`INSERT INTO stock_reservations(order_item_id,location_id,variant_id,quantity,state,expires_at)
          VALUES($1,$2,$3,$4,'ACTIVE',now()+($5::integer*interval '1 hour'))`,[l.id,locationId,l.variantId,l.quantity,Math.min(168,Math.max(1,Number(process.env.RESERVATION_TTL_HOURS||24)))]);
      }
      await audit(c,u?.id??null,null,'ONLINE_ORDER',order.id);
      await outbox(c,'order.placed',order.id,{number,email:b.customer.email??null});
      // Tracking token only returned to the placing browser, never exposed on staff list.
      return {id:order.id,orderNumber:number,trackingToken:tracking,status:'PENDING',paymentStatus:'UNPAID',totalMinor:total,currency:'DZD',paymentMethod:'PAY_ON_DELIVERY'};
    }));
  }
}
@Controller('v1')
export class CustomerOrdersController {
  constructor(private db:Database){}
  @Get('track-by-code/:number') async trackCode(@Param('number') number:string,@Query('phone') phone:string){
    if(!/^[A-Z0-9-]{6,45}$/i.test(number)||!phone||phone.length<7||phone.length>40) throw new NotFoundException();
    const row=(await this.db.query(`SELECT o.order_number,o.status,o.payment_status,o.total_minor,o.created_at
      FROM orders o WHERE o.order_number=$1 AND regexp_replace(COALESCE(o.customer_snapshot->>'phone',''),'[^0-9]','','g')
      =regexp_replace($2,'[^0-9]','','g') AND char_length(regexp_replace($2,'[^0-9]','','g'))>=9`,[number,phone])).rows[0];
    if(!row) throw new NotFoundException();
    return {order_number:row.order_number,status:row.status,payment_status:row.payment_status,
      total_minor:Number(row.total_minor),created_at:row.created_at,items:[]};
  }
  @Get('track/:token') async track(@Param('token') code:string){
    if(!/^[a-zA-Z0-9_-]{40,60}$/.test(code)) throw new NotFoundException();
    const order=(await this.db.query('SELECT id FROM orders WHERE tracking_token_hash=$1',[digest(code)])).rows[0];
    if(!order) throw new NotFoundException();
    const data=await this.db.tx(c=>orderDetail(c,order.id));
    // Public tracking only exposes the minimal fields required for status display.
    return {order_number:data.order_number,status:data.status,payment_status:data.payment_status,
      total_minor:data.total_minor,currency:data.currency,created_at:data.created_at,
      customer_snapshot:data.customer_snapshot,shipping_snapshot:data.shipping_snapshot,
      items:data.items.map((l:any)=>({sku_snapshot:l.sku_snapshot,name_snapshot:l.name_snapshot,qty:l.qty,line_total_minor:l.line_total_minor,unit_price_minor:l.unit_price_minor,configuration_snapshot:l.configuration_snapshot}))};
  }
}
@Controller('v1/me') @UseGuards(SessionGuard)
export class MyOrdersController {
  constructor(private db:Database,private auth:AuthService){}
  @Get('orders') async list(@Req() req:Request){
    const u:Identity=(req as any).identity;
    this.auth.require(u,['CUSTOMER']);
    if(!u.customerId) return [];
    const rows=await this.db.query(`SELECT id,order_number,status,payment_status,total_minor,created_at FROM orders
      WHERE customer_id=$1 ORDER BY created_at DESC LIMIT 100`,[u.customerId]);
    return rows.rows.map(x=>({...x,total_minor:Number(x.total_minor)}));
  }
  @Get('orders/:id') async detail(@Req() req:Request,@Param('id') id:string){
    const u:Identity=(req as any).identity;this.auth.require(u,['CUSTOMER']);validate(uuid,id);
    const owns=await this.db.query('SELECT id FROM orders WHERE id=$1 AND customer_id=$2',[id,u.customerId??null]);
    if(!owns.rowCount) throw new NotFoundException();
    return this.db.tx(c=>orderDetail(c,id));
  }
}
@Controller('v1/staff/orders') @UseGuards(SessionGuard)
export class StaffOrdersController {
  constructor(private db:Database,private auth:AuthService){}
  private permitted(u:Identity,order:any):boolean{
    if(this.auth.can(u,['COMPANY_ADMIN'])) return true;
    const locs=u.roles.filter(x=>allowedRoles.includes(x.role)&&x.locationId).map(x=>x.locationId);
    return locs.includes(order.sales_location_id)||locs.includes(order.stock_location_id);
  }
  @Get() async list(@Req() req:Request,@Query('status') status='') {
    const u:Identity=(req as any).identity;this.auth.require(u,allowedRoles);
    const all=this.auth.can(u,['COMPANY_ADMIN']);
    const locs=u.roles.filter(x=>allowedRoles.includes(x.role)&&x.locationId).map(x=>x.locationId);
    return (await this.db.query(`SELECT o.id,o.order_number,o.channel_code,o.status,o.payment_status,o.total_minor,o.created_at,o.sales_location_id,
      (SELECT sr.location_id FROM stock_reservations sr JOIN order_items oi ON oi.id=sr.order_item_id WHERE oi.order_id=o.id LIMIT 1) stock_location_id
      FROM orders o WHERE ($1='' OR o.status=$1) AND ($2::boolean OR o.sales_location_id=ANY($3::uuid[]) OR EXISTS(
        SELECT 1 FROM order_items oi JOIN stock_reservations r ON r.order_item_id=oi.id WHERE oi.order_id=o.id AND r.location_id=ANY($3::uuid[])))
      ORDER BY o.created_at DESC LIMIT 100`,[status,all,locs])).rows.map(x=>({...x,total_minor:Number(x.total_minor)}));
  }
  private async locked(c:PoolClient,id:string,u:Identity){
    const row=(await c.query(`SELECT o.*,(SELECT sr.location_id FROM stock_reservations sr JOIN order_items oi ON oi.id=sr.order_item_id WHERE oi.order_id=o.id LIMIT 1) stock_location_id
      FROM orders o WHERE o.id=$1 FOR UPDATE OF o`,[id])).rows[0];
    if(!row || !this.permitted(u,row)) throw new NotFoundException();
    return row;
  }
  @Get(':id') async detail(@Req() req:Request,@Param('id') id:string){
    validate(uuid,id);const u:Identity=(req as any).identity;this.auth.require(u,allowedRoles);
    return this.db.tx(async c=>{await this.locked(c,id,u);return orderDetail(c,id);});
  }
  @Post(':id/confirm') async confirm(@Req() req:Request,@Param('id') id:string){
    validate(uuid,id);const u:Identity=(req as any).identity;this.auth.require(u,allowedRoles);
    return this.db.tx(async c=>{
      const order=await this.locked(c,id,u);
      if(order.status!=='PENDING') throw new ConflictException('Only pending orders can be confirmed');
      await c.query("UPDATE orders SET status='CONFIRMED',updated_at=now() WHERE id=$1",[id]);
      // Staff confirmation turns the stock hold into a long-lived reservation.
      await c.query(`UPDATE stock_reservations r SET expires_at=NULL FROM order_items oi WHERE r.order_item_id=oi.id AND oi.order_id=$1 AND r.state='ACTIVE'`,[id]);
      await audit(c,u.id,order.stock_location_id,'ORDER_CONFIRMED',id);
      await outbox(c,'order.confirmed',id,{number:order.order_number,email:order.customer_snapshot?.email});
      return {ok:true,status:'CONFIRMED'};
    });
  }
  @Post(':id/cancel') async cancel(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){
    validate(uuid,id);const b=validate(z.object({reason:z.string().min(3).max(250)}),body);
    const u:Identity=(req as any).identity;this.auth.require(u,allowedRoles);
    return this.db.tx(async c=>{
      const order=await this.locked(c,id,u);
      if(!['PENDING','CONFIRMED'].includes(order.status)) throw new ConflictException('Order cannot be cancelled');
      const reservations=(await c.query(`SELECT r.* FROM stock_reservations r JOIN order_items oi ON oi.id=r.order_item_id
        WHERE oi.order_id=$1 AND r.state='ACTIVE' ORDER BY r.location_id,r.variant_id FOR UPDATE OF r`,[id])).rows;
      for(let i=0;i<reservations.length;i++){
        const r=reservations[i];
        await changeStock(c,{locationId:r.location_id,variantId:r.variant_id,onHand:0,reserved:-r.quantity,eventType:'CANCEL_RELEASE',eventId:id,eventLine:i,actorId:u.id,reason:b.reason});
        await c.query("UPDATE stock_reservations SET state='RELEASED' WHERE id=$1",[r.id]);
      }
      await c.query("UPDATE orders SET status='CANCELLED',updated_at=now() WHERE id=$1",[id]);
      await audit(c,u.id,order.stock_location_id,'ORDER_CANCELLED',id,{reason:b.reason});
      return {ok:true,status:'CANCELLED'};
    });
  }
  @Post(':id/fulfill') async fulfill(@Req() req:Request,@Param('id') id:string){
    validate(uuid,id);const u:Identity=(req as any).identity;this.auth.require(u,allowedRoles);
    return this.db.tx(async c=>{
      const order=await this.locked(c,id,u);
      if(order.status!=='CONFIRMED') throw new ConflictException('Confirm online order before fulfillment');
      const reservations=(await c.query(`SELECT r.* FROM stock_reservations r JOIN order_items oi ON oi.id=r.order_item_id
        WHERE oi.order_id=$1 AND r.state='ACTIVE' ORDER BY r.location_id,r.variant_id FOR UPDATE OF r`,[id])).rows;
      if(!reservations.length) throw new ConflictException('No active stock reservation');
      const groups=new Map<string,string>();
      for(let i=0;i<reservations.length;i++){
        const r=reservations[i];
        this.auth.require(u,allowedRoles,r.location_id);
        await changeStock(c,{locationId:r.location_id,variantId:r.variant_id,onHand:-r.quantity,reserved:-r.quantity,eventType:'ONLINE_FULFILL',eventId:id,eventLine:i,actorId:u.id});
        await c.query("UPDATE stock_reservations SET state='CONSUMED' WHERE id=$1",[r.id]);
        let fulfillmentId=groups.get(r.location_id);
        if(!fulfillmentId){
          fulfillmentId=(await c.query(`INSERT INTO fulfillments(order_id,source_location_id,status,method)
            VALUES($1,$2,'FULFILLED',$3) RETURNING id`,[id,r.location_id,order.shipping_snapshot?.method==='PICKUP'?'PICKUP':'DELIVERY'])).rows[0].id;
          groups.set(r.location_id,fulfillmentId!);
        }
        await c.query('INSERT INTO fulfillment_items(fulfillment_id,order_item_id,quantity) VALUES($1,$2,$3)',[fulfillmentId,r.order_item_id,r.quantity]);
      }
      await c.query("UPDATE orders SET status='FULFILLED',updated_at=now() WHERE id=$1",[id]);
      await audit(c,u.id,order.stock_location_id,'ORDER_FULFILLED',id);
      await outbox(c,'order.fulfilled',id,{number:order.order_number,email:order.customer_snapshot?.email});
      return {ok:true,status:'FULFILLED'};
    });
  }
  @Post(':id/collect-payment') async collectPayment(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){
    validate(uuid,id);const b=validate(z.object({method:z.literal('CASH'),amountMinor:priceMinor}),body);
    const u:Identity=(req as any).identity;this.auth.require(u,allowedRoles);
    return this.db.tx(async c=>{
      const order=await this.locked(c,id,u);
      if(order.payment_status!=='UNPAID'||order.channel_code!=='ONLINE'||!['CONFIRMED','FULFILLED'].includes(order.status)) throw new ConflictException('Payment cannot be collected');
      if(b.amountMinor<Number(order.total_minor)) throw new BadRequestException('Cash tender below order total');
      await c.query("INSERT INTO payments(order_id,method,state,amount_minor) VALUES($1,'CASH','CONFIRMED',$2)",[id,order.total_minor]);
      await c.query("UPDATE orders SET payment_status='PAID',updated_at=now() WHERE id=$1",[id]);
      await audit(c,u.id,order.stock_location_id,'PAYMENT_COLLECTED',id);
      return {ok:true,paymentStatus:'PAID',changeMinor:b.amountMinor-Number(order.total_minor)};
    });
  }
  @Post(':id/refund') async refund(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){
    validate(uuid,id);const b=validate(z.object({reason:z.string().min(5).max(300),restock:z.boolean().default(false)}),body);
    const u:Identity=(req as any).identity;this.auth.require(u,['LOCATION_MANAGER','COMPANY_ADMIN']);
    return this.db.tx(async c=>{
      const order=await this.locked(c,id,u);
      if(order.status!=='FULFILLED'||order.payment_status!=='PAID') throw new ConflictException('Only fully paid and fulfilled sales can be returned');
      // Only CASH payments are supported in MVP. External card payments require a verified provider refund adapter.
      const payments=(await c.query("SELECT id,method,state FROM payments WHERE order_id=$1 AND state='CONFIRMED' FOR UPDATE",[id])).rows;
      if(payments.length!==1||payments[0].method!=='CASH') throw new ConflictException('Automated refund not available for this payment method');
      const fulfillment=(await c.query('SELECT source_location_id FROM fulfillments WHERE order_id=$1 LIMIT 1',[id])).rows[0];
      if(!fulfillment) throw new ConflictException('No recorded fulfillment');
      this.auth.require(u,['LOCATION_MANAGER','COMPANY_ADMIN'],fulfillment.source_location_id);
      if(b.restock){
        const items=(await c.query('SELECT id,variant_id,qty FROM order_items WHERE order_id=$1 ORDER BY id',[id])).rows;
        for(let i=0;i<items.length;i++){
          const item=items[i];
          if(!item.variant_id) throw new ConflictException('Cannot restock removed SKU');
          await changeStock(c,{locationId:fulfillment.source_location_id,variantId:item.variant_id,onHand:item.qty,reserved:0,eventType:'RETURN_RESTOCK',eventId:id,eventLine:i,actorId:u.id,reason:b.reason});
        }
      }
      await c.query(`INSERT INTO refunds(order_id,amount_minor,method,reason,processed_by)
        VALUES($1,$2,'CASH',$3,$4)`,[id,order.total_minor,b.reason,u.id]);
      await c.query("UPDATE payments SET state='REFUNDED' WHERE id=$1",[payments[0].id]);
      await c.query("UPDATE orders SET status='RETURNED',payment_status='REFUNDED',updated_at=now() WHERE id=$1",[id]);
      await audit(c,u.id,fulfillment.source_location_id,'CASH_RETURN',id,{reason:b.reason,restock:b.restock});
      return {ok:true,status:'RETURNED',paymentStatus:'REFUNDED',cashRefundMinor:Number(order.total_minor)};
    });
  }
}
