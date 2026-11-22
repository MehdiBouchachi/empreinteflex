import { getProductsWithDetails } from './products';
export async function getAllThicknesses(){
  const products=await getProductsWithDetails();const values=new Set();
  for(const p of products)for(const d of p.details?.dimensions||[])for(const o of d.options||[])if(o.thickness!=null)values.add(Number(o.thickness));
  return [...values].sort((a,b)=>a-b).map(value=>({id:value,value}));
}
