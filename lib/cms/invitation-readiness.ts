import {EXPECTED_PROJECT} from "./config";
export function invitationDeliveryConfig(env:Record<string,string|undefined>=process.env){
 if(env.VERCEL_ENV==="preview"||env.CMS_INVITATIONS_ENABLED!=="true"||env.NEXT_PUBLIC_SUPABASE_URL!==`https://${EXPECTED_PROJECT}.supabase.co`||!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_")||!env.SUPABASE_SECRET_KEY?.startsWith("sb_secret_"))return null;
 try{const url=new URL(env.CMS_AUTH_CALLBACK_URL??"");
 if(url.pathname!=="/auth/callback"||url.search||url.hash||url.username||url.password||!(url.protocol==="https:"||(url.protocol==="http:"&&["localhost","127.0.0.1"].includes(url.hostname))))return null;
 return {redirect:url.href};
 }catch{return null;}
}
export function invitationIntentMatches(intent:boolean,enabled:boolean){return intent===enabled;}
