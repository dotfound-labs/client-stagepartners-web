import { pageMetadata } from "@/lib/cms/metadata";
import PublishedPage from "@/components/PublishedPage";

import CmsText from "@/components/CmsText";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalPage from "@/components/LegalPage";
import { COMPANY_NAME, HEAD_OFFICE } from "@/content/company";

// 個人情報保護法・関連ガイドラインに沿った一般的な条項構成。
// 実際の取扱い(委託先の範囲、保管期間の具体的な数値、開示請求の受付方法の詳細)は
// 運用が固まり次第、法務確認のうえで数値・固有名詞を確定させる。
export async function generateMetadata(): Promise<Metadata> { return pageMetadata("privacy", {
  title: "プライバシーポリシー | STAGE PARTNERS",
  description: "株式会社STAGE PARTNERSの個人情報の取扱いについて。",
  alternates: { canonical: "/privacy" },
}); }

export default function PrivacyPage() {
  return (
    <PublishedPage slug="privacy">
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <LegalPage
          eyebrow="PRIVACY POLICY"
          title="プライバシーポリシー"
          lead="株式会社STAGE PARTNERS（以下「当社」といいます）は、お客様の個人情報を適切に取り扱うことが社会的責務であると認識し、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。"
          updated="2026年8月25日"
          sections={[
            {
              heading: "第1条（個人情報）",
              body: (
                <p><CmsText>{"「個人情報」とは、個人情報保護法にいう「個人情報」を指し、生存する個人に関する情報であって、氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報、および容貌、指紋、声紋にかかるデータ、健康保険証の保険者番号など、個人識別符号が含まれる情報を指します。"}</CmsText></p>
              ),
            },
            {
              heading: "第2条（取得する情報と方法）",
              body: (
                <>
                  <p><CmsText>{"当社は、お問い合わせフォームおよびお電話でのお問い合わせの際に、氏名、会社名（法人のお客様の場合）、電話番号、メールアドレス、ご住所、お問い合わせ内容等の個人情報をお客様よりご提供いただきます。"}</CmsText></p>
                  <p><CmsText>{"不動産の仲介・買取・管理、または建築・リフォームのご依頼にあたっては、契約手続きに必要な範囲で、上記に加えて物件情報等をお伺いする場合があります。"}</CmsText></p>
                </>
              ),
            },
            {
              heading: "第3条（利用目的）",
              body: (
                <p><CmsText>{"当社は、取得した個人情報を、以下の目的の範囲内で利用します。"}</CmsText><ul>
                    <li><CmsText>{"お問い合わせ・ご相談への対応、および必要事項のご連絡のため"}</CmsText></li>
                    <li><CmsText>{"不動産の仲介・管理・買取再販、建築・リフォームに関するサービスの提供、見積り作成、契約手続きのため"}</CmsText></li>
                    <li><CmsText>{"工事・取引に関する重要事項のご連絡、アフターサービスの提供のため"}</CmsText></li>
                    <li><CmsText>{"採用選考に関するご連絡のため（採用応募の場合）"}</CmsText></li>
                    <li><CmsText>{"上記利用目的に付随する目的のため"}</CmsText></li>
                  </ul>
                </p>
              ),
            },
            {
              heading: "第4条（第三者提供）",
              body: (
                <>
                  <p><CmsText>{"当社は、次に掲げる場合を除き、あらかじめお客様の同意を得ることなく、第三者に個人情報を提供しません。"}</CmsText></p>
                  <ul>
                    <li><CmsText>{"法令に基づく場合"}</CmsText></li>
                    <li><CmsText>{"人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき"}</CmsText></li>
                    <li><CmsText>{"取引の性質上、提携する金融機関・登記関係機関・保険会社等へ、契約手続きに必要な範囲で提供する場合"}</CmsText></li>
                  </ul>
                  <p><CmsText>{"なお、当社はグループ会社（"}</CmsText><Link href="/company#company"><CmsText>{"会社概要ページ"}</CmsText></Link><CmsText>{"に掲載）と情報を共有する場合がありますが、その場合も本ポリシーに定める利用目的の範囲内で取り扱います。"}</CmsText></p>
                </>
              ),
            },
            {
              heading: "第5条（個人情報取扱いの委託）",
              body: (
                <p><CmsText>{"当社は、利用目的の達成に必要な範囲内において、個人情報の取扱いの全部または一部を委託する場合があります。この場合、委託先に対する必要かつ適切な監督を行います。"}</CmsText></p>
              ),
            },
            {
              heading: "第6条（Cookie等の利用）",
              body: (
                <p><CmsText>{"本サイトは、2026年8月時点においてアクセス解析ツールおよびCookieを利用した個人情報の取得は行っておりません。今後、サービス向上のためこれらを導入する場合は、本ポリシーを改定のうえ、その利用目的を明示します。"}</CmsText></p>
              ),
            },
            {
              heading: "第7条（安全管理措置）",
              body: (
                <p><CmsText>{"当社は、個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。"}</CmsText></p>
              ),
            },
            {
              heading: "第8条（個人情報の開示・訂正・利用停止等）",
              body: (
                <p><CmsText>{"当社は、お客様ご本人から個人情報の開示、訂正、追加、削除、利用停止を求められた場合には、ご本人であることを確認のうえ、法令に従い遅滞なく対応します。お手続きの詳細は、下記お問い合わせ窓口までご連絡ください。"}</CmsText></p>
              ),
            },
            {
              heading: "第9条（本ポリシーの変更）",
              body: (
                <p><CmsText>{"本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、お客様に通知することなく変更することができるものとします。変更後の内容は、本サイトに掲載した時点から効力を生じるものとします。"}</CmsText></p>
              ),
            },
            {
              heading: "第10条（お問い合わせ窓口）",
              body: (
                <p><CmsText>{"本ポリシーに関するお問い合わせは、下記までご連絡ください。"}</CmsText><br />
                  <CmsText>{COMPANY_NAME}</CmsText>
                  <br />
                  <CmsText>{HEAD_OFFICE.address}</CmsText>
                  <br /><CmsText>{"お問い合わせフォーム："}</CmsText><Link href="/contact"><CmsText>{"お問い合わせページ"}</CmsText></Link>
                </p>
              ),
            },
          ]}
        />
      </main>
      <Footer />
    </PublishedPage>
  );
}
