import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsDetail from "@/components/NewsDetail";
import { NEWS, getNewsPost, getNewsSiblings } from "@/content/news";

type Params = { params: Promise<{ slug: string }> };

/**
 * 全記事をビルド時にSSGする。
 * バックエンド接続後、記事が動的に増える運用にする場合は、この関数で
 * APIから slug 一覧を取得するようにし、下の dynamicParams = false を外す
 * (外すと、ビルド後に追加された記事も初回アクセス時に生成される)。
 */
export function generateStaticParams() {
  return NEWS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getNewsPost(slug);
  if (!post) return {};
  const title = `${post.title} | お知らせ | STAGE PARTNERS`;
  return {
    title,
    description: post.excerpt,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      title,
      description: post.excerpt,
      type: "article",
      locale: "ja_JP",
      publishedTime: post.date,
    },
  };
}

export default async function NewsPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getNewsPost(slug);
  if (!post) notFound();
  const { prev, next } = getNewsSiblings(slug);

  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <NewsDetail post={post} prev={prev} next={next} />
      </main>
      <Footer />
    </>
  );
}

export const dynamicParams = false;
