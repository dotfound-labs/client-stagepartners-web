import {randomBytes,timingSafeEqual} from "node:crypto";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {requireIdentity} from "@/lib/cms/server";
import {sameOrigin} from "@/lib/cms/csrf";
import {instagramOAuthConfig,exchangeInstagramCode} from "@/lib/cms/instagram-oauth";
import {saveInstagramConnection} from "@/lib/cms/instagram-token-store";
export const dynamic="force-dynamic";
const cookie="cms_instagram_oauth_state",headers={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"};
export async function POST(request:Request){
 try{if(!sameOrigin(request))return new Response(null,{status:403});const {identity}=await requireIdentity();if(!identity.owner)return new Response(null,{status:403});
 const config=instagramOAuthConfig();if(!config||new URL(request.url).origin!==new URL(config.redirect).origin)return Response.json({error:"公式認可と安全な保存先の設定待ちです。"},{status:503,headers});
 const state=randomBytes(32).toString("hex"),jar=await cookies();jar.set(cookie,JSON.stringify({state,user:identity.id}),{httpOnly:true,secure:true,sameSite:"lax",path:"/api/admin/instagram/oauth",maxAge:600});
 const url=new URL("https://www.instagram.com/oauth/authorize");url.search=new URLSearchParams({client_id:config.appId,redirect_uri:config.redirect,response_type:"code",scope:"instagram_business_basic",state}).toString();return Response.json({url:url.href},{headers});
 }catch{return Response.json({error:"接続を開始できませんでした。"},{status:503,headers});}
}
export async function GET(request:Request){
 const jar=await cookies(),stored=jar.get(cookie)?.value;jar.delete({name:cookie,path:"/api/admin/instagram/oauth"});
 try{const config=instagramOAuthConfig();if(!config)throw Error();const {identity,client}=await requireIdentity();if(!identity.owner)throw Error();
 const expected=JSON.parse(stored??"null"),url=new URL(request.url),state=url.searchParams.get("state")??"",code=url.searchParams.get("code");
 if(!expected||expected.user!==identity.id||typeof expected.state!=="string"||state.length!==64||Buffer.byteLength(state)!==Buffer.byteLength(expected.state)||!timingSafeEqual(Buffer.from(state),Buffer.from(expected.state))||!code||code.length>4096||url.searchParams.has("error"))throw Error();
 const connection=await exchangeInstagramCode(code,config);
 // Account binding remains disabled until the owner explicitly starts sync.
 const result=await client.rpc("cms_configure_instagram",{p_account_id:connection.accountId,p_username:connection.username,p_enabled:false,p_auto_publish:false});if(result.error)throw Error();
 await saveInstagramConnection(connection.token);
 return NextResponse.redirect(new URL("/admin?instagram=connected",config.redirect),{headers});
 }catch{return new Response("Instagram 接続を完了できませんでした。管理画面から再接続してください。",{status:400,headers});}
}
