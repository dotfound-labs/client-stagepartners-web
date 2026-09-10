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
 * 建築ソリューションの詳細ページ(/business/architecture)本体。
 *
 * グループのアイム建築事業部が2ページで持っている内容(店舗設計・施工／施設営繕／
 * 空きテナントのサポート)を1ページに畳んでいる。縦に長いページは読み飛ばされるため、
 *   - ヒーローを全画面にせず、本文を初回表示に入れる
 *   - 直下に見出しへのアンカーを置き、ページの全体量と行き先を先に見せる
 *   - 工程は画像を持たせず、番号と短文に圧縮する
 * の3点で縦の長さを抑えている。
 */
const TRADES = [
  "オフィス",
  "飲食店",
  "美容室",
  "クリニック",
  "スポーツ施設",
  "居酒屋",
  "携帯ショップ",
  "遊技場",
];

const SECTIONS = [
  { id: "works-scope", label: "対応する工事" },
  { id: "flow", label: "店舗設計・施工" },
  { id: "maintenance", label: "施設営繕" },
  { id: "vacancy", label: "空きテナントのご相談" },
];

const FLOW = [
  {
    title: "ヒアリング",
    body: "お店のコンセプトと、譲れない条件を伺います。予算と開店希望日も、この時点で共有してください。",
  },
  {
    title: "プランニング",
    body: "間取りを図面に落とし、パースで完成形をご覧いただきます。ここで大きな方向を決めます。",
  },
  {
    title: "デザイン制作",
    body: "設備と什器の位置、寸法を確定します。レイアウトが決まると、働きやすさもほぼ決まります。",
  },
  {
    title: "詳細設計・お見積もり",
    body: "色や質感、家具、必要な設備を一つずつ決めます。費用と工期をお示しし、ご了承をいただいてから着工日を確定します。",
  },
  {
    title: "施工",
    body: "解体、造作、仕上げの順に進みます。工事中は定期的に進捗をご報告し、変更が必要になればその都度ご相談します。",
  },
  {
    title: "引き渡し・検査",
    body: "設備の使い方をご説明し、検査を受けます。保健所や消防署の営業許可も、ここで取得します。引き渡した後の不具合にも対応します。",
  },
];

const MAINTENANCE = [
  {
    title: "点検",
    body: "建築基準法と官公法で定められた点検です。建物と敷地、昇降機、建築設備、防火設備の劣化を確認します。",
  },
  {
    title: "補修",
    body: "決まった周期ではなく、不具合が出た箇所に対して行います。実用上の問題がない状態まで戻します。",
  },
  {
    title: "メンテナンス",
    body: "日々の清掃、設備の点検、リニューアル工事。空調が効いて水が出る、その当たり前を保ちます。",
  },
];

type Step = { title: string; body: string };

/**
 * 番号を振った縦型の工程リスト。
 * スクロールに合わせて縦のレールが伸び、番号→矢印→次の番号の順に現れる。
 * 明色地と暗色地の両方で使うため、配色だけ tone で切り替える。
 */
