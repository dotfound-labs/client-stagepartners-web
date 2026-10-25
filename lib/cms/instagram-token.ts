import "server-only";

export type InstagramToken = { accessToken:string; kind:"instagram-login-long-lived"; issuedAt:string; expiresAt:string };
export type TokenResult = { token?:InstagramToken; status:"ok"|"refreshed"|"expiring"|"reauthorization-required"|"invalid-metadata"|"rate-limited"|"refresh-error"|"persistence-error"; retrySeconds:number };
const day=86400000;
// Call under a durable exclusive credential-store lock. Never log provider bodies or URLs.
export async function maintainInstagramToken(token:InstagramToken, deps:{fetch:typeof fetch;save:(next:InstagramToken)=>Promise<void>;now?:()=>number}):Promise<TokenResult>{
 const now=(deps.now??Date.now)(),issued=Date.parse(token.issuedAt),expires=Date.parse(token.expiresAt);
 if(token.kind!=="instagram-login-long-lived"||!token.accessToken||!Number.isFinite(issued)||!Number.isFinite(expires)||issued>now||expires<=issued)return {status:"invalid-metadata",retrySeconds:3600};
 if(expires<=now)return {status:"reauthorization-required",retrySeconds:86400};
 if(expires-now>7*day)return {token,status:"ok",retrySeconds:3600};
 if(now-issued<day)return {token,status:"expiring",retrySeconds:Math.max(3600,Math.ceil((issued+day-now)/1000))};
 try{
  const url=new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type","ig_refresh_token");url.searchParams.set("access_token",token.accessToken);
  const response=await deps.fetch(url,{method:"GET",redirect:"error",cache:"no-store",signal:AbortSignal.timeout(15000)});
  const body=await response.json();
  if(!response.ok){
   if(response.status===401||body?.error?.code===190)return {status:"reauthorization-required",retrySeconds:86400};
   const rate=response.status===429||[4,17,32,613].includes(body?.error?.code);
   const retryAfter=response.headers.get("retry-after"),numeric=Number(retryAfter);
   const seconds=retryAfter?(Number.isFinite(numeric)?numeric:(Date.parse(retryAfter)-now)/1000):3600;
   return {token,status:rate?"rate-limited":"refresh-error",retrySeconds:Number.isFinite(seconds)?Math.max(3600,Math.min(Math.ceil(seconds),86400)):3600};
  }
  if(typeof body?.access_token!=="string"||!body.access_token||!Number.isSafeInteger(body.expires_in)||body.expires_in<=0||body.expires_in>60*86400)return {token,status:"refresh-error",retrySeconds:3600};
  const next:InstagramToken={accessToken:body.access_token,kind:token.kind,issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+body.expires_in*1000).toISOString()};
  try{await deps.save(next);}catch{return {status:"persistence-error",retrySeconds:3600};}
  return {token:next,status:"refreshed",retrySeconds:3600};
 }catch{return {token,status:"refresh-error",retrySeconds:3600};}
}
