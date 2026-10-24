import type { Metadata } from "next";
import AdminApp, { Login } from "@/components/admin/AdminApp";
import { cmsConfig } from "@/lib/cms/config";
import { CmsError, requireIdentity } from "@/lib/cms/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理画面 | STAGE PARTNERS", robots: { index: false, follow: false } };
export default async function AdminPage() {
  let configured = false;
  let identity, message;
  try { configured = !!cmsConfig(); if (configured) identity = (await requireIdentity()).identity; }
  catch (error) { message = error instanceof CmsError && error.status === 401 ? undefined : error instanceof CmsError ? error.message : "接続設定を確認してください。"; }
  return identity ? <AdminApp identity={identity} /> : <Login configured={configured} message={message} />;
}
