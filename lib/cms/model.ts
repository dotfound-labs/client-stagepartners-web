import { z } from "zod";

export const MODULES = {
  works: { label: "施工実績", capabilities: ["read", "edit", "publish", "delete"] },
  news: { label: "お知らせ", capabilities: ["read", "edit", "publish", "delete"] },
  pages: { label: "ページ編集", capabilities: ["read", "edit", "publish", "delete"] },
  media: { label: "画像", capabilities: ["read", "edit", "delete"] },
  inquiries: { label: "問い合わせ", capabilities: ["read", "edit", "delete"] },
  users: { label: "管理者権限", capabilities: ["manage"] },
  settings: { label: "設定", capabilities: ["read", "edit"] },
} as const;
export type Module = keyof typeof MODULES;
export type Capability = "read" | "edit" | "publish" | "delete" | "manage";
export const CAPABILITY_LABEL: Record<Capability, string> = { read: "閲覧", edit: "追加・編集", publish: "公開・非公開", delete: "削除", manage: "管理者の閲覧・権限管理" };
export type Permission = { module: Module; capability: Capability };
export type Identity = { id: string; email: string; owner: boolean; permissions: Permission[] };
export function can(user: Identity, module: Module, capability: Capability) {
  return user.owner || user.permissions.some(p => p.module === module && p.capability === capability);
}
export function canRead(user: Identity, module: Module) { return can(user, module, module === "users" ? "manage" : "read"); }
export const slugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(120);
const text = z.string().trim().min(1).max(200);
const photoSchema = z.object({ media_id: z.uuid().optional(), legacy_path: z.string().regex(/^\/works\/[a-z0-9-]+\/[a-zA-Z0-9_-]+\.(jpg|png|webp|avif)$/).optional(), alt: z.string().trim().min(1).max(500), state: z.enum(["before", "after"]).optional() }).strict().refine(p => !!p.media_id !== !!p.legacy_path, "画像を1つ指定してください。");
export const workSchema = z.object({ slug: slugSchema.optional(), title: text, category: z.enum(["store", "facility"]), type: text, summary: z.string().max(10000), date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(), featured: z.boolean().optional(), cover: photoSchema, shots: z.array(photoSchema.safeExtend({ state: z.enum(["before", "after"]) })).min(1).max(100) }).strict();
export const newsSchema = z.object({ slug: slugSchema.optional(), title: text, category: z.enum(["info", "works", "instagram"]), date: z.iso.date(), excerpt: z.string().max(2000), body: z.array(z.string().max(20000)).min(1).max(100) }).strict();
export const pageImageSchema = z.object({media_id:z.uuid().optional(),legacy_path:z.string().regex(/^\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp|avif)$/i).optional(),alt:z.string().max(500)}).strict().refine(p=>!!p.media_id!==!!p.legacy_path);
export const pageSchema = z.object({ title: text, fields: z.record(z.string().max(100), z.string().max(20000)),images:z.record(z.string().max(100),pageImageSchema).optional() }).strict();
export type Photo = z.infer<typeof photoSchema>;
export type WorkData = z.infer<typeof workSchema>;
export type NewsData = z.infer<typeof newsSchema>;
export type PageData = z.infer<typeof pageSchema>;
export type ContentData = WorkData | NewsData | PageData;
export type ContentModule = "works" | "news" | "pages" | "settings";
export type Document = { id: string; module: ContentModule; slug: string; draft: ContentData; version: number; archived: boolean; source: "manual" | "instagram"; source_url: string | null; updated_at: string; published?: { version: number } | null };
export type Media = { id: string; original_name: string; alt: string; ready: boolean; deletion_requested: boolean; mime_type: string; size_bytes: number };
export type Revision = { id: number; version: number; action: string; data: ContentData; created_at: string };
export function parseContent(module: ContentModule, data: unknown) { return (module === "works" ? workSchema : module === "news" ? newsSchema : pageSchema).parse(data); }
export function photoUrl(photo: Photo) { return photo.media_id ? `/api/media/${photo.media_id}` : photo.legacy_path ?? ""; }
