import {publicationDate,type PublicationDates as Dates} from "@/lib/cms/publication-dates";
export default function PublicationDates({firstPublishedAt,contentUpdatedAt}:Dates){
 if(!firstPublishedAt&&!contentUpdatedAt)return null;
 return <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs opacity-75" aria-label="公開情報（日本時間）">
  {firstPublishedAt&&<span>公開日 <time dateTime={firstPublishedAt}>{publicationDate(firstPublishedAt)}</time></span>}
  {contentUpdatedAt&&<span>更新日 <time dateTime={contentUpdatedAt}>{publicationDate(contentUpdatedAt)}</time></span>}
  <span>日本時間</span>
 </p>;
}
