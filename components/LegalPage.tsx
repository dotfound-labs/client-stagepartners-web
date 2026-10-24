
import CmsText from "@/components/CmsText";
import type { ReactNode } from "react";

/**
 * プライバシーポリシー・サイトポリシー・特定商取引法に基づく表記で共通する型。
 * 3ページとも「見出し + 本文」の並びしか持たないため、共通化して差分を content だけにする。
 */
export type LegalSection = { heading: string; body: ReactNode };

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  updated: string;
  sections: LegalSection[];
};

export default function LegalPage({ eyebrow, title, lead, updated, sections }: Props) {
  return (
    <section className="w-full bg-paper px-6 py-28 sm:px-10 lg:px-16 lg:py-32 xl:px-24">
      <div className="mx-auto max-w-3xl">
        <p className="flex items-center gap-4 font-latin text-[10px] tracking-[0.35em] text-ink-muted sm:text-[11px]">
          <span aria-hidden className="inline-block h-px w-10 bg-ink/25" />
          <CmsText>{eyebrow}</CmsText>
        </p>
        <h1 className="t-heading mt-7 font-display font-normal text-ink"><CmsText>{title}</CmsText></h1>
        <CmsText>{lead && <p className="t-note mt-6 text-ink-muted"><CmsText>{lead}</CmsText></p>}</CmsText>
        <p className="mt-6 text-xs tracking-[0.05em] text-ink-muted"><CmsText>{"最終更新日："}</CmsText><CmsText>{updated}</CmsText></p>

        <div className="mt-16 space-y-14 border-t border-line pt-14">
          <CmsText>{sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-display text-lg font-normal text-ink sm:text-xl">
                <CmsText>{section.heading}</CmsText>
              </h2>
              <div className="t-note mt-5 space-y-4 leading-loose text-ink-muted [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-ink [&_li]:leading-loose [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                <CmsText>{section.body}</CmsText>
              </div>
            </div>
          ))}</CmsText>
        </div>
      </div>
    </section>
  );
}
