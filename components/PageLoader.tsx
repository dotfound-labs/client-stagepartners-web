"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/hooks/useGsap";
import { markStageRevealed, prefersReducedMotion } from "@/lib/animations";

/**
 * ローディング/ページ遷移の幕。初回ロードと以降の遷移で動きを分けている。
 *
 * 初回ロード(サイトに入った瞬間):
 *   ネイビーの幕がロゴと「REAL ESTATE & ARCHITECTURE」を見せてから、
 *   緞帳のように上へ引き上がる(仕様書4.2の「舞台」モチーフ)。
 *
 * 以降のページ遷移:
 *   上下2枚のパネルが中央で閉じ、合わせ目に社名の入った線が光り、
 *   遷移後にそのまま上下へ割れて開く(codyhouse の animated page transition
 *   と同じ考え方)。閉じる→開くが一続きに見えるようにしている。
 *
 * 遷移の遅延について:
 *   Next.js の App Router は遷移が終わってからでないと pathname が変わらず、
 *   そのままでは「閉じる」動きを見せる間がない。そこで内部リンクのクリックを
 *   capture フェーズで横取りし、閉じ切ってから router.push している。
 *   横取りするのは同一サイト内の別ページへ進む素のクリックだけで、
 *   ページ内アンカー(#)・外部リンク・別タブ・ダウンロード・修飾キー付きの
 *   クリックには手を出さない(SmoothScroll 側のハッシュ処理とも衝突しない)。
 *
 * 実装上の要点:
 * - 初期状態(SSR)から幕は閉じているため、JS適用前に中身が見えてしまうことがない。
 * - 遷移時は useLayoutEffect(描画前)で幕を閉じ直すので、新ページが一瞬見える現象を防ぐ。
 * - 幕が出ている間は背面をスクロールさせない。終了後は pointer-events を切って操作を妨げない。
 * - 戻る/進むなど横取りできない遷移では、閉じた状態から開くだけになる(従来どおり)。
 */
