import PublishedPage from "@/components/PublishedPage";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Business from "@/components/Business";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/business" },
  title: "事業内容 | STAGE PARTNERS",
  description:
    "不動産ソリューションと建築ソリューション。2つの事業を一社でつなぐSTAGE PARTNERSの事業内容をご紹介します。",
};

export default function BusinessPage() {
  return (
    <PublishedPage slug="home">
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <div className="pt-20"><h1 className="sr-only">事業内容</h1><Business /></div>
      </main>
      <Footer />
    </PublishedPage>
  );
}
