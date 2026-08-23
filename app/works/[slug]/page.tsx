import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkDetail from "@/components/WorkDetail";
import { WORKS, getSiblings, getWork, workImage } from "@/lib/works";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return WORKS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
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
      locale: "ja_JP",
      images: [workImage(work, work.cover)],
    },
  };
}

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();
  const siblings = getSiblings(slug)!;

  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <WorkDetail work={work} prev={siblings.prev} next={siblings.next} />
      </main>
      <Footer />
    </>
  );
}

export const dynamicParams = false;
