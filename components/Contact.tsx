"use client";

import { useState } from "react";
import CmsText, {useCmsText} from "@/components/CmsText";
import Image from "next/image";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";
import { INQUIRY_TYPES, OFFICES } from "@/content/company";

// お問い合わせフォーム。送信は Web3Forms を利用する。
// ドメイン確定後、Web3Forms で発行される正式な access_key に差し替える。
// それまでは仮のキーのため、実際の送信はエラーになる(UIは完成状態)。
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const cmsText=useCmsText();
  const [status, setStatus] = useState<Status>("idle");

  const sectionRef = useScopedGsap<HTMLElement>(({ scope }) => {
    gsap.from("[data-contact-fade]", {
      opacity: 0,
      y: 22,
      duration: 1,
      ease: "power2.out",
      stagger: 0.12,
      scrollTrigger: { trigger: scope.current, ...scrollTriggerDefaults },
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!WEB3FORMS_ACCESS_KEY || status === "sending") return;
    setStatus("sending");

    // Reactはハンドラが返った直後にcurrentTargetをnullへ戻すため、awaitを挟むと
    // 送信後には参照できない。同期のうちにform要素を掴んでおく。
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", WEB3FORMS_ACCESS_KEY);
    formData.append("subject", "STAGE PARTNERS｜サイトからのお問い合わせ");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="on-dark relative w-full overflow-hidden bg-navy px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      {/* カラー写真にネイビーのオーバーレイを重ね、可読性を確保する。 */}
      <div className="media-static absolute inset-0 opacity-40">
        <Image
          src="/heroimage1.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-navy/82 via-navy/68 to-navy/88"
      />

      <div className="relative z-10 mx-auto grid max-w-[1520px] grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
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
            売却・賃貸・リフォーム・管理まで、
            <br />
            どんな段階のご相談でも構いません。
            <br />
            ご相談は無料です。お気軽にお問い合わせください。
          </p>
          <div
            data-contact-fade
            className="mt-10 space-y-2 text-sm text-on-dark/70"
          >
            <p className="font-latin text-[11px] tracking-[0.2em] text-on-dark/50">TEL</p>
            {OFFICES.map((office) => (
              <p key={office.key} className="flex items-baseline gap-3">
                <span className="text-xs text-on-dark/50"><CmsText>{office.label}</CmsText></span>
                <span className="font-latin text-lg tracking-[0.05em] text-on-dark">
                  <CmsText>{office.tel}</CmsText>
                </span>
              </p>
            ))}
          </div>
        </div>

        <form
          data-contact-fade
          onSubmit={handleSubmit}
          className="bg-paper p-7 sm:p-10"
        >
          <div className="grid grid-cols-1 gap-6">
            <label className="block">
              <span className="text-xs font-medium tracking-[0.1em] text-ink-muted">
                お名前 <span className="text-ink">*</span>
              </span>
              <input
                type="text"
                name="name"
                required
                className="mt-2 w-full border-b border-line bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-foreground"
              />
            </label>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium tracking-[0.1em] text-ink-muted">
                  メールアドレス <span className="text-ink">*</span>
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-2 w-full border-b border-line bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-foreground"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium tracking-[0.1em] text-ink-muted">
                  電話番号
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="mt-2 w-full border-b border-line bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-foreground"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium tracking-[0.1em] text-ink-muted">
                ご相談の種別
              </span>
              <select
                name="inquiry_type"
                defaultValue={cmsText(INQUIRY_TYPES[0])}
                className="mt-2 w-full border-b border-line bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-foreground"
              >
                {INQUIRY_TYPES.map((type) => (
                  <option key={type} value={cmsText(type)}>
                    {cmsText(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium tracking-[0.1em] text-ink-muted">
                お問い合わせ内容 <span className="text-ink">*</span>
              </span>
              <textarea
                name="message"
                required
                rows={4}
                className="mt-2 w-full resize-none border-b border-line bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-foreground"
              />
            </label>

            {!WEB3FORMS_ACCESS_KEY && <p role="status" className="text-sm text-ink">フォームは現在準備中です。上記のお電話にてお問い合わせください。</p>}
            <button
              type="submit"
              disabled={!WEB3FORMS_ACCESS_KEY || status === "sending"}
              className="mt-2 inline-flex items-center justify-center gap-3 bg-navy-mid px-11 py-4 text-xs font-medium tracking-[0.2em] text-on-dark transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {status === "sending" ? "送信中..." : "この内容で送信する"}
              {status !== "sending" && <span aria-hidden>→</span>}
            </button>

            {status === "success" && (
              <p className="text-xs leading-relaxed text-ink">
                お問い合わせありがとうございます。担当者より折り返しご連絡いたします。
              </p>
            )}
            {status === "error" && (
              <p className="text-xs leading-relaxed text-ink-muted">
                送信に失敗しました。お手数ですが、お電話にてお問い合わせください。
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
