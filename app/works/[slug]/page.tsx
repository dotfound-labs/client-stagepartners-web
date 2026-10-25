import PublishedPage from "@/components/PublishedPage";
import { getPublishedWorks } from "@/lib/cms/public";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkDetail from "@/components/WorkDetail";
import { workImage } from "@/content/works";

type Params = { params: Promise<{ slug: string }> };



export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const works = await getPublishedWorks();
  const work = works.find(w => w.slug === slug);
  if (!work) return {};
  const title = `${work.title}｜${work.type} | 施工実績 | STAGE PARTNERS`;
  return {
    title,
    description: work.summary,
    alternates: { canonical: `/works/${work.slug}` },
    openGraph: {
      title,
      description: work.summary,
      type: "article",
      publishedTime: work.firstPublishedAt ?? undefined,
      modifiedTime: work.contentUpdatedAt ?? undefined,
      locale: "ja_JP",
      images: [workImage(work, work.cover)],
    },
  };
}

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const works = await getPublishedWorks();
  const work = works.find(w => w.slug === slug);
  if (!work) notFound();
  const index = works.indexOf(work);
  const siblings = { prev: works[(index - 1 + works.length) % works.length], next: works[(index + 1) % works.length] };

  return (
    <PublishedPage slug="common">
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <WorkDetail work={work} prev={siblings.prev} next={siblings.next} />
      </main>
      <Footer />
    </PublishedPage>
  );
}

export const dynamic = "force-dynamic";
