"use client";

import Image from "next/image";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { prefersReducedMotion } from "@/lib/animations";
import { STATE_LABEL, workImage, type Shot, type Work } from "@/lib/works";

/**
 * 施工前・施工後を、それぞれ1つのセクションとして見せるスクロール連動の写真展開。
 *
 * 以前は写真を1枚ずつ「組」にして施工前→矢印→施工後の順に出していたが、
 * 撮影アングルが揃っていない案件では組ませた前後が同じ場所を指しておらず、
 * 見比べる意味を持たない組み合わせになってしまっていた。
 * そのため組み合わせをやめ、施工前は施工前でまとめて、施工後は施工後でまとめて
 * それぞれ順にめくっていく構成にし、「前から後へ」の合図は両セクションの間に
 * 置く1つの区切りだけが担う。
 *
 *   - 施工前セクション: 彩度を落とした写真が、スクロールに合わせて1枚ずつ現れる
 *   - 区切り        : 縦の線が伸びて矢印が現れる。ここだけが前後の切り替わり
 *   - 施工後セクション: フルカラーの写真が、同じ調子で1枚ずつ現れる
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

    // 区切り: 縦の線が伸びきると同時に矢印が現れる。前後セクションを跨ぐ、唯一の合図。
    const divider = scope.current!.querySelector("[data-seq-divider]");
    if (divider) {
      const line = divider.querySelector("[data-seq-divider-line]");
      const arrow = divider.querySelector("[data-seq-divider-arrow]");
      const labels = divider.querySelectorAll("[data-seq-divider-label]");
      gsap
        .timeline({
          scrollTrigger: { trigger: divider, start: "top 85%", end: "bottom 35%", scrub: 0.8 },
        })
        .fromTo(line, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: "none" })
        .fromTo(
          arrow,
          { opacity: 0, scale: 0.5, rotate: -20 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.4, ease: "back.out(2.2)" },
          ">-0.15",
        )
        .fromTo(
          labels,
          { opacity: 0.35 },
          { opacity: 1, duration: 0.5, ease: "power1.out", stagger: 0.15 },
          "<",
        );
    }
  }, [work.slug]);

  return (
    <div ref={rootRef} className="flex flex-col gap-20 lg:gap-28">
      <section data-seq-section="before" className="flex flex-col gap-12 lg:gap-14">
        <SectionHead tone="before" count={before.length} />
        <div className="flex flex-col gap-16 lg:gap-20">
          {before.map((shot, i) => (
            <Photo key={shot.file} work={work} shot={shot} tone="before" index={i} priority={i === 0} />
          ))}
        </div>
      </section>

      {/* 施工前→施工後の切り替わりを示す、唯一の区切り。縦の線は上下どちらの
          画面幅でも同じ向き(下向き)で正しい。 */}
      <div
        data-seq-divider
        aria-hidden
        className="relative mx-auto flex flex-col items-center gap-4 py-2"
      >
        <span
          data-seq-divider-label
          className="font-latin text-[10px] tracking-[0.3em] text-ink-muted"
        >
          BEFORE
        </span>
        <div className="relative h-20 w-px overflow-hidden">
          <span
            data-seq-divider-line
            className="absolute inset-0 origin-top bg-gradient-to-b from-ink/35 to-navy-mid"
          />
        </div>
        <span
          data-seq-divider-arrow
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-paper text-base text-navy-mid shadow-[0_4px_16px_rgba(26,22,19,0.12)]"
        >
          ↓
        </span>
        <span
          data-seq-divider-label
          className="font-latin text-[10px] tracking-[0.3em] text-navy-mid"
        >
          AFTER
        </span>
      </div>

      <section data-seq-section="after" className="flex flex-col gap-12 lg:gap-14">
        <SectionHead tone="after" count={after.length} />
        <div className="flex flex-col gap-16 lg:gap-20">
          {after.map((shot, i) => (
            <Photo key={shot.file} work={work} shot={shot} tone="after" index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
