import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { CmsError, requireIdentity, requirePermission } from "@/lib/cms/server";
import { parseContent, type Module, type WorkData, type NewsData, type PageData } from "@/lib/cms/model";
import { toWork } from "@/lib/cms/public";
import WorkDetail from "@/components/WorkDetail";
import NewsDetail from "@/components/NewsDetail";
import PagePreview from "@/components/admin/PagePreview";
import "@/components/admin/admin.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "下書きプレビュー | STAGE PARTNERS", robots: { index: false, follow: false } };
export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  const id = z.uuid().safeParse((await params).id); if (!id.success) notFound();
  let access;
  try { access = await requireIdentity(); } catch (e) { if (e instanceof CmsError && e.status === 401) redirect("/admin"); notFound(); }
  const result = await access.client.from("cms_documents").select("*").eq("id", id.data).maybeSingle();
  if (result.error || !result.data) notFound();
  const doc = result.data; requirePermission(access.identity, doc.module as Module, "read");
  const data = parseContent(doc.module, doc.draft);
  return <><div className="admin-preview-bar">下書きプレビュー · 一般の訪問者には表示されません<a href="/admin">管理画面に戻る</a></div><main id="main">{doc.module === "works" ? <WorkDetail work={toWork(doc.slug, data as WorkData)} prev={toWork(doc.slug, data as WorkData)} next={toWork(doc.slug, data as WorkData)} /> : doc.module === "news" ? <NewsDetail post={{ ...(data as NewsData), slug: doc.slug, sourceUrl: doc.source_url ?? undefined }} prev={null} next={null} /> : <PagePreview slug={doc.slug} data={data as PageData} />}</main></>;
}
