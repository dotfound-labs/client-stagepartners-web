"use client";
import {useEffect,useState} from "react";
import {publicationDate} from "@/lib/cms/publication-dates";
type Status={updatedAt:string|null;available:boolean};
export default function SitePublicationStatus({load}:{load:()=>Promise<Status>}){
 const [status,setStatus]=useState<Status|null>(null),[error,setError]=useState(false);
 useEffect(()=>{let active=true;load().then(value=>{if(active)setStatus(value)}).catch(()=>{if(active)setError(true)});return()=>{active=false};},[]); // eslint-disable-line react-hooks/exhaustive-deps
 return <div className="admin-notice"><strong>サイトの最終公開更新</strong><p>{error?"更新日時を確認できませんでした。":!status?"確認中…":!status.available?"公開更新日時の記録を準備中です。":status.updatedAt?publicationDate(status.updatedAt,true)+"（日本時間）":"記録開始後の公開更新はまだありません。"}</p><small>下書き保存は含みません。過去の公開日時が不明な記事には移行日時を表示しません。</small></div>;
}
