import {siteMetadata} from "@/lib/cms/site-metadata";
import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho, Inter } from "next/font/google";
import SiteEffects from "@/components/SiteEffects";

import "./globals.css";

// 本文・UI。可読性重視のゴシック。
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  preload: false,
  weight: ["400", "500", "700"],
  display: "swap",
});

// 見出し・コーポレートメッセージ。明朝で格を出す。
const shippori = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  preload: false,
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// 英字ラベル・連番。
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
  weight: ["400", "500"],
  display: "swap",
});

export async function generateMetadata():Promise<Metadata>{return siteMetadata();}

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
        <SiteEffects />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-navy focus:px-5 focus:py-3 focus:text-xs focus:tracking-[0.15em] focus:text-on-dark"
        >
          本文へスキップ
        </a>
        {children}
      </body>
    </html>
  );
}
