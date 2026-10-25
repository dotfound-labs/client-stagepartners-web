"use client";
import { PAGE_TEMPLATES } from "@/content/page-fields";
import type { PageData } from "@/lib/cms/model";
import SiteSettingsPreview from "./SiteSettingsPreview";

export default function SiteSettingsFields({ data, change }: { data: PageData; change: (patch: Partial<PageData>) => void }) {
  const fields = PAGE_TEMPLATES.common.fields;
  const seo = fields.filter(field => field.id.startsWith("common.seo_"));
  const company = fields.find(field => field.id === "common.text_9a3cbf23")!;
  const update = (id: string, value: string) => change({ fields: { ...data.fields, [id]: value } });
  const input = (field: typeof company) => {
    const value = data.fields[field.id] ?? field.value;
    const max = field.id === "common.seo_site_name" ? 100 : field.id === "common.seo_description" ? 500 : field.id === "common.seo_url" ? 253 : field.id.startsWith("common.seo_") ? 200 : field.kind === "text" ? 20000 : 2000;
    return <label key={field.id}>{field.id === company.id ? "会社名（全ページ共通）" : field.label}
      {field.id === "common.seo_indexing" ? <select value={value} onChange={event => update(field.id, event.target.value)}><option value="index">検索エンジンへの掲載を許可</option><option value="noindex">検索エンジンに掲載しない</option></select>
        : field.id === "common.seo_description" || field.kind === "text" && !field.id.startsWith("common.seo_") ? <textarea rows={field.id === "common.seo_description" ? 4 : 2} maxLength={max} value={value} onChange={event => update(field.id, event.target.value)} />
        : <input type={field.id === "common.seo_url" ? "url" : field.kind === "phone" ? "tel" : "text"} maxLength={max} value={value} onChange={event => update(field.id, event.target.value)} />}
      {field.id.startsWith("common.seo_") && field.id !== "common.seo_indexing" && <small>{value.length} / {max}文字</small>}
    </label>;
  };
  return <>
    <h2>サイト情報・SEO</h2>
    <p className="admin-help">既存サイトのサイト名・正式URL・説明・画像を初期値にしています。入力 → 下書き保存 → プレビュー → 公開の順で反映します。</p>
    {seo.some(field => data.fields[field.id] === undefined) && <p className="admin-notice" role="status">未設定のSEO項目には既存サイトの初期値を表示しています。下書き保存で保存され、公開するまでは公開版を変更しません。</p>}
    {input(company)}{seo.map(input)}
    <p className="admin-help">正式URLはHTTPSのドメインのみ（例：https://www.stagepartners.co.jp）。全ページのcanonical・サイトマップ・構造化データに使用します。ページ固有のタイトル・説明は引き続き優先されます。管理画面・下書きプレビュー・確認用の公開環境は常に検索対象外です。</p>
    <SiteSettingsPreview data={data} />
    <details className="admin-card"><summary>自動生成するSEO設定について</summary><p>検索非掲載は各ページのnoindexで指定します。検索エンジンがこの指示を読めるよう公開ページの巡回は許可し、管理画面・認証画面はrobots.txtで除外します。</p><p>サイトマップには公開ページ・公開済みの施工実績とお知らせを含めます。検索結果の追加リンク（サイトリンク）とは別です。</p><p>会社情報・サイト情報の構造化データは、会社名・住所・ロゴ・サイト名から生成します。資格や評価は追加しません。</p></details>
    <details className="admin-card"><summary>共通メニュー・会社情報を編集</summary><p className="admin-help">ヘッダー・フッターなど全ページ共通の表示です。</p>{fields.filter(field => !field.id.startsWith("common.seo_") && field.id !== company.id).map(input)}</details>
    <p className="admin-help">ロゴ・ファビコン・SNS共有画像は、下の画像欄で選択します。画像の追加は「画像」メニューから行えます。</p>
  </>;
}
