import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/cms/site-metadata";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Preview is a separate, nonpublic environment; its HTML also carries noindex.
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  const site = await getSiteSettings();
  // Production noindex must remain crawlable so engines can see the HTML rule.
  // Private routes stay excluded regardless of the public indexing preference.
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/auth/"] },
    ...(site.indexing === "index" ? { sitemap: `${site.url}/sitemap.xml` } : {}),
  };
}
