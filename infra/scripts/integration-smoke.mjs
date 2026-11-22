// DESTRUCTIVE TEST: only run against a disposable environment with SEED_DEMO=true.
// Requires a started Docker Compose environment and its generated .env credentials.
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
const env=Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(x=>x&&!x.startsWith('#')&&x.includes('=')).map(x=>[x.split('=')[0],x.slice(x.indexOf('=')+1)]));
if(env.SEED_DEMO!=='true')throw new Error('Refusing to modify non-demo database.');
const API=process.env.SMOKE_API||'http://localhost:8081/v1';
const login=await fetch(`${API}/auth/login`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:env.ADMIN_EMAIL,password:env.ADMIN_PASSWORD})});
if(!login.ok)throw new Error('Login failed '+await login.text());
const cookie=login.headers.get('set-cookie')?.split(';')[0];if(!cookie)throw new Error('No session cookie');
const req=async(path,method='GET',body,idem)=>{
  const res=await fetch(API+path,{method,headers:{cookie,'content-type':'application/json',...(idem?{'Idempotency-Key':idem}:{})},body:body?JSON.stringify(body):undefined});
  return {status:res.status,data:await res.json()};
};
const loc=await req('/staff/locations');const locationId=loc.data[0]?.id;
if(!locationId)throw new Error('No active location');
const prefix=randomUUID().slice(0,8),slug=`test-race-${prefix}`;
const product=await req('/admin/products','POST',{name:'Test Race '+prefix,slug,categoryCode:'PILLOW',description:'Disposable transaction test'});
if(product.status!==201)throw new Error('Product creation failed '+JSON.stringify(product));
const variant=await req(`/admin/products/${product.data.id}/variants`,'POST',{sku:`TEST-${prefix}`,widthMm:500,lengthMm:700,heightMm:120,priceMinor:10000});
if(variant.status!==201)throw new Error('Variant creation failed');
const stock=await req('/staff/inventory/adjustments','POST',{locationId,variantId:variant.data.id,delta:1,reason:'Integration race test'},randomUUID());
if(stock.status!==201)throw new Error('Cannot initialize stock');
const sale={locationId,customerId:null,items:[{variantId:variant.data.id,quantity:1}],payment:{method:'CASH',amountMinor:10000}};
const key=randomUUID();
const [a,b]=await Promise.all([req('/pos/sales','POST',sale,key),req('/pos/sales','POST',sale,randomUUID())]);
if([a.status,b.status].sort().join(',')!=='201,409')throw new Error('Oversell test failed '+JSON.stringify([a,b]));
const first=a.status===201?a:b;
const replay=await req('/pos/sales','POST',sale,key);
if(a.status===201&&replay.data.id!==first.data.id)throw new Error('Idempotency failed');
console.log('PASS: one-of-two concurrent sales, no overselling');
console.log('PASS: idempotent POS replay');
console.log('PASS: disposable product '+slug);
// Online checkout last-unit race against the same disposable variant after a new +1 stock adjustment.
const second=await req(`/admin/products/${product.data.id}/variants`,'POST',{
  sku:`CHECKOUT-${prefix}`,widthMm:400,lengthMm:600,heightMm:100,priceMinor:25000
});
if(second.status!==201)throw new Error('Online test variant creation failed');
await req('/staff/inventory/adjustments','POST',{locationId,variantId:second.data.id,delta:1,reason:'Online concurrency test'},randomUUID());
const online={items:[{variantId:second.data.id,quantity:1}],customer:{fullName:'Integration Test',phone:'0550000000',email:null},shippingAddress:{wilaya:'Blida',city:'Blida',addressLine:'Test street 1'},deliveryMethod:'DELIVERY'};
const checkout=async()=>{const r=await fetch(`${API.replace(/\/v1$/,'')}/v1/checkout/orders`,{method:'POST',headers:{'content-type':'application/json','Idempotency-Key':randomUUID()},body:JSON.stringify(online)});return {status:r.status,data:await r.json()}};
const [c,d]=await Promise.all([checkout(),checkout()]);
if([c.status,d.status].sort().join(',')!=='201,409')throw new Error('Online reservation race failed '+JSON.stringify([c,d]));
const row=(await req(`/staff/inventory?locationId=${locationId}&q=CHECKOUT-${prefix}`)).data.find(x=>x.variant_id===second.data.id);
if(row?.reserved!==1 || row?.available!==0)throw new Error('Reservation ledger mismatch '+JSON.stringify(row));
console.log('PASS: one-of-two online reservations and correct stock allocation');
