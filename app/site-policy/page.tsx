import PublishedPage from "@/components/PublishedPage";

import CmsText from "@/components/CmsText";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "サイトポリシー | STAGE PARTNERS",
  description: "株式会社STAGE PARTNERSが運営する本サイトのご利用にあたっての注意事項です。",
  alternates: { canonical: "/site-policy" },
};

export default function SitePolicyPage() {
  return (
    <PublishedPage slug="site-policy">
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <LegalPage
          eyebrow="SITE POLICY"
          title="サイトポリシー"
          lead="本サイト（stagepartners-hp1.vercel.app、以下「本サイト」といいます）は、株式会社STAGE PARTNERS（以下「当社」といいます）が運営しています。本サイトのご利用にあたっては、以下の内容をご確認ください。"
          updated="2026年8月25日"
          sections={[
            {
              heading: "著作権について",
              body: (
                <p><CmsText>{"本サイトに掲載されている文章、画像、写真、ロゴ、その他すべてのコンテンツの著作権は、当社または正当な権利を有する第三者に帰属します。法令で認められる場合を除き、事前の許諾なく複製、転載、改変、二次利用することはできません。"}</CmsText></p>
              ),
            },
            {
              heading: "施工実績の掲載について",
              body: (
                <p><CmsText>{"本サイトに掲載する施工実績の一部は、グループ会社が施工したものを含みます。掲載にあたっては、施工主体を含めた表記の正確性に努めています。"}</CmsText></p>
              ),
            },
            {
              heading: "リンクについて",
              body: (
                <p><CmsText>{"本サイトへのリンクは、原則として自由に設定いただけます。ただし、当社または本サイトの信用を損なう可能性のある形での設定はご遠慮ください。また、本サイトから他社サイトへのリンクは、リンク先の内容について当社が保証するものではありません。"}</CmsText></p>
              ),
            },
            {
              heading: "免責事項",
              body: (
                <>
                  <p><CmsText>{"当社は、本サイトに掲載する情報の正確性・最新性の維持に努めていますが、その内容を保証するものではありません。本サイトの情報を利用したことにより生じたいかなる損害についても、当社は責任を負わないものとします。"}</CmsText></p>
                  <p><CmsText>{"本サイトは、予告なく内容の変更、掲載の中止、公開の停止を行うことがあります。"}</CmsText></p>
                </>
              ),
            },
            {
              heading: "推奨環境",
              body: (
                <p><CmsText>{"本サイトは、最新版のGoogle Chrome、Safari、Microsoft Edge等の主要なブラウザでの閲覧を想定して制作しています。ブラウザの設定や機種によっては、正しく表示されない場合があります。"}</CmsText></p>
              ),
            },
            {
              heading: "アクセス解析について",
              body: (
                <p><CmsText>{"本サイトは、2026年8月時点においてアクセス解析ツールを利用していません。導入する場合は、"}</CmsText><Link href="/privacy"><CmsText>{"プライバシーポリシー"}</CmsText></Link><CmsText>{"にあわせて本ページを改定します。"}</CmsText></p>
              ),
            },
            {
              heading: "準拠法・管轄裁判所",
              body: (
                <p><CmsText>{"本ポリシーの解釈にあたっては、日本法を準拠法とします。本サイトに関して当社とお客様との間で紛争が生じた場合には、当社本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。"}</CmsText></p>
              ),
            },
          ]}
        />
      </main>
      <Footer />
    </PublishedPage>
  );
}
