import type {Metadata} from "next";
import {notFound} from "next/navigation";
import AccountSetup from "@/components/admin/AccountSetup";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"メール確認 | STAGE PARTNERS",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function Confirm({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const {token_hash,type}=await searchParams;
  if(!token_hash||!/^[a-zA-Z0-9_-]{20,256}$/.test(token_hash)||!['invite','recovery'].includes(type??''))notFound();
  return <AccountSetup tokenHash={token_hash} type={type}/>;
}
