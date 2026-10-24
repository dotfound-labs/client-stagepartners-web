import { COMPANY_NAME, HEAD_OFFICE } from "@/content/company";
import { getPageFields } from "@/lib/cms/public";
import { textKey } from "@/lib/cms/text-key";
export default async function OrganizationData() {
  const fields = await getPageFields("common");
  const text = (value: string) => fields[textKey(value)] ?? value;
  const data = { "@context": "https://schema.org", "@type": "Organization", name: text(COMPANY_NAME), url: "https://www.stagepartners.co.jp/", address: { "@type": "PostalAddress", streetAddress: text(HEAD_OFFICE.address), postalCode: text(HEAD_OFFICE.postalCode), addressCountry: "JP" } };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
