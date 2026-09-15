import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalPage from "@/components/LegalPage";
import { BUSINESS_HOURS, COMPANY_NAME, HEAD_OFFICE, OFFICES } from "@/content/company";

// 本サイトはお問い合わせ・ご相談の受付が中心で、サイト上での商品の通信販売・
// オンライン決済は行っていない。そのため特定商取引法が定める表示事項のうち、
// 通信販売取引を前提とする項目(返品条件・決済手段等)は「該当なし」としている。
// 運営統括責任者名は、会社概要ページと同じ方針(2026-08-24 代表者情報削除)に
// 揃えて個人名を記載していない。オンライン販売機能を追加する場合は、
// その時点で本ページの全項目を法務確認のうえ書き直す。
export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | STAGE PARTNERS",
  description: "株式会社STAGE PARTNERSの特定商取引法に基づく表記です。",
  alternates: { canonical: "/tokushoho" },
};

const ROW = "flex flex-col gap-1 border-b border-line py-5 sm:flex-row sm:gap-8";
const LABEL = "font-latin text-[11px] tracking-[0.15em] text-ink-muted sm:w-40 sm:shrink-0 sm:pt-1";
const VALUE = "text-sm leading-relaxed text-ink sm:text-base";

export default function TokushohoPage() {
  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <LegalPage
          eyebrow="LEGAL NOTICE"
          title="特定商取引法に基づく表記"
          lead="本サイトは、不動産の仲介・管理・買取再販、建築・リフォームに関するご相談・お問い合わせの受付を目的としており、サイト上での商品の通信販売やオンライン決済は行っておりません。特定商取引法（第11条）に基づき、以下のとおり表示します。"
          updated="2026年8月25日"
          sections={[
            {
              heading: "事業者・所在地・連絡先",
              body: (
                <dl className="border-t border-line">
                  <div className={ROW}>
                    <dt className={LABEL}>販売業者</dt>
                    <dd className={VALUE}>{COMPANY_NAME}</dd>
                  </div>
                  <div className={ROW}>
                    <dt className={LABEL}>運営統括責任者</dt>
                    <dd className={VALUE}>
                      代表取締役
                      <br />
                      <span className="text-xs text-ink-muted">
                        ※個人名の表記は、
                        <Link href="/company">会社概要ページ</Link>
                        と同じ方針により省略しています。お問い合わせいただいた際に担当者よりご案内します。
                      </span>
                    </dd>
                  </div>
                  <div className={ROW}>
                    <dt className={LABEL}>所在地</dt>
                    <dd className={VALUE}>
                      〒{HEAD_OFFICE.postalCode}　{HEAD_OFFICE.address}
                      <span className="block text-xs text-ink-muted">
                        （{OFFICES.map((o) => `${o.label}：${o.address}`).join("／")}）
                      </span>
                    </dd>
                  </div>
                  <div className={ROW}>
                    <dt className={LABEL}>電話番号</dt>
                    <dd className={VALUE}>
                      {OFFICES.map((o) => `${o.label} ${o.tel}`).join("／")}
                      <span className="block text-xs text-ink-muted">
                        受付時間　{BUSINESS_HOURS}
                      </span>
                    </dd>
                  </div>
                  <div className={ROW}>
                    <dt className={LABEL}>お問い合わせ</dt>
                    <dd className={VALUE}>
                      <Link href="/contact">お問い合わせフォーム</Link>
                      よりご連絡ください。
                    </dd>
                  </div>
                </dl>
              ),
            },
            {
              heading: "事業内容",
              body: (
                <p>
                  不動産ソリューション（仲介・管理・買取再販）、建築ソリューション（新規出店・リノベーション・営繕）。詳細は
                  <Link href="/business">事業内容ページ</Link>
                  をご覧ください。
                </p>
              ),
            },
            {
              heading: "料金・お見積りについて",
              body: (
                <p>
                  仲介手数料、工事費用等は、物件の状況・工事内容により個別に異なります。正式なご依頼の前に、必ず個別のお見積りをご提示し、ご了承をいただいたうえで契約手続きに進みます。サイト上での価格提示や、その場でのオンライン決済は行っておりません。
                </p>
              ),
            },
            {
              heading: "契約の成立・引渡時期",
              body: (
                <p>
                  不動産の仲介・売買、および工事の請負契約は、それぞれの取引に定める重要事項説明・契約書の締結をもって成立します。引渡し・着工・完工の時期は、個別の契約書に定めるとおりとします。
                </p>
              ),
            },
            {
              heading: "お支払い方法・キャンセルについて",
              body: (
                <p>
                  お支払い方法・お支払い時期は、契約締結時に個別にご案内します。契約後のキャンセル・変更については、宅地建物取引業法・建設業法等の関係法令、および個別の契約書に定める条件に従います。
                </p>
              ),
            },
            {
              heading: "許認可",
              body: (
                <p>
                  宅地建物取引業免許、一般建設業登録、一級建築士事務所登録。登録番号を含む詳細は
                  <Link href="/company">会社概要ページ</Link>
                  に掲載しています。
                </p>
              ),
            },
          ]}
        />
      </main>
      <Footer />
    </>
  );
}
