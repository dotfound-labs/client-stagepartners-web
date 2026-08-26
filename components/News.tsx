"use client";

import Link from "next/link";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";
import {
  NEWS_CATEGORY_LABEL,
  formatNewsDate,
  getLatestNews,
  type NewsPost,
} from "@/lib/news";

/**
 * TOPのお知らせセクション。最新3件を出す。
 *
 * データは lib/news.ts を唯一の情報源にしているため、記事を追加すれば
 * 一覧(/news)とこのセクションは常に同じ内容を指す(TOP用の別配列は持たない)。
 *
 * バックエンド接続時: getLatestNews() を async にすると client component の
 * このファイルからは呼べなくなるため、app/page.tsx 側で
 * `const posts = await getLatestNews(3)` して `<News posts={posts} />` と
 * 渡す形にする。props は既に受け取れるようにしてあるので、その際
 * このファイルで直すのは「props が無ければ getLatestNews() を使う」
 * フォールバックの1行を消すだけでよい。
 */
type Props = { posts?: NewsPost[] };

export default function News({ posts }: Props) {
  const items = posts ?? getLatestNews(3);
  const sectionRef = useScopedGsap<HTMLElement>(({ scope }) => {
    // 左カラム([data-news-head])は高さが小さく、end("bottom 20%")を
    // すぐ通過してreverseが走り、閲覧中にボタンが消えてしまう。
    // セクション全体をトリガーにして、表示中は消えないようにする。
    gsap.from("[data-news-fade]", {
      opacity: 0,
      y: 24,
      duration: 1,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: scope.current,
        ...scrollTriggerDefaults,
      },
    });

    gsap.from("[data-news-row]", {
      opacity: 0,
      y: 22,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: "[data-news-list]",
        ...scrollTriggerDefaults,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="news"
      className="w-full bg-stone px-6 py-24 sm:px-10 lg:px-16 lg:py-32 xl:px-24"
    >
      <div className="mx-auto grid max-w-[1520px] grid-cols-1 gap-12 lg:grid-cols-[360px_1fr] lg:gap-20">
        <div data-news-head>
          <p
            data-news-fade
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]"
          >
            <span aria-hidden className="inline-block h-px w-10 bg-ink/25" />
            NEWS
          </p>
          <h2
            data-news-fade
            className="t-heading mt-8 font-display font-normal text-ink"
          >
            お知らせ
          </h2>
          {/* gsapでopacityをアニメーションする要素にTailwindのtransition-opacityが
              同居すると競合して表示されないため、ラッパー側をアニメーション対象にする。 */}
          <div data-news-fade className="mt-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-3 bg-navy px-8 py-4 text-xs font-medium tracking-[0.2em] text-on-dark transition-opacity hover:opacity-80"
            >
              お知らせ一覧を見る
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <ul data-news-list className="flex flex-col">
          {items.map((item) => (
            <li key={item.slug} data-news-row className="border-t border-line last:border-b">
              <Link
                href={`/news/${item.slug}`}
                className="group flex flex-col gap-2 py-7 transition-opacity hover:opacity-60 sm:flex-row sm:items-center sm:gap-8"
              >
                <time
                  dateTime={item.date}
                  className="font-latin text-[11px] tracking-[0.14em] text-ink-muted sm:w-24 sm:shrink-0"
                >
                  {formatNewsDate(item.date)}
                </time>
                <span className="w-fit border border-line px-3 py-1 font-latin text-[10px] tracking-[0.15em] text-ink-muted sm:shrink-0">
                  {NEWS_CATEGORY_LABEL[item.category]}
                </span>
                <span className="text-sm font-normal leading-relaxed text-ink sm:text-base">
                  {item.title}
                </span>
                <span
                  aria-hidden
                  className="hidden text-ink/40 transition-transform group-hover:translate-x-1 sm:ml-auto sm:block"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
