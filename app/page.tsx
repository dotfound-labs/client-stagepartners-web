import type { Metadata } from "next";
import OrganizationData from "@/components/OrganizationData";
export const metadata: Metadata = { alternates: { canonical: "/" } };
import PublishedPage from "@/components/PublishedPage";
import { getPublishedWorks, getPublishedNews } from "@/lib/cms/public";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Message from "@/components/Message";
import Challenges from "@/components/Challenges";
import Business from "@/components/Business";
import Strengths from "@/components/Strengths";
import Works from "@/components/WorksTop";
import News from "@/components/News";
import ContactCta from "@/components/ContactCta";
import Footer from "@/components/Footer";

export default async function Home() {
  const [works, news] = await Promise.all([getPublishedWorks(), getPublishedNews()]);
  return (
    <PublishedPage slug="home">
      <OrganizationData />
      <Header transparent />
      <main id="main" className="flex flex-1 flex-col">
        <Hero />
        <Message />
        <Challenges />
        <Business />
        <Strengths />
        <Works works={works.filter(w => w.featured).slice(0, 3)} />
        <News posts={news.slice(0, 3)} />
        <ContactCta />
      </main>
      <Footer />
    </PublishedPage>
  );
}
