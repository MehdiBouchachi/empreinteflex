import { backend } from '@/lib/backend';
function status(value){return ({PENDING:'unconfirmed',CONFIRMED:'confirmed',FULFILLED:'delivered',CANCELLED:'cancelled',EXPIRED:'cancelled',RETURNED:'cancelled'})[value]||value?.toLowerCase()||'unconfirmed';}
function normalizeTracked(order,full=false){
 if(!order)return null;
 const customer=order.customer_snapshot||{};
 const items=(order.items||[]).map(i=>({id:i.id||i.sku_snapshot,productId:null,name:i.name_snapshot,
   size:i.configuration_snapshot?.widthMm?`${i.configuration_snapshot.widthMm/10}x${i.configuration_snapshot.lengthMm/10}`:null,
   thickness:i.configuration_snapshot?.heightMm?i.configuration_snapshot.heightMm/10:null,price:Number(i.unit_price_minor||0)/100,
   quantity:i.qty||0,subtotal:Number(i.line_total_minor||0)/100}));
 const names=(customer.fullName||'').trim().split(/\s+/);
 const total=Number(order.total_minor||0)/100;
 return {id:order.id||order.order_number,orderCode:order.order_number,status:status(order.status),createdAt:order.created_at,date:order.created_at,
   customer:customer.fullName?{firstName:names.shift()||'',lastName:names.join(' '),phone:customer.phone,email:customer.email}:null,
   shipping:order.shipping_snapshot?.address||null,payment:{method:'cash_on_delivery',status:order.payment_status},
   total,totalPrice:total,summary:{itemsCount:items.length,totalQuantity:items.reduce((n,i)=>n+i.quantity,0),totalPrice:total,subtotalPrice:total,discountAmount:0,discountPercent:0},items};
}
export async function createOrder(orderData){
 const customer=orderData.customer||{};
 const items=(orderData.items||[]).map(x=>({variantId:x.variantId,quantity:Number(x.quantity)}));
 if(!items.length||items.some(i=>!i.variantId||!Number.isInteger(i.quantity)||i.quantity<=0))throw new Error('Product variant selection required');
 const payload={customer:{fullName:[customer.firstName,customer.lastName].filter(Boolean).join(' '),email:customer.email||null,phone:customer.phone},
   shippingAddress:{wilaya:orderData.shipping?.wilaya,city:orderData.shipping?.city||'-',addressLine:orderData.shipping?.street||'Showroom delivery address to confirm'},
   deliveryMethod:'DELIVERY',items};
 const result=await backend('/v1/checkout/orders',{method:'POST',headers:{'content-type':'application/json','idempotency-key':orderData.idempotencyKey},body:JSON.stringify(payload)});
 return {success:true,orderCode:result.orderNumber,trackingToken:result.trackingToken,orderId:result.id};
}
export async function findOrderByCode(code,phone){
 if(!phone)return null;
 try{return normalizeTracked(await backend(`/v1/track-by-code/${encodeURIComponent(code)}?phone=${encodeURIComponent(phone)}`))}catch(e){if(e.status===404)return null;throw e}
}
export async function getOrderByCode(code,trackingToken){
 if(!trackingToken)return null;
 try{const order=await backend(`/v1/track/${encodeURIComponent(trackingToken)}`);return order.order_number===code?normalizeTracked(order,true):null}catch(e){if(e.status===404)return null;throw e}
}
export async function getOrder(code,token){return getOrderByCode(code,token)};
export async function getOrders(){return []; /* no public unrestricted order list */}
