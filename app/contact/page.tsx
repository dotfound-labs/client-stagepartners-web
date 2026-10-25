import { publicPageMetadata } from "@/lib/cms/site-metadata";
import PublishedPage from "@/components/PublishedPage";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> { return publicPageMetadata({
  alternates: { canonical: "/contact" },
  title: "お問い合わせ | STAGE PARTNERS",
  description:
    "不動産の売却・買取、賃貸・空室、リフォーム・改修、建物・入居者の管理まで。STAGE PARTNERSへのご相談はこちらから。ご相談は無料です。",
}); }

export default function ContactPage() {
  return (
    <PublishedPage slug="common">
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <Contact />
      </main>
      <Footer />
    </PublishedPage>
  );
}
