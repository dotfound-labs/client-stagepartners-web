import sharp from "sharp";
import {trustedServerClient} from "@/lib/cms/trusted-server";
import {safeInstagramImage,integrationEnabled} from "@/lib/cms/integration-config";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
 const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
 if(!integrationEnabled("INSTAGRAM_SYNC_ENABLED"))return new Response(null,{status:404,headers});
 try{
  const {slug}=await params;if(!/^instagram-[0-9]+$/.test(slug))return new Response(null,{status:404,headers});
  const result=await trustedServerClient().rpc("cms_instagram_image",{p_slug:slug});
  if(result.error||!result.data||!safeInstagramImage(result.data))return new Response(null,{status:404,headers});
  const response=await fetch(result.data,{redirect:"error",cache:"no-store",signal:AbortSignal.timeout(10000)});
  if(!response.ok||!response.headers.get("content-type")?.startsWith("image/")||!response.body)throw new Error();
  const chunks:Uint8Array[]=[];let total=0;const reader=response.body.getReader();
  while(true){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>8*1024*1024){await reader.cancel();throw new Error();}chunks.push(value);}
  const image=await sharp(Buffer.concat(chunks),{limitInputPixels:40000000}).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:85}).toBuffer();
  return new Response(new Uint8Array(image),{headers:{...headers,"Content-Type":"image/webp"}});
 }catch{return new Response(null,{status:404,headers});}
}
