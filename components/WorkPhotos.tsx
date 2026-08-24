"use client";

import Image from "next/image";
import { STATE_LABEL, workImage, type Shot, type Work } from "@/lib/works";

/**
 * 施工の記録。/works/[slug] の写真セクション本体。
 *
 * 案件ごとに写真の揃い方が違っても、ページの見た目が変わらないよう判定を
 * ここに集約する。
 *
 *   - 施工前の写真がある店舗案件 → 左に施工前・右に施工後の2カラム
 *   - 施工後しかない店舗案件 → 単カラム(「撤廃」で「施工前」の空枠は出さない)
 *   - 施設営繕・解体 → 単カラム、施工前/施工後のラベルも付けない。
 *     解体は「壊す前後」であって「作る前後」ではなく、この語彙で比べる対象ではない。
 *
 * 2カラムの背景は、以前は左右で塗り分けていたが、片方が地の色(paper)と
 * 同化して「半分だけ色が付いた」ように見え、区切りが事故に見えていた。
 * 面で塗り分けるのをやめ、両カラムとも地の色のまま、見出し下の細い帯線と
 * ラベルの色だけで施工前/施工後を書き分ける。中央の縦線と矢印が、
 * 唯一の視覚的な区切りになる。
 *
 * アニメーションはWorkDetail側のuseScopedGsapが data-photo-col / data-photo を
 * 対象に動かす。ここではDOMとdata属性の用意だけを担う。
 */
type Props = { work: Work };

function PhotoStack({ shots, tone }: { shots: Shot[]; tone: "before" | "after" | "flat" }) {
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
    const flatShots = isFacility ? work.shots : after;
    return (
      <div data-photo-col="flat" className="bg-paper">
        <PhotoStack shots={withSrc(flatShots)} tone="flat" />
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-1 gap-12 bg-paper lg:grid-cols-2 lg:gap-x-14">
      {/* 中央の縦線と矢印。面の塗り分けをやめた分、区切りはここだけが担う */}
      <div
        data-photo-divider
        aria-hidden
        className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line lg:block"
      />
      <div
        data-photo-arrow
        aria-hidden
        className="absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 lg:flex"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-sm text-ink shadow-[0_4px_16px_rgba(26,22,19,0.12)]">
          →
        </span>
      </div>

      <div data-photo-col="before">
        <div data-photo-head className="flex items-center gap-3">
          <span className="font-latin text-[10px] tracking-[0.3em] text-ink-muted">BEFORE</span>
          <span className="h-px flex-1 bg-ink/20" />
          <span className="font-latin text-[10px] tracking-[0.2em] text-ink-muted">
            {String(before.length).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-3 font-display text-lg font-normal text-ink">{STATE_LABEL.before}</h3>
        <div className="mt-8">
          <PhotoStack shots={withSrc(before)} tone="before" />
        </div>
      </div>

      <div data-photo-col="after">
        <div data-photo-head className="flex items-center gap-3">
          <span className="font-latin text-[10px] tracking-[0.3em] text-navy-mid">AFTER</span>
          <span className="h-px flex-1 bg-navy-mid/30" />
          <span className="font-latin text-[10px] tracking-[0.2em] text-navy-mid">
            {String(after.length).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-3 font-display text-lg font-normal text-ink">{STATE_LABEL.after}</h3>
        {/* data-photo-reveal: スクロール連動でclip-pathを開き、施工前から施工後が
            現れるように見せる。overflow-hiddenで開く前の中身を隠す。 */}
        <div data-photo-reveal className="mt-8 overflow-hidden">
          <PhotoStack shots={withSrc(after)} tone="after" />
        </div>
      </div>
    </div>
  );
}
