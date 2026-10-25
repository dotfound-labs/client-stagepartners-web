import "server-only";
import {trustedServerClient} from "./trusted-server";
import {maintainInstagramToken,type InstagramToken,type TokenResult} from "./instagram-token";
import {sealInstagramToken,openInstagramToken,tokenEncryptionKey} from "./instagram-token-crypto";
import * as local from "./instagram-token-file";
export function encryptedTokenStoreReady(){return process.env.VERCEL_ENV!=="preview"&&process.env.INSTAGRAM_TOKEN_STORE==="encrypted-db"&&/^[0-9a-f]{64}$/i.test(process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY??"")&&Boolean(process.env.SUPABASE_SECRET_KEY);}
async function operation(action:string,lease?:string,ciphertext?:string){
 if(!encryptedTokenStoreReady())throw Error("STORE_UNAVAILABLE");
 const result=await trustedServerClient().rpc("cms_instagram_token_operation",{p_action:action,p_lease:lease??null,p_ciphertext:ciphertext??null});
 if(result.error)throw Error("TOKEN_STORE_FAILED");return result.data as {lease?:string;ciphertext?:string|null}|null;
}
export async function saveInstagramConnection(token:InstagramToken){
 if(process.env.VERCEL_ENV==="preview")throw Error("STORE_UNAVAILABLE");
 if(process.env.INSTAGRAM_TOKEN_STORE!=="encrypted-db")return local.saveInstagramConnection(token);
 const key=tokenEncryptionKey(),claim=await operation("claim");if(!claim?.lease)throw Error("TOKEN_STORE_BUSY");
 try{await operation("commit",claim.lease,sealInstagramToken(token,key));}
 finally{await operation("release",claim.lease).catch(()=>{});}
}
export async function storedInstagramToken():Promise<TokenResult>{
 if(process.env.VERCEL_ENV==="preview")return {status:"invalid-metadata",retrySeconds:3600};
 if(process.env.INSTAGRAM_TOKEN_STORE!=="encrypted-db")return local.localInstagramToken();
 let lease:string|undefined;
 try{
  const key=tokenEncryptionKey(),claim=await operation("claim");lease=claim?.lease;if(!lease)return {status:"persistence-error",retrySeconds:3600};
  if(!claim?.ciphertext)return {status:"invalid-metadata",retrySeconds:3600};
  return await maintainInstagramToken(openInstagramToken(claim.ciphertext,key),{fetch,save:async token=>{await operation("commit",lease,sealInstagramToken(token,key));}});
 }catch{return {status:"persistence-error",retrySeconds:3600};}
 finally{if(lease)await operation("release",lease).catch(()=>{});}
}
export async function instagramTokenMetadata(){
 if(process.env.VERCEL_ENV==="preview")return {state:"unconnected",expiresAt:null};
 if(process.env.INSTAGRAM_TOKEN_STORE!=="encrypted-db")return local.instagramTokenMetadata();
 if(!encryptedTokenStoreReady())return {state:"unconnected",expiresAt:null};
 try{const row=await operation("read");if(!row?.ciphertext)return {state:"unconnected",expiresAt:null};
  const token=openInstagramToken(row.ciphertext,tokenEncryptionKey()),expiry=Date.parse(token.expiresAt);
  return {state:expiry<=Date.now()?"expired":expiry-Date.now()<7*86400000?"expiring":"connected",expiresAt:token.expiresAt};
 }catch{return {state:"error",expiresAt:null};}
}
