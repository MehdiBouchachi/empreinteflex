import { categories as tree } from '@/constants/products';
// The storefront keeps its exact original range taxonomy; the backend manages stock categories.
function cat(x,type,parent_id=null){return {id:x.value,value:x.value,translations:x.translations,type,parent_id};}
export async function getMainCategories(){return tree.map(c=>cat(c,'main'));}
export async function getAllCategories(){const list=[];for(const c of tree){list.push(cat(c,'main'));for(const s of c.subcategories||[]){list.push(cat(s,'sub',c.value));for(const t of s.types||[])list.push(cat(t,'type',s.value));}}return list;}
