import PublishedPage from "@/components/PublishedPage";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Company from "@/components/Company";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/company" },
  title: "会社概要 | STAGE PARTNERS",
  description: "STAGE PARTNERSの会社概要ページです。",
};

export default function CompanyOverviewPage() {
  return (
    <PublishedPage slug="company">
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <Company />
      </main>
      <Footer />
    </PublishedPage>
  );
}
