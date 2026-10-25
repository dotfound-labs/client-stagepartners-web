import {getSiteSettings} from "@/lib/cms/site-metadata";
import { COMPANY_NAME, HEAD_OFFICE } from "@/content/company";
import { getPageFields } from "@/lib/cms/public";
import { textKey } from "@/lib/cms/text-key";
export default async function OrganizationData() {
  const site=await getSiteSettings();
  const fields = await getPageFields("common");
  const text = (value: string) => fields[`common.${textKey(value)}`] ?? value;
  const data = { "@context": "https://schema.org", "@type": "Organization", name: text(COMPANY_NAME), url: site.url+"/", logo: site.url+"/site-assets/logo", address: { "@type": "PostalAddress", streetAddress: text(HEAD_OFFICE.address), postalCode: text(HEAD_OFFICE.postalCode), addressCountry: "JP" } };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([data,{"@context":"https://schema.org","@type":"WebSite",name:site.siteName,url:site.url+"/"}]).replace(/</g, "\\u003c") }} />;
}
