import "server-only";
// Only presence/validity metadata leaves the server. Never return credential values.
export function instagramSetupStatus(origin:string){
 const e=process.env;
 let redirectValid=false,originMatches=false;
 try{const u=new URL(e.INSTAGRAM_REDIRECT_URI??'');redirectValid=u.protocol==='https:'&&u.pathname==='/api/admin/instagram/oauth'&&!u.search&&!u.hash&&!u.username&&!u.password;originMatches=redirectValid&&u.origin===origin;}catch{}
 const local=e.INSTAGRAM_TOKEN_STORE==='local-file'&&!e.VERCEL;
 const encrypted=e.INSTAGRAM_TOKEN_STORE==='encrypted-db'&&/^[0-9a-f]{64}$/i.test(e.INSTAGRAM_TOKEN_ENCRYPTION_KEY??'')&&Boolean(e.SUPABASE_SECRET_KEY);
 return {checks:{environment:e.VERCEL_ENV!=='preview',appId:/^\d+$/.test(e.INSTAGRAM_APP_ID??''),appSecret:Boolean(e.INSTAGRAM_APP_SECRET),redirect:redirectValid,origin:originMatches,version:/^v\d+\.0$/.test(e.INSTAGRAM_API_VERSION??''),storage:local||encrypted,oauthEnabled:e.INSTAGRAM_OAUTH_ENABLED==='true',syncEnabled:e.INSTAGRAM_SYNC_ENABLED==='true',jobSecret:Boolean(e.CRON_SECRET),serverKey:Boolean(e.SUPABASE_SECRET_KEY)},storageMode:encrypted?'encrypted-db':local?'local-file':'unconfigured'};
}
export function instagramOAuthConfig(){
 const storeReady=process.env.INSTAGRAM_TOKEN_STORE==="encrypted-db"?/^[0-9a-f]{64}$/i.test(process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY??"")&&Boolean(process.env.SUPABASE_SECRET_KEY):!process.env.VERCEL&&process.env.INSTAGRAM_TOKEN_STORE==="local-file";
 if(process.env.VERCEL_ENV==="preview"||process.env.INSTAGRAM_OAUTH_ENABLED!=="true"||!storeReady)return null;
 const appId=process.env.INSTAGRAM_APP_ID,secret=process.env.INSTAGRAM_APP_SECRET,redirect=process.env.INSTAGRAM_REDIRECT_URI,version=process.env.INSTAGRAM_API_VERSION;
 if(!appId||!/^\d+$/.test(appId)||!secret||!redirect||!version||!/^v\d+\.0$/.test(version))return null;
 try{const url=new URL(redirect);if(url.protocol!=="https:"||url.pathname!=="/api/admin/instagram/oauth"||url.search||url.hash||url.username||url.password)return null;}catch{return null;}
 return {appId,secret,redirect,version};
}
export async function exchangeInstagramCode(code:string,config:NonNullable<ReturnType<typeof instagramOAuthConfig>>,fetcher:typeof fetch=fetch,expectedUsername=""){
 if(!/^[a-z0-9._]{1,30}$/i.test(expectedUsername))throw Error("TARGET_REQUIRED");
 const options={redirect:"error" as const,cache:"no-store" as const,signal:AbortSignal.timeout(15000)};
 const first=await fetcher("https://api.instagram.com/oauth/access_token",{...options,method:"POST",body:new URLSearchParams({client_id:config.appId,client_secret:config.secret,grant_type:"authorization_code",redirect_uri:config.redirect,code})});
 const short=await first.json();if(!first.ok||typeof short.access_token!=="string")throw Error("EXCHANGE_FAILED");
 const url=new URL("https://graph.instagram.com/access_token");url.search=new URLSearchParams({grant_type:"ig_exchange_token",client_secret:config.secret,access_token:short.access_token}).toString();
 const response=await fetcher(url,{...options,signal:AbortSignal.timeout(15000)});const long=await response.json();
 if(!response.ok||typeof long.access_token!=="string"||!Number.isSafeInteger(long.expires_in)||long.expires_in<=0||long.expires_in>5184000)throw Error("LONG_TOKEN_FAILED");
 const me=await fetcher(`https://graph.instagram.com/${config.version}/me?fields=user_id,username`,{...options,headers:{Authorization:`Bearer ${long.access_token}`},signal:AbortSignal.timeout(15000)});const account=await me.json();
 if(!me.ok||!/^\d+$/.test(String(account.user_id))||typeof account.username!=="string"||account.username.toLowerCase()!==expectedUsername.toLowerCase())throw Error("ACCOUNT_MISMATCH");
 return {accountId:String(account.user_id),username:account.username as string,token:{accountId:String(account.user_id),username:account.username as string,accessToken:long.access_token as string,kind:"instagram-login-long-lived" as const,issuedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+long.expires_in*1000).toISOString()}};
}
