import 'server-only';
import type { Metadata } from 'next';
import { getPageContent } from './public';
import { resolveSiteSettings } from './site-settings';

export async function getSiteSettings() {
  return resolveSiteSettings(await getPageContent('common'));
}

export async function siteMetadata(): Promise<Metadata> {
  const common = await getPageContent('common');
  const site = resolveSiteSettings(common);
  const noindex = process.env.VERCEL_ENV === 'preview' || site.indexing === 'noindex';
  const imageAlt = common.images?.seo_og?.alt || site.siteName;
  return {
    metadataBase: new URL(site.url),
    title: site.title,
    description: site.description,
    robots: { index: !noindex, follow: !noindex },
    icons: {
      icon: [{ url: '/site-assets/icon', type: 'image/png', sizes: '512x512' }],
      apple: [{ url: '/site-assets/icon', sizes: '512x512', type: 'image/png' }],
    },
    openGraph: {
      title: site.title,
      description: site.description,
      siteName: site.siteName,
      type: 'website',
      locale: 'ja_JP',
      url: site.url + '/',
      images: [{ url: '/site-assets/og', width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.title,
      description: site.description,
      images: [{ url: '/site-assets/og', alt: imageAlt }],
    },
  };
}

/** Next.js shallow-merges nested metadata, so public pages explicitly retain
 * the published site images/identity while supplying their own share text. */
export async function publicPageMetadata(page: Metadata): Promise<Metadata> {
  const site = await siteMetadata();
  const title = page.title ?? site.title ?? undefined;
  const description = page.description ?? site.description ?? undefined;
  const canonical = page.alternates?.canonical;
  const canonicalUrl = typeof canonical === 'string' || canonical instanceof URL
    ? canonical : canonical?.url;
  const openGraph: NonNullable<Metadata['openGraph']> = {
    ...site.openGraph,
    title,
    description,
    ...page.openGraph,
    siteName: site.openGraph?.siteName,
    url: page.openGraph?.url ?? canonicalUrl ?? site.openGraph?.url,
  };
  const blocked = typeof site.robots === 'object' && site.robots?.index === false;
  const pageRobots = typeof page.robots === 'object' ? page.robots : undefined;
  const robots = blocked ? {
    ...pageRobots,
    index: false,
    follow: false,
    ...(pageRobots?.googleBot ? { googleBot: { index: false, follow: false } } : {}),
  } : page.robots ?? site.robots;
  return {
    ...site,
    ...page,
    metadataBase: site.metadataBase,
    robots,
    openGraph,
    twitter: {
      ...site.twitter,
      title: openGraph.title,
      description: openGraph.description,
      images: openGraph.images,
      ...page.twitter,
    },
  };
}
