"use client";
import Image from "next/image";
import {useState} from "react";
export default function InstagramImage({slug,alt}:{slug:string;alt:string}){
 const [failed,setFailed]=useState(false);if(failed)return <p className="mt-6 text-sm text-ink-muted">画像はInstagramの元の投稿でご確認ください。</p>;
 return <Image unoptimized src={`/api/instagram-image/${slug}`} alt={alt} width={1200} height={1200} className="mt-8 h-auto max-h-[70vh] w-full object-contain" onError={()=>setFailed(true)}/>;
}
