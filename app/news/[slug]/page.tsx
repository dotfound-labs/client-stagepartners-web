import {getSiteSettings} from "@/lib/cms/site-metadata";
import PublishedPage from "@/components/PublishedPage";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsDetail from "@/components/NewsDetail";
import { getPublishedNews } from "@/lib/cms/public";

type Params = { params: Promise<{ slug: string }> };

/**
 * 全記事をビルド時にSSGする。
 * バックエンド接続後、記事が動的に増える運用にする場合は、この関数で
 * APIから slug 一覧を取得するようにし、下の dynamicParams = false を外す
 * (外すと、ビルド後に追加された記事も初回アクセス時に生成される)。
 */


export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPublishedNews();
  const post = posts.find(p => p.slug === slug);
  if (!post) return {};
  const site=await getSiteSettings();
  const title = `${post.title} | お知らせ | ${site.siteName}`;
  return {
    title,
    description: post.excerpt,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      title,
      description: post.excerpt,
      type: "article",
      locale: "ja_JP",
      images:["/site-assets/og"],
      siteName:site.siteName,
      publishedTime: post.firstPublishedAt ?? post.date,
      modifiedTime: post.contentUpdatedAt ?? undefined,
    },
  };
}

export default async function NewsPostPage({ params }: Params) {
  const { slug } = await params;
  const posts = await getPublishedNews();
  const post = posts.find(p => p.slug === slug);
  if (!post) notFound();
  const index = posts.indexOf(post);
  const prev = posts[index - 1] ?? null, next = posts[index + 1] ?? null;

  return (
    <PublishedPage slug="common">
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <NewsDetail post={post} prev={prev} next={next} />
      </main>
      <Footer />
    </PublishedPage>
  );
}

export const dynamic = "force-dynamic";
