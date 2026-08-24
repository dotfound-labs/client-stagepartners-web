"use client";

import Image from "next/image";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { prefersReducedMotion } from "@/lib/animations";
import { STATE_LABEL, workImage, type Shot, type Work } from "@/lib/works";

/**
 * 施工前後を1組ずつ見せていく、スクロール連動の写真セクション。
 *
 * スクロールに合わせて
 *   施工前が出る → 矢印が伸びる → 施工後が出る → 次の組の施工前が出る …
 * の順で1段ずつ進む。全部を最初から並べると「前と後を見比べる」読み方に
 * ならないため、1組ずつに区切って順番を作っている。
 *
 * ただ現れるだけでは変化が伝わらないので、施工前と施工後で見え方に
 * はっきり差をつけている。
 *   - 施工前: 彩度を落とし、少し縮んだ状態で置かれる。過去の記録の見え方。
 *   - 矢印  : 線が伸びきると同時に、施工前が退き(彩度と明度が落ちる)、
 *             番号が回って施工後側へ主役が移る。
 *   - 施工後: マスクが下から上がって画が現れ、同時に中の写真が
 *             わずかに引き(scale)ながら定位置に収まる。カラーで、影も濃い。
 * 「退く」「現れる」を同じ時間軸に重ねることで、単なる2枚の表示ではなく
 * 入れ替わりとして読める。
 *
 * 組ごとにトリガーを分けているので、スクロール速度に関わらず必ず
 * 前→矢印→後 の順で現れる。
 */
type Props = { work: Work };

/** shots を [施工前, 施工後] の組に畳む。対応が取れない余りは片側だけの組にする。 */
function toPairs(shots: Shot[]): { before?: Shot; after?: Shot }[] {
  const pairs: { before?: Shot; after?: Shot }[] = [];
  let pending: Shot | null = null;

  for (const shot of shots) {
    if (shot.state === "before") {
      if (pending) pairs.push({ before: pending });
      pending = shot;
    } else if (pending) {
      pairs.push({ before: pending, after: shot });
      pending = null;
    } else {
      pairs.push({ after: shot });
    }
  }
  if (pending) pairs.push({ before: pending });
  return pairs;
}

function Photo({
  work,
  shot,
  tone,
}: {
  work: Work;
  shot: Shot;
  tone: "before" | "after";
}) {
  const isBefore = tone === "before";
  return (
    <figure>
      <figcaption className="flex items-center gap-3">
        <span
          data-photo-label
          className={`font-latin text-[10px] tracking-[0.3em] ${isBefore ? "text-ink-muted" : "text-navy-mid"
            }`}
        >
          {isBefore ? "BEFORE" : "AFTER"}
        </span>
        <span className={`h-px flex-1 ${isBefore ? "bg-ink/20" : "bg-navy-mid/30"}`} />
      </figcaption>
      <p className="mt-2 font-display text-base font-normal text-ink">
        {STATE_LABEL[shot.state]}
      </p>

      {/* data-photo-mask: 施工後だけ、下から上がる覆いで画を現す */}
      <div
        data-photo-mask={isBefore ? undefined : ""}
        className="media relative mt-5 aspect-[3/2] w-full overflow-hidden bg-[#161513]"
      >
        <div data-photo-inner className="absolute inset-0">
          <Image
            src={workImage(work, shot.file)}
            alt=""
            fill
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </figure>
  );
}

export default function WorkPhotoSequence({ work }: Props) {
  const pairs = toPairs(work.shots);

  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    if (prefersReducedMotion()) return;

    gsap.utils.toArray<HTMLElement>(scope.current!.querySelectorAll("[data-pair]")).forEach((pair) => {
      const inPair = gsap.utils.selector(pair);
      const before = inPair("[data-pair-before]");
      const beforeInner = inPair("[data-pair-before] [data-photo-inner]");
      const arrow = inPair("[data-pair-arrow]");
      const arrowLine = inPair("[data-pair-arrow-line]");
      const arrowHead = inPair("[data-pair-arrow-head]");
      const badge = inPair("[data-pair-badge]");
      const after = inPair("[data-pair-after]");
      const afterMask = inPair("[data-pair-after] [data-photo-mask]");
      const afterInner = inPair("[data-pair-after] [data-photo-inner]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pair,
          // この組が画面の下から入ってきたら始め、抜けきる手前で終わる。
          // 組の高さぶんの距離を使うので、前→矢印→後 の3段が
          // それぞれ十分なスクロール量を持ち、1段ずつ進んで見える。
          start: "top 88%",
          end: "bottom 45%",
          scrub: 0.8,
        },
      });

      // 1. 施工前が置かれる。彩度を落とし、少し縮んだ状態から等倍へ。
      if (before.length) {
        tl.fromTo(
          before,
          { opacity: 0, y: 44 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
        ).fromTo(
          beforeInner,
          { scale: 1.12, filter: "grayscale(0.85) brightness(0.9)" },
          { scale: 1, filter: "grayscale(0.7) brightness(0.94)", duration: 1, ease: "power2.out" },
          "<",
        );
      }

      // 2. 矢印が伸びる。伸びきる動きに合わせて施工前が一段退く。
      if (arrow.length) {
        tl.fromTo(arrowLine, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "none" }, ">-0.05")
          .fromTo(
            arrowHead,
            { opacity: 0, scale: 0.4 },
            { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)" },
            ">-0.12",
          );
        if (badge.length) {
          tl.fromTo(
            badge,
            { opacity: 0, rotate: -25, scale: 0.7 },
            { opacity: 1, rotate: 0, scale: 1, duration: 0.4, ease: "back.out(2)" },
            "<",
          );
        }
        // 主役が右へ移るので、施工前は色と明るさを一段落とす
        if (beforeInner.length) {
          tl.to(
            beforeInner,
            { filter: "grayscale(0.85) brightness(0.82)", duration: 0.6, ease: "power1.inOut" },
            "<-0.2",
          );
        }
      }

      // 3. 施工後が現れる。覆いが下から上がり、中の写真は引きながら収まる。
      if (after.length) {
        tl.fromTo(after, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, ">-0.1")
          .fromTo(
            afterMask,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.out" },
            "<",
          )
          .fromTo(
            afterInner,
            { scale: 1.18 },
            { scale: 1, duration: 1.3, ease: "power2.out" },
            "<",
          );
      }
    });
  }, [work.slug]);

  return (
    <div ref={rootRef} className="flex flex-col gap-24 lg:gap-32">
      {pairs.map((pair, i) => (
        <div
          key={i}
          data-pair
          className="relative grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-8"
        >
          <div data-pair-before>
            {pair.before ? (
              <Photo work={work} shot={pair.before} tone="before" />
            ) : (
              <div aria-hidden className="hidden lg:block" />
            )}
          </div>

          {/* 前と後をつなぐ矢印。線が伸びてから頭が出て、番号が留め具になる */}
          <div
            data-pair-arrow
            aria-hidden
            className="flex items-center justify-center gap-3 lg:h-full lg:flex-col lg:pt-28"
          >
            <span
              data-pair-badge
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-paper font-latin text-[10px] tracking-[0.05em] text-ink-muted"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              data-pair-arrow-line
              className="block h-px w-14 origin-left bg-ink/30 lg:h-14 lg:w-px lg:origin-top"
            />
            <span
              data-pair-arrow-head
              className="font-latin text-sm text-ink lg:rotate-90"
            >
              →
            </span>
          </div>

          <div data-pair-after>
            {pair.after ? (
              <Photo work={work} shot={pair.after} tone="after" />
            ) : (
              <div aria-hidden className="hidden lg:block" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
