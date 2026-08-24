"use client";

import Image from "next/image";
import { STATE_LABEL, workImage, type Shot, type Work } from "@/lib/works";

/**
 * 施工の記録。/works/[slug] の写真セクション本体。
 *
 * 旧実装はスライダー(BeforeAfter)と横スクロールのカルーセル(WorkGallery)を
 * 案件ごとに出し分けていたが、写真の揃い方の違いがそのままページ構成の違いに
 * なってしまい、比較として読みにくかった。ここでは判定を1箇所に集約し、
 * 案件ごとの見た目のブレを無くす。
 *
 *   - 施工前の写真がある店舗案件 → 左に施工前・右に施工後の2カラム
 *     (スライダーのように重ねて隠すのではなく、両方を並べて出す。
 *      比較のためにつまみを操作させる手間を無くし、見た瞬間に伝わるようにする)
 *   - 施工後しかない店舗案件 → 単カラム(「撤廃」で「施工前」の空枠は出さない)
 *   - 施設営繕・解体 → 単カラム、施工前/施工後のラベルも付けない。
 *     解体は「壊す前後」であって「作る前後」ではなく、この語彙で比べる対象ではない。
 *
 * アニメーションはWorkDetail側のuseScopedGsapが data-photo-col / data-photo を
 * 対象に動かす。ここではDOMとdata属性の用意だけを担う。
 */
type Props = { work: Work };

function PhotoStack({
  shots,
  tone,
}: {
  shots: Shot[];
  tone: "before" | "after" | "flat";
}) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {shots.map((shot, i) => (
        <div
          key={shot.file}
          data-photo
          className="media relative aspect-[3/2] w-full overflow-hidden bg-[#161513]"
        >
          <Image
            src={shot.file}
            alt=""
            fill
            sizes="(min-width: 1024px) 46vw, 100vw"
            className={`object-cover ${tone === "before" ? "[filter:grayscale(0.7)_brightness(0.94)]" : ""
              }`}
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}

export default function WorkPhotos({ work }: Props) {
  const isFacility = work.category === "facility";
  const before = work.shots.filter((s) => s.state === "before");
  const after = work.shots.filter((s) => s.state === "after");
  const hasSplit = !isFacility && before.length > 0;

  const withSrc = (shots: Shot[]) => shots.map((s) => ({ ...s, file: workImage(work, s.file) }));

  if (!hasSplit) {
    // 施設営繕・解体、または施工前の写真が無い店舗案件は単カラムで出す。
    // 施工前が無いのに「施工前」の枠だけ空で残る、という状態を作らない。
    const flatShots = isFacility ? work.shots : after;
    return (
      <div data-photo-col="flat" className="bg-paper">
        <PhotoStack shots={withSrc(flatShots)} tone="flat" />
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-0">
      {/* 中央の矢印。施工前→施工後という向きを、文字を読まなくても伝える */}
      <div
        data-photo-arrow
        aria-hidden
        className="absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 lg:flex"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-sm text-ink shadow-[0_4px_16px_rgba(26,22,19,0.12)]">
          →
        </span>
      </div>

      <div data-photo-col="before" className="bg-stone px-6 py-10 sm:px-8 sm:py-12 lg:pr-10">
        <div data-photo-head className="flex items-center gap-3">
          <span className="font-latin text-[10px] tracking-[0.3em] text-ink-muted">
            BEFORE
          </span>
          <span className="h-px flex-1 bg-ink/15" />
          <span className="font-latin text-[10px] tracking-[0.2em] text-ink-muted">
            {String(before.length).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-3 font-display text-lg font-normal text-ink">
          {STATE_LABEL.before}
        </h3>
        <div className="mt-8">
          <PhotoStack shots={withSrc(before)} tone="before" />
        </div>
      </div>

      <div data-photo-col="after" className="bg-paper px-6 py-10 sm:px-8 sm:py-12 lg:pl-10">
        <div data-photo-head className="flex items-center gap-3">
          <span className="font-latin text-[10px] tracking-[0.3em] text-navy-mid">
            AFTER
          </span>
          <span className="h-px flex-1 bg-navy-mid/25" />
          <span className="font-latin text-[10px] tracking-[0.2em] text-navy-mid">
            {String(after.length).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-3 font-display text-lg font-normal text-ink">
          {STATE_LABEL.after}
        </h3>
        <div className="mt-8">
          <PhotoStack shots={withSrc(after)} tone="after" />
        </div>
      </div>
    </div>
  );
}
