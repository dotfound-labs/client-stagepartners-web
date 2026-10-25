import {timingSafeEqual} from "node:crypto";
import {trustedServerClient} from "@/lib/cms/trusted-server";
import {syncInstagram} from "@/lib/cms/instagram-worker";
import {integrationEnabled,safeInstagramImage} from "@/lib/cms/integration-config";
import {storedInstagramToken} from "@/lib/cms/instagram-token-store";
export const dynamic="force-dynamic";
export const maxDuration=60;
export async function GET(request:Request){
 const headers={"Cache-Control":"private, no-store"};
 if(!integrationEnabled("INSTAGRAM_SYNC_ENABLED"))return Response.json({status:"disabled"},{status:503,headers});
 const secret=process.env.CRON_SECRET,version=process.env.INSTAGRAM_API_VERSION;
 let token=process.env.INSTAGRAM_ACCESS_TOKEN;
 const supplied=request.headers.get("authorization")??"",expected=`Bearer ${secret}`;
 if(!secret||secret.length<32||Buffer.byteLength(supplied)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(expected)))return new Response(null,{status:401,headers});
 if((!token&&!["local-file","encrypted-db"].includes(process.env.INSTAGRAM_TOKEN_STORE??""))||!version)return Response.json({status:"unconfigured"},{status:503,headers});
 try{
  const db=trustedServerClient();const config=await db.from("cms_instagram_config").select("enabled,account_id").eq("singleton",true).single();
  if(config.error)throw new Error();
  const claim=await db.rpc("cms_claim_instagram_sync");if(claim.error)throw new Error();
  if(!claim.data)return Response.json({status:"skipped"},{headers});
  let tokenStatus="environment-token-expiry-untracked";
  if(["local-file","encrypted-db"].includes(process.env.INSTAGRAM_TOKEN_STORE??"")){
   const credential=await storedInstagramToken();tokenStatus=credential.status;
   if(!credential.token||!["ok","refreshed","expiring"].includes(credential.status)){
    await db.rpc("cms_instagram_health",{p_status:credential.status==="reauthorization-required"?"token-expired":credential.status==="rate-limited"?"rate-limited":"error",p_retry_after_seconds:credential.retrySeconds});
    return Response.json({status:credential.status},{status:503,headers});
   }
   token=credential.token.accessToken;
  }
  if(!token)return Response.json({status:"unconfigured"},{status:503,headers});
  const result=await syncInstagram({enabled:config.data.enabled,accountId:config.data.account_id,apiVersion:version,accessToken:token},{fetch,
   health:async(status,retrySeconds)=>{const r=await db.rpc("cms_instagram_health",{p_status:status,p_retry_after_seconds:retrySeconds});if(r.error)throw new Error();},
   importPost:async post=>{
    const r=await db.rpc("cms_import_instagram",{p_account_id:post.accountId,p_media_id:post.mediaId,p_permalink:post.permalink,p_caption:post.caption,p_timestamp:post.timestamp});if(r.error)throw new Error();
    if(post.imageUrl&&safeInstagramImage(post.imageUrl)){const image=await db.from("cms_instagram_images").upsert({document_id:r.data.id,image_url:post.imageUrl,updated_at:new Date().toISOString()});if(image.error)throw new Error();}
   }});
  return Response.json({...result,tokenStatus},{headers});
 }catch{return Response.json({status:"error"},{status:503,headers});}
}
