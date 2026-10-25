import "server-only";
import {open,readFile,rename,unlink} from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {maintainInstagramToken,type InstagramToken,type TokenResult} from "./instagram-token";

export async function saveInstagramConnection(token:InstagramToken){
 if(process.env.VERCEL||process.env.INSTAGRAM_TOKEN_STORE!=="local-file")throw Error("STORE_UNAVAILABLE");
 const file=path.join(process.cwd(),".cms-secrets","instagram-token.json"),lock=file+".lock";
 const handle=await open(lock,"wx",0o600);
 try{const temp=file+"."+randomUUID()+".tmp";const out=await open(temp,"wx",0o600);try{await out.writeFile(JSON.stringify(token));await out.sync();}finally{await out.close();}await rename(temp,file);}
 finally{await handle.close();await unlink(lock).catch(()=>{});}
}

export async function instagramTokenMetadata(){
 if(process.env.VERCEL||process.env.INSTAGRAM_TOKEN_STORE!=="local-file")return {state:"unconnected",expiresAt:null};
 try{const t=JSON.parse(await readFile(path.join(process.cwd(),".cms-secrets","instagram-token.json"),"utf8")) as InstagramToken;
 const expiry=Date.parse(t.expiresAt);if(t.kind!=="instagram-login-long-lived"||!t.accessToken||!Number.isFinite(expiry))return {state:"error",expiresAt:null};
 return {state:expiry<=Date.now()?"expired":expiry-Date.now()<7*86400000?"expiring":"connected",expiresAt:t.expiresAt};
 }catch{return {state:"unconnected",expiresAt:null};}
}

// Opt-in single-host adapter. The operator provisions this directory with owner-only
// Windows ACLs / Unix permissions. No token file or credential is auto-created.
export async function localInstagramToken():Promise<TokenResult>{
 if(process.env.VERCEL||process.env.INSTAGRAM_TOKEN_STORE!=="local-file")return {status:"invalid-metadata",retrySeconds:3600};
 const file=path.join(process.cwd(),".cms-secrets","instagram-token.json"),lock=file+".lock";
 let handle;
 try{handle=await open(lock,"wx",0o600);}catch{return {status:"persistence-error",retrySeconds:3600};}
 try{
  const token=JSON.parse(await readFile(file,"utf8")) as InstagramToken;
  return await maintainInstagramToken(token,{fetch,save:async next=>{
   const temporary=file+"."+randomUUID()+".tmp";
   const output=await open(temporary,"wx",0o600);
   try{await output.writeFile(JSON.stringify(next),"utf8");await output.sync();}finally{await output.close();}
   // Same-directory atomic replacement; uncertain failures are never called success.
   await rename(temporary,file);
  }});
 }catch{return {status:"invalid-metadata",retrySeconds:3600};}
 finally{await handle.close();await unlink(lock).catch(()=>{});}
}
