import type {Metadata} from "next";
import AuthCallback from "@/components/admin/AuthCallback";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"メール確認 | STAGE PARTNERS",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function Callback(){return <AuthCallback/>;}
