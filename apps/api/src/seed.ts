import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
const root=process.cwd();
async function main(){
  const pool=new Pool({connectionString:process.env.DATABASE_URL,max:2});
  const c=await pool.connect();
  try{
    await c.query('BEGIN');
    for(const [code,name] of [['MATTRESS','Mattresses'],['PILLOW','Pillows'],['TOPPER','Toppers']]) await c.query('INSERT INTO categories(code,name) VALUES($1,$2) ON CONFLICT(code) DO NOTHING',[code,name]);
    await c.query("INSERT INTO order_channels(code,name) VALUES('ONLINE','Online store'),('POS','Showroom') ON CONFLICT DO NOTHING");
    await c.query("INSERT INTO locations(code,name,kind) VALUES('EF_MAIN','Empreinte Flex — Main Showroom','SHOWROOM') ON CONFLICT(code) DO NOTHING");
    const email=(process.env.ADMIN_EMAIL||'').trim().toLowerCase();const password=process.env.ADMIN_PASSWORD||'';
    if(!email||password.length<12||password.startsWith('CHANGE_')) throw new Error('Set ADMIN_EMAIL and unique ADMIN_PASSWORD (12+ chars) in .env');
    const hashed=await bcrypt.hash(password,12);
    const user=(await c.query('INSERT INTO users(email,password_hash,display_name,email_verified_at) VALUES($1,$2,$3,now()) ON CONFLICT(email) DO UPDATE SET email=EXCLUDED.email RETURNING id',[email,hashed,process.env.ADMIN_NAME||'System Administrator'])).rows[0];
    await c.query("INSERT INTO user_role_grants(user_id,role) VALUES($1,'COMPANY_ADMIN') ON CONFLICT DO NOTHING",[user.id]);
    if(process.env.SEED_DEMO==='true'){
      const dataDir=[join(root,'data'),join(root,'../../data'),join(root,'/app/data')].find(d=>{try{return readFileSync(join(d,'catalog-demo.json'))!==undefined}catch{return false}});
      if(!dataDir) throw new Error('Demo catalog files missing');
      const catalog=JSON.parse(readFileSync(join(dataDir,'catalog-demo.json'),'utf8')) as any[];
      const manifest=JSON.parse(readFileSync(join(dataDir,'media-manifest.json'),'utf8')) as any[];
      const loc=(await c.query("SELECT id FROM locations WHERE code='EF_MAIN'")).rows[0];
      for(const product of catalog){
        const fields={range:product.range,subcategory:product.subcategory,pricingType:product.pricingType,technicalSpecs:[],whyChoose:[]};
        const prod=(await c.query(`INSERT INTO products(category_id,slug,name,description,name_i18n,description_i18n,storefront_meta,featured)
          SELECT id,$2,$3,$4,$5,$6,$7,$8 FROM categories WHERE code=$1
          ON CONFLICT(slug) DO UPDATE SET slug=EXCLUDED.slug RETURNING id,storefront_meta`,
          [product.categoryCode,product.slug,product.name.fr,product.description.fr,JSON.stringify(product.name),JSON.stringify(product.description),JSON.stringify(fields),true])).rows[0];
        if(prod.storefront_meta?.legacySupabaseId!=null)continue;
        const sizes=product.pricingType==='SIMPLE'?[[500,700,120]]:[[900,1900,product.categoryCode==='TOPPER'?50:220],[1400,1900,product.categoryCode==='TOPPER'?50:220],[1600,2000,product.categoryCode==='TOPPER'?50:220]];
        for(let i=0;i<sizes.length;i++){
          const [w,l,h]=sizes[i];const sku=`${product.slug.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,14)}-${w}-${l}-${h}`;
          const variant=(await c.query(`INSERT INTO product_variants(product_id,sku,width_mm,length_mm,height_mm)
             VALUES($1,$2,$3,$4,$5) ON CONFLICT(sku) DO UPDATE SET sku=EXCLUDED.sku RETURNING id`,[prod.id,sku,w,l,h])).rows[0];
          const amount=Math.round(product.basePriceMinor*(1+i*.35));
          await c.query(`INSERT INTO variant_prices(variant_id,amount_minor) SELECT $1,$2 WHERE NOT EXISTS(SELECT 1 FROM variant_prices WHERE variant_id=$1 AND effective_until IS NULL)`,[variant.id,amount]);
          const inserted=await c.query('INSERT INTO stock_balances(location_id,variant_id,on_hand) VALUES($1,$2,12) ON CONFLICT DO NOTHING RETURNING variant_id',[loc.id,variant.id]);
          if(inserted.rowCount) await c.query(`INSERT INTO stock_movements(location_id,variant_id,event_type,event_id,event_line,delta_on_hand,reason) VALUES($1,$2,'SEED_STOCK',$2,0,12,'Demo stock only')`,[loc.id,variant.id]);
        }
        for(const img of manifest.filter(m=>m.slug===product.slug)){
          const blob=readFileSync(join(dataDir,'product-media',img.file));
          const sha=createHash('sha256').update(blob).digest('hex');
          const asset=(await c.query(`INSERT INTO media_assets(sha256,mime_type,filename,bytes,byte_length) VALUES($1,'image/jpeg',$2,$3,$4)
            ON CONFLICT(sha256) DO UPDATE SET sha256=EXCLUDED.sha256 RETURNING id`,[sha,img.file,blob,blob.length])).rows[0];
          await c.query(`INSERT INTO product_media(product_id,asset_id,r2_key,alt_text,sort_order)
            VALUES($1,$2,$3,$4,$5) ON CONFLICT(r2_key) DO NOTHING`,[prod.id,asset.id,`db://${prod.id}/${img.file}`,img.alt,img.sort]);
        }
      }
    }
    await c.query('COMMIT');console.log('Seeded categories + admin'+(process.env.SEED_DEMO==='true'?' + demo catalog/photos (NOT production pricing)':''));
  } catch(err){await c.query('ROLLBACK');throw err}finally{c.release();await pool.end()}
}
main().catch(e=>{console.error(e);process.exit(1)});
