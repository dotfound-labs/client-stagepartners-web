"use client";

import Link from "next/link";
import { useState } from "react";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults, prefersReducedMotion, drawLine } from "@/lib/animations";
import {
  NEWS_CATEGORY_LABEL,
  formatNewsDate,
  type NewsCategory,
  type NewsPost,
} from "@/content/news";

/**
 * お知らせ一覧(/news)。
 *
 * 記事データは props で受け取る。ここで content/news.ts を直接読まないのは、
 * バックエンド接続時に app/news/page.tsx 側で await して渡すだけで
 * 済むようにするため(このコンポーネントは変更不要になる)。
 *
 * カテゴリのタブは NEWS_CATEGORY_LABEL から自動生成しているので、
 * カテゴリを増やしてもここは触らなくてよい。件数が0のカテゴリは出さない。
 */
type Filter = "all" | NewsCategory;

type Props = { posts: NewsPost[] };

export default function NewsIndex({ posts }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    const q = gsap.utils.selector(scope);
    if (prefersReducedMotion()) return;

    gsap
      .timeline({ delay: 0.15 })
      .from(q("[data-hero-eyebrow]"), { opacity: 0, y: 14, duration: 0.8, ease: "power2.out" })
      .from(q("[data-hero-title]"), { opacity: 0, y: 26, duration: 1, ease: "expo.out" }, "-=0.5")
      .from(q("[data-hero-lead]"), { opacity: 0, y: 18, duration: 0.9, ease: "power2.out" }, "-=0.7")
      .from(q("[data-tab]"), { opacity: 0, y: 12, duration: 0.6, stagger: 0.07, ease: "power2.out" }, "-=0.6");

    drawLine(q("[data-rule]"), { duration: 0.9 });

    gsap.from(q("[data-news-row]"), {
      opacity: 0,
      y: 22,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: { trigger: q("[data-news-list]")[0], ...scrollTriggerDefaults },
    });
  }, []);

  // 件数が0のカテゴリはタブに出さない(記事が増減しても破綻しないようにする)
  const categories = (Object.keys(NEWS_CATEGORY_LABEL) as NewsCategory[]).filter((c) =>
    posts.some((p) => p.category === c),
  );
  const tabs: { value: Filter; label: string }[] = [
    { value: "all", label: "すべて" },
    ...categories.map((c) => ({ value: c as Filter, label: NEWS_CATEGORY_LABEL[c] })),
  ];

  const shown = posts.filter((p) => filter === "all" || p.category === filter);

  return (
    <div ref={rootRef}>
      {/* ヒーロー。写真を持たないページなので、施工実績より控えめな高さにする */}
      <section className="on-dark relative flex min-h-[42svh] w-full items-end overflow-hidden bg-navy pb-14 pt-32 text-on-dark sm:pb-16 lg:min-h-[46svh]">
        <div className="relative z-10 mx-auto w-full max-w-[1520px] px-6 sm:px-10 lg:px-16 xl:px-24">
          <p
            data-hero-eyebrow
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/70 sm:text-[11px]"
          >
            <span data-rule aria-hidden className="inline-block h-px w-10 bg-on-dark/40" />
            NEWS
          </p>
          <h1 data-hero-title className="t-heading mt-7 font-display font-normal text-on-dark">
            お知らせ
          </h1>
          <p data-hero-lead className="t-note mt-6 max-w-xl text-on-dark/80">
            新着情報や施工実績の公開、現場の様子など、STAGE PARTNERSからのお知らせをお届けします。
          </p>
        </div>
      </section>

      {/* カテゴリ */}
      <nav
        aria-label="お知らせの絞り込み"
        className="w-full border-b border-line bg-stone px-6 py-5 sm:px-10 lg:px-16 xl:px-24"
      >
        <ul className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-x-3 gap-y-2">
          {tabs.map((tab) => {
            const active = tab.value === filter;
            const count =
              tab.value === "all"
                ? posts.length
                : posts.filter((p) => p.category === tab.value).length;
            return (
              <li key={tab.value} data-tab>
                <button
                  type="button"
                  onClick={() => setFilter(tab.value)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2.5 px-5 py-2.5 text-xs tracking-[0.12em] transition-colors duration-300 ${active
                    ? "bg-navy text-on-dark"
                    : "border border-line text-ink-muted hover:border-ink/40 hover:text-ink"
                    }`}
                >
                  {tab.label}
                  <span className="font-latin text-[10px] opacity-60">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 一覧。TOPのお知らせセクションと同じ行の組み方にそろえる */}
      <section className="w-full bg-paper px-6 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
        <div className="mx-auto max-w-[1520px]">
          {shown.length === 0 ? (
            <p className="t-note py-16 text-center text-ink-muted">
              該当するお知らせはまだありません。
            </p>
          ) : (
            <ul data-news-list className="flex flex-col">
              {shown.map((post) => (
                <li
                  key={post.slug}
                  data-news-row
                  className="border-t border-line last:border-b"
                >
                  <Link
                    href={`/news/${post.slug}`}
                    className="group flex flex-col gap-2 py-7 transition-opacity hover:opacity-60 sm:flex-row sm:items-center sm:gap-8"
                  >
                    <time
                      dateTime={post.date}
                      className="font-latin text-[11px] tracking-[0.14em] text-ink-muted sm:w-24 sm:shrink-0"
                    >
                      {formatNewsDate(post.date)}
                    </time>
                    <span className="w-fit border border-line px-3 py-1 font-latin text-[10px] tracking-[0.15em] text-ink-muted sm:shrink-0">
                      {NEWS_CATEGORY_LABEL[post.category]}
                    </span>
                    <span className="text-sm font-normal leading-relaxed text-ink sm:text-base">
                      {post.title}
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
          )}
        </div>
      </section>
    </div>
  );
}
