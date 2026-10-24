"use client";

import Link from "next/link";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { prefersReducedMotion, drawLine } from "@/lib/animations";
import { NEWS_CATEGORY_LABEL, formatNewsDate, type NewsPost } from "@/content/news";

/**
 * お知らせ詳細(/news/[slug])。
 *
 * 記事データは props で受け取る(NewsIndex と同じ理由。バックエンド接続時に
 * app/news/[slug]/page.tsx 側で await して渡すだけで済むようにするため)。
 *
 * 本文は段落の配列(post.body)を <p> で並べているだけ。CMSのリッチテキスト
 * (HTML文字列)に移行する場合は、この本文描画のブロックだけを
 * dangerouslySetInnerHTML なり専用レンダラなりに差し替えればよい。
 * その際はサニタイズを必ず通すこと。
 */
type Props = {
  post: NewsPost;
  prev: NewsPost | null;
  next: NewsPost | null;
};

export default function NewsDetail({ post, prev, next }: Props) {
  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    const q = gsap.utils.selector(scope);
    if (prefersReducedMotion()) return;

    gsap
      .timeline({ delay: 0.15 })
      .from(q("[data-hero-crumb]"), { opacity: 0, y: 12, duration: 0.7, ease: "power2.out" })
      .from(q("[data-hero-meta]"), { opacity: 0, y: 14, duration: 0.7, ease: "power2.out" }, "-=0.4")
      .from(q("[data-hero-title]"), { opacity: 0, y: 26, duration: 1, ease: "expo.out" }, "-=0.45");

    drawLine(q("[data-rule]"), { duration: 0.9 });

    gsap.from(q("[data-body-block]"), {
      opacity: 0,
      y: 20,
      duration: 0.85,
      ease: "power2.out",
      stagger: 0.09,
      delay: 0.35,
    });
  }, [post.slug]);

  return (
    <div ref={rootRef}>
      {/* ヒーロー。施工実績の詳細と同じ骨格にそろえる(写真は持たない) */}
      <section className="on-dark relative flex min-h-[42svh] w-full items-end overflow-hidden bg-navy pb-14 pt-32 text-on-dark sm:pb-16 lg:min-h-[46svh]">
        <div className="relative z-10 mx-auto w-full max-w-[1520px] px-6 sm:px-10 lg:px-16 xl:px-24">
          <nav data-hero-crumb aria-label="パンくず">
            <ol className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.12em] text-on-dark/60">
              <li>
                <Link href="/news" className="transition-colors hover:text-on-dark">
                  お知らせ
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-on-dark/85">{NEWS_CATEGORY_LABEL[post.category]}</li>
            </ol>
          </nav>

          <div data-hero-meta className="mt-7 flex flex-wrap items-center gap-4">
            <time
              dateTime={post.date}
              className="font-latin text-[11px] tracking-[0.2em] text-on-dark/70"
            >
              {formatNewsDate(post.date)}
            </time>
            <span className="border border-on-dark/30 px-3 py-1 font-latin text-[10px] tracking-[0.15em] text-on-dark/75">
              {NEWS_CATEGORY_LABEL[post.category]}
            </span>
          </div>

          <h1
            data-hero-title
            className="t-heading-tight mt-5 max-w-3xl font-display font-normal text-on-dark"
          >
            {post.title}
          </h1>
        </div>
      </section>

      {/* 本文 */}
      <article className="w-full bg-paper px-6 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
        <div className="mx-auto max-w-3xl">
          <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
            <span data-rule aria-hidden className="inline-block h-px w-10 bg-ink/25" />
            NEWS
          </p>

          {post.sourceUrl && <p className="mt-8"><a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Instagramの元の投稿を見る ↗</a></p>}
            <div className="mt-12 space-y-6">
            {post.body.map((paragraph, i) => (
              <p
                key={i}
                data-body-block
                className="t-note leading-loose text-ink-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>

      {/* 前後の記事。端では反対側だけを出す */}
      {(prev || next) && (
        <section className="w-full border-t border-line bg-stone px-6 py-14 sm:px-10 lg:px-16 xl:px-24">
          <div className="mx-auto grid max-w-[1520px] grid-cols-1 gap-8 sm:grid-cols-2">
            {prev ? (
              <Link href={`/news/${prev.slug}`} className="group">
                <span className="font-latin text-[10px] tracking-[0.3em] text-ink-muted">PREV</span>
                <p className="mt-3 flex items-center gap-3 text-sm text-ink transition-opacity group-hover:opacity-60">
                  <span
                    aria-hidden
                    className="inline-block h-px w-9 shrink-0 bg-ink transition-all duration-300 group-hover:w-12"
                  />
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span aria-hidden />
            )}
            {next ? (
              <Link href={`/news/${next.slug}`} className="group sm:text-right">
                <span className="font-latin text-[10px] tracking-[0.3em] text-ink-muted">NEXT</span>
                <p className="mt-3 flex items-center gap-3 text-sm text-ink transition-opacity group-hover:opacity-60 sm:justify-end">
                  {next.title}
                  <span
                    aria-hidden
                    className="inline-block h-px w-9 shrink-0 bg-ink transition-all duration-300 group-hover:w-12"
                  />
                </p>
              </Link>
            ) : (
              <span aria-hidden />
            )}
          </div>
        </section>
      )}

      {/* CTA。施工実績の詳細と同じ型 */}
      <section className="on-dark w-full bg-navy px-6 py-20 text-on-dark sm:px-10 lg:px-16 lg:py-24 xl:px-24">
        <div className="mx-auto max-w-[1520px]">
          <p className="t-body max-w-xl font-display font-light text-on-dark/90">
            土地と建物のことで気になることがあれば、お気軽にご相談ください。
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 bg-on-dark px-8 py-4 text-xs font-medium tracking-[0.2em] text-navy transition-colors duration-300 hover:bg-navy-mid hover:text-on-dark"
            >
              お問い合わせ
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/news"
              className="inline-flex items-center gap-2.5 border border-on-dark/30 px-6 py-3.5 text-xs tracking-[0.12em] text-on-dark/80 transition-colors duration-300 hover:border-on-dark hover:text-on-dark"
            >
              お知らせ一覧へ戻る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
