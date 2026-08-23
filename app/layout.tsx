import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho, Inter } from "next/font/google";
import PageLoader from "@/components/PageLoader";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

// 本文・UI。可読性重視のゴシック。
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// 見出し・コーポレートメッセージ。明朝で格を出す。
const shippori = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// 英字ラベル・連番。
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "STAGE PARTNERS | 株式会社ステージパートナーズ",
  description:
    "土地と建物に、次の価値を。STAGE PARTNERSは不動産の仲介・管理から建物のリフォームまで、地主さま・オーナーさまの資産の可能性を一貫して引き出すパートナーです。",
  // ファビコンは app/favicon.ico・app/icon.png・app/apple-icon.png を
  // Next.jsのファイル規約で自動配信する。ここでiconsを指定すると規約側が
  // 上書きされるため書かない。
  metadataBase: new URL("https://stagepartners.example.com"),
  openGraph: {
    title: "STAGE PARTNERS | 株式会社ステージパートナーズ",
    description:
      "不動産の仲介・管理から建物のリフォームまで。土地と建物の可能性を一貫して引き出す、地主さま・オーナーさまのためのパートナー。",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${shippori.variable} ${inter.variable}`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <SmoothScroll />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-navy focus:px-5 focus:py-3 focus:text-xs focus:tracking-[0.15em] focus:text-on-dark"
        >
          本文へスキップ
        </a>
        <PageLoader />
        {children}
      </body>
    </html>
  );
}
