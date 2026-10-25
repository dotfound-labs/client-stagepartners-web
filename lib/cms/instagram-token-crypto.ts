import "server-only";
import {createCipheriv,createDecipheriv,randomBytes} from "node:crypto";
import type {InstagramToken} from "./instagram-token";
const aad=Buffer.from("stagepartners:apkfyxfmsndwqjfetdad:aim_architecture:instagram-token:v1");
export function tokenEncryptionKey(value=process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY){
 if(!value||! /^[0-9a-f]{64}$/i.test(value))throw Error("TOKEN_KEY_UNCONFIGURED");
 return Buffer.from(value,"hex");
}
export function sealInstagramToken(token:InstagramToken,key:Buffer){
 const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key,iv);cipher.setAAD(aad);
 const data=Buffer.concat([cipher.update(JSON.stringify(token),"utf8"),cipher.final()]);
 return ["v1",iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),data.toString("base64url")].join(".");
}
export function openInstagramToken(envelope:string,key:Buffer):InstagramToken{
 try{
  if(envelope.length>65536)throw Error();const parts=envelope.split(".");
  if(parts.length!==4||parts[0]!=="v1"||parts.slice(1).some(p=>! /^[A-Za-z0-9_-]+$/.test(p)))throw Error();
  const iv=Buffer.from(parts[1],"base64url"),tag=Buffer.from(parts[2],"base64url");if(iv.length!==12||tag.length!==16)throw Error();
  const decipher=createDecipheriv("aes-256-gcm",key,iv);decipher.setAAD(aad);decipher.setAuthTag(tag);
  const token=JSON.parse(Buffer.concat([decipher.update(Buffer.from(parts[3],"base64url")),decipher.final()]).toString("utf8"));
  if(token.kind!=="instagram-login-long-lived"||typeof token.accessToken!=="string"||!token.accessToken||token.accessToken.length>20000||!Number.isFinite(Date.parse(token.issuedAt))||!Number.isFinite(Date.parse(token.expiresAt))||Date.parse(token.expiresAt)<=Date.parse(token.issuedAt))throw Error();
  return token;
 }catch{throw Error("TOKEN_DECRYPTION_FAILED");}
}
