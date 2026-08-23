"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { Flip } from "gsap/Flip";
import { scrollTriggerDefaults, prefersReducedMotion, drawLine } from "@/lib/animations";
import { CATEGORY_LABEL, WORKS, workImage, type WorkCategory } from "@/lib/works";
import type { HoverGl } from "@/lib/hover-gl";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

type Filter = "all" | WorkCategory;

const TABS: { value: Filter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "store", label: CATEGORY_LABEL.store },
  { value: "facility", label: CATEGORY_LABEL.facility },
];

export default function WorksIndex() {
  const [filter, setFilter] = useState<Filter>("all");
  const gridRef = useRef<HTMLUListElement>(null);
  const glRef = useRef<HoverGl | null>(null);

  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    const q = gsap.utils.selector(scope);
    if (prefersReducedMotion()) return;

    gsap
      .timeline({ delay: 0.15 })
      .from(q("[data-hero-eyebrow]"), { opacity: 0, y: 14, duration: 0.8, ease: "power2.out" })
      .from(q("[data-hero-title]"), { opacity: 0, y: 26, duration: 1, ease: "expo.out" }, "-=0.5")
      .from(q("[data-hero-lead]"), { opacity: 0, y: 18, duration: 0.9, ease: "power2.out" }, "-=0.7")
      .from(q("[data-tab]"), { opacity: 0, y: 12, duration: 0.6, stagger: 0.07, ease: "power2.out" }, "-=0.6");

    gsap.from(q("[data-hero-media]"), { scale: 1.14, duration: 2, ease: "power2.out" });

    drawLine(q("[data-rule]"), { duration: 0.9 });

    gsap.from(q("[data-card]"), {
      opacity: 0,
      y: 34,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.07,
      scrollTrigger: { trigger: gridRef.current, ...scrollTriggerDefaults },
    });
  }, []);

  // WebGLのホバー演出。非対応・タッチ・動きの低減時はCSSのズームだけで見せる。
  useEffect(() => {
    let cancelled = false;
    import("@/lib/hover-gl").then(({ HoverGl }) => {
      if (cancelled || !HoverGl.isSupported()) return;
      glRef.current = new HoverGl();
    });
    return () => {
      cancelled = true;
      glRef.current?.destroy();
      glRef.current = null;
    };
  }, []);

  const changeFilter = (next: Filter) => {
    if (next === filter) return;
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) {
      setFilter(next);
      return;
    }
    // 並び替えを瞬間移動させず、元の位置から新しい位置へ流す
    const state = Flip.getState(grid.querySelectorAll("[data-card]"));
    setFilter(next);
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.7,
        ease: "power3.inOut",
        stagger: 0.02,
        absolute: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.35 }),
      });
    });
  };

  const shown = WORKS.filter((w) => filter === "all" || w.category === filter);

  return (
    <div ref={rootRef}>
      {/* ヒーロー */}
      <section className="on-dark relative flex min-h-[58svh] w-full items-end overflow-hidden bg-navy pb-14 pt-32 text-on-dark sm:pb-16 lg:min-h-[62svh]">
        <div data-hero-media aria-hidden className="absolute inset-0">
          <Image
            src={workImage(WORKS[0], WORKS[0].cover)}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/88 via-navy/62 to-navy/92" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1520px] px-6 sm:px-10 lg:px-16 xl:px-24">
          <p
            data-hero-eyebrow
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/70 sm:text-[11px]"
          >
            <span data-rule aria-hidden className="inline-block h-px w-10 bg-on-dark/40" />
            WORKS
          </p>
          <h1 data-hero-title className="t-heading mt-7 font-display font-normal text-on-dark">
            施工実績
          </h1>
          <p data-hero-lead className="t-note mt-6 max-w-xl text-on-dark/80">
            飲食店や物販店の新装から、住まいの改修、施設の営繕と解体まで。これまでに手がけた{WORKS.length}件をご覧ください。
          </p>
        </div>
      </section>

      {/* カテゴリ */}
      <nav
        aria-label="施工実績の絞り込み"
        className="w-full border-b border-line bg-stone px-6 py-5 sm:px-10 lg:px-16 xl:px-24"
      >
        <ul className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-x-3 gap-y-2">
          {TABS.map((tab) => {
            const active = tab.value === filter;
            return (
              <li key={tab.value} data-tab>
                <button
                  type="button"
                  onClick={() => changeFilter(tab.value)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2.5 px-5 py-2.5 text-xs tracking-[0.12em] transition-colors duration-300 ${active
                    ? "bg-navy text-on-dark"
                    : "border border-line text-ink-muted hover:border-ink/40 hover:text-ink"
                    }`}
                >
                  {tab.label}
                  <span className="font-latin text-[10px] opacity-60">
                    {tab.value === "all"
                      ? WORKS.length
                      : WORKS.filter((w) => w.category === tab.value).length}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 一覧 */}
      <section className="w-full bg-paper px-6 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
        <ul
          ref={gridRef}
          className="mx-auto grid max-w-[1520px] grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {shown.map((work) => (
            <li key={work.slug} data-card data-flip-id={work.slug}>
              <Link
                href={`/works/${work.slug}`}
                className="group block focus:outline-none"
                onMouseEnter={(event) => {
                  const media = event.currentTarget.querySelector<HTMLElement>("[data-media]");
                  const before = work.beforeShots[0];
                  if (media && before) {
                    glRef.current?.enter(
                      media,
                      workImage(work, work.cover),
                      workImage(work, before),
                    );
                  }
                }}
                onMouseLeave={() => glRef.current?.leave()}
              >
                {/* 全案件で同じ比率にそろえる。写真の縦横がばらついていても行の高さが動かない */}
                <div
                  data-media
                  className="media relative aspect-[3/2] w-full overflow-hidden bg-[#161513]"
                >
                  <Image
                    src={workImage(work, work.cover)}
                    alt={`${work.title}の施工実績`}
                    fill
                    sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <span className="mt-6 block font-latin text-[11px] tracking-[0.25em] text-ink-muted">
                  {work.type}
                </span>
                <h2 className="t-body mt-3 font-display font-normal text-ink transition-colors duration-300 group-hover:text-navy-mid line-clamp-2 min-h-[2.8em]">
                  {work.title}
                </h2>
                <p className="mt-2 text-xs tracking-[0.12em] text-ink-muted">
                  {CATEGORY_LABEL[work.category]}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
