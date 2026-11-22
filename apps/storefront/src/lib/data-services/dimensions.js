import { getProductsWithDetails } from './products';
export async function getAllDimensions(){
  const products=await getProductsWithDetails();const values=new Set();
  for(const p of products)for(const d of p.details?.dimensions||[])values.add(d.size);
  return [...values].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).map(label=>({id:label,label}));
}
