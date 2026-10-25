"use client";
import Image, {type ImageProps} from "next/image";
import {useCmsValues,useCmsText} from "./CmsText";
import {textKey} from "@/lib/cms/text-key";
export default function CmsImage(props:ImageProps) {
  const {data}=useCmsValues();const text=useCmsText();
  const photo=typeof props.src==="string"?data.images?.[`image_${textKey(props.src)}`]:undefined;
  const src=photo?.media_id?`/api/media/${photo.media_id}`:photo?.legacy_path??props.src;
  return <Image {...props} src={src} alt={photo?.alt??text(props.alt)} unoptimized={typeof src==="string"&&src.startsWith("/api/media/")?true:props.unoptimized} />;
}
