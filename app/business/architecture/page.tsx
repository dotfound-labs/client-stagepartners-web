import PublishedPage from "@/components/PublishedPage";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ArchitectureSolution from "@/components/ArchitectureSolution";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "建築ソリューション｜店舗の内装工事・リノベーション・施設営繕 | STAGE PARTNERS",
  description:
    "飲食店・美容室・クリニックなどの店舗デザイン施工から、住まいのリノベーション、建物の点検・補修・メンテナンスまで。静岡県沼津市のSTAGE PARTNERSが、設計から引き渡し後の維持管理まで一社で担います。空き店舗の改修とテナント募集もご相談ください。",
  alternates: { canonical: "/business/architecture" },
  openGraph: {
    title: "建築ソリューション | STAGE PARTNERS",
    description:
      "店舗の内装工事からリノベーション、施設営繕まで。設計から引き渡し後の維持管理まで一社で担います。",
    type: "article",
    locale: "ja_JP",
  },
};

export default function ArchitecturePage() {
  return (
    <PublishedPage slug="architecture">
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <ArchitectureSolution />
      </main>
      <Footer />
    </PublishedPage>
  );
}
