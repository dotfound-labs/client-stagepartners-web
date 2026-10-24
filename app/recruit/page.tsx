import PublishedPage from "@/components/PublishedPage";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ComingSoon from "@/components/ComingSoon";
import Footer from "@/components/Footer";

// TODO: 2026-07-27デザインレビューで確定したサイトIA(トップ／事業内容／施工実績／
// 会社概要／ニュース／お問い合わせ／プライバシーポリシー／404／管理者画面)には
// 採用ページは含まれていない。ナビゲーション(Header/Footer)からは既に外しているが、
// 既存コンテンツを無断で削除せずこのページ自体は残してある。`/recruit`を
// 正式導線として残すかどうかはCEO/クライアント判断待ち。

export const metadata: Metadata = {
  alternates: { canonical: "/recruit" },
  title: "採用情報 | STAGE PARTNERS",
  description:
    "STAGE PARTNERSの採用情報ページです。募集要項は近日公開予定です。",
};

export default function RecruitPage() {
  return (
    <PublishedPage slug="common">
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <ComingSoon
          eyebrow="RECRUIT"
          title="採用情報"
          description="STAGE PARTNERSで共に挑戦する仲間の募集要項を、近日公開予定です。"
        />
      </main>
      <Footer />
    </PublishedPage>
  );
}
