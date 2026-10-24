
import CmsText, { CommonFields } from "@/components/CmsText";
import Image from "@/components/CmsImage";
import Link from "@/components/CmsLink";

// "#news" のようなアンカーだけのhrefは、トップページ以外にいる時にクリックしても
// 遷移できないため、"/#news" のようにパスを明示する。
const FOOTER_LINKS = [
  { label: "TOP", href: "/" },
  { label: "事業内容", href: "/business" },
  { label: "施工実績", href: "/works" },
  { label: "会社概要", href: "/company" },
  { label: "お知らせ", href: "/news" },
  { label: "お問い合わせ", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "サイトポリシー", href: "/site-policy" },
  { label: "特定商取引法に基づく表記", href: "/tokushoho" },
];

function FooterContent() {
  return (
    <footer className="w-full border-t border-line bg-paper px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <Link href="/" aria-label="STAGE PARTNERS トップへ">
          <Image
            src="/logo-color-footer.png"
            alt="STAGE PARTNERS"
            width={456}
            height={114}
            className="h-8 w-auto"
          />
        </Link>

        <nav aria-label="フッターナビゲーション" className="overflow-x-auto">
          <ul className="flex flex-nowrap gap-x-6 gap-y-3 sm:flex-wrap sm:gap-x-10">
            <CmsText>{FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="whitespace-nowrap text-xs font-normal tracking-[0.1em] text-ink-muted transition-colors hover:text-ink"
                >
                  <CmsText>{link.label}</CmsText>
                </Link>
              </li>
            ))}</CmsText>
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-16 flex max-w-[1520px] flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] font-normal tracking-[0.05em] text-ink-muted"><CmsText>{"© STAGE PARTNERS All Rights Reserved."}</CmsText></p>

        <nav aria-label="法的情報" className="overflow-x-auto">
          <ul className="flex flex-nowrap gap-x-4 gap-y-2 sm:flex-wrap sm:gap-x-8">
            <CmsText>{LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="whitespace-nowrap text-[9.5px] font-normal tracking-[0.05em] text-ink-muted transition-colors hover:text-ink"
                >
                  <CmsText>{link.label}</CmsText>
                </Link>
              </li>
            ))}</CmsText>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default function Footer(){return <CommonFields><FooterContent/></CommonFields>;}
