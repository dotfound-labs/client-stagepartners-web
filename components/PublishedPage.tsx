import { getPageContent } from "@/lib/cms/public";
import { PageFieldsProvider } from "./CmsText";
export default async function PublishedPage({ slug = "common", children }: { slug?: string; children: React.ReactNode }) {
  const [page,common]=await Promise.all([getPageContent(slug),getPageContent("common")]);
  return <PageFieldsProvider scope={slug} page={page} common={common}>{children}</PageFieldsProvider>;
}
