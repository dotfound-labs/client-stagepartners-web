"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { ScrollTrigger } from "@/hooks/useGsap";
import { prefersReducedMotion } from "@/lib/animations";

/**
 * サイト全体の慣性スクロール。
 *
 * GSAPはスクロールに合わせて何かを動かすことはできるが、スクロールそのものの
 * 効き方は変えられない。ここだけLenisに任せている。
 *
 * 注意点が4つある。
 * 1. Lenisは専用のrequestAnimationFrameで回す。GSAPのtickerに相乗りさせる書き方も
 *    あるが、tickerが眠るとページが一切スクロールできなくなる。スクロールは
 *    演出と違って止まると操作不能になるため、独立させておく。
 *    ScrollTriggerとの同期は scroll イベントで取る。
 * 2. Lenisを入れるとブラウザ標準のハッシュ移動が効かなくなる。建築ソリューションの
 *    目次が飛ばなくなるため、ページ内リンクは lenis.scrollTo に繋ぎ替える。
 *    固定ヘッダー分のオフセットもここで持つ(globals.cssのscroll-padding-topは効かない)。
 * 3. 動きの低減設定では起動せず、ブラウザ標準のスクロールに戻す。
 * 4. このコンポーネントはレイアウトに置いてあるため、ページ遷移をまたいで
 *    マウントされたまま。遷移直後、新しいページのGSAP/ScrollTrigger群が
 *    レイアウトを組み直す(高さの違うページに変わる・スクロールトリガーが
 *    再計算される)過程で、一度は先頭に戻してもその直後にブラウザ側の
 *    "native" スクロールとして検知される揺り戻しが起き、結果的に中段や
 *    下段まで動いてしまうことがある(原因はページごとに一定しない)。
 *    1回リセットするだけでは不十分なため、PageLoaderの幕が画面を覆っている
 *    間(遷移後 約1.8秒)は毎フレーム先頭へ固定し続け、幕の裏で必ず収まる
 *    ようにしている。画面サイズによらず起きる問題なので、ここでの対処で
 *    全ブレークポイントに効く。
 */
const HEADER_OFFSET = -88;

declare global {
  interface Window {
    /** 動作確認用。コンソールから __lenis.destroy() で素のスクロールに戻せる。 */
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // 遷移のたびに、ページ本体とLenisの内部位置を先頭へ固定する。
  // PageLoaderの幕が画面を覆っている間(最長でも約1.8秒)、毎フレーム
  // 0へ戻し続けることで、原因を問わずどんな揺り戻しも幕の裏に隠す。
  // 描画前に動かし始めたいので useLayoutEffect で開始する。
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      // 初回表示は既に先頭にいるので何もしない
      isFirstRender.current = false;
      return;
    }

    const start = performance.now();
    const PIN_DURATION = 1800;
    let raf = 0;

    const pin = () => {
      window.scrollTo(0, 0);
      window.__lenis?.scrollTo(0, { immediate: true, force: true });
      if (performance.now() - start < PIN_DURATION) {
        raf = requestAnimationFrame(pin);
      }
    };
    pin();

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

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
