import type { Metadata } from "next";
import Header from "@/components/Header";
import ComingSoon from "@/components/ComingSoon";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "事業内容 | STAGE PARTNERS",
  description:
    "不動産ソリューションと建築ソリューション。2つの事業を一社でつなぐSTAGE PARTNERSの事業内容をご紹介します。",
};

export default function BusinessPage() {
  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <ComingSoon
          eyebrow="OUR SOLUTIONS"
          title="事業内容"
          description="不動産ソリューションと建築ソリューション、2つの事業をご紹介するページです。各事業の詳細は下記からもご覧いただけます。"
        />
      </main>
      <Footer />
    </>
  );
}
