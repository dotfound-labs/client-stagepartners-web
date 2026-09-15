"use client";

import Image from "next/image";
import Link from "next/link";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";
import { CATEGORY_LABEL, WORKS as ALL_WORKS, workImage } from "@/content/works";

// トップに出す注目実績。スラッグで明示指定する(2026-09-10 議事録)。
const FEATURED_SLUGS = ["zentoku", "issekisancho", "deltaring-gym"] as const;
const FEATURED = FEATURED_SLUGS
  .map((slug) => ALL_WORKS.find((w) => w.slug === slug))
  .filter((w): w is NonNullable<typeof w> => Boolean(w));

export default function Works() {
  const sectionRef = useScopedGsap<HTMLElement>(() => {
    gsap.from("[data-works-fade]", {
      opacity: 0,
      y: 24,
      duration: 1,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: "[data-works-head]",
        ...scrollTriggerDefaults,
      },
    });

    gsap.from("[data-works-card]", {
      opacity: 0,
      y: 30,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: "[data-works-grid]",
        ...scrollTriggerDefaults,
      },
    });

    // ボタン単体は高さが小さくend("bottom 20%")をすぐ通過してreverseが走り、
    // 閲覧中に消えてしまうため、グリッドを基準に発火させる。
    gsap.from("[data-works-cta]", {
      opacity: 0,
      y: 20,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "[data-works-grid]",
        ...scrollTriggerDefaults,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-paper px-6 py-24 sm:px-10 lg:px-16 lg:py-32 xl:px-24"
    >
      <div className="mx-auto max-w-[1520px]">
        <div
          data-works-head
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p
              data-works-fade
              className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]"
            >
              <span aria-hidden className="inline-block h-px w-10 bg-ink/25" />
              WORKS
            </p>
            <h2
              data-works-fade
              className="t-heading mt-8 font-display font-normal text-ink"
            >
              施工実績
            </h2>
          </div>
          <p data-works-fade className="t-note max-w-sm text-ink-muted">
            土地と建物に価値を加えてきた、私たちの仕事の一部をご紹介します。
          </p>
        </div>

        <div
          data-works-grid
          className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
        >
          {FEATURED.map((work) => (
            <article key={work.slug} data-works-card>
              <Link href={`/works/${work.slug}`} className="group block">
                {/* 一覧ページと同じ3:2。サイト内で実績カードの比率をそろえる */}
                <div className="media relative aspect-[3/2] w-full overflow-hidden bg-[#161513]">
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
                <h3 className="t-body mt-3 font-display font-normal text-ink transition-colors duration-300 group-hover:text-navy-mid line-clamp-2 min-h-[2.8em]">
                  {work.title}
                </h3>
                <p className="mt-2 text-xs tracking-[0.12em] text-ink-muted">
                  {CATEGORY_LABEL[work.category]}
                </p>
              </Link>
            </article>
          ))}
        </div>

        <div data-works-cta className="mt-14 flex justify-center lg:mt-16">
          <Link
            href="/works"
            className="inline-flex items-center gap-3 bg-navy px-8 py-4 text-xs font-medium tracking-[0.2em] text-on-dark transition-opacity hover:opacity-80"
          >
            実績一覧を見る
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
