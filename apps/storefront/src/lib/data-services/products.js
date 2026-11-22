import { backend } from '@/lib/backend';
const LOCALES=['fr','en','ar'];
async function all(locale='fr'){
  const lang=LOCALES.includes(locale)?locale:'fr';
  return backend(`/v1/catalog/storefront?locale=${lang}`);
}
function matches(product,filter){
  if(filter.featured!=null && Boolean(product.featured)!==Boolean(filter.featured)) return false;
  if(filter.available!=null && Boolean(product.available)!==Boolean(filter.available)) return false;
  if(filter.category && product.category!==filter.category) return false;
  if(filter.subcategory && product.subcategory!==filter.subcategory) return false;
  return true;
}
export async function getProducts(filters={},locale='fr'){
  return (await all(locale)).filter(p=>matches(p,filters));
}
export async function getProductsWithDetails(filters={},locale='fr'){
  return (await all(locale)).filter(p=>matches(p,filters)).sort((a,b)=>(b.minPrice||0)-(a.minPrice||0));
}
export async function getProductBySlug(slug,locale='fr'){
  const list=await all(locale);
  return list.find(p=>p.slug===slug)||null;
}
