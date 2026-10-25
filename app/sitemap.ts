import {getSiteSettings} from "@/lib/cms/site-metadata";
import type { MetadataRoute } from "next";
import { getPublishedNews, getPublishedWorks } from "@/lib/cms/public";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site=await getSiteSettings();
  if(process.env.VERCEL_ENV==="preview"||site.indexing==="noindex")return [];
  const [works, news] = await Promise.all([getPublishedWorks(), getPublishedNews()]);
  const paths = ["", "/business", "/business/real-estate", "/business/architecture", "/company", "/contact", "/works", "/news", "/recruit", "/privacy", "/site-policy", "/tokushoho", ...works.map(w => `/works/${w.slug}`), ...news.map(n => `/news/${n.slug}`)];
  return paths.map(path => ({ url: `${site.url}${path || "/"}` }));
}
