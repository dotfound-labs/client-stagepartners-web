"use client";

import Image from "next/image";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";
import { COMPANY_NAME, HEAD_OFFICE, OFFICES } from "@/content/company";

// 会社概要ページ(/company)本体のコンテンツ。
// 代表者名は正式決定まで仮の値。許認可番号は確定後に各行へ追記する。
// 会社名・拠点・電話は content/company.ts を単一の情報源にしている。
type ProfileRow = {
  label: string;
  value?: string | string[];
  links?: { name: string; href: string }[];
};

const PROFILE: ProfileRow[] = [
  { label: "会社名", value: COMPANY_NAME },
  { label: "設立", value: "2026年6月15日" },
  { label: "資本金", value: "800万円" },
  { label: "本社", value: `〒${HEAD_OFFICE.postalCode}　${HEAD_OFFICE.address}` },
  ...OFFICES.map((office) => ({
    label: office.label,
    value: [office.address, `TEL ${office.tel}`],
  })),
  {
    label: "事業内容",
    value: "不動産ソリューション（仲介・管理・買取再販）／ 建築ソリューション（新規出店・リノベーション・営繕）",
  },
  {
    label: "許認可",
    value: ["宅地建物取引業免許", "一般建設業登録", "一級建築士事務所"],
  },
  {
    label: "グループ会社",
    links: [
      { name: "サンプラホールディングス株式会社", href: "https://www.sunpla-hd.co.jp/" },
      { name: "株式会社サン・プランナー", href: "https://www.sunpla.info/" },
      { name: "株式会社ソレイユ", href: "https://www.soleil-fuji.co.jp/" },
      { name: "株式会社サンプラダイニング", href: "https://sunpladining.com/" },
      { name: "株式会社sunpla style", href: "https://sunpla-style.co.jp/" },
      { name: "株式会社ドットファウンド", href: "https://www.dotfound.co.jp/" },
    ],
  },
];

export default function Company() {
  const sectionRef = useScopedGsap<HTMLElement>(() => {
    gsap.from("[data-company-image]", {
      opacity: 0,
      scale: 1.06,
      duration: 1.4,
      ease: "power1.out",
      scrollTrigger: {
        trigger: "[data-company-image]",
        ...scrollTriggerDefaults,
      },
    });

    gsap.from("[data-company-text]", {
      opacity: 0,
      y: 24,
      duration: 1,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "[data-company-text]",
        ...scrollTriggerDefaults,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="company"
      className="w-full bg-paper px-6 py-24 sm:px-10 lg:px-16 lg:py-32 xl:px-24"
    >
      <div className="mx-auto grid w-full max-w-[1520px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div
          data-company-image
          className="media relative aspect-[4/3] overflow-hidden bg-[#161513] lg:aspect-[4/5]"
        >
          <Image
            src="/company-hero.jpg"
            alt="STAGE PARTNERSの拠点と街並み"
            fill
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="object-cover object-center"
          />
        </div>

        <div>
          <p
            data-company-text
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]"
          >
            <span aria-hidden className="inline-block h-px w-10 bg-ink/25" />
            COMPANY
          </p>
          <h2
            data-company-text
            className="t-heading mt-8 font-display font-normal text-ink"
          >
            会社概要
          </h2>

          <dl data-company-text className="mt-10 border-t border-line">
            {PROFILE.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b border-line py-5 sm:flex-row sm:gap-8"
              >
                <dt className="font-latin text-[11px] tracking-[0.15em] text-ink-muted sm:w-36 sm:shrink-0 sm:pt-1">
                  {row.label}
                </dt>
                <dd className="text-sm font-normal leading-relaxed text-ink sm:text-base">
                  {row.links
                    ? row.links.map((link) => (
                      <span key={link.href} className="block">
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:text-navy-mid hover:underline"
                        >
                          {link.name}
                          <span aria-hidden className="text-[0.85em] text-ink-muted">
                            ↗
                          </span>
                          <span className="sr-only">（外部サイト・新しいタブで開きます）</span>
                        </a>
                      </span>
                    ))
                    : Array.isArray(row.value)
                      ? row.value.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))
                      : row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
