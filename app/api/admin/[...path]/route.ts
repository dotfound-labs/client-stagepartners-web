import {instagramOAuthConfig,instagramSetupStatus} from "@/lib/cms/instagram-oauth";
import {instagramTokenMetadata} from "@/lib/cms/instagram-token-store";
import {GET as runInstagramJob} from "@/app/api/jobs/instagram/route";
import {invitationDeliveryConfig,invitationIntentMatches} from "@/lib/cms/invitation-readiness";
import {deliverInvitation} from "@/lib/cms/invitation-delivery";
import {instagramReady,contactReady} from "@/lib/cms/integration-config";
import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/cms/csrf";
import { z, ZodError } from "zod";
import { CmsError, databaseError, requireIdentity, requirePermission, sessionClient } from "@/lib/cms/server";
import { MODULES, parseContent, slugSchema, type Module, type Capability } from "@/lib/cms/model";
import { PAGE_TEMPLATES } from "@/content/page-fields";
import { PAGE_ASSETS } from "@/content/page-assets";
import { safeHref } from "@/lib/cms/page-values";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const contentModule = z.enum(["works", "news", "pages", "settings"]);
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
function failure(error: unknown) {
  if (error instanceof CmsError) return reply({ error: error.message }, error.status);
  if (error instanceof ZodError) return reply({ error: "入力内容を確認してください。", fields: error.issues.map(i => i.path.join(".")) }, 400);
  return reply({ error: "処理を完了できませんでした。接続設定を確認してください。" }, 503);
}
async function body(request: Request) {
  if (!sameOrigin(request)) throw new CmsError(403, "ページを再読み込みしてお試しください。");
  if (!request.headers.get("content-type")?.includes("application/json")) throw new CmsError(415, "JSON形式が必要です。");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 300000) throw new CmsError(413, "入力内容が大きすぎます。");
  try { return JSON.parse(raw); } catch { throw new CmsError(400, "入力内容を読み取れません。"); }
}
export async function GET(request: Request, context: Context) {
  try {
    const path = (await context.params).path.join("/");
    const { client, identity } = await requireIdentity();
    const query = new URL(request.url).searchParams;
    if (path === "publication-status") {
      const result=await client.from("cms_site_publication").select("updated_at").single();
      if(result.error?.code === "PGRST205" || result.error?.code === "42P01")return reply({updatedAt:null,available:false});
      databaseError(result.error);return reply({updatedAt:result.data?.updated_at??null,available:true});
    }
    if (path === "bootstrap") return reply({ identity });
    if (path === "documents") {
      const selectedModule = contentModule.parse(query.get("module")); requirePermission(identity, selectedModule, "read");
      const { data, error } = await client.from("cms_documents").select("*").eq("module", selectedModule).order("updated_at", { ascending: false }).limit(1000);
      databaseError(error);
      const published = await client.from("cms_published").select("document_id,version").eq("module", selectedModule); databaseError(published.error);
      return reply({ documents: (data ?? []).map(d => ({ ...d, published: published.data?.find(p => p.document_id === d.id) ?? null })) });
    }
    if (path === "revisions") {
      const id = z.uuid().parse(query.get("id"));
      const document = await client.from("cms_documents").select("module").eq("id", id).maybeSingle(); databaseError(document.error);
      if (!document.data) throw new CmsError(404, "対象が見つかりません。");
      requirePermission(identity, document.data.module as Module, "read");
      const { data, error } = await client.from("cms_revisions").select("id,version,action,data,created_at").eq("document_id", id).order("version", { ascending: false }).limit(100); databaseError(error);
      return reply({ revisions: data });
    }
    if (path === "media") {
      requirePermission(identity, "media", "read");
      const { data, error } = await client.from("cms_media").select("id,original_name,alt,ready,deletion_requested,mime_type,size_bytes,object_path").order("created_at", { ascending: false }).limit(500); databaseError(error);
      return reply({ media: data });
    }
    if (path === "users") {
      requirePermission(identity, "users", "manage");
      const results = await Promise.all([client.from("cms_members").select("*"), client.from("cms_permissions").select("*"), client.from("cms_invitations").select("*").order("created_at", { ascending: false }).limit(100)]);
      results.forEach(r => databaseError(r.error));
      return reply({ members: results[0].data, permissions: results[1].data, invitations: results[2].data, deliveryEnabled: Boolean(invitationDeliveryConfig()) });
    }
    if (path === "inquiries") {
      requirePermission(identity, "inquiries", "read");
      const { data, error } = await client.from("cms_inquiries").select("*").order("created_at", { ascending: false }).limit(200); databaseError(error);
      return reply({ inquiries: data, intakeEnabled: contactReady() });
    }
    if (path === "instagram") {
      requirePermission(identity, "settings", "read");
      const { data, error } = await client.from("cms_instagram_config").select("*").single(); databaseError(error);
      const setup=instagramSetupStatus(new URL(request.url).origin);
      return reply({ config: data, authorizationConfigured: instagramReady(), connectionAvailable: Boolean(instagramOAuthConfig())&&setup.checks.origin, token: await instagramTokenMetadata(), ...(identity.owner?{setup}:{}) });
    }
    throw new CmsError(404, "対象が見つかりません。");
  } catch (error) { return failure(error); }
}
export async function POST(request: Request, context: Context) {
  try {
    const path = (await context.params).path.join("/");
    const input = await body(request);
    if (path === "auth/login") {
      const credentials = z.object({ email: z.email().max(254), password: z.string().min(1).max(128) }).strict().parse(input);
      const client = await sessionClient();
      const { error } = await client.auth.signInWithPassword(credentials);
      if (error) throw new CmsError(error.status === 429 ? 429 : 401, error.status === 429 ? "試行回数が多いため、しばらく待ってからお試しください。" : "メールアドレスまたはパスワードを確認してください。");
      const acceptance = await client.rpc("cms_accept_invitation"); databaseError(acceptance.error);
      await requireIdentity();
      return reply({ ok: true });
    }
    if (path === "auth/logout") {
      const client = await sessionClient(); const { error } = await client.auth.signOut(); databaseError(error);
      return reply({ ok: true });
    }
    const { client, identity } = await requireIdentity();
    if (path === "document") {
      const value = z.object({ id: z.uuid(), module: contentModule, slug: slugSchema, action: z.enum(["save", "publish", "unpublish", "archive", "restore"]), data: z.unknown().optional(), version: z.number().int().min(0), requestId: z.uuid(), revisionId: z.number().int().positive().optional() }).strict().parse(input);
      const capability: Capability = value.action === "archive" ? "delete" : ["publish", "unpublish"].includes(value.action) ? "publish" : "edit";
      requirePermission(identity, value.module, value.module === "settings" ? "edit" : capability);
      if (["pages", "settings"].includes(value.module) && ["archive", "unpublish"].includes(value.action)) throw new CmsError(400, "固定ページは削除できません。内容を編集して公開してください。");
      const data = value.action === "save" ? parseContent(value.module, value.data) : null;
      if (data && "fields" in data) {
        const template = PAGE_TEMPLATES[value.slug];
        if (!template || (value.module === "settings") !== (value.slug === "common")) throw new CmsError(400, "ページの種類を確認してください。");
        const allowed = new Set(template.fields.map(f => f.id));
        if (Object.keys(data.fields).some(key => !allowed.has(key))) throw new CmsError(400, "未対応の入力項目があります。");
        for(const field of template.fields){const entry=data.fields[field.id];if(entry===undefined)continue;if(field.kind==="link"&&!safeHref(entry)||field.kind==="phone"&&!/^\+?[0-9-]{6,20}$/.test(entry))throw new CmsError(400,"リンク先・電話番号の形式を確認してください。");}
        for(const [key,image] of Object.entries(data.images??{})){const slot=PAGE_ASSETS[value.slug]?.images.find(s=>s.id===key);if(!slot||image.legacy_path&&image.legacy_path!==slot.path)throw new CmsError(400,"画像の指定が正しくありません。");}
      }
      const { data: result, error } = await client.rpc("cms_mutate_content", { p_id: value.id, p_module: value.module, p_slug: value.slug, p_action: value.action, p_data: data, p_expected_version: value.version, p_request_id: value.requestId, p_restore_revision: value.revisionId ?? null }); databaseError(error);
      return reply({ result });
    }
    if (path === "member" || path === "invitation") {
      requirePermission(identity, "users", "manage");
      const permission = z.object({ module: z.enum(Object.keys(MODULES) as [Module, ...Module[]]), capability: z.enum(["read", "edit", "publish", "delete", "manage"]) }).strict();
      const value = z.object({ id: z.uuid().optional(), email: z.email().max(254).optional(), sendEmail:z.boolean().optional(), owner: z.boolean(), active: z.boolean().optional(), permissions: z.array(permission).max(32) }).strict().parse(input);
      if (path === "member") {
        if (!value.id || value.active === undefined) throw new CmsError(400, "対象を選択してください。");
        const { error } = await client.rpc("cms_set_member", { p_user_id: value.id, p_owner: value.owner, p_active: value.active, p_permissions: value.permissions }); databaseError(error);
      } else {
        if(value.sendEmail===undefined||!invitationIntentMatches(value.sendEmail,Boolean(invitationDeliveryConfig())))throw new CmsError(409,"招待メールの送信設定が変わりました。画面を再読み込みして確認してください。");
        if (!value.email) throw new CmsError(400, "メールアドレスを入力してください。");
        const { data: invitationId, error } = await client.rpc("cms_reserve_invitation", { p_email: value.email, p_owner: value.owner, p_permissions: value.permissions }); databaseError(error);
        return reply({ok:true,message:await deliverInvitation(invitationId)});
      }
      return reply({ ok: true, message: "権限を保存しました。" });
    }
    if (path === "invitation/cancel") {
      requirePermission(identity, "users", "manage"); const { id } = z.object({ id: z.uuid() }).parse(input);
      const { error } = await client.rpc("cms_cancel_invitation", { p_id: id }); databaseError(error); return reply({ ok: true });
    }
    if (path === "media") {
      const value = z.object({ id: z.uuid(), action: z.enum(["describe", "delete"]), alt: z.string().trim().min(1).max(500).optional() }).strict().parse(input);
      requirePermission(identity, "media", value.action === "delete" ? "delete" : "edit");
      const { data: result, error } = await client.rpc("cms_mutate_media", { p_id: value.id, p_action: value.action, p_alt: value.alt }); databaseError(error);
      if (value.action === "delete") {
        const removal = await client.storage.from("cms-media").remove([result.object_path]); databaseError(removal.error);
        const purge = await client.rpc("cms_mutate_media", { p_id: value.id, p_action: "purge" }); databaseError(purge.error);
      }
      return reply({ ok: true });
    }
    if (path === "inquiry") {
      const value = z.object({ id: z.uuid(), action: z.enum(["save", "delete"]), status: z.enum(["new", "in-progress", "closed"]), note: z.string().max(20000), version: z.number().int().positive() }).strict().parse(input);
      requirePermission(identity, "inquiries", value.action === "delete" ? "delete" : "edit");
      const { error } = await client.rpc("cms_mutate_inquiry", { p_id: value.id, p_action: value.action, p_status: value.status, p_note: value.note, p_version: value.version }); databaseError(error); return reply({ ok: true });
    }
    if(path==="instagram/sync"){
 if(!identity.owner)throw new CmsError(403,"オーナーのみ同期できます。");
 if(!instagramReady())throw new CmsError(503,"認可・保存先・同期設定を確認してください。");
 return runInstagramJob(new Request(new URL("/api/jobs/instagram",request.url),{headers:{Authorization:"Bearer "+process.env.CRON_SECRET}}));
 }
 if (path === "instagram") {
      if (!identity.owner) throw new CmsError(403, "オーナーのみ変更できます。");
      const value = z.object({ accountId: z.string().regex(/^\d+$/).nullable(), username: z.string().regex(/^[A-Za-z0-9_.]{1,30}$/).nullable(), enabled: z.boolean(), autoPublish: z.boolean() }).strict().parse(input);
      // OAuth and secret provisioning have not been authorized/configured yet.
      if (value.enabled && !instagramReady()) throw new CmsError(409, "公式アカウントの確認と安全なAPI認可が完了してから有効化できます。");
      const { error } = await client.rpc("cms_configure_instagram", { p_account_id: value.accountId, p_username: value.username, p_enabled: value.enabled, p_auto_publish: value.autoPublish }); databaseError(error); return reply({ ok: true });
    }
    throw new CmsError(404, "対象が見つかりません。");
  } catch (error) { return failure(error); }
}
