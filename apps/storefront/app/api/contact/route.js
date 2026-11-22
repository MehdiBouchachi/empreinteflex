import { NextResponse } from 'next/server';
import { backend } from '@/lib/backend';
export async function POST(req){
 try{const body=await req.json();const response=await backend('/v1/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return NextResponse.json(response)}
 catch(e){console.error('[contact]',e.message);return NextResponse.json({success:false,message:'Unable to send contact request at the moment.'},{status:e.status===400?422:e.status||500})}
}
