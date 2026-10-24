import "server-only";
import {createClient} from "@supabase/supabase-js";
import {cmsConfig} from "./config";
import {CmsError} from "./server";
// Provisioning is separately authorized. Never fall back to a public/user key.
export function trustedServerClient(){
  const config=cmsConfig();const key=process.env.SUPABASE_SECRET_KEY;
  if(!config||!key?.startsWith("sb_secret_"))throw new CmsError(503,"画像検証用の安全なサーバー設定が準備中です。");
  return createClient(config.url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