export default function PageLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const closeTlRef = useRef<gsap.core.Timeline | null>(null);
  const isClosingRef = useRef(false);

  /**
   * 上下のパネルを閉じ切ってから onDone を呼ぶ。
   *
   * onDone は実際のページ遷移(router.push)を発火させる、待たせすぎては
   * いけない処理。バックグラウンドタブなどで requestAnimationFrame が
   * 止まるとGSAPのタイムラインも進まなくなるため、アニメーション完了を
   * 待つだけだと遷移そのものが起きなくなる恐れがある。保険として、
   * アニメーションの想定時間より長いタイムアウトで必ず1回だけ onDone を
   * 呼ぶようにしている(アニメーションが先に終われば、そちらが先に呼ぶ)。
   */
  const playClose = useCallback((onDone: () => void) => {
    const panel = panelRef.current;
    if (!panel || prefersReducedMotion()) {
      onDone();
      return;
    }

    const q = gsap.utils.selector(panel);
    const curtain = q("[data-loader-curtain]");
    const halves = q("[data-loader-half]");
    const seam = q("[data-loader-seam]");

    gsap.set(panel, { visibility: "visible", pointerEvents: "auto" });
    gsap.set(curtain, { display: "none" });
    gsap.set(halves, { display: "block" });
    gsap.set(seam, { opacity: 0 });
    document.body.style.overflow = "hidden";

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      isClosingRef.current = false;
      onDone();
    };
    // アニメーション想定0.7秒に対し、1100msで打ち切る安全弁
    const fallback = window.setTimeout(finish, 1100);

    closeTlRef.current?.kill();
    const tl = gsap.timeline({
      onComplete: () => {
        window.clearTimeout(fallback);
        finish();
      },
    });
    closeTlRef.current = tl;

    tl.fromTo(
      halves[0],
      { yPercent: -100 },
      { yPercent: 0, duration: 0.6, ease: "power4.inOut" },
    )
      .fromTo(
        halves[1],
        { yPercent: 100 },
        { yPercent: 0, duration: 0.6, ease: "power4.inOut" },
        "<",
      )
      .to(seam, { opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.18");
  }, []);

  // 内部リンクのクリックを横取りし、閉じ切ってから遷移する
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      // 左クリック以外・修飾キー付き(別タブで開く操作)は触らない
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      // ページ内アンカーは SmoothScroll に任せる。外部・メール・電話も触らない。
      if (!href.startsWith("/")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // 同じページへのリンク(ロゴやTOPなど)は遷移が起きないので幕を出さない
      if (url.pathname === window.location.pathname) return;

      if (isClosingRef.current) {
        // 閉じている最中の二重クリックは無視する
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // Next.js の Link 自身のハンドラより先に止める(captureで拾っている)
      event.preventDefault();
      event.stopPropagation();

      isClosingRef.current = true;
      playClose(() => router.push(href));
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [playClose, router]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const intro = isFirstLoad.current;
    isFirstLoad.current = false;

    const q = gsap.utils.selector(panel);
    const curtain = q("[data-loader-curtain]");
    const halves = q("[data-loader-half]");
    const seam = q("[data-loader-seam]");

    // 閉じる側のタイムラインは役目を終えているので止めておく
    closeTlRef.current?.kill();
    closeTlRef.current = null;
    isClosingRef.current = false;

    // requestAnimationFrame が止まる(バックグラウンドタブ等)とGSAPの
    // タイムラインも進まなくなり、onComplete が来ないまま画面が閉じきり・
    // スクロールロックしたままになりかねない。unlock 自体を「一度きり、
    // 保険のタイムアウト付き」にして、アニメーションが完了しなくても
    // 必ず後片付けされるようにする。
    let unlocked = false;
    let unlockFallback = 0;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      window.clearTimeout(unlockFallback);
      document.body.style.overflow = "";
      gsap.set(panel, { pointerEvents: "none", visibility: "hidden" });
    };

    gsap.set(panel, { pointerEvents: "auto", visibility: "visible" });
    document.body.style.overflow = "hidden";

    if (prefersReducedMotion()) {
      gsap.set(curtain, { display: intro ? "flex" : "none", clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(halves, { display: intro ? "none" : "block", yPercent: 0 });
      gsap.set(q("[data-loader-item]"), { opacity: 1, y: 0 });
      gsap.set(q("[data-loader-rule]"), { scaleX: 1 });
      gsap.set(seam, { opacity: intro ? 0 : 1 });
      unlockFallback = window.setTimeout(() => {
        unlock();
        markStageRevealed();
      }, 900);
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

    // ── 初回ロード: 緞帳が上がる ──────────────────────────────
    if (intro) {
      gsap.set(curtain, { display: "flex", clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(halves, { display: "none" });
      gsap.set(seam, { opacity: 0 });

      unlockFallback = window.setTimeout(() => {
        unlock();
        markStageRevealed();
      }, 3000);
      const tl = gsap.timeline({ onComplete: unlock });

      // 幕の中身: ロゴ → 基準線 → ラベル
      tl.fromTo(
        q("[data-loader-item]"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power2.out" },
      )
        .fromTo(
          q("[data-loader-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: "power3.inOut" },
          "-=0.55",
        )
        // 中身を先に消してから幕を上げる(文字が動きながら切れるのを避ける)
        .to(
          q("[data-loader-content]"),
          { opacity: 0, duration: 0.35, ease: "power2.in" },
          "+=0.25",
        )
        // 緞帳が上がる
        .to(
          curtain,
          { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "power4.inOut" },
          "-=0.1",
        )
        // 幕が上がり切る前に合図を出し、下のページの導入と重ねる
        .add(markStageRevealed, "<0.3");

      return () => {
        tl.kill();
        unlock();
        markStageRevealed();
      };
    }

    // ── 以降の遷移: 閉じた状態から上下へ割れて開く ──────────────────
    // クリックを横取りできた場合はすでに閉じ切っており、
    // 戻る/進むなど横取りできない場合はここで閉じた状態に揃える。
    gsap.set(curtain, { display: "none" });
    gsap.set(halves, { display: "block", yPercent: 0 });

    unlockFallback = window.setTimeout(() => {
      unlock();
      markStageRevealed();
    }, 1900);
    const tl = gsap.timeline({ onComplete: unlock });

    // 合わせ目の社名を見せてから、上下へ割る
    tl.to(seam, { opacity: 1, duration: 0.26, ease: "power2.out" })
      .to(seam, { opacity: 0, duration: 0.22, ease: "power2.in" }, "+=0.16")
      .to(
        halves[0],
        { yPercent: -100, duration: 0.85, ease: "power4.inOut" },
        "-=0.1",
      )
      .to(
        halves[1],
        { yPercent: 100, duration: 0.85, ease: "power4.inOut" },
        "<",
      )
      // 開き切る前に合図を出し、下のページの導入と重ねる
      .add(markStageRevealed, "<0.25");

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
      className="page-loader fixed inset-0 z-[90]"
    >
      {/* JSが無効な環境で幕が残り続けないようにする */}
      <noscript>
        <style>{`.page-loader{display:none !important}`}</style>
      </noscript>

      {/* 初回ロードの幕(緞帳) */}
      <div
        data-loader-curtain
        className="absolute inset-0 flex items-center justify-center bg-navy"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        {/* 製図のような内枠 */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-4 border border-on-dark/15 sm:inset-6 lg:inset-8"
        />

        <div
          data-loader-content
          className="relative flex flex-col items-center gap-7 px-8"
        >
          <Image
            data-loader-item
            src="/logo-mono-white.png"
            alt=""
            width={400}
            height={97}
            priority
            className="h-8 w-auto sm:h-10"
          />

          {/* 地平線/基礎を引くような水平線 */}
          <span
            data-loader-rule
            aria-hidden
            className="block h-px w-40 origin-center bg-on-dark/45 sm:w-56"
          />

          <span
            data-loader-item
            className="font-latin text-[9px] tracking-[0.4em] text-on-dark/55 sm:text-[10px]"
          >
            REAL ESTATE &amp; ARCHITECTURE
          </span>
        </div>
      </div>

      {/* 遷移用の上下2枚。初期はSSRで見えないようにしておく。
          画面の高さが奇数ピクセルのとき合わせ目に1pxの隙間ができ、
          その線から下のページが覗くため、上下ともわずかに重ねている。 */}
      <span
        data-loader-half
        aria-hidden
        className="absolute inset-x-0 top-0 h-[50.5%] bg-navy"
        style={{ display: "none" }}
      />
      <span
        data-loader-half
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[50.5%] bg-navy"
        style={{ display: "none" }}
      />

      {/* 合わせ目の線と社名 */}
      <div
        data-loader-seam
        className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-4 px-6 opacity-0 sm:gap-6 sm:px-10"
      >
        <span
          aria-hidden
          className="block h-px flex-1 bg-on-dark/60 shadow-[0_0_12px_rgba(243,244,245,0.5)]"
        />
        <span className="shrink-0 whitespace-nowrap font-latin text-[10px] tracking-[0.4em] text-on-dark sm:text-xs">
          STAGE PARTNERS
        </span>
        <span
          aria-hidden
          className="block h-px flex-1 bg-on-dark/60 shadow-[0_0_12px_rgba(243,244,245,0.5)]"
        />
      </div>
    </div>
  );
}
