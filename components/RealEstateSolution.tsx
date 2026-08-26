"use client";

import Image from "next/image";
import Link from "next/link";
import { useScopedGsap, gsap, SplitText } from "@/hooks/useGsap";
import {
  scrollTriggerDefaults,
  prefersReducedMotion,
  drawLine,
  imageReveal,
  staggerFadeUp,
} from "@/lib/animations";

/**
 * 不動産ソリューションの詳細ページ(/business/real-estate)本体。
 *
 * 建築ソリューション(components/ArchitectureSolution.tsx)と骨格・演出を
 * そろえている。ヒーロー → 目次 → 本文セクション → CTA の並びと、
 * data-section / data-rule / data-fade / data-media / StepList の作りは
 * 同じものを使っているので、片方を直すときはもう片方も確認すること。
 *
 * 建築側との違いは、扱うのが「物件そのもの」である点。
 * 物件検索はat home上で行うため、SERVICE セクションの下に
 * at home の掲載ページへ渡す導線を置いている。
 */
const SECTIONS = [
  { id: "service", label: "取り扱い業務" },
  { id: "owner", label: "オーナー様へ" },
  { id: "flow", label: "ご相談の流れ" },
  { id: "search", label: "物件をお探しの方" },
];

const SERVICES = [
  {
    en: "BROKERAGE",
    title: "売買・賃貸の仲介",
    body: "土地・建物の売買、テナントや住まいの賃貸を仲介します。売りたい・貸したいというオーナー様のご要望と、借りたい・買いたいという方のご希望の間に立ち、条件をすり合わせて成約まで進めます。",
  },
  {
    en: "MANAGEMENT",
    title: "賃貸管理",
    body: "入居者の募集から契約、入居中の対応、退去時の原状回復まで引き受けます。建築部門を自社に持っているため、修繕が必要になったときも外注を挟まずそのまま動けます。",
  },
  {
    en: "PURCHASE & RESALE",
    title: "買取・再販",
    body: "土地や建物を当社で買い取り、リフォームで手を入れてから次の所有者へお渡しします。相続や住み替えで早く手放したい場合も、買主を探す期間を待たずに進められます。",
  },
];

const OWNER_POINTS = [
  {
    title: "空室が埋まらない",
    body: "募集条件の見直しだけで解決しないときは、建築部門と一緒に原因を見ます。設備の古さが理由なら、費用対効果を見たうえで改修をご提案します。",
  },
  {
    title: "建物が古くなってきた",
    body: "現状のまま貸し続けるか、手を入れて賃料を上げるか、売却するか。それぞれの収支を並べてお出しし、そのうえで方針を決めていただきます。",
  },
  {
    title: "相続した土地の使い道が決まらない",
    body: "そのまま売る、貸す、建てて貸す。立地と法規制から現実的な選択肢を絞り、判断に必要な数字をそろえます。",
  },
];

const FLOW = [
  {
    title: "ご相談",
    body: "お電話・お問い合わせフォームからご連絡ください。所在地と現在の状況を伺います。この時点で費用はかかりません。",
  },
  {
    title: "現地確認・調査",
    body: "物件を実際に拝見し、法規制や周辺の相場を調べます。建物がある場合は、劣化の状況もあわせて確認します。",
  },
  {
    title: "ご提案",
    body: "売る・貸す・手を入れて活かす。とりうる選択肢を、それぞれの想定収支と期間とともにお示しします。",
  },
  {
    title: "契約・募集開始",
    body: "方針が決まりましたら、媒介契約または管理契約を結び、募集を開始します。進捗は定期的にご報告します。",
  },
  {
    title: "成約・引き渡し",
    body: "条件が整いましたら契約手続きに進みます。管理をお任せいただく場合は、ここから入居中の対応が始まります。",
  },
];

type Step = { title: string; body: string };

/**
 * 番号を振った縦型の工程リスト。
 * ArchitectureSolution.tsx の StepList と同じ作り・同じ data 属性を使う
 * (演出のGSAP側も共通のセレクタで拾っている)。
 */
