"use client";
import CmsText from "@/components/CmsText";


import Link from "next/link";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";

// オーナー様向けの課題提起。相談への入口をつくる。
const CONCERNS = [
  {
    index: "01",
    title: "空室が埋まらない",
    body: "募集しても入居が決まらない、稼働率が上がらない。収益の土台が揺らいでいる。",
  },
  {
    index: "02",
    title: "建物の老朽化",
    body: "外観や設備の傷みが目立ってきた。どこから、どこまで手を入れるべきか判断がつかない。",
  },
  {
    index: "03",
    title: "管理の負担",
    body: "入居者対応や日々の管理に手が回らない。任せられる相手が近くにいない。",
  },
  {
    index: "04",
    title: "改修費用が読めない",
    body: "リフォームすべきかどうか、いくらかかり、いくら戻るのか。費用対効果が見えない。",
  },
  {
    index: "05",
    title: "資産の活かし方",
    body: "貸すべきか、売るべきか、直して活かすべきか。土地と建物の次の一手に迷っている。",
  },
];

export default function Challenges() {
  const sectionRef = useScopedGsap<HTMLElement>(() => {
    gsap.from("[data-challenge-fade]", {
      opacity: 0,
      y: 26,
      duration: 1,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: "[data-challenge-head]",
        ...scrollTriggerDefaults,
      },
    });

    gsap.from("[data-challenge-card]", {
      opacity: 0,
      y: 30,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.09,
      scrollTrigger: {
        trigger: "[data-challenge-grid]",
        ...scrollTriggerDefaults,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-stone px-6 py-24 sm:px-10 lg:px-16 lg:py-32 xl:px-24"
    >
      <div className="mx-auto max-w-[1520px]">
        <div data-challenge-head className="max-w-2xl">
          <p
            data-challenge-fade
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]"
          >
            <span aria-hidden className="inline-block h-px w-10 bg-ink/25" /><CmsText>{"YOUR CONCERNS"}</CmsText></p>
          <h2
            data-challenge-fade
            className="t-heading mt-8 font-display font-normal text-ink"
          ><CmsText>{"その土地と建物の悩み、"}</CmsText><br /><CmsText>{"抱え込んでいませんか。"}</CmsText></h2>
          <p data-challenge-fade className="t-note mt-6 max-w-md text-ink-muted"><CmsText>{"オーナー様が直面しやすい課題を、STAGE PARTNERSは不動産と建築の両面から解きほぐします。"}</CmsText></p>
        </div>

        <div
          data-challenge-grid
          className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
        >
          <CmsText>{CONCERNS.map((concern) => (
            <div
              key={concern.index}
              data-challenge-card
              className="bg-stone px-7 py-9 transition-colors duration-300 hover:bg-paper sm:px-8 sm:py-10"
            >
              <span className="block font-latin text-[11px] tracking-[0.25em] text-ink-muted">
                <CmsText>{concern.index}</CmsText>
              </span>
              <h3 className="t-body mt-5 font-display font-normal text-ink">
                <CmsText>{concern.title}</CmsText>
              </h3>
              <p className="mt-4 text-sm font-normal leading-loose text-ink-muted">
                <CmsText>{concern.body}</CmsText>
              </p>
            </div>
          ))}</CmsText>

          {/* 相談への入口 */}
          <Link
            href="/contact"
            data-challenge-card
            className="on-dark group flex flex-col justify-between bg-navy px-7 py-9 text-on-dark transition-colors duration-300 hover:bg-navy-mid sm:px-8 sm:py-10"
          >
            <span className="block font-latin text-[11px] tracking-[0.25em] text-on-dark/60"><CmsText>{"CONTACT"}</CmsText></span>
            <span className="mt-8 block">
              <span className="t-body block font-display font-normal"><CmsText>{"まずは、"}</CmsText><br /><CmsText>{"話を聞いてほしい。"}</CmsText></span>
              <span className="mt-6 inline-flex items-center gap-3 text-xs font-medium tracking-[0.2em] text-on-dark/85 transition-opacity group-hover:opacity-70"><CmsText>{"無料で相談する"}</CmsText><span aria-hidden><CmsText>{"→"}</CmsText></span>
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
