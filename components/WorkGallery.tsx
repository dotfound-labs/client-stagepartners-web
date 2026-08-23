"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, FreeMode, Keyboard, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

type Props = {
  images: string[];
  label: string;
  alt: string;
  tone?: "light" | "dark";
};

/**
 * 施工写真の横並びギャラリー。
 *
 * 縦に積むと1案件で画面数が伸びて読み飛ばされるため、横に流して
 * 高さを一定に抑えている。慣性とタッチの効きは自前で書くと粗くなるのでSwiperに任せる。
 */
export default function WorkGallery({ images, label, alt, tone = "light" }: Props) {
  if (images.length === 0) return null;
  const dark = tone === "dark";

  return (
    <div>
      <p
        className={`flex items-center gap-4 font-latin text-[10px] tracking-[0.3em] sm:text-[11px] ${dark ? "text-on-dark/50" : "text-ink-muted"
          }`}
      >
        <span
          aria-hidden
          className={`inline-block h-px w-10 ${dark ? "bg-on-dark/25" : "bg-ink/25"}`}
        />
        {label}
      </p>

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
        className="mt-7 !overflow-visible"
        a11y={{ containerMessage: `${alt}の${label}の写真` }}
      >
        {images.map((src, i) => (
          <SwiperSlide key={src}>
            <div className="media relative aspect-[3/2] w-full overflow-hidden bg-[#161513]">
              <Image
                src={src}
                alt={`${alt} ${label} ${i + 1}枚目`}
                fill
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 88vw"
                className="object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
