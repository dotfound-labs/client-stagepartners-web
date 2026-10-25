"use client";

import { useEffect, useId, useRef, useState } from "react";
import {submitContact,type ContactFields} from "@/lib/contact-submit";
import CmsText, {useCmsText} from "@/components/CmsText";
import Image from "next/image";
import { useScopedGsap, gsap } from "@/hooks/useGsap";
import { scrollTriggerDefaults } from "@/lib/animations";
import { INQUIRY_TYPES, OFFICES } from "@/content/company";

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const cmsText=useCmsText();
  const [enabled,setEnabled]=useState(false);
  const [saved,setSaved]=useState(false);
  const inFlight=useRef(false);
  const submission=useRef<{id:string;payload:string}|null>(null);
  useEffect(()=>{fetch("/api/contact").then(r=>r.json()).then(data=>setEnabled(data.enabled===true)).catch(()=>setEnabled(false));},[]);
  const [status, setStatus] = useState<Status>("idle");
  const completionDialog = useRef<HTMLDialogElement>(null);
  const completionStatus = useRef<HTMLParagraphElement>(null);
  const completionTitleId = useId();
  const completionDescriptionId = useId();
  useEffect(() => {
    if (status === "success" && !completionDialog.current?.open) {
      completionDialog.current?.showModal();
    }
  }, [status]);

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
    if (!enabled || inFlight.current || (status === "error" && saved)) return;
    inFlight.current=true;setSaved(false);
    setStatus("sending");

    // Reactはハンドラが返った直後にcurrentTargetをnullへ戻すため、awaitを挟むと
    // 送信後には参照できない。同期のうちにform要素を掴んでおく。
    const form = e.currentTarget;
    const formData = new FormData(form);
    const fields=Object.fromEntries(["name","company","email","phone","inquiry_type","message","website"].map(key=>[key,String(formData.get(key)??"")])) as ContactFields;
    const payload=JSON.stringify(fields);
    if(submission.current?.payload!==payload)submission.current={id:crypto.randomUUID(),payload};
    try {
      const result=await submitContact(fields,submission.current.id);
      setSaved(result.saved);
      if(result.accepted){setStatus("success");form.reset();submission.current=null;}
      else setStatus("error");
    } catch { setStatus("error"); }
    finally {inFlight.current=false;}
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
          <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden"/>
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

            <label className="block">
              <span className="text-xs font-medium tracking-[0.1em] text-ink-muted">会社名（任意）</span>
              <input type="text" name="company" autoComplete="organization" maxLength={200} className="mt-2 w-full border-b border-line bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-foreground" />
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

            {!enabled && <p role="status" className="text-sm text-ink">フォームは現在準備中です。上記のお電話にてお問い合わせください。</p>}
            <button
              type="submit"
              disabled={!enabled || status === "sending" || (saved && status === "error")}
              className="mt-2 inline-flex items-center justify-center gap-3 bg-navy-mid px-11 py-4 text-xs font-medium tracking-[0.2em] text-on-dark transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {status === "sending" ? "送信中..." : "この内容で送信する"}
              {status !== "sending" && <span aria-hidden>→</span>}
            </button>

            {status === "success" && (
              <p ref={completionStatus} tabIndex={-1} role="status" className="text-xs leading-relaxed text-ink">
                お問い合わせありがとうございます。
                送信サービスがフォームを受け付けました。メールの到着を保証する表示ではありません。担当者からの連絡をお待ちください。
              </p>
            )}
            {status === "error" && (
              <p role="alert" className="text-xs leading-relaxed text-ink-muted">
                {saved ? "内容は受付済みですが、通知サービスの受付を確認できませんでした。二重送信を避けるため、お電話で受付状況をご確認ください。" : "送信結果を確認できませんでした。お手数ですが、お電話にてお問い合わせください。"}
              </p>
            )}
          </div>
        </form>
      </div>
      <dialog
        ref={completionDialog}
        aria-labelledby={completionTitleId}
        aria-describedby={completionDescriptionId}
        onClose={() => completionStatus.current?.focus()}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto border border-line bg-paper p-6 text-ink shadow-xl backdrop:bg-black/60 sm:p-10"
      >
        <h2 id={completionTitleId} className="text-xl font-medium leading-relaxed">お問い合わせありがとうございます</h2>
        <p id={completionDescriptionId} className="mt-4 text-sm leading-relaxed">送信サービスがフォームを受け付けました。担当者からの連絡をお待ちください。</p>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">メールの到着や自動返信を保証する表示ではありません。</p>
        <button type="button" onClick={() => completionDialog.current?.close()} className="mt-6 w-full bg-navy-mid px-6 py-3 text-sm text-on-dark focus-visible:outline-2 focus-visible:outline-offset-4">閉じる</button>
      </dialog>
    </section>
  );
}
