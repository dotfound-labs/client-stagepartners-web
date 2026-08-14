"use client";

import Image from "next/image";
import Link from "next/link";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";

// 事業は優先度順に構成する。
// 1. 不動産事業(仲介・管理)  2. 建築事業(リフォーム)
// 画像パスは実写が用意でき次第そのまま差し替えれば反映される。
const DIVISIONS = [
  {
    index: "01",
    en: "REAL ESTATE",
    title: "不動産ソリューション",
    lead: "仲介・管理・買取再販",
    description:
      "地主さま・オーナーさまの「貸したい・売りたい」に応え、確かな価値へとつなぎます。",
    points: [
      "土地・建物を買い上げ、リフォーム等で価値を高めて次の所有者へ",
      "オーナーさまと入居者の間に立つ、賃貸の仲介と管理",
      "ご要望に沿って、最適な借主・買主をお探しする",
    ],
    image: "/real-estateimage1.png",
    imagePosition: "object-[70%_80%]",
    href: "/business/real-estate",
  },
  {
    index: "02",
    en: "RENOVATION",
    title: "建築ソリューション",
    lead: "リフォーム・リノベーション",
    description:
      "空室・老朽化・資産価値の低下といった課題を、建物への手入れで解決します。",
    points: [
      "空室対策・原状回復から本格的なリノベーションまで",
      "費用対効果を見据えた、無理のない改修プラン",
      "自社で不動産まで見通すからこそ描ける、活かす前提の設計",
    ],
    image: "/issekisanncho.jpeg",
    imagePosition: "object-center",
    href: "/business/architecture",
  },
];

export default function Business() {
  const sectionRef = useScopedGsap<HTMLElement>(() => {
    gsap.from("[data-business-fade]", {
      opacity: 0,
      y: 26,
      duration: 1,
      ease: "power2.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: "[data-business-intro]",
        ...scrollTriggerDefaults,
      },
    });

    const rows = gsap.utils.toArray<HTMLElement>("[data-business-row]");
    rows.forEach((row) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: row, ...scrollTriggerDefaults },
      });

      tl.from(row.querySelector("[data-business-image]"), {
        opacity: 0,
        scale: 1.08,
        duration: 1.3,
        ease: "power1.out",
      }).from(
        row.querySelectorAll("[data-business-text]"),
        {
          opacity: 0,
          y: 20,
          duration: 0.9,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.8",
      );
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="business"
      className="w-full bg-paper px-6 py-24 sm:px-10 lg:px-16 lg:py-32 xl:px-24"
    >
      <div className="mx-auto max-w-[1520px]">
        <div data-business-intro className="max-w-2xl">
          <p
            data-business-fade
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]"
          >
            <span aria-hidden className="inline-block h-px w-10 bg-ink/25" />
            OUR SOLUTIONS
          </p>
          <h2
            data-business-fade
            className="t-heading mt-8 font-display font-normal text-ink"
          >
            不動産と建築を、
            <br />
            一社でつなぐ。
          </h2>
          <p data-business-fade className="t-note mt-6 max-w-md text-ink-muted">
            仲介で終わらせず、リフォームで価値を高め、管理まで。事業を分けずに一気通貫で担うからこそ、土地と建物の可能性を最大限に引き出せます。
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-20 lg:mt-24 lg:gap-28">
          {DIVISIONS.map((division, i) => (
            <div
              key={division.index}
              data-business-row
              className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
            >
              <div
                data-business-image
                className="media relative aspect-[4/3] w-full overflow-hidden bg-[#161513] lg:aspect-[5/4]"
              >
                <Image
                  src={division.image}
                  alt={`${division.title}のイメージ`}
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className={`object-cover ${division.imagePosition}`}
                />
                <span className="absolute left-6 top-6 font-latin text-[11px] tracking-[0.3em] text-on-dark/85">
                  {division.en}
                </span>
              </div>

              <div className="lg:px-4">
                <span
                  data-business-text
                  className="block font-latin text-[11px] tracking-[0.25em] text-ink-muted"
                >
                  {division.index}　{division.lead}
                </span>
                <h3
                  data-business-text
                  className="t-heading-tight mt-5 font-display font-normal text-ink"
                >
                  {division.title}
                </h3>
                <p
                  data-business-text
                  className="t-note mt-5 max-w-md text-ink-muted"
                >
                  {division.description}
                </p>

                <ul data-business-text className="mt-7 space-y-3">
                  {division.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-sm font-normal leading-relaxed text-ink/80"
                    >
                      <span
                        aria-hidden
                        className="mt-2.5 inline-block h-px w-4 shrink-0 bg-ink/40"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div data-business-text className="mt-9">
                  <Link
                    href={division.href}
                    className="group inline-flex items-center gap-3 bg-ink px-8 py-4 text-xs font-medium tracking-[0.2em] text-paper transition-opacity hover:opacity-80"
                  >
                    詳細を見る
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
