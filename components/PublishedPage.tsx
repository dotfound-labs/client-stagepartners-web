import { getPageFields } from "@/lib/cms/public";
import { PageFieldsProvider } from "./CmsText";
export default async function PublishedPage({ slug = "common", children }: { slug?: string; children: React.ReactNode }) {
  return <PageFieldsProvider fields={await getPageFields(slug)}>{children}</PageFieldsProvider>;
}
