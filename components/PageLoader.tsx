"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/hooks/useGsap";
import { markStageRevealed, prefersReducedMotion } from "@/lib/animations";

/**
 * ローディング/ページ遷移の幕。ブラウン管テレビの電源を切ったときの動きを模す。
 *
 * 幕(ネイビー)は画面いっぱいの状態から、縦方向に潰れて一本の水平線になり、
 * その線が横に縮んで消える。線になった瞬間に社名を出し、
 * 「-----STAGE PARTNERS-----」のように線と文字が一体で見えるようにしている。
 *
 * 実装上の要点:
 * - 初期状態(SSR)から幕は閉じているため、JS適用前に中身が見えてしまうことがない。
 * - 遷移時は useLayoutEffect(描画前)で幕を閉じ直すので、新ページが一瞬見える現象を防ぐ。
 * - 幕が出ている間は背面をスクロールさせない。終了後は pointer-events を切って操作を妨げない。
 * - scaleY/scaleX は transform なので合成のみで動き、clip-path より滑らかに出る。
 */
export default function PageLoader() {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const intro = isFirstLoad.current;
    isFirstLoad.current = false;

    const q = gsap.utils.selector(panel);
    const screen = q("[data-crt-screen]")[0];
    // 走査線は社名の左右に1本ずつ。まとめて同じ動きをさせる。
    const line = q("[data-crt-line]");
    const label = q("[data-crt-label]")[0];

    const unlock = () => {
      document.body.style.overflow = "";
      gsap.set(panel, { pointerEvents: "none", visibility: "hidden" });
    };

    // 初回ロード・遷移とも、必ず「画面が閉じた状態」から始める
    gsap.set(panel, { pointerEvents: "auto", visibility: "visible" });
    gsap.set(screen, { scaleY: 1, scaleX: 1, opacity: 1 });
    gsap.set(line, { scaleX: 0, opacity: 0 });
    gsap.set(label, { opacity: 0 });
    document.body.style.overflow = "hidden";

    if (prefersReducedMotion()) {
      const tl = gsap.timeline({
        onComplete: () => {
          unlock();
          markStageRevealed();
        },
      });
      tl.to(panel, { opacity: 0, duration: 0.25, delay: 0.2 }).set(panel, {
        opacity: 1,
      });
      return () => {
        tl.kill();
        unlock();
        markStageRevealed();
      };
    }

    const tl = gsap.timeline({ onComplete: unlock });

    // 1. 画面が縦に潰れて一本の線になる(ブラウン管の電源を切る動き)
    tl.to(screen, {
      scaleY: 0.002,
      duration: intro ? 0.75 : 0.6,
      ease: "power3.inOut",
      delay: intro ? 0.25 : 0,
    })
      // 2. 潰れきったところで、線と社名を重ねて出す
      .to(
        line,
        { scaleX: 1, opacity: 1, duration: intro ? 0.5 : 0.4, ease: "power2.out" },
        "-=0.12",
      )
      .to(screen, { opacity: 0, duration: 0.2 }, "<")
      .to(
        label,
        { opacity: 1, duration: intro ? 0.45 : 0.35, ease: "power2.out" },
        "-=0.25",
      )
      // 3. 線を残したまま少し見せる
      .to({}, { duration: intro ? 0.5 : 0.25 })
      // 4. 線が横に縮んで消える
      .to(label, { opacity: 0, duration: 0.25, ease: "power2.in" })
      .to(
        line,
        { scaleX: 0, duration: intro ? 0.6 : 0.5, ease: "power3.inOut" },
        "-=0.1",
      )
      // 線が消えきる前に合図を出し、下のページの導入と重ねる
      .add(markStageRevealed, "<0.15");

    return () => {
      tl.kill();
      unlock();
      markStageRevealed();
    };
  }, [pathname]);

  return (
    <div
      ref={panelRef}
      aria-hidden
      className="page-loader pointer-events-auto fixed inset-0 z-[90] flex items-center justify-center"
    >
      {/* JSが無効な環境で幕が残り続けないようにする */}
      <noscript>
        <style>{`.page-loader{display:none !important}`}</style>
      </noscript>

      {/* ブラウン管の「画面」。縦に潰れて線になる */}
      <span
        data-crt-screen
        aria-hidden
        className="absolute inset-0 origin-center bg-navy"
      />

      {/* 潰れきった瞬間に出る走査線と社名 */}
      <div className="relative flex w-full items-center justify-center gap-4 px-6 sm:gap-6 sm:px-10">
        {/* 左の線は右端(社名側)を起点に外へ伸ばす */}
        <span
          data-crt-line
          aria-hidden
          className="block h-px flex-1 origin-right bg-on-dark/70 shadow-[0_0_12px_rgba(243,244,245,0.55)]"
        />
        <span
          data-crt-label
          className="shrink-0 whitespace-nowrap font-latin text-[10px] tracking-[0.4em] text-on-dark sm:text-xs"
        >
          STAGE PARTNERS
        </span>
        {/* 右の線は左端(社名側)を起点に外へ伸ばす */}
        <span
          data-crt-line
          aria-hidden
          className="block h-px flex-1 origin-left bg-on-dark/70 shadow-[0_0_12px_rgba(243,244,245,0.55)]"
        />
      </div>
    </div>
  );
}
