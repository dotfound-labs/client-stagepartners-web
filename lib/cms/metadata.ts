import 'server-only';
import type { Metadata } from 'next';
import { getPageFields } from './public';
import { resolvePageMetadata } from './page-values';
import { publicPageMetadata } from './site-metadata';

export async function pageMetadata(slug: string, defaults: Metadata): Promise<Metadata> {
  const fields = await getPageFields(slug);
  return publicPageMetadata(resolvePageMetadata(slug, fields, defaults));
}
