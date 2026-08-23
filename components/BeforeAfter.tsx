"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/hooks/useGsap";
import { Draggable } from "gsap/Draggable";
import { prefersReducedMotion } from "@/lib/animations";

if (typeof window !== "undefined") gsap.registerPlugin(Draggable);

type Props = {
  before: string;
  after: string;
  alt: string;
};

/**
 * 施工前と施工後を1枚の画の上で比べるスライダー。
 *
 * 施工前の側だけ彩度を落としてあり、ハンドルを境に
 * 「モノクロの過去」から「色のある現在」へ切り替わって見える。
 * グレースケールからカラーへ戻す表現はMessageセクション(.media-mono)で
 * 既に使っているサイトの語彙なので、ここだけ浮くことはない。
 *
 * 掴めることが伝わらないと動かしてもらえないため、初回に一度だけ
 * ハンドルが自分でスイープする。動きの低減設定では行わない。
 */
export default function BeforeAfter({ before, after, alt }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(50);
  useEffect(() => {
    const root = rootRef.current;
    const handle = handleRef.current;
    if (!root || !handle) return;

    // 現在値はエフェクト内に持つ。描画中にrefを書き換えないため。
    let current = 50;
    const apply = (percent: number) => {
      const p = gsap.utils.clamp(0, 100, percent);
      current = p;
      setValue(Math.round(p));
      gsap.set(clipRef.current, { clipPath: `inset(0 0 0 ${p}%)` });
      gsap.set(handle, { left: `${p}%` });
    };
    apply(50);

    const draggable = Draggable.create(handle, {
      type: "x",
      cursor: "ew-resize",
      activeCursor: "grabbing",
      bounds: root,
      onPress() {
        gsap.killTweensOf(handle);
      },
      onDrag() {
        apply((this.x / root.clientWidth) * 100 + 50);
      },
    })[0];

    // 画像の上をどこでも掴めるようにする(ハンドルの細い当たり判定だけに頼らない)
    const onPointer = (event: PointerEvent) => {
      if (event.buttons !== 1) return;
      const rect = root.getBoundingClientRect();
      apply(((event.clientX - rect.left) / rect.width) * 100);
    };
    root.addEventListener("pointerdown", onPointer);
    root.addEventListener("pointermove", onPointer);

    const onKey = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 10 : 2;
      if (event.key === "ArrowLeft") apply(current - step);
      else if (event.key === "ArrowRight") apply(current + step);
      else return;
      event.preventDefault();
    };
    handle.addEventListener("keydown", onKey);

    // 初回だけ「動かせる」ことを見せる
    let intro: gsap.core.Timeline | undefined;
    if (!prefersReducedMotion()) {
      const proxy = { p: 50 };
      intro = gsap.timeline({
        paused: true,
        onUpdate: () => apply(proxy.p),
      });
      intro
        .to(proxy, { p: 78, duration: 0.9, ease: "power2.inOut" })
        .to(proxy, { p: 26, duration: 1.1, ease: "power2.inOut" })
        .to(proxy, { p: 50, duration: 0.8, ease: "power2.inOut" });

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            intro?.play();
            observer.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      observer.observe(root);
      return () => {
        observer.disconnect();
        intro?.kill();
        draggable?.kill();
        root.removeEventListener("pointerdown", onPointer);
        root.removeEventListener("pointermove", onPointer);
        handle.removeEventListener("keydown", onKey);
      };
    }

    return () => {
      draggable?.kill();
      root.removeEventListener("pointerdown", onPointer);
      root.removeEventListener("pointermove", onPointer);
      handle.removeEventListener("keydown", onKey);
    };
  }, []);


  return (
    <div
      ref={rootRef}
      className="relative aspect-[3/2] w-full touch-none select-none overflow-hidden bg-[#161513]"
    >
      {/* 施工前(下に敷く。彩度を落として過去として見せる) */}
      <Image
        src={before}
        alt={`${alt}の施工前`}
        fill
        sizes="(min-width: 1024px) 70vw, 100vw"
        className="object-cover [filter:grayscale(0.85)_brightness(0.92)]"
      />

      {/* 施工後(ハンドルの右側だけ出す) */}
      <div ref={clipRef} className="absolute inset-0">
        <Image
          src={after}
          alt={`${alt}の施工後`}
          fill
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover"
        />
      </div>

      <span className="pointer-events-none absolute left-5 top-5 font-latin text-[10px] tracking-[0.3em] text-on-dark/85">
        BEFORE
      </span>
      <span className="pointer-events-none absolute right-5 top-5 font-latin text-[10px] tracking-[0.3em] text-on-dark/85">
        AFTER
      </span>

      {/* ハンドル */}
      <div
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={`${alt}の施工前後を比べる`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`施工後を${value}パーセント表示`}
        className="absolute top-0 z-10 -ml-6 flex h-full w-12 cursor-ew-resize items-center justify-center focus:outline-none"
      >
        {/* 境界の光 */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-on-dark/90 shadow-[0_0_12px_rgba(255,255,255,0.55)]"
        />
        <span
          aria-hidden
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-on-dark/70 bg-navy/70 backdrop-blur-sm transition-colors duration-300 group-focus:border-on-dark"
        >
          <span className="font-latin text-[10px] tracking-[0.1em] text-on-dark">↔</span>
        </span>
      </div>
    </div>
  );
}
