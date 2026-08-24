"use client";

import Image from "next/image";
import Link from "next/link";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import {
  scrollTriggerDefaults,
  prefersReducedMotion,
  drawLine,
  staggerFadeUp,
} from "@/lib/animations";
import { CATEGORY_LABEL, workImage, type Work } from "@/lib/works";
import WorkPhotos from "@/components/WorkPhotos";

type Props = { work: Work; prev: Work; next: Work };

export default function WorkDetail({ work, prev, next }: Props) {
  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    const q = gsap.utils.selector(scope);
    if (prefersReducedMotion()) return;

    gsap.from(q("[data-hero-media]"), { scale: 1.14, duration: 2, ease: "power2.out" });
    gsap
      .timeline({ delay: 0.15 })
      .from(q("[data-hero-crumb]"), { opacity: 0, y: 12, duration: 0.7, ease: "power2.out" })
      .from(q("[data-hero-title]"), { opacity: 0, y: 28, duration: 1, ease: "expo.out" }, "-=0.4")
      .from(q("[data-hero-meta]"), { opacity: 0, y: 16, duration: 0.8, stagger: 0.08, ease: "power2.out" }, "-=0.6");

    gsap.utils.toArray<HTMLElement>(scope.current!.querySelectorAll("[data-section]")).forEach((section) => {
      const inSection = gsap.utils.selector(section);
      const trigger = { trigger: section, ...scrollTriggerDefaults };
      const rule = inSection("[data-rule]");
      if (rule.length) drawLine(rule, { duration: 0.9, scrollTrigger: trigger });
      const fades = inSection("[data-fade]");
      if (fades.length) staggerFadeUp(fades, { duration: 0.85, scrollTrigger: trigger });
    });

    // 施工の記録: 施工前は最初から見えている状態から軽くfadeUpするだけにし、
    // 「これが元の状態」であることをまず見せる。施工後は逆に、スクロールに
    // 連動してclip-pathが開き、施工前の上から現れるように見せる。
    // ドラッグで操作するスライダーをやめた代わりに、スクロールという
    // 誰もが必ず行う操作そのものを「めくる」動作に変える。
    const photoWrap = q("[data-photo-wrap]")[0];
    if (photoWrap) {
      const trigger = { trigger: photoWrap, ...scrollTriggerDefaults };
      const beforePhotos = photoWrap.querySelectorAll('[data-photo-col="before"] [data-photo]');
      const revealBox = photoWrap.querySelector("[data-photo-reveal]");
      const afterPhotos = revealBox ? revealBox.querySelectorAll("[data-photo]") : [];
      const heads = photoWrap.querySelectorAll("[data-photo-head]");
      const arrow = photoWrap.querySelectorAll("[data-photo-arrow]");
      const divider = photoWrap.querySelectorAll("[data-photo-divider]");
      const flatPhotos = photoWrap.querySelectorAll('[data-photo-col="flat"] [data-photo]');

      if (revealBox) {
        gsap.from(heads, {
          opacity: 0,
          y: 14,
          duration: 0.7,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: trigger,
        });
        staggerFadeUp(beforePhotos, { duration: 0.8, stagger: 0.08, scrollTrigger: trigger });
        if (arrow.length) {
          gsap.from(arrow, {
            opacity: 0,
            scale: 0.4,
            duration: 0.6,
            delay: 0.25,
            ease: "back.out(2.4)",
            scrollTrigger: trigger,
          });
        }
        if (divider.length) {
          gsap.from(divider, {
            scaleY: 0,
            transformOrigin: "top center",
            duration: 1,
            ease: "none",
            scrollTrigger: {
              trigger: photoWrap,
              start: "top 70%",
              end: "bottom 65%",
              scrub: 0.6,
            },
          });
        }

        // 施工後: 上から覆いを外すように、スクロールに合わせて開く。
        // clip-pathなので画像自体は動かさず、見える範囲だけが変わる。
        gsap.fromTo(
          revealBox,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: photoWrap,
              start: "top 65%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          },
        );
        gsap.fromTo(
          afterPhotos,
          { scale: 1.06 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: photoWrap,
              start: "top 65%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          },
        );
      } else if (flatPhotos.length) {
        staggerFadeUp(flatPhotos, { duration: 0.85, scrollTrigger: trigger });
      }
    }
  }, [work.slug]);

  const isFacility = work.category === "facility";
  const hasBefore = work.shots.some((s) => s.state === "before");
  const hasSplit = !isFacility && hasBefore;

  return (
    <div ref={rootRef}>
      {/* ヒーロー */}
      <section className="on-dark relative flex min-h-[62svh] w-full items-end overflow-hidden bg-navy pb-16 pt-32 text-on-dark sm:pb-20 lg:min-h-[68svh]">
        <div data-hero-media aria-hidden className="absolute inset-0">
          <Image
            src={workImage(work, work.cover)}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/58 to-navy/92" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1520px] px-6 sm:px-10 lg:px-16 xl:px-24">
          <nav data-hero-crumb aria-label="パンくず">
            <ol className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.12em] text-on-dark/60">
              <li>
                <Link href="/works" className="transition-colors hover:text-on-dark">
                  施工実績
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-on-dark/85">{work.title}</li>
            </ol>
          </nav>

          <h1 data-hero-title className="t-heading mt-6 font-display font-normal text-on-dark">
            {work.title}
          </h1>

          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
            <div data-hero-meta>
              <dt className="font-latin text-[10px] tracking-[0.3em] text-on-dark/45">TYPE</dt>
              <dd className="mt-2 text-sm text-on-dark/85">{work.type}</dd>
            </div>
            <div data-hero-meta>
              <dt className="font-latin text-[10px] tracking-[0.3em] text-on-dark/45">CATEGORY</dt>
              <dd className="mt-2 text-sm text-on-dark/85">{CATEGORY_LABEL[work.category]}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 概要 */}
      <section
        data-section
        className="w-full bg-paper px-6 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
            <span data-rule aria-hidden className="inline-block h-px w-10 bg-ink/25" />
            OVERVIEW
          </p>
          <p data-fade className="t-note mt-7 max-w-2xl text-ink-muted">
            {work.summary}
          </p>
        </div>
      </section>

      {/* 施工の記録。全案件で同じ見出し・同じ骨格にする。
          店舗案件で施工前の写真がある場合だけ、左に施工前・右に施工後を並べる。
          施設営繕・解体、または施工後しかない案件は単カラムにする。 */}
      <section
        data-section
        className="w-full overflow-hidden bg-paper px-6 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
            <span data-rule aria-hidden className="inline-block h-px w-10 bg-ink/25" />
            PHOTOS
          </p>
          <h2 data-fade className="t-heading-tight mt-7 font-display font-normal text-ink">
            施工の記録
          </h2>
          <p data-fade className="t-note mt-5 max-w-lg text-ink-muted">
            {hasSplit
              ? "スクロールに合わせて、施工前から施工後へ1組ずつご覧いただけます。"
              : isFacility
                ? "現場の記録です。"
                : "施工後の様子です。"}
          </p>
        </div>

        <div data-photo-wrap className="mx-auto mt-12 max-w-[1520px]">
          <WorkPhotos work={work} />
        </div>
      </section>

      {/* 前後の実績 */}
      <section className="w-full border-t border-line bg-stone px-6 py-14 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 gap-8 sm:grid-cols-2">
          <Link href={`/works/${prev.slug}`} className="group">
            <span className="font-latin text-[10px] tracking-[0.3em] text-ink-muted">PREV</span>
            <p className="mt-3 flex items-center gap-3 text-sm text-ink transition-opacity group-hover:opacity-60">
              <span aria-hidden className="inline-block h-px w-9 bg-ink transition-all duration-300 group-hover:w-12" />
              {prev.title}
            </p>
          </Link>
          <Link href={`/works/${next.slug}`} className="group sm:text-right">
            <span className="font-latin text-[10px] tracking-[0.3em] text-ink-muted">NEXT</span>
            <p className="mt-3 flex items-center gap-3 text-sm text-ink transition-opacity group-hover:opacity-60 sm:justify-end">
              {next.title}
              <span aria-hidden className="inline-block h-px w-9 bg-ink transition-all duration-300 group-hover:w-12" />
            </p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section
        data-section
        className="on-dark w-full bg-navy px-6 py-20 text-on-dark sm:px-10 lg:px-16 lg:py-24 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <p data-fade className="t-body max-w-xl font-display font-light text-on-dark/90">
            同じような工事をお考えでしたら、まずはご相談ください。
          </p>
          <div data-fade className="mt-9 flex flex-wrap items-center gap-4">
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
              href="/works"
              className="inline-flex items-center gap-2.5 border border-on-dark/30 px-6 py-3.5 text-xs tracking-[0.12em] text-on-dark/80 transition-colors duration-300 hover:border-on-dark hover:text-on-dark"
            >
              実績一覧へ戻る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