function StepList({ steps, tone }: { steps: Step[]; tone: "dark" | "light" }) {
  const dark = tone === "dark";

  return (
    <ol data-step-list className="relative mt-12">
      {/* レール(下地と、スクロールで伸びる線) */}
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

          <div data-step-body>
            <h4
              className={`font-display text-base font-normal sm:text-lg ${dark ? "text-on-dark" : "text-ink"
                }`}
            >
              {step.title}
            </h4>
            <p
              className={`mt-3 text-sm leading-relaxed ${dark ? "text-on-dark/60" : "text-ink-muted"
                }`}
            >
              {step.body}
            </p>
          </div>

          {i < steps.length - 1 && (
            <span
              data-step-arrow
              aria-hidden
              className={`absolute bottom-2 left-[1.125rem] -translate-x-1/2 font-latin text-sm leading-none ${dark ? "text-on-dark/45" : "text-ink/35"
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

export default function ArchitectureSolution() {
  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    const q = gsap.utils.selector(scope);

    // 動きの低減設定では一切動かさず、最初から見えている状態にする
    if (prefersReducedMotion()) {
      gsap.set(q("[data-step-rail]"), { scaleY: 1 });
      return;
    }

    // ヒーロー: 背景の寄り + 見出しの行送り
    gsap.from(q("[data-hero-media]"), {
      scale: 1.14,
      duration: 2,
      ease: "power2.out",
    });

    const heroLines = SplitText.create(q("[data-hero-title]"), {
      type: "lines",
      mask: "lines",
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

    // ヒーロー背景をスクロールでゆっくり流す
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

    // 各セクション: 罫線を引く → 見出しと本文を送り出す
    gsap.utils.toArray<HTMLElement>("[data-section]").forEach((section) => {
      const inSection = gsap.utils.selector(section);
      const trigger = { trigger: section, ...scrollTriggerDefaults };

      const rule = inSection("[data-rule]");
      if (rule.length) {
        drawLine(rule, { duration: 0.9, scrollTrigger: trigger });
      }

      const fades = inSection("[data-fade]");
      if (fades.length) {
        staggerFadeUp(fades, { duration: 0.85, scrollTrigger: trigger });
      }

      const media = inSection("[data-media]");
      if (media.length) {
        imageReveal(media, { scrollTrigger: { trigger: media[0], ...scrollTriggerDefaults } });
      }
    });

    // 業種のタグは少し弾ませて順に置く
    gsap.from(q("[data-trade]"), {
      opacity: 0,
      y: 12,
      scale: 0.94,
      duration: 0.5,
      ease: "back.out(1.6)",
      stagger: 0.045,
      scrollTrigger: {
        trigger: q("[data-trade-list]")[0],
        ...scrollTriggerDefaults,
      },
    });

    // 工程リスト: レールをスクロールに連動させ、番号 → 矢印 → 次の番号の順に出す
    gsap.utils.toArray<HTMLElement>("[data-step-list]").forEach((list) => {
      const inList = gsap.utils.selector(list);

      gsap.fromTo(
        inList("[data-step-rail]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list,
            start: "top 72%",
            end: "bottom 78%",
            scrub: 0.8,
          },
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
      {/* ヒーロー: 全画面にせず、直下の目次まで初回表示に入る高さに留める */}
      <section
        data-hero
        className="on-dark relative flex min-h-[62svh] w-full items-end overflow-hidden bg-navy pb-16 pt-32 text-on-dark sm:pb-20 lg:min-h-[68svh]"
      >
        <div data-hero-media aria-hidden className="absolute inset-0">
          <Image
            src="/issekisancho.png"
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
            ARCHITECTURE SOLUTIONS
          </p>

          <h1
            data-hero-title
            className="t-heading mt-7 font-display font-normal text-on-dark"
          >
            建築ソリューション
          </h1>

          <p data-hero-lead className="t-note mt-6 max-w-xl text-on-dark/80">
            店舗・オフィス等の新規出店から、住まいの改修、建てた後の維持管理まで。図面を引くところから引き渡した先まで、一社で受けます。
          </p>
        </div>
      </section>

      {/* 目次: ページの分量と行き先を先に見せ、読み飛ばしと離脱を防ぐ */}
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

      {/* 対応する工事 */}
      <section
        id="works-scope"
        data-section
        className="w-full bg-paper px-6 py-24 sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 gap-12 lg:grid-cols-[340px_1fr] lg:gap-20">
          <div>
            <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
              <span
                data-rule
                aria-hidden
                className="inline-block h-px w-10 bg-ink/25"
              />
              SCOPE
            </p>
            <h2
              data-fade
              className="t-heading-tight mt-7 font-display font-normal text-ink"
            >
              対応する工事
            </h2>
          </div>

          <div>
            <p data-fade className="t-note max-w-2xl text-ink-muted">
              店舗・オフィス等の新規出店は、デザインから施工まで一貫してお引き受けします。壁紙の張り替えやエアコンの交換といった一日で終わる工事から、フロアをまるごと変える大型リニューアルまで扱います。業種が変われば必要な設備も動線も変わるので、図面はいつも一から引き直します。
            </p>
            <p data-fade className="t-note mt-5 max-w-2xl text-ink-muted">
              住まいも同じです。二世帯住宅への間取り変更、マンションのリノベーション。家族の人数が変われば、必要な部屋の数も位置も変わります。
            </p>

            <p
              data-fade
              className="mt-10 font-latin text-[11px] tracking-[0.25em] text-ink-muted"
            >
              INDUSTRIES
            </p>
            <ul data-trade-list className="mt-5 flex flex-wrap gap-2.5">
              {TRADES.map((trade) => (
                <li
                  key={trade}
                  data-trade
                  className="border border-line px-4 py-2 text-xs text-ink/80"
                >
                  {trade}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 店舗ができるまで */}
      <section
        id="flow"
        data-section
        className="on-dark w-full bg-navy px-6 py-24 text-on-dark sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/50 sm:text-[11px]">
            <span
              data-rule
              aria-hidden
              className="inline-block h-px w-10 bg-on-dark/25"
            />
            STORE DESIGN
          </p>
          <h2
            data-fade
            className="t-heading-tight mt-7 font-display font-normal"
          >
            店舗設計・施工
          </h2>

          <div className="mt-8 max-w-3xl">
            <p data-fade className="t-note text-on-dark/65">
              私たちは、店舗デザインのプロフェッショナルとして、お客様のブランドやアイデンティティを反映させながら、魅力的で機能的な空間を創り出します。内装工事では高品質な施工を心がけ、営繕管理では施設を持続可能な状態に保ちます。そして、新しい店舗をお探しの方には、適切な空き店舗の提案も行います。
            </p>
            <p data-fade className="t-note mt-5 text-on-dark/65">
              テナント施設を紹介し、作り、守ることで、店舗設計における三拍子が揃ったスペシャリストとして、お客様のビジネス成功に向けて全力でサポートします。私たちは、お客様とともに成長し、繁栄する未来を築くために、真摯かつ専門的なサービスを提供いたします。
            </p>

            <h3
              data-fade
              className="mt-16 border-t border-on-dark/15 pt-10 font-display text-xl font-normal sm:text-2xl"
            >
              店舗ができるまで
            </h3>
            <p data-fade className="t-note mt-4 text-on-dark/60">
              ご相談から引き渡しまで、六つの段階を踏みます。どの段階でも図面と見積もりをご覧いただき、合意してから次へ進みます。
            </p>

            <StepList steps={FLOW} tone="dark" />
          </div>
        </div>
      </section>

      {/* 施設営繕 */}
      <section
        id="maintenance"
        data-section
        className="w-full bg-paper px-6 py-24 sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div
            data-media
            className="media relative aspect-[4/3] w-full overflow-hidden bg-[#161513] lg:sticky lg:top-28 lg:aspect-[5/4]"
          >
            <Image
              src="/companyimage1.png"
              alt="建物の劣化状況を点検する現場担当者"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-[30%_center]"
            />
          </div>

          <div>
            <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
              <span
                data-rule
                aria-hidden
                className="inline-block h-px w-10 bg-ink/25"
              />
              MAINTENANCE
            </p>
            <h2
              data-fade
              className="t-heading-tight mt-7 font-display font-normal text-ink"
            >
              施設営繕
            </h2>
            <p data-fade className="t-note mt-8 max-w-xl text-ink-muted">
              施設はお客様の重要な財産です。その価値を守るために、定期的な点検、必要な補修、継続的なメンテナンスを実施いたします。私たちは、高い専門性と信頼性をもって、お客様の施設を確実に管理し、持続可能な状態を維持します。
            </p>

            <h3
              data-fade
              className="mt-14 border-t border-line pt-10 font-display text-xl font-normal text-ink sm:text-2xl"
            >
              施設営繕の内容
            </h3>

            <StepList steps={MAINTENANCE} tone="light" />
          </div>
        </div>
      </section>

      {/* 空きテナントのご相談 */}
      <section
        id="vacancy"
        data-section
        className="w-full bg-stone px-6 py-24 sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div>
            <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
              <span
                data-rule
                aria-hidden
                className="inline-block h-px w-10 bg-ink/25"
              />
              VACANCY SUPPORT
            </p>
            <h2
              data-fade
              className="t-heading-tight mt-7 font-display font-normal text-ink"
            >
              空きテナントでお困りのオーナー様へ
            </h2>
            <p data-fade className="t-note mt-8 max-w-xl text-ink-muted">
              空き店舗の修繕や改修により、ビルの価値を高め、魅力的な賃貸スペースに変貌させることが可能です。私たちは、これらのプロセスに関する豊富な経験と専門知識を持ち、改修後は不動産事業のノウハウを活かして事業者の募集をサポートします。特に、借り手が集まらないビルのオーナー様にとって、このサービスは大きな助けとなります。
            </p>
            <p data-fade className="t-note mt-5 max-w-xl text-ink-muted">
              私たちは、ビルの魅力を引き出し、適切なテナントの選定や効果的なマーケティング戦略を提供します。空きスペースの有効活用はオーナー様の収益向上に直結し、私たちはそのお手伝いを致します。空き店舗にお困りのビルオーナー様は、ぜひお気軽にご相談ください。専門的なチームが全力でサポートし、ビジネスの成功をサポートいたします。
            </p>

            <Link
              data-fade
              href="/business/real-estate"
              className="group mt-9 inline-flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-ink transition-opacity hover:opacity-60"
            >
              不動産ソリューションを見る
              <span
                aria-hidden
                className="inline-block h-px w-9 bg-ink transition-all duration-300 group-hover:w-12"
              />
            </Link>
          </div>

          <div
            data-media
            className="media relative aspect-[4/3] w-full overflow-hidden bg-[#161513]"
          >
            <Image
              src="/heroimage2.jpg"
              alt="沼津の街並みとテナントが入る建物"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        data-section
        className="on-dark w-full bg-navy px-6 py-24 text-on-dark sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <p
            data-fade
            className="t-body max-w-xl font-display font-light text-on-dark/90"
          >
            仕上がりは、実際の現場でご覧ください。
          </p>

          <div data-fade className="mt-9">
            <Link
              href="/works"
              className="group inline-flex items-center gap-3 bg-on-dark px-8 py-4 text-xs font-medium tracking-[0.2em] text-navy transition-colors duration-300 hover:bg-navy-mid hover:text-on-dark"
            >
              施工実績を見る
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>

          <p data-fade className="t-note mt-10 text-on-dark/55">
            工事の規模や費用の目安については、
            <Link
              href="/contact"
              className="underline underline-offset-4 transition-colors hover:text-on-dark"
            >
              お問い合わせ
            </Link>
            からご相談ください。
          </p>
        </div>
      </section>
    </div>
  );
}
