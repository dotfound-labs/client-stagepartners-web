"use client";

import Image from "next/image";
import Link from "next/link";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";
import { OFFICES } from "@/content/company";

// トップページのお問い合わせ導線。フォーム本体は /contact に置き、
// トップは相談を促す面に徹する。

export default function ContactCta() {
  const sectionRef = useScopedGsap<HTMLElement>(({ scope }) => {
    gsap.from("[data-contact-fade]", {
      opacity: 0,
      y: 22,
      duration: 1,
      ease: "power2.out",
      stagger: 0.12,
      scrollTrigger: { trigger: scope.current, ...scrollTriggerDefaults },
    });

    gsap.to("[data-contact-image]", {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: scope.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="on-dark relative w-full overflow-hidden bg-navy px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="absolute inset-0">
        <div data-contact-image className="absolute inset-x-0 -top-[10%] -bottom-[10%]">
          <Image
            src="/heroimage1.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-navy/82 via-navy/68 to-navy/88"
      />

      <div className="relative z-10 mx-auto grid max-w-[1520px] grid-cols-1 gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
        <div className="text-on-dark">
          <p
            data-contact-fade
            className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-on-dark/60 sm:text-[11px]"
          >
            <span aria-hidden className="inline-block h-px w-10 bg-on-dark/30" />
            CONTACT
          </p>
          <h2
            data-contact-fade
            className="t-heading mt-8 font-display font-normal"
          >
            土地と建物のこと、
            <br />
            まずは聞かせてください。
          </h2>
          <p
            data-contact-fade
            className="t-note mt-7 max-w-md text-on-dark/70"
          >
            売却・賃貸・リフォーム・管理まで、どんな段階のご相談でも構いません。ご相談は無料です。
          </p>
        </div>

        <div data-contact-fade className="flex flex-col items-start gap-8 lg:items-end">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-4 bg-on-dark px-10 py-5 text-xs font-medium tracking-[0.2em] text-navy transition-colors duration-300 hover:bg-navy-mid hover:text-on-dark"
          >
            お問い合わせフォームへ
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>

          <div className="space-y-2 text-on-dark/70 lg:text-right">
            <p className="font-latin text-[11px] tracking-[0.2em] text-on-dark/50">TEL</p>
            {OFFICES.map((office) => (
              <p key={office.key} className="flex items-baseline gap-3 lg:justify-end">
                <span className="text-xs text-on-dark/50">{office.label}</span>
                <span className="font-latin text-lg tracking-[0.05em] text-on-dark">
                  {office.tel}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
