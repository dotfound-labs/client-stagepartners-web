import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cmsConfig } from "./config";
import { can, canRead, type Identity, type Module, type Capability, type Permission } from "./model";

export class CmsError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function sessionClient() {
  const config = cmsConfig();
  if (!config) throw new CmsError(503, "管理画面の接続設定がまだ完了していません。");
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: { getAll: () => jar.getAll(), setAll(values) { for (const { name, value, options } of values) {
      try { jar.set(name, value, { ...options, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }); }
      catch { /* Server Component refresh is persisted by proxy.ts. */ }
    } } },
  });
}
export function publicClient() {
  const config = cmsConfig();
  if (!config) return null;
  return createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(15000) }) } });
}
export async function requireIdentity() {
  const client = await sessionClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new CmsError(401, "ログインしてください。");
  const { data: member, error: memberError } = await client.from("cms_members").select("user_id,email,is_owner,active").eq("user_id", user.id).maybeSingle();
  if (memberError) throw new CmsError(503, "管理画面のデータを読み込めません。接続状態を確認してください。");
  if (!member?.active) throw new CmsError(403, "このアカウントには管理画面の利用権限がありません。");
  const { data: permissions, error: permissionError } = await client.from("cms_permissions").select("module,capability").eq("user_id", user.id);
  if (permissionError) throw new CmsError(503, "権限を確認できませんでした。");
  const identity: Identity = { id: user.id, email: member.email, owner: member.is_owner, permissions: (permissions ?? []) as Permission[] };
  return { client, identity };
}
export function requirePermission(identity: Identity, module: Module, capability: Capability) {
  if (!canRead(identity, module) || !can(identity, module, capability)) throw new CmsError(403, "この操作の権限がありません。");
}
export function databaseError(error: { message: string; code?: string } | null) {
  if (!error) return;
  if (error.message.includes("VERSION_CONFLICT")) throw new CmsError(409, "別の更新が保存されています。再読み込みして内容を確認してください。");
  if (error.message.includes("MEDIA_IN_USE")) throw new CmsError(409, "この画像は下書き・公開ページ・履歴で使用中のため削除できません。");
  if (/FORBIDDEN|OWNER_REQUIRED|DELEGATE|SELF_PERMISSION|LAST_OWNER/.test(error.message)) throw new CmsError(403, "権限上この操作はできません。自分自身や最後のオーナーの権限は変更できません。");
  if (error.code === "23505" || /INVITATION_EXISTS|ALREADY_MEMBER/.test(error.message)) throw new CmsError(409, "同じURL・メールアドレスの登録があります。");
  if (/CMS_INVALID|CMS_UNKNOWN|CMS_IMMUTABLE|CMS_MEDIA_NOT_READY/.test(error.message)) throw new CmsError(400, "入力内容または画像を確認してください。");
  throw new CmsError(503, "処理を完了できませんでした。時間をおいてもう一度お試しください。");
}
