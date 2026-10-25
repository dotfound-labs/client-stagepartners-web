import {notFound} from "next/navigation";
import {headers} from "next/headers";
import AdminApp from "@/components/admin/AdminApp";
export const dynamic="force-dynamic";
export const metadata={title:"管理画面デザイン確認（ローカルデモ）",robots:{index:false,follow:false}};
export default async function DesignPreview(){
 const host=(await headers()).get("host");
 if(process.env.NODE_ENV!=="development"||process.env.VERCEL||!['127.0.0.1:3102','localhost:3102'].includes(host??''))notFound();
 return <><div style={{background:'#fef3c7',color:'#713f12',padding:'12px 24px',fontWeight:700}}>ローカル・デザイン確認専用：架空データです。保存・公開・送信はできません。「お知らせ」で実際の編集画面を確認できます。</div><AdminApp identity={{id:'00000000-0000-4000-8000-000000000099',email:'design-demo@example.invalid',owner:true,permissions:[]}}/></>;
}
