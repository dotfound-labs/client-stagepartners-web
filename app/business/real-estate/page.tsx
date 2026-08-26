import type { Metadata } from "next";
import Header from "@/components/Header";
import RealEstateSolution from "@/components/RealEstateSolution";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "不動産ソリューション | STAGE PARTNERS",
  description:
    "STAGE PARTNERSの不動産ソリューションについて。売買・賃貸の仲介から賃貸管理、買取・再販まで。建築部門を自社に持つ強みを活かし、貸す・売る・活かすの判断からその先の手入れまでお引き受けします。",
  alternates: { canonical: "/business/real-estate" },
};

export default function RealEstatePage() {
  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 flex-col">
        <RealEstateSolution />
      </main>
      <Footer />
    </>
  );
}
