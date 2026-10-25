export type PageImage = { media_id?: string; legacy_path?: string; alt: string };
export type PageValues = { title: string; fields: Record<string,string>; images?: Record<string,PageImage> };
export const safeHref = (value: string) => /^\/(?!\/)[^\s\\]*$/.test(value) || /^#[a-zA-Z0-9_-]+$/.test(value) || /^https:\/\/[^\s\\]+$/.test(value) || /^tel:\+?[0-9-]{6,20}$/.test(value);
import type {Metadata} from "next";
import {textKey} from "./text-key";
export function resolvePageMetadata(slug:string,fields:Record<string,string>,defaults:Metadata):Metadata{
  const title=typeof defaults.title==="string"?fields[`${slug}.${textKey(defaults.title)}`]??defaults.title:defaults.title;
  const description=defaults.description?fields[`${slug}.${textKey(defaults.description)}`]??defaults.description:defaults.description;
  return {...defaults,title,description,openGraph:{...defaults.openGraph,...(typeof title==="string"?{title}:{}),...(description?{description}:{})}};
}
