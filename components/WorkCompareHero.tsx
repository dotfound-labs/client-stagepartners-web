"use client";

import Image from "next/image";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { prefersReducedMotion } from "@/lib/animations";
import { workImage, type Work } from "@/content/works";

/**
 * 施工の記録セクション冒頭に置く、施工前→施工後のスクロール連動ワイプ(パイロット)。
 *
 * work.heroCompare が設定された案件だけ、同アングルで撮れた1組をスクロールに
 * 連動して施工前→施工後へ左から右にワイプで見せる。それ以外の案件では
 * 何も描画しない(既存の全案件ページの見た目・挙動は変わらない)。
 *
 * Message(components/Message.tsx)と同じ構成: 外側に高さのあるラッパーを置き、
 * 内側を position:sticky で据え置きながら、ScrollTrigger の scrub でラッパーの
 * 高さ分だけ進捗0→1を割り当てる。GSAPの pin は使わない(Lenisとの競合を避ける
 * ため、このプロジェクトでは sticky に統一している)。
 */
type Props = { work: Work };

export default function WorkCompareHero({ work }: Props) {
  const compare = work.heroCompare;

  const rootRef = useScopedGsap<HTMLDivElement>(({ scope }) => {
    if (!compare) return;
    const q = gsap.utils.selector(scope);

    if (prefersReducedMotion()) {
      // 動きの低減設定では固定の中間状態(左右半々)で比較だけ静的に見せる。
      gsap.set(q("[data-compare-after]"), { clipPath: "inset(0% 50% 0% 0%)" });
      gsap.set(q("[data-compare-edge]"), { left: "50%" });
      return;
    }

    gsap.set(q("[data-compare-after]"), { clipPath: "inset(0% 100% 0% 0%)" });
    gsap.set(q("[data-compare-edge]"), { left: "0%" });

    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: scope.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      },
    })
      .to(q("[data-compare-after]"), { clipPath: "inset(0% 0% 0% 0%)" }, 0)
      .to(q("[data-compare-edge]"), { left: "100%" }, 0);
  }, [work.slug, compare?.before, compare?.after]);

  if (!compare) return null;

  return (
    <section className="w-full bg-paper px-6 pt-20 sm:px-10 lg:px-16 lg:pt-24 xl:px-24">
      <div
        ref={rootRef}
        data-compare
        className="relative mx-auto h-[200vh] w-full max-w-[1520px] motion-reduce:h-auto"
      >
        <div data-compare-stage className="sticky top-28 motion-reduce:static">
          <figure
            aria-hidden="true"
            className="media-static relative aspect-[3/2] w-full overflow-hidden bg-[#161513]"
          >
            {/* 施工前(下敷き、常時フル表示) */}
            <div className="absolute inset-0">
              <Image
                src={workImage(work, compare.before)}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>

            {/* 施工後(clip-pathでスクロールに合わせて左から現れる) */}
            <div data-compare-after className="absolute inset-0">
              <Image
                src={workImage(work, compare.after)}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>

            {/* ワイプの境界線。WorkPhotoSequenceの中央区切り線と同じ意匠。 */}
            <div
              data-compare-edge
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-px bg-on-dark/70"
            />

            <span className="absolute left-5 top-5 font-latin text-[10px] tracking-[0.25em] text-on-dark/85">
              BEFORE
            </span>
            <span className="absolute right-5 top-5 font-latin text-[10px] tracking-[0.25em] text-on-dark/85">
              AFTER
            </span>
          </figure>
        </div>
      </div>
    </section>
  );
}
