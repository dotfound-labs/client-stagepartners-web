"use client";

import Image from "next/image";
import Link from "next/link";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";

/**
 * 建築ソリューションの詳細ページ(/business/architecture)本体。
 *
 * グループのアイム建築事業部が2ページで持っている内容(店舗設計・施工／施設営繕／
 * 店舗募集サポート)を1ページに畳んでいる。縦に長いページは読み飛ばされるため、
 *   - ヒーローを全画面にせず、本文を初回表示に入れる
 *   - 直下に見出しへのアンカーを置き、ページの全体量と行き先を先に見せる
 *   - 施工の流れは画像を持たせず番号付きの短文に圧縮する
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
  { id: "flow", label: "店舗ができるまで" },
  { id: "maintenance", label: "施設営繕" },
  { id: "vacancy", label: "空き店舗のご相談" },
];

const FLOW = [
  {
    no: "01",
    title: "ヒアリング",
    body: "お店のコンセプトと、譲れない条件を伺います。予算と開店希望日も、この時点で共有してください。",
  },
  {
    no: "02",
    title: "プランニング",
    body: "間取りを図面に落とし、パースで完成形をご覧いただきます。ここで大きな方向を決めます。",
  },
  {
    no: "03",
    title: "デザイン制作",
    body: "設備と什器の位置、寸法を確定します。レイアウトが決まると、働きやすさもほぼ決まります。",
  },
  {
    no: "04",
    title: "詳細設計・お見積もり",
    body: "色や質感、家具、必要な設備を一つずつ決めます。費用と工期をお示しし、ご了承をいただいてから着工日を確定します。",
  },
  {
    no: "05",
    title: "施工",
    body: "解体、造作、仕上げの順に進みます。工事中は定期的に進捗をご報告し、変更が必要になればその都度ご相談します。",
  },
  {
    no: "06",
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

export default function ArchitectureSolution() {
  const rootRef = useScopedGsap<HTMLDivElement>(() => {
    gsap.from("[data-arch-hero]", {
      opacity: 0,
      y: 24,
      duration: 1,
      ease: "power2.out",
      stagger: 0.12,
    });

    gsap.utils.toArray<HTMLElement>("[data-arch-section]").forEach((section) => {
      gsap.from(section.querySelectorAll("[data-arch-fade]"), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: section, ...scrollTriggerDefaults },
      });
    });
  }, []);

  return (
    <div ref={rootRef}>
      {/* ヒーロー: 全画面にせず、直下の目次まで初回表示に入る高さに留める */}
      <section className="on-dark relative flex min-h-[62svh] w-full items-end overflow-hidden bg-navy pb-16 pt-32 text-on-dark sm:pb-20 lg:min-h-[68svh]">
        <div aria-hidden className="absolute inset-0">
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
            data-arch-hero
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/70 sm:text-[11px]"
          >
            <span aria-hidden className="inline-block h-px w-10 bg-on-dark/40" />
            ARCHITECTURE SOLUTIONS
          </p>

          <h1
            data-arch-hero
            className="t-heading mt-7 font-display font-normal text-on-dark"
          >
            建築ソリューション
          </h1>

          <p
            data-arch-hero
            className="t-note mt-6 max-w-xl text-on-dark/80"
          >
            店舗の内装から、住まいの改修、建てた後の維持管理まで。図面を引くところから引き渡した先まで、一社で受けます。
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
            <li key={section.id}>
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
        data-arch-section
        className="w-full bg-paper px-6 py-24 sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 gap-12 lg:grid-cols-[340px_1fr] lg:gap-20">
          <div>
            <p
              data-arch-fade
              className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]"
            >
              <span aria-hidden className="inline-block h-px w-10 bg-ink/25" />
              SCOPE
            </p>
            <h2
              data-arch-fade
              className="t-heading-tight mt-7 font-display font-normal text-ink"
            >
              対応する工事
            </h2>
          </div>

          <div>
            <p data-arch-fade className="t-note max-w-2xl text-ink-muted">
              壁紙の張り替えやエアコンの交換といった一日で終わる工事から、フロアをまるごと変える大型リニューアルまで扱います。業種が変われば必要な設備も動線も変わるので、図面はいつも一から引き直します。
            </p>
            <p data-arch-fade className="t-note mt-5 max-w-2xl text-ink-muted">
              住まいも同じです。二世帯住宅への間取り変更、マンションのリノベーション。家族の人数が変われば、必要な部屋の数も位置も変わります。
            </p>

            <p
              data-arch-fade
              className="mt-10 font-latin text-[11px] tracking-[0.25em] text-ink-muted"
            >
              INDUSTRIES
            </p>
            <ul data-arch-fade className="mt-5 flex flex-wrap gap-2.5">
              {TRADES.map((trade) => (
                <li
                  key={trade}
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
        data-arch-section
        className="on-dark w-full bg-navy px-6 py-24 text-on-dark sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <p
            data-arch-fade
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/50 sm:text-[11px]"
          >
            <span aria-hidden className="inline-block h-px w-10 bg-on-dark/25" />
            FLOW
          </p>
          <h2
            data-arch-fade
            className="t-heading-tight mt-7 font-display font-normal"
          >
            店舗ができるまで
          </h2>
          <p data-arch-fade className="t-note mt-6 max-w-xl text-on-dark/60">
            ご相談から引き渡しまで、六つの段階を踏みます。どの段階でも図面と見積もりをご覧いただき、合意してから次へ進みます。
          </p>

          <ol className="mt-14 grid grid-cols-1 gap-x-16 gap-y-0 md:grid-cols-2">
            {FLOW.map((step) => (
              <li
                key={step.no}
                data-arch-fade
                className="grid grid-cols-[auto_1fr] gap-5 border-t border-on-dark/10 py-7 sm:gap-8"
              >
                <span className="font-latin text-[11px] tracking-[0.3em] text-on-dark/40">
                  {step.no}
                </span>
                <div>
                  <h3 className="font-display text-base font-normal sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-on-dark/60">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 施設営繕 */}
      <section
        id="maintenance"
        data-arch-section
        className="w-full bg-paper px-6 py-24 sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div
            data-arch-fade
            className="media relative aspect-[4/3] w-full overflow-hidden bg-[#161513] lg:aspect-[5/4]"
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
            <p
              data-arch-fade
              className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]"
            >
              <span aria-hidden className="inline-block h-px w-10 bg-ink/25" />
              MAINTENANCE
            </p>
            <h2
              data-arch-fade
              className="t-heading-tight mt-7 font-display font-normal text-ink"
            >
              施設営繕
            </h2>
            <p data-arch-fade className="t-note mt-6 max-w-md text-ink-muted">
              建てた後のほうが、建物と付き合う時間は長くなります。点検で劣化を見つけ、傷んだところを直し、日々の管理を続けます。
            </p>

            <dl className="mt-10 border-t border-line">
              {MAINTENANCE.map((item) => (
                <div
                  key={item.title}
                  data-arch-fade
                  className="flex flex-col gap-2 border-b border-line py-6 sm:flex-row sm:gap-8"
                >
                  <dt className="font-display text-base font-normal text-ink sm:w-28 sm:shrink-0">
                    {item.title}
                  </dt>
                  <dd className="text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 空き店舗のご相談 */}
      <section
        id="vacancy"
        data-arch-section
        className="w-full bg-stone px-6 py-24 sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto grid max-w-[1520px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div>
            <p
              data-arch-fade
              className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]"
            >
              <span aria-hidden className="inline-block h-px w-10 bg-ink/25" />
              VACANCY SUPPORT
            </p>
            <h2
              data-arch-fade
              className="t-heading-tight mt-7 font-display font-normal text-ink"
            >
              空き店舗のご相談
            </h2>
            <p data-arch-fade className="t-note mt-6 max-w-xl text-ink-muted">
              借り手がつかない区画も、直せば動くことがあります。修繕と改修で見栄えと使い勝手を上げたうえで、不動産側のつながりを使って事業者を探します。
            </p>
            <p data-arch-fade className="t-note mt-5 max-w-xl text-ink-muted">
              建築と不動産を別の会社に頼むと、改修の中身と募集の条件が噛み合わないことがあります。私たちは両方を自社で持っているので、貸せる状態から逆算して工事を決められます。
            </p>

            <Link
              data-arch-fade
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
            data-arch-fade
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
        data-arch-section
        className="on-dark w-full bg-navy px-6 py-24 text-on-dark sm:px-10 lg:px-16 lg:py-28 xl:px-24"
      >
        <div className="mx-auto max-w-[1520px]">
          <p
            data-arch-fade
            className="t-body max-w-xl font-display font-light text-on-dark/90"
          >
            仕上がりは、実際の現場でご覧ください。
          </p>

          <div data-arch-fade className="mt-9">
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

          <p data-arch-fade className="t-note mt-10 text-on-dark/55">
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
