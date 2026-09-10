import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorksIndex from "@/components/WorksIndex";
import { WORKS } from "@/content/works";

export const metadata: Metadata = {
  title: "施工実績｜店舗の内装工事・リノベーション・解体 | STAGE PARTNERS",
  description: `飲食店・美容室・クリニック・学習塾などの店舗新装から、住まいのリノベーション、施設の営繕と解体まで。STAGE PARTNERSが手がけた${WORKS.length}件の施工実績を、施工前後の写真とあわせてご紹介します。`,
  alternates: { canonical: "/works" },
  openGraph: {
    title: "施工実績 | STAGE PARTNERS",
    description: "店舗の新装から住まいの改修、施設の営繕と解体まで。施工前後の写真とあわせてご紹介します。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function WorksPage() {
  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <WorksIndex />
      </main>
      <Footer />
    </>
  );
}
