"use client";

import Image from "next/image";
import { workImage, type Shot, type Work } from "@/lib/works";
import WorkPhotoSequence from "@/components/WorkPhotoSequence";

/**
 * 施工の記録。/works/[slug] の写真セクション本体。
 *
 * 案件ごとに写真の揃い方が違っても、ページの見た目が変わらないよう判定を
 * ここに集約する。
 *
 *   - 施工前の写真がある店舗案件 → WorkPhotoSequence(左に施工前・右に施工後)
 *   - 施工後しかない店舗案件 → 単カラム(「撤廃」で「施工前」の空枠は出さない)
 *   - 施設営繕・解体 → 単カラム、施工前/施工後のラベルも付けない。
 *     解体は「壊す前後」であって「作る前後」ではなく、この語彙で比べる対象ではない。
 */
type Props = { work: Work };

function PhotoStack({ shots }: { shots: Shot[] }) {
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
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}

export function hasPhotoSplit(work: Work) {
  return work.category !== "facility" && work.shots.some((s) => s.state === "before");
}

export default function WorkPhotos({ work }: Props) {
  if (hasPhotoSplit(work)) {
    return <WorkPhotoSequence work={work} />;
  }

  const isFacility = work.category === "facility";
  const flatShots = isFacility ? work.shots : work.shots.filter((s) => s.state === "after");
  const withSrc = flatShots.map((s) => ({ ...s, file: workImage(work, s.file) }));

  return (
    <div data-photo-col="flat" className="bg-paper">
      <PhotoStack shots={withSrc} />
    </div>
  );
}
