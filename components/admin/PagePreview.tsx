import { PageFieldsProvider } from "@/components/CmsText";
import { getPageFields, getPublishedWorks, getPublishedNews } from "@/lib/cms/public";
import { type PageData } from "@/lib/cms/model";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Message from "@/components/Message";
import Challenges from "@/components/Challenges";
import Business from "@/components/Business";
import Strengths from "@/components/Strengths";
import ContactCta from "@/components/ContactCta";
import Works from "@/components/WorksTop";
import News from "@/components/News";
import Company from "@/components/Company";
import Architecture from "@/components/ArchitectureSolution";
import RealEstate from "@/components/RealEstateSolution";
import { PAGE_TEMPLATES } from "@/content/page-fields";
export default async function PagePreview({slug,data}:{slug:string;data:PageData}) {
  const fields = {...await getPageFields("common"),...data.fields};
  const [works,news] = slug === "home" ? await Promise.all([getPublishedWorks(),getPublishedNews()]) : [[],[]];
  return <PageFieldsProvider fields={fields}><Header />{slug === "home" ? <><Hero /><Message /><Challenges /><Business /><Strengths /><Works works={works.filter(w=>w.featured).slice(0,3)} /><News posts={news.slice(0,3)} /><ContactCta /></> : slug === "company" ? <Company /> : slug === "architecture" ? <Architecture /> : slug === "real-estate" ? <RealEstate /> : <section className="admin-app"><div className="admin-main"><h1>{data.title}</h1><p>各項目の内容確認（公開ページの配置は変更されません）</p>{PAGE_TEMPLATES[slug]?.fields.map(f=><article className="admin-card" key={f.id}><h2>{f.label}</h2><p className="admin-prewrap">{data.fields[f.id]??f.value}</p></article>)}</div></section>}<Footer /></PageFieldsProvider>;
}
