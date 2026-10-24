import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { publicClient } from "./server";
import { WORKS, type Work } from "@/content/works";
import { NEWS, type NewsPost } from "@/content/news";
import { PAGE_TEMPLATES } from "@/content/page-fields";
import { parseContent, photoUrl, type WorkData, type NewsData, type PageData, type ContentModule } from "./model";

export const published = cache(async (module: ContentModule) => {
  const client = publicClient();
  if (!client) return null;
  const { data, error } = await client.from("cms_published").select("slug,data,source,source_url,published_at").eq("module", module).limit(1000);
  if (error) throw new Error("公開コンテンツを読み込めませんでした。");
  return data ?? [];
});
export function toWork(slug: string, data: WorkData): Work {
  return { slug, title: data.title, category: data.category, type: data.type, summary: data.summary, date: data.date, cover: photoUrl(data.cover), featured: data.featured, shots: data.shots.map(s => ({ file: photoUrl(s), state: s.state, alt: s.alt })) };
}
export const getPublishedWorks = cache(async (): Promise<Work[]> => {
  const rows = await published("works");
  if (rows === null) return WORKS.map(w => ({ ...w, featured: ["zentoku", "issekisancho", "deltaring-gym"].includes(w.slug) }));
  return rows.map(row => toWork(row.slug, parseContent("works", row.data) as WorkData)).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
});
export const getPublishedNews = cache(async (): Promise<NewsPost[]> => {
  const rows = await published("news");
  if (rows === null) return [...NEWS].sort((a, b) => b.date.localeCompare(a.date));
  return rows.map(row => ({ ...(parseContent("news", row.data) as NewsData), slug: row.slug, sourceUrl: row.source === "instagram" ? row.source_url ?? undefined : undefined })).sort((a, b) => b.date.localeCompare(a.date));
});
export const getPageContent = cache(async (slug: string):Promise<PageData> => {
  const rows=await published(slug==='common'?'settings':'pages');
  if(rows===null){const template=PAGE_TEMPLATES[slug];if(!template)notFound();return {title:template.title,fields:Object.fromEntries(template.fields.map(f=>[f.id,f.value]))};}
  const row=rows.find(row=>row.slug===slug);if(!row)notFound();
  return parseContent(slug==='common'?'settings':'pages',row.data) as PageData;
});
export const getPageFields=cache(async(slug:string)=>(await getPageContent(slug)).fields);