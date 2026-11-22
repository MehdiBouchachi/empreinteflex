export const BASE='/v1';
export type User={id:string;displayName:string;email:string;roles:{role:string;locationId:string|null}[]};
export type Location={id:string;code:string;name:string;kind:string};
export type Variant={id:string;sku:string;width_mm:number;length_mm:number;height_mm:number|null;amount_minor:number;available:number};
export type Product={id:string;slug:string;name:string;description:string;category:string;starting_price_minor:number|null;image_url:string|null;variants?:Variant[]};
export async function api<T=any>(path:string,options:RequestInit={}):Promise<T>{
  const headers=new Headers(options.headers);
  if(options.body && !(options.body instanceof FormData)) headers.set('Content-Type','application/json');
  const res=await fetch(`${BASE}${path}`,{credentials:'same-origin',...options,headers});
  if(!res.ok){
    const body=await res.json().catch(()=>({}));
    const message=typeof body?.message==='string'?body.message:Array.isArray(body?.message)?body.message.join(', '):`Erreur HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}
export const dzd=(minor:number|string|null|undefined)=>`${new Intl.NumberFormat('fr-DZ',{maximumFractionDigits:2}).format(Number(minor||0)/100)} DA`;
export const post=(path:string,value:any,key?:string)=>api(path,{method:'POST',headers:key?{'Idempotency-Key':key}:undefined,body:JSON.stringify(value)});
export const uid=()=>crypto.randomUUID();
