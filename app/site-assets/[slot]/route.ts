import {readFile} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {getPageContent} from '@/lib/cms/public';
import {publicClient} from '@/lib/cms/server';
export const dynamic='force-dynamic';
// Only published common images, using anonymous RLS even for logged-in visitors.
export async function GET(_request:Request,{params}:{params:Promise<{slot:string}>}){
 const {slot}=await params;
 const slots={icon:{id:'seo_icon',file:'icon.png'},og:{id:'seo_og',file:'stagepartners-hero.jpg'},logo:{id:'image_text_85561920',file:'logo-color-footer.png'}};
 const selected=slots[slot as keyof typeof slots];if(!selected)return new Response(null,{status:404});
 try{
  const data=await getPageContent('common'),image=data.images?.[selected.id];let bytes:Buffer;
  if(image?.media_id){const client=publicClient();if(!client)throw Error();const row=await client.from('cms_media').select('object_path').eq('id',image.media_id).eq('ready',true).eq('deletion_requested',false).maybeSingle();if(row.error||!row.data)throw Error();const file=await client.storage.from('cms-media').download(row.data.object_path);if(file.error||!file.data)throw Error();bytes=Buffer.from(await file.data.arrayBuffer());}
  else bytes=await readFile(path.join(process.cwd(),'public',selected.file));
  const output=slot==='icon'?await sharp(bytes,{limitInputPixels:40000000}).resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer():slot==='og'?await sharp(bytes,{limitInputPixels:40000000}).resize(1200,630,{fit:'cover'}).jpeg({quality:85}).toBuffer():await sharp(bytes,{limitInputPixels:40000000}).png().toBuffer();
  return new Response(new Uint8Array(output),{headers:{'Content-Type':slot==='og'?'image/jpeg':'image/png','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(process.env.VERCEL_ENV==='preview'?{'X-Robots-Tag':'noindex'}:{})}});
 }catch{return new Response(null,{status:503,headers:{'Cache-Control':'no-store'}});}
}
