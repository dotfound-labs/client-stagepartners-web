import {limitedText} from "@/lib/cms/request-body";
import {z} from "zod";
import {sameOrigin} from "@/lib/cms/csrf";
import {contactReady} from "@/lib/cms/integration-config";
import {trustedServerClient} from "@/lib/cms/trusted-server";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
const ready=contactReady;
export function GET(){return Response.json({enabled:ready()},{headers});}
const input=z.object({id:z.uuid(),name:z.string().trim().min(1).max(200),email:z.email().max(254),phone:z.string().max(40),inquiry_type:z.string().min(1).max(200),message:z.string().trim().min(1).max(10000),website:z.string().max(0)}).strict();
export async function POST(request:Request){
 if(!ready())return Response.json({error:"フォームは現在準備中です。お電話でお問い合わせください。"},{status:503,headers});
 if(!sameOrigin(request))return new Response(null,{status:403,headers});
 try{
  if(Number(request.headers.get("content-length"))>20000)return new Response(null,{status:413,headers});
  const raw=await limitedText(request,20000);if(raw.length>20000)return new Response(null,{status:413,headers});
  const data=input.parse(JSON.parse(raw)),db=trustedServerClient();
  const stored=await db.rpc("cms_receive_inquiry",{p_id:data.id,p_name:data.name,p_email:data.email,p_phone:data.phone,p_subject:data.inquiry_type,p_message:data.message});
  if(stored.error)return Response.json({error:"受付できませんでした。入力内容を確認し、時間をおいて再度お試しください。"},{status:400,headers});
  if(stored.data){
   // The durable CMS record is the receipt. Notification is attempted once only;
   // timeout may mean delivery succeeded, so never retry it automatically.
   let status="uncertain";
   try{
    const response=await fetch("https://api.web3forms.com/v1/submissions",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${process.env.WEB3FORMS_SECRET_KEY}`},redirect:"error",signal:AbortSignal.timeout(10000),body:JSON.stringify({form_id:process.env.WEB3FORMS_FORM_ID,fields:{name:data.name,email:data.email,phone:data.phone,message:data.message,inquiry_type:data.inquiry_type},subject:`STAGE PARTNERS | ${data.inquiry_type}`,replyto:data.email})});
    const result=await response.json();if(response.status===201&&typeof result.data?.id==="string")status="sent";
   }catch{/* No PII or provider response logging. */}
   await db.rpc("cms_inquiry_notification",{p_id:data.id,p_status:status});
  }
  return Response.json({success:true},{headers});
 }catch{return Response.json({error:"受付できませんでした。入力内容と接続を確認してください。"},{status:400,headers});}
}
