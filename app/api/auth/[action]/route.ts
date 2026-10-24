import {z} from "zod";
import {sameOrigin} from "@/lib/cms/csrf";
import {CmsError,sessionClient} from "@/lib/cms/server";
export const dynamic="force-dynamic";
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
  const headers={"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"};
  try{
    if(!sameOrigin(request))throw new CmsError(403,"ページを再読み込みしてください。");
    const raw=await request.text();if(raw.length>2048)throw new CmsError(413,"入力内容が大きすぎます。");
    const body=JSON.parse(raw);const {action}=await params;const client=await sessionClient();
    if(action==="confirm"){
      const value=z.object({token_hash:z.string().regex(/^[a-zA-Z0-9_-]{20,256}$/),type:z.enum(["invite","recovery"])}).strict().parse(body);
      const {error}=await client.auth.verifyOtp(value);if(error)throw new CmsError(400,"リンクの期限が切れているか、使用済みです。オーナーへ再発行を依頼してください。");
      return Response.json({ok:true},{headers});
    }
    if(action==="password"){
      const {password}=z.object({password:z.string().min(12).max(128)}).strict().parse(body);
      const {data:{user},error}=await client.auth.getUser();
      if(error||!user?.email_confirmed_at)throw new CmsError(401,"メールの設定リンクからやり直してください。");
      const result=await client.auth.updateUser({password});if(result.error)throw new CmsError(400,"パスワードを設定できませんでした。安全性の条件とリンクの期限を確認してください。");
      await client.auth.signOut();return Response.json({ok:true},{headers});
    }
    throw new CmsError(404,"対象が見つかりません。");
  }catch(error){return Response.json({error:error instanceof CmsError?error.message:"入力内容と接続設定を確認してください。"},{status:error instanceof CmsError?error.status:400,headers});}
}