function StepList({ steps, tone }: { steps: Step[]; tone: "dark" | "light" }) {
  const dark = tone === "dark";

  return (
    <ol data-step-list className="relative mt-12">
      <span
        aria-hidden
        className={`absolute left-[1.125rem] top-9 bottom-9 w-px -translate-x-1/2 ${dark ? "bg-on-dark/10" : "bg-ink/10"
          }`}
      />
      <span
        data-step-rail
        aria-hidden
        className={`absolute left-[1.125rem] top-9 bottom-9 w-px -translate-x-1/2 origin-top ${dark ? "bg-on-dark/40" : "bg-ink/30"
          }`}
      />

      {steps.map((step, i) => (
        <li
          key={step.title}
          data-step
          className="relative grid grid-cols-[2.25rem_1fr] gap-5 pb-12 last:pb-0 sm:gap-7"
        >
          <span
            data-step-badge
            className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full font-latin text-[10px] tracking-[0.08em] ${dark
              ? "border border-on-dark/25 bg-navy text-on-dark/75"
              : "border border-line bg-paper text-ink-muted"
              }`}
          >
            {String(i + 1).padStart(2, "0")}
          </span>

          <div data-step-body className="pt-1">
            <h4
              className={`font-display text-base font-normal sm:text-lg ${dark ? "text-on-dark" : "text-ink"
                }`}
            >
              {step.title}
            </h4>
            <p className={`t-note mt-3 ${dark ? "text-on-dark/60" : "text-ink-muted"}`}>
              {step.body}
            </p>
          </div>

          {i < steps.length - 1 && (
            <span
              data-step-arrow
              aria-hidden
              className={`absolute left-[1.125rem] bottom-[1.35rem] -translate-x-1/2 font-latin text-xs ${dark ? "text-on-dark/45" : "text-ink/35"
                }`}
            >
              ↓
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function RealEstateSolution() {
  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    const q = gsap.utils.selector(scope);
    if (prefersReducedMotion()) return;

    const heroTitle = q("[data-hero-title]")[0];
    const heroLines = new SplitText(heroTitle, {
      type: "lines",
      linesClass: "overflow-hidden",
    });

    gsap
      .timeline({ delay: 0.15 })
      .from(q("[data-hero-eyebrow]"), {
        opacity: 0,
        y: 14,
        duration: 0.8,
        ease: "power2.out",
      })
      .from(
        heroLines.lines,
        { yPercent: 120, duration: 1.1, ease: "expo.out", stagger: 0.12 },
        "-=0.5",
      )
      .from(
        q("[data-hero-lead]"),
        { opacity: 0, y: 18, duration: 0.9, ease: "power2.out" },
        "-=0.7",
      )
      .from(
        q("[data-nav-item]"),
        { opacity: 0, y: 10, duration: 0.6, stagger: 0.06, ease: "power2.out" },
        "-=0.6",
      );

    gsap.to(q("[data-hero-media]"), {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: q("[data-hero]")[0],
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.utils.toArray<HTMLElement>(scope.current!.querySelectorAll("[data-section]")).forEach((section) => {
      const inSection = gsap.utils.selector(section);
      const trigger = { trigger: section, ...scrollTriggerDefaults };

      const rule = inSection("[data-rule]");
      if (rule.length) drawLine(rule, { duration: 0.9, scrollTrigger: trigger });

      const fades = inSection("[data-fade]");
      if (fades.length) staggerFadeUp(fades, { duration: 0.85, scrollTrigger: trigger });

      const media = inSection("[data-media]");
      if (media.length) {
        imageReveal(media, { scrollTrigger: { trigger: media[0], ...scrollTriggerDefaults } });
      }
    });

    // 取り扱い業務のカード
    gsap.from(q("[data-service]"), {
      opacity: 0,
      y: 28,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: q("[data-service-list]")[0],
        ...scrollTriggerDefaults,
      },
    });

    // 工程リスト(建築側と同じ演出)
    gsap.utils.toArray<HTMLElement>(scope.current!.querySelectorAll("[data-step-list]")).forEach((list) => {
      const inList = gsap.utils.selector(list);

      gsap.fromTo(
        inList("[data-step-rail]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 72%", end: "bottom 78%", scrub: 0.8 },
        },
      );

      gsap.utils.toArray<HTMLElement>(list.querySelectorAll("[data-step]")).forEach((step) => {
        const inStep = gsap.utils.selector(step);

        gsap
          .timeline({
            scrollTrigger: { trigger: step, start: "top 82%", toggleActions: "play none none none" },
          })
          .from(inStep("[data-step-badge]"), {
            opacity: 0,
            scale: 0.5,
            duration: 0.5,
            ease: "back.out(2)",
          })
          .from(
            inStep("[data-step-body]"),
            { opacity: 0, x: 20, duration: 0.6, ease: "power2.out" },
            "-=0.3",
          )
          .from(
            inStep("[data-step-arrow]"),
            { opacity: 0, y: -8, duration: 0.45, ease: "power2.out" },
            "-=0.25",
          );
      });
    });
  }, []);

  return (
    <div ref={rootRef}>
      {/* ヒーロー */}
      <section
        data-hero
        className="on-dark relative flex min-h-[62svh] w-full items-end overflow-hidden bg-navy pb-16 pt-32 text-on-dark sm:pb-20 lg:min-h-[68svh]"
      >
        <div data-hero-media aria-hidden className="absolute inset-0">
          <Image
            src="/realestate-hero.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/55 to-navy/90" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1520px] px-6 sm:px-10 lg:px-16 xl:px-24">
          <p
            data-hero-eyebrow
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/70 sm:text-[11px]"
          >
            <span aria-hidden className="inline-block h-px w-10 bg-on-dark/40" />
            REAL ESTATE SOLUTIONS
          </p>

          <h1 data-hero-title className="t-heading mt-7 font-display font-normal text-on-dark">
            不動産ソリューション
          </h1>

          <p data-hero-lead className="t-note mt-6 max-w-xl text-on-dark/80">
            売買・賃貸の仲介から管理、買取・再販まで。建築部門を自社に持つ強みを活かし、貸す・売る・活かすの判断からその先の手入れまでを一社でお引き受けします。
          </p>
        </div>
      </section>

      {/* 目次 */}
      <nav
        aria-label="このページの内容"
        className="w-full border-b border-line bg-stone px-6 py-6 sm:px-10 lg:px-16 xl:px-24"
      >
        <ul className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-x-8 gap-y-3">
          {SECTIONS.map((section) => (
            <li key={section.id} data-nav-item>
              <a
                href={`#${section.id}`}
                className="group inline-flex items-center gap-2 text-xs text-ink-muted transition-colors hover:text-ink"
              >
                <span
                  aria-hidden
                  className="inline-block h-px w-4 bg-ink/30 transition-all duration-300 group-hover:w-7 group-hover:bg-ink"
                />
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 取り扱い業務 */}
      <section
        id="service"
        data-section
        className="w-full bg-paper px-6 py-24 sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[340px_1fr] lg:gap-20">
            <div>
              <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
                <span data-rule aria-hidden className="inline-block h-px w-10 bg-ink/25" />
                SERVICE
              </p>
              <h2 data-fade className="t-heading-tight mt-7 font-display font-normal text-ink">
                取り扱い業務
              </h2>
            </div>

            <div>
              <p data-fade className="t-note max-w-2xl text-ink-muted">
                住まいから事業用の物件まで、不動産に関わる業務を一通り扱います。仲介して終わりではなく、貸した後の管理や、必要になったときの改修まで見据えてご提案します。
              </p>

              <ul data-service-list className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
                {SERVICES.map((service) => (
                  <li key={service.title} data-service className="bg-paper p-7 sm:p-8">
                    <p className="font-latin text-[10px] tracking-[0.25em] text-ink-muted">
                      {service.en}
                    </p>
                    <h3 className="mt-4 font-display text-lg font-normal text-ink">
                      {service.title}
                    </h3>
                    <p className="t-note mt-4 text-ink-muted">{service.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* オーナー様へ */}
      <section
        id="owner"
        data-section
        className="on-dark w-full bg-navy px-6 py-24 text-on-dark sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/50 sm:text-[11px]">
            <span data-rule aria-hidden className="inline-block h-px w-10 bg-on-dark/25" />
            FOR OWNERS
          </p>
          <h2 data-fade className="t-heading-tight mt-7 font-display font-normal">
            オーナー様へ
          </h2>

          <div className="mt-8 max-w-3xl">
            <p data-fade className="t-note text-on-dark/65">
              土地や建物をお持ちの方から特に多くいただくご相談は、次の三つです。いずれも「不動産だけ」「建築だけ」では答えが出ません。私たちは両方を自社で持っているため、貸し方の見直しと建物への手入れを同じテーブルで検討できます。
            </p>

            <StepList steps={OWNER_POINTS} tone="dark" />
          </div>
        </div>
      </section>

      {/* ご相談の流れ */}
      <section
        id="flow"
        data-section
        className="w-full bg-paper px-6 py-24 sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div
            data-media
            className="media relative aspect-[4/3] w-full overflow-hidden bg-[#161513] lg:sticky lg:top-28 lg:aspect-[5/4]"
          >
            <Image
              src="/room.PNG"
              alt="沼津の街並みと建ち並ぶ住宅"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          <div>
            <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
              <span data-rule aria-hidden className="inline-block h-px w-10 bg-ink/25" />
              FLOW
            </p>
            <h2 data-fade className="t-heading-tight mt-7 font-display font-normal text-ink">
              ご相談の流れ
            </h2>
            <p data-fade className="t-note mt-8 max-w-xl text-ink-muted">
              ご相談から成約まで、五つの段階を踏みます。現地確認とご提案までは費用をいただきません。方針が決まらないうちに契約を迫ることもありません。
            </p>

            <StepList steps={FLOW} tone="light" />
          </div>
        </div>
      </section>

      {/* 物件をお探しの方(at home) */}
      <section
        id="search"
        data-section
        className="w-full bg-stone px-6 py-24 sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
          <div>
            <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
              <span data-rule aria-hidden className="inline-block h-px w-10 bg-ink/25" />
              PROPERTY SEARCH
            </p>
            <h2 data-fade className="t-heading-tight mt-7 font-display font-normal text-ink">
              物件をお探しの方へ
            </h2>
            <p data-fade className="t-note mt-8 max-w-xl text-ink-muted">
              現在お取り扱い中の物件は、不動産情報サイト「at home」に掲載しています。間取りや写真、周辺環境まで掲載していますので、まずはこちらをご覧ください。
            </p>
            <p data-fade className="t-note mt-5 max-w-xl text-ink-muted">
              掲載されていない物件のご相談や、条件を決めてお探しすることも承ります。ご希望がお決まりでない段階でも構いませんので、お気軽にお問い合わせください。
            </p>
          </div>

          {/* at home の掲載ページへ。外部サイトなので新規タブで開き、
              rel="noopener" を付ける(target="_blank" の際の作法)。 */}
          <div data-fade>
            <a
              href="https://www.athome.co.jp/ahcb/aim.html"
              target="_blank"
              rel="noopener noreferrer"
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-4 focus-visible:ring-offset-stone"
            >
              <div className="media relative aspect-[16/6] w-full overflow-hidden bg-[#DF0031]">
                <Image
                  src="/athome-logo-wide.png"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03] sm:p-8"
                />
              </div>
              <p className="mt-5 flex items-center gap-3 text-sm font-normal text-ink transition-opacity group-hover:opacity-60">
                at homeで掲載物件を見る
                <span
                  aria-hidden
                  className="inline-block h-px w-9 shrink-0 bg-ink transition-all duration-300 group-hover:w-12"
                />
              </p>
              <p className="mt-2 text-xs tracking-[0.05em] text-ink-muted">
                外部サイト（at home）が新しいタブで開きます
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        data-section
        className="on-dark w-full bg-navy px-6 py-24 text-on-dark sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <p data-fade className="t-body max-w-xl font-display font-light text-on-dark/90">
            貸すか、売るか、手を入れて活かすか。判断の材料からご一緒します。
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
              href="/business/architecture"
              className="inline-flex items-center gap-2.5 border border-on-dark/30 px-6 py-3.5 text-xs tracking-[0.12em] text-on-dark/80 transition-colors duration-300 hover:border-on-dark hover:text-on-dark"
            >
              建築ソリューションを見る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
