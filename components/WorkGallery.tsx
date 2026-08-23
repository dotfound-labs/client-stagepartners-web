"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode, Keyboard, Mousewheel } from "swiper/modules";
import { STATE_LABEL, type Shot } from "@/lib/works";
import "swiper/css";
import "swiper/css/free-mode";

type Props = {
  shots: (Shot & { src: string })[];
  alt: string;
};

/**
 * 施工の記録。1案件につきこの1本だけを出す。
 *
 * 施工前と施工後で列を分けると、写真の揃い方が案件ごとに違うせいで
 * ページの構成そのものが1件ずつ変わってしまう。1本に統一したうえで、
 *   - 同じ場所の前後を隣り合わせに並べる(データ側で並べ替え済み)
 *   - 施工前は彩度を落とす
 *   - 各写真に「施工前」「施工後」を出す
 * の3つで、どれが前でどれが後かを写真の上だけで分かるようにしている。
 * 彩度を落とす扱いは比較スライダーと同じなので、見え方の語彙も揃う。
 */
export default function WorkGallery({ shots, alt }: Props) {
  if (shots.length === 0) return null;

  return (
    <Swiper
      modules={[FreeMode, Mousewheel, Keyboard, A11y]}
      freeMode={{ enabled: true, momentum: true, momentumRatio: 0.6 }}
      slidesPerView={1.15}
      spaceBetween={16}
      keyboard={{ enabled: true }}
      mousewheel={{ forceToAxis: true }}
      breakpoints={{
        640: { slidesPerView: 2.1, spaceBetween: 20 },
        1024: { slidesPerView: 3.1, spaceBetween: 24 },
      }}
      className="!overflow-visible"
      a11y={{ containerMessage: `${alt}の施工写真` }}
    >
      {shots.map((shot, i) => (
        <SwiperSlide key={shot.file}>
          <figure>
            <div className="media relative aspect-[3/2] w-full overflow-hidden bg-[#161513]">
              <Image
                src={shot.src}
                alt={`${alt} ${STATE_LABEL[shot.state]} ${i + 1}枚目`}
                fill
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 88vw"
                className={`object-cover ${shot.state === "before" ? "[filter:grayscale(0.85)_brightness(0.92)]" : ""
                  }`}
              />
              <span
                className={`absolute left-4 top-4 px-3 py-1.5 text-[11px] tracking-[0.18em] backdrop-blur-sm ${shot.state === "before"
                  ? "bg-navy/70 text-on-dark/90"
                  : "bg-on-dark/85 text-navy"
                  }`}
              >
                {STATE_LABEL[shot.state]}
              </span>
            </div>
          </figure>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
