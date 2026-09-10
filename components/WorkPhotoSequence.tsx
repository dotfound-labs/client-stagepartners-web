"use client";

import Image from "next/image";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { prefersReducedMotion } from "@/lib/animations";
import { STATE_LABEL, workImage, type Shot, type Work } from "@/content/works";

/**
 * 施工前・施工後を、左右2カラムでそれぞれ1つのセクションとして見せる。
 *
 * 以前は写真を1枚ずつ「組」にして施工前→矢印→施工後の順に出していたが、
 * 撮影アングルが揃っていない案件では組ませた前後が同じ場所を指しておらず、
 * 見比べる意味を持たない組み合わせになってしまっていた。
 * そのため組み合わせをやめ、左に施工前・右に施工後をそれぞれまとめて置き、
 * 各カラムの中で写真がスクロールに合わせて1枚ずつ現れる構成にした。
 * 前後の対応は中央の縦線と矢印だけが示す(モバイルは縦積みになるため隠す)。
 */
type Props = { work: Work };

function Photo({
  work,
  shot,
  tone,
  index,
  priority,
}: {
  work: Work;
  shot: Shot;
  tone: "before" | "after";
  index: number;
  priority?: boolean;
}) {
  const isBefore = tone === "before";
  return (
    <figure
      data-seq-photo
      className="media relative aspect-[3/2] w-full overflow-hidden bg-[#161513]"
    >
      <div data-seq-photo-inner className="absolute inset-0">
        <Image
          src={workImage(work, shot.file)}
          alt=""
          fill
          sizes="(min-width: 1024px) 46vw, 100vw"
          className={`object-cover ${isBefore ? "[filter:grayscale(0.65)_brightness(0.94)]" : ""
            }`}
          priority={priority}
        />
      </div>
      <span
        aria-hidden
        className="absolute left-5 top-5 font-latin text-[10px] tracking-[0.25em] text-on-dark/85"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </figure>
  );
}

function SectionHead({ tone, count }: { tone: "before" | "after"; count: number }) {
  const isBefore = tone === "before";
  return (
    <div
      data-seq-head
      className={`flex items-end justify-between gap-6 border-b pb-5 ${isBefore ? "border-line" : "border-navy-mid/30"
        }`}
    >
      <div>
        <span
          className={`font-latin text-[11px] tracking-[0.35em] ${isBefore ? "text-ink-muted" : "text-navy-mid"
            }`}
        >
          {isBefore ? "BEFORE" : "AFTER"}
        </span>
        <h3 className="mt-3 font-display text-2xl font-normal text-ink">
          {STATE_LABEL[tone]}
        </h3>
      </div>
      <span
        className={`font-latin text-xs tracking-[0.2em] ${isBefore ? "text-ink-muted" : "text-navy-mid"
          }`}
      >
        {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function WorkPhotoSequence({ work }: Props) {
  const before = work.shots.filter((s) => s.state === "before");
  const after = work.shots.filter((s) => s.state === "after");

  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    if (prefersReducedMotion()) return;

    // 各写真: 下から現れながら、少し引いた状態(scale)から等倍に収まる。
    gsap.utils.toArray<HTMLElement>(scope.current!.querySelectorAll("[data-seq-photo]")).forEach((photo) => {
      const inner = photo.querySelector("[data-seq-photo-inner]");
      gsap.fromTo(
        photo,
        { opacity: 0, y: 56 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: photo, start: "top 88%", end: "top 55%", scrub: 0.8 },
        },
      );
      if (inner) {
        gsap.fromTo(
          inner,
          { scale: 1.16 },
          {
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: { trigger: photo, start: "top 88%", end: "top 40%", scrub: 0.8 },
          },
        );
      }
    });

    // 中央の縦線と矢印。PCで左右に分かれた瞬間、一度だけ現れれば十分なので
    // 組ごとのスクラブはせず、セクション全体が視界に入った時に一度だけ動かす。
    const divider = scope.current!.querySelector("[data-seq-divider-line]");
    const arrow = scope.current!.querySelector("[data-seq-divider-arrow]");
    if (divider) {
      gsap.fromTo(
        divider,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: { trigger: scope.current, start: "top 75%", end: "bottom 70%", scrub: 0.6 },
        },
      );
    }
    if (arrow) {
      gsap.fromTo(
        arrow,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(2.2)",
          scrollTrigger: { trigger: scope.current, start: "top 70%", end: "top 40%", scrub: false },
        },
      );
    }
  }, [work.slug]);

  return (
    <div ref={rootRef} className="relative grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-x-14">
      {/* 中央の区切り。左右に分かれるPCだけで見せる。モバイルは縦積みで
          BEFORE→AFTERの順そのものが対応を示すので、線・矢印とも不要。 */}
      <div
        data-seq-divider-line
        aria-hidden
        className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line lg:block"
      />
      <div
        data-seq-divider-arrow
        aria-hidden
        className="absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 lg:flex"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-sm text-navy-mid shadow-[0_4px_16px_rgba(26,22,19,0.12)]">
          →
        </span>
      </div>

      <section data-seq-section="before" className="flex flex-col gap-12 lg:gap-14">
        <SectionHead tone="before" count={before.length} />
        <div className="flex flex-col gap-14">
          {before.map((shot, i) => (
            <Photo key={shot.file} work={work} shot={shot} tone="before" index={i} priority={i === 0} />
          ))}
        </div>
      </section>

      <section data-seq-section="after" className="flex flex-col gap-12 lg:gap-14">
        <SectionHead tone="after" count={after.length} />
        <div className="flex flex-col gap-14">
          {after.map((shot, i) => (
            <Photo key={shot.file} work={work} shot={shot} tone="after" index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
