import 'server-only';
const root=(process.env.API_INTERNAL_URL || 'http://localhost:3001').replace(/\/$/,'');
export async function backend(path,options={}){
  const {cache='no-store',next, ...rest}=options;
  const response=await fetch(root+path,{...rest,cache,...(next?{next}:{})});
  if(!response.ok){
    const error=await response.json().catch(()=>({}));
    const message=typeof error.message==='string'?error.message:Array.isArray(error.message)?error.message.join(', '):'Backend request failed';
    const e=new Error(message);e.status=response.status;throw e;
  }
  return response.json();
}
