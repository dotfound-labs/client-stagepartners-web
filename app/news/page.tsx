import type { Metadata } from "next";
import Header from "@/components/Header";
import NewsIndex from "@/components/NewsIndex";
import Footer from "@/components/Footer";
import { getAllNews } from "@/content/news";

export const metadata: Metadata = {
  title: "お知らせ | STAGE PARTNERS",
  description:
    "STAGE PARTNERSからのお知らせ一覧です。新着情報・施工実績の公開・現場の様子などをお届けします。",
  alternates: { canonical: "/news" },
};

/**
 * お知らせ一覧。
 *
 * バックエンド接続時は getAllNews() を async にして、ここを
 * `const posts = await getAllNews();` に変えるだけで動く。
 * CMSの更新を反映させたい場合は `export const revalidate = 60;` を追加する。
 */
export default function NewsPage() {
  const posts = getAllNews();

  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <NewsIndex posts={posts} />
      </main>
      <Footer />
    </>
  );
}
