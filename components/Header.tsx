"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScopedGsap, gsap } from "@/hooks/useGsap";

// "#news" のようなアンカーだけのhrefは、トップページ以外(会社概要・採用情報など)に
// いる時にクリックしても遷移できないため、"/#news" のようにパスを明示する。
type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
  // ドロップダウン展開せず、強調ボタンとして表示する項目(現状は「お問い合わせ」のみ)。
  cta?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "TOP", href: "/" },
  {
    label: "事業内容",
    href: "/business",
    children: [
      { label: "不動産ソリューション（仲介・管理）", href: "/business/real-estate" },
      { label: "建築ソリューション（リフォーム）", href: "/business/architecture" },
    ],
  },
  { label: "施工実績", href: "/works" },
  { label: "会社概要", href: "/company" },
  { label: "お知らせ", href: "/news" },
  { label: "お問い合わせ", href: "/contact", cta: true },
];

type HeaderProps = {
  // ヒーローに濃い背景画像がある(トップページの)場合だけ、最上部を透明にして
  // スクロールで濃いネイビーへふわっと変化させる。それ以外のページは最初から
  // 濃い背景で固定し、白抜き文字のヘッダーが見えなくなるのを防ぐ。
  transparent?: boolean;
};

export default function Header({ transparent = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobile, setOpenMobile] = useState<string | null>(null);
  const pathname = usePathname();

  // ロゴ・TOPは href="/" のため、すでにトップページにいる場合は Next.js が
  // 何も遷移せず画面も動かない。その時だけ手動で最上部へスクロールさせる。
  const scrollTopIfHome = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const headerRef = useScopedGsap<HTMLElement>(({ scope }) => {
    if (!transparent) {
      gsap.set(scope.current, {
        backgroundColor: "rgba(14,35,56,0.96)",
        borderBottomColor: "rgba(243,244,245,0.08)",
        backdropFilter: "blur(12px)",
      });
      return;
    }

    gsap.set(scope.current, {
      backgroundColor: "rgba(14,35,56,0)",
      borderBottomColor: "rgba(243,244,245,0)",
    });

    gsap.to(scope.current, {
      backgroundColor: "rgba(14,35,56,0.96)",
      borderBottomColor: "rgba(243,244,245,0.08)",
      backdropFilter: "blur(12px)",
      ease: "none",
      scrollTrigger: { start: 0, end: 120, scrub: 0.3 },
    });
  }, [transparent]);

  return (
    <header
      ref={headerRef}
      data-site-header
      className="on-dark fixed top-0 left-0 z-50 w-full border-b border-transparent"
    >
      <div className="mx-auto flex max-w-[1520px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <Link
          href="/"
          aria-label="STAGE PARTNERS トップへ"
          className="shrink-0"
          onClick={scrollTopIfHome}
        >
          <Image
            src="/logo-mono-white.png"
            alt="STAGE PARTNERS"
            width={400}
            height={97}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="メインナビゲーション"
        >
          {NAV_ITEMS.map((item) =>
            item.cta ? (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-2 bg-on-dark px-6 py-2.5 text-xs font-medium tracking-[0.12em] text-navy transition-colors hover:bg-navy-mid hover:text-on-dark"
              >
                {item.label}
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <div key={item.label} className="group relative">
                {item.children ? (
                  // 子を持つ項目(事業内容)は自身のページを持たないため、リンクにせず
                  // ホバー/フォーカスでドロップダウンを開くだけの見出しにする。
                  <span className="inline-flex cursor-default items-center gap-1.5 py-6 text-xs font-normal tracking-[0.12em] text-on-dark/80 transition-colors group-hover:text-on-dark">
                    {item.label}
                    <span
                      aria-hidden
                      className="mt-px inline-block h-1 w-1 rotate-45 border-b border-r border-on-dark/50 transition-colors group-hover:border-on-dark"
                    />
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    onClick={item.href === "/" ? scrollTopIfHome : undefined}
                    className="inline-flex items-center gap-1.5 py-6 text-xs font-normal tracking-[0.12em] text-on-dark/80 transition-colors hover:text-on-dark"
                  >
                    {item.label}
                  </Link>
                )}

                {item.children && (
                  <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="min-w-[220px] border border-on-dark/10 bg-navy/98 py-2 shadow-2xl backdrop-blur-md">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            className="block whitespace-nowrap px-5 py-3 text-xs font-normal tracking-[0.08em] text-on-dark/70 transition-colors hover:bg-on-dark/5 hover:text-on-dark"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ),
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          aria-label="メニューを開閉する"
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`block h-px w-5 bg-on-dark transition-transform duration-300 ${isMenuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-5 bg-on-dark transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`block h-px w-5 bg-on-dark transition-transform duration-300 ${isMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* モバイル: 各項目をアコーディオンで開閉して次階層を表示 */}
      <nav
        id="mobile-nav"
        aria-label="モバイルナビゲーション"
        className={`overflow-hidden bg-navy/98 backdrop-blur-md transition-[max-height,opacity] duration-500 ease-out lg:hidden ${isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <ul className="flex flex-col border-t border-on-dark/10 px-6 py-2 sm:px-10">
          {NAV_ITEMS.map((item) =>
            item.cta ? (
              <li key={item.label} className="py-4">
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-on-dark py-3.5 text-sm font-medium tracking-[0.08em] text-navy"
                >
                  {item.label}
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ) : (
              <li key={item.label} className="border-b border-on-dark/5">
                <div className="flex items-center justify-between">
                  {item.children ? (
                    // 子を持つ項目(事業内容)は自身のページを持たないため、
                    // タップでアコーディオンを開閉するだけにする。
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobile((v) => (v === item.label ? null : item.label))
                      }
                      className="block flex-1 py-4 text-left text-sm font-normal tracking-[0.08em] text-on-dark/85"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (item.href === "/") scrollTopIfHome(e);
                        setIsMenuOpen(false);
                      }}
                      className="block flex-1 py-4 text-sm font-normal tracking-[0.08em] text-on-dark/85"
                    >
                      {item.label}
                    </Link>
                  )}
                  {item.children && (
                    <button
                      type="button"
                      aria-label={`${item.label}のサブメニューを開閉`}
                      aria-expanded={openMobile === item.label}
                      onClick={() =>
                        setOpenMobile((v) => (v === item.label ? null : item.label))
                      }
                      className="flex h-11 w-11 items-center justify-center text-on-dark/60"
                    >
                      <span
                        className={`inline-block h-2 w-2 rotate-45 border-b border-r border-on-dark/60 transition-transform duration-300 ${openMobile === item.label ? "-rotate-[135deg]" : ""}`}
                      />
                    </button>
                  )}
                </div>

                {item.children && (
                  <ul
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ${openMobile === item.label ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-3 pl-4 text-xs font-normal tracking-[0.06em] text-on-dark/60"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ),
          )}
        </ul>
      </nav>
    </header>
  );
}
