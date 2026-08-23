"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "@/hooks/useGsap";
import { prefersReducedMotion } from "@/lib/animations";

/**
 * サイト全体の慣性スクロール。
 *
 * GSAPはスクロールに合わせて何かを動かすことはできるが、スクロールそのものの
 * 効き方は変えられない。ここだけLenisに任せている。
 *
 * 注意点が3つある。
 * 1. Lenisは専用のrequestAnimationFrameで回す。GSAPのtickerに相乗りさせる書き方も
 *    あるが、tickerが眠るとページが一切スクロールできなくなる。スクロールは
 *    演出と違って止まると操作不能になるため、独立させておく。
 *    ScrollTriggerとの同期は scroll イベントで取る。
 * 2. Lenisを入れるとブラウザ標準のハッシュ移動が効かなくなる。建築ソリューションの
 *    目次が飛ばなくなるため、ページ内リンクは lenis.scrollTo に繋ぎ替える。
 *    固定ヘッダー分のオフセットもここで持つ(globals.cssのscroll-padding-topは効かない)。
 * 3. 動きの低減設定では起動せず、ブラウザ標準のスクロールに戻す。
 */
const HEADER_OFFSET = -88;

declare global {
  interface Window {
    /** 動作確認用。コンソールから __lenis.destroy() で素のスクロールに戻せる。 */
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true,
    });
    window.__lenis = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: HEADER_OFFSET });
      history.replaceState(null, "", href);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
