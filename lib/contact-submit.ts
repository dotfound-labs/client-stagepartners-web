import {CONTACT_SUBJECT,notificationFields} from "./contact-notification";
export type ContactFields={name:string;company?:string;email:string;phone:string;inquiry_type:string;message:string;website:string};
export type ContactResult={accepted:boolean;saved:boolean};
// Browser-only standard delivery. Do not proxy /submit through the server:
// Web3Forms requires a paid plan and IP allowlisting for server-side /submit.
export async function submitContact(fields:ContactFields,id:string,fetcher:typeof fetch=fetch):Promise<ContactResult>{
 let saved=false;
 try{
  const response=await fetcher("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...fields,id}),signal:AbortSignal.timeout(25000)});
  const result=await response.json();saved=result.saved===true;
  if(!response.ok)return {accepted:false,saved};
  if(result.notification==="accepted"&&result.success===true)return {accepted:true,saved};
  if(result.mode!=="browser"||result.attemptAllowed!==true||!saved||typeof result.accessKey!=="string"||! /^[0-9a-f-]{36}$/i.test(result.accessKey))return {accepted:false,saved};
  const delivery=await fetcher("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},redirect:"error",signal:AbortSignal.timeout(15000),body:JSON.stringify({access_key:result.accessKey,...notificationFields(fields,id),email:fields.email,subject:CONTACT_SUBJECT,replyto:fields.email,botcheck:fields.website!==""})});
  const receipt=await delivery.json();return {accepted:delivery.ok&&receipt.success===true,saved};
 }catch{return {accepted:false,saved};}
}
