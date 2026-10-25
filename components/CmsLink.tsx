"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
import {useCmsValues,useCmsText} from "./CmsText";
import {textKey} from "@/lib/cms/text-key";
import {safeHref} from "@/lib/cms/page-values";
export default function CmsLink(props:ComponentProps<typeof Link>) {
  const {scope,data}=useCmsValues();const text=useCmsText();
  const replacement=typeof props.href==="string"?data.fields[`${scope}.link_${textKey(props.href)}`]:undefined;
  const telephone=typeof props.href==="string"&&props.href.startsWith("tel:")?`tel:${text(props.href.slice(4))}`:undefined;
  const href=telephone&&safeHref(telephone)?telephone:replacement&&safeHref(replacement)?replacement:props.href;
  return <Link {...props} href={href} aria-label={props["aria-label"]?text(props["aria-label"]):undefined} title={props.title?text(props.title):undefined} />;
}
