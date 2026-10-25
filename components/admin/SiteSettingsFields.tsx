"use client";
import {PAGE_TEMPLATES} from '@/content/page-fields';
import type {PageData} from '@/lib/cms/model';
import {resolveSiteSettings} from '@/lib/cms/site-settings';
export default function SiteSettingsFields({data,change}:{data:PageData;change:(patch:Partial<PageData>)=>void}){
 const fields=PAGE_TEMPLATES.common.fields,seo=fields.filter(f=>f.id.includes('.seo_')),company=fields.find(f=>f.id==='common.text_9a3cbf23')!,site=resolveSiteSettings(data);
 const input=(field:typeof company)=><label key={field.id}>{field.id===company.id?'会社名（全ページ共通）':field.label}{field.id==='common.seo_indexing'?<select value={data.fields[field.id]??field.value} onChange={e=>change({fields:{...data.fields,[field.id]:e.target.value}})}><option value="index">検索エンジンへの掲載を許可</option><option value="noindex">検索エンジンに掲載しない</option></select>:<textarea rows={field.id==='common.seo_description'?4:2} maxLength={field.id==='common.seo_description'?500:field.id==='common.seo_url'?253:200} value={data.fields[field.id]??field.value} onChange={e=>change({fields:{...data.fields,[field.id]:e.target.value}})}/>}</label>;
 return <><h2>サイト情報・SEO</h2><p>下書き保存だけでは公開設定は変わりません。保存後にプレビューし、確認できたら公開してください。</p>{input(company)}{seo.map(input)}
 <p className="admin-help">正式URLはサイト全体のcanonical・サイトマップ・構造化データに使用します。個別ページの検索タイトル・説明は「ページ編集」で設定した値が優先されます。管理画面や確認用の公開環境は検索掲載を許可しません。</p>
 <section className="admin-card"><h3>検索結果の表示イメージ（下書き）</h3><p>{site.url}</p><strong>{site.title}</strong><p>{site.description}</p><p>表示内容や掲載時期、検索結果の追加リンクは検索エンジンが判断します。</p></section>
 <h3>自動で生成する設定</h3><p>robots.txt：検索掲載の選択に連動します。管理画面・認証画面は除外します。</p><p>サイトマップ：公開済みページ・施工実績・お知らせだけを含めます。検索結果に出る追加リンク（サイトリンク）とは別のものです。</p><p>構造化データ：会社名・住所・ロゴ・サイト名を既存情報から生成します。資格・評価などの情報は追加しません。</p>
 <h2>共通メニュー・会社情報</h2><p>ロゴ・ファビコン・SNS共有画像は、この下の画像欄から選択できます。</p>{fields.filter(f=>!f.id.includes('.seo_')&&f.id!==company.id).map(input)}</>;
}
