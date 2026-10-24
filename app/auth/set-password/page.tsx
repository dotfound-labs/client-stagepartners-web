import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {sessionClient} from "@/lib/cms/server";
import AccountSetup from "@/components/admin/AccountSetup";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"パスワード設定 | STAGE PARTNERS",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function Password(){
  const client=await sessionClient();const {data:{user}}=await client.auth.getUser();if(!user?.email_confirmed_at)redirect('/admin');
  return <AccountSetup/>;
}
