"use client";
import CmsText from "@/components/CmsText";


import Image from "@/components/CmsImage";
import Link from "@/components/CmsLink";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { prefersReducedMotion } from "@/lib/animations";

/**
 * 導入メッセージ(仕様書2.3 / 6.1)を、スクロール連動の据え置き(sticky)演出で見せる。
 *
 * 他セクションが hp1(stagepartners-hp)と似た「静的な組版」なのに対し、ここだけは
 * 背の高いセクションの中で画面を据え置き、スクロール量に演出を紐づけて差別化する。
 *   第1段階: 街の写真を背景に、前置きの一文を立ち上げる
 *   第2段階: 次のスクロールで写真が退いてネイビーが現れ、"画像の外"に
 *            このメッセージの核心(見出しサイズ)がスポットライトと共に開く
 *   仕上げ : 結びの一文(通常サイズ)を添えてから、次セクションへ解放する
 *
 * pin(要素をfixed化)ではなく position:sticky を使うことで、開始/終了で隣接
 * セクションとぶつかる挙動を避ける。コーポレートメッセージの原文は改変しない
 * (仕様書2.3)。文字サイズは web_design_standard.md のトークン(t-heading/t-body)
 * の2階層のみを用いる(Businessの見出し「不動産と建築を、一社でつなぐ。」と同格)。
 * prefers-reduced-motion では据え置きも演出も行わず静的に見せる。
 */
const INTRO = "不動産や建築を扱うということは、主役は私たちではない。";
const CORE = ["主役は、", "その場所で挑戦する人たちだ。"];
const OUTRO = "私たちは、その人たちが輝くための舞台を創る。";

export default function Message() {
  const sectionRef = useScopedGsap<HTMLElement>(({ scope }) => {
    const q = gsap.utils.selector(scope);

    if (prefersReducedMotion()) {
      gsap.set(q("[data-msg-intro]"), { opacity: 1, y: 0 });
      gsap.set(q("[data-msg-core-line]"), { opacity: 1, yPercent: 0 });
      gsap.set(q("[data-msg-outro]"), { opacity: 1, y: 0 });
      gsap.set(q("[data-msg-rule]"), { scaleX: 1 });
      gsap.set(q("[data-msg-link]"), { opacity: 1, y: 0 });
      gsap.set(q("[data-msg-glow]"), { opacity: 1, scale: 1 });
      gsap.set(q("[data-msg-bg]"), { opacity: 0 });
      return;
    }

    // 初期状態: 画像は最初は素のまま見せ、紺のフィルターは文字が出始めるまでかけない
    gsap.set(q("[data-msg-scrim]"), { opacity: 0 });
    gsap.set(q("[data-msg-intro]"), { opacity: 0, y: 28 });
    gsap.set(q("[data-msg-core-line]"), { opacity: 0, yPercent: 120 });
    gsap.set(q("[data-msg-outro]"), { opacity: 0, y: 16 });
    gsap.set(q("[data-msg-rule]"), { scaleX: 0, transformOrigin: "left center" });
    gsap.set(q("[data-msg-glow]"), { opacity: 0, scale: 0.85 });
    gsap.set(q("[data-msg-link]"), { opacity: 0, y: 14 });

    const coreLines = q("[data-msg-core-line]");

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: scope.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.8,
      },
    });

    // 演出は進捗0.86までに完了させ、残りは"見せる余白"として据え置く。
    tl.to(q("[data-msg-bg-img]"), { scale: 1.16 }, 0)
      // 文字が出始めるのに合わせて紺のフィルターをかける(それまでは素の写真)
      .to(q("[data-msg-scrim]"), { opacity: 1, duration: 0.08 }, 0.05)
      .to(q("[data-msg-intro]"), { opacity: 1, y: 0, duration: 0.14 }, 0.05)
      // 写真を退けてネイビーを現す(＝核心の一文を画像bgの外へ出す)
      .to(q("[data-msg-bg]"), { opacity: 0, duration: 0.14 }, 0.4)
      .to(q("[data-msg-intro]"), { opacity: 0.35, duration: 0.12 }, 0.4)
      .to(q("[data-msg-glow]"), { opacity: 1, scale: 1, duration: 0.2 }, 0.42)
      .to(coreLines[0], { opacity: 1, yPercent: 0, duration: 0.14 }, 0.46)
      .to(coreLines[1], { opacity: 1, yPercent: 0, duration: 0.16 }, 0.55)
      .to(q("[data-msg-outro]"), { opacity: 1, y: 0, duration: 0.12 }, 0.7)
      .to(q("[data-msg-rule]"), { scaleX: 1, duration: 0.1 }, 0.8)
      .to(q("[data-msg-link]"), { opacity: 1, y: 0, duration: 0.1 }, 0.83);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="message"
      aria-label="メッセージ"
      className="h-[320vh] w-full bg-navy motion-reduce:h-auto"
    >
      <div
        data-msg-stage
        className="on-dark sticky top-0 flex h-[100svh] w-full items-center overflow-hidden bg-navy text-on-dark motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-[100svh]"
      >
        {/* 画像レイヤー(第1段階) */}
        <div data-msg-bg className="absolute inset-0">
          <div data-msg-bg-img className="absolute inset-0">
            <Image
              src="/heroimage1.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[40%_center]"
            />
          </div>
          <div data-msg-scrim aria-hidden className="absolute inset-0 bg-navy/60" />
          <div
            data-msg-scrim
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-navy via-navy/25 to-navy/50"
          />
        </div>

        {/* スポットライトの光(第2段階) */}
        <div
          data-msg-glow
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[56%] h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,248,232,0.16), transparent)",
          }}
        />

        {/* 本文 */}
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-14">
          <div className="max-w-3xl">
            <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/55 sm:text-[11px]">
              <span aria-hidden className="inline-block h-px w-10 bg-on-dark/30" /><CmsText>{"MESSAGE"}</CmsText></p>

            <p
              data-msg-intro
              className="t-body mt-10 font-display font-light text-on-dark/85 sm:mt-12"
            >
              <CmsText>{INTRO}</CmsText>
            </p>

            <h2 className="mt-8 font-display font-normal sm:mt-10">
              <CmsText>{CORE.map((line) => (
                <span key={line} className="block overflow-hidden">
                  <span
                    data-msg-core-line
                    className="t-heading block text-on-dark"
                  >
                    <CmsText>{line}</CmsText>
                  </span>
                </span>
              ))}</CmsText>
            </h2>

            <p
              data-msg-outro
              className="t-body mt-8 font-display font-light text-on-dark/85 sm:mt-10"
            >
              <CmsText>{OUTRO}</CmsText>
            </p>

            <span
              data-msg-rule
              aria-hidden
              className="mt-8 block h-px w-24 origin-left bg-on-dark/40 sm:w-32"
            />

            <Link
              data-msg-link
              href="/company"
              className="group mt-9 inline-flex items-center gap-3 bg-on-dark px-8 py-4 text-xs font-medium tracking-[0.2em] text-navy transition-colors duration-300 hover:bg-navy-mid hover:text-on-dark"
            ><CmsText>{"私たちについて"}</CmsText><span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              ><CmsText>{"→"}</CmsText></span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
