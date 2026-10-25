import type { NextConfig } from "next";

// Only immutable repository assets may enter Next's public image cache.
// CMS media and site-assets are revocable/no-store and must never be optimized.
const permanentPublicImages = [
  "/0G0A9351-1536x1024-1.jpg",
  "/aimheroimage1.jpg",
  "/apple-icon.png",
  "/athome-logo-wide.png",
  "/athome-logo.png",
  "/company-hero.jpg",
  "/companyimage1.png",
  "/constructimage1.jpg",
  "/favicon.ico",
  "/file.svg",
  "/globe.svg",
  "/heroimage1.png",
  "/heroimage2.jpg",
  "/icon.png",
  "/issekisancho.png",
  "/kadai.PNG",
  "/logo-color-footer.png",
  "/logo-color-header.png",
  "/logo-color.png",
  "/logo-mono-black.png",
  "/logo-mono-white.png",
  "/moc image 2.png",
  "/mocimage.png",
  "/next.svg",
  "/proclaim-image-1.jpg",
  "/proclaim-image-2.jpg",
  "/real-estateimage1.png",
  "/realestate-hero.jpg",
  "/room.PNG",
  "/stagepartners-hero.jpg",
  "/stagepartners-logo.jpg",
  "/stagepartners.png",
  "/vercel.svg",
  "/window.svg",
];

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      // Keep each exact-filename expression short for Vercel's output validator.
      // Pairs stay below Next's 25-pattern limit, including its static-media entries.
      ...Array.from({ length: Math.ceil(permanentPublicImages.length / 2) }, (_, index) => {
        const names = permanentPublicImages.slice(index * 2, index * 2 + 2).map(pathname => encodeURI(pathname.slice(1)));
        return { pathname: names.length === 1 ? `/${names[0]}` : `/{${names.join(",")}}`, search: "" };
      }),
      { pathname: "/works/**", search: "" },
    ],
  },
  turbopack: {
    // Next.jsはlockfileを頼りにルートを自動判定するため、放置すると一つ上の
    // AI-Company/package-lock.json を拾い、リポジトリ全体をルートとみなしてしまう
    // (ファイル監視の範囲とキャッシュ検証のコストが不要に広がる)。
    // このプロジェクト自身をルートとして明示する。
    root: __dirname,
  },
};

export default nextConfig;
