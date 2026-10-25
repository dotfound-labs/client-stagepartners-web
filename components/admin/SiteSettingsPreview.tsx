/* eslint-disable @next/next/no-img-element */
import { PAGE_ASSETS } from "@/content/page-assets";
import { photoUrl, type PageData } from "@/lib/cms/model";
import { resolveSiteSettings, validateSiteFields } from "@/lib/cms/site-settings";

export default function SiteSettingsPreview({ data }: { data: PageData }) {
  try { validateSiteFields(data.fields); } catch (error) {
    return <p className="admin-notice error" role="alert">プレビューする前に入力を確認してください：{(error as Error).message} 公開設定は変更されていません。</p>;
  }
  const site = resolveSiteSettings(data);
  const asset = (id: string) => {
    const slot = PAGE_ASSETS.common.images.find(image => image.id === id)!;
    return data.images?.[id] ?? { legacy_path: slot.path, alt: slot.alt };
  };
  const icon = asset("seo_icon"), og = asset("seo_og");
  return <section className="admin-seo-previews" aria-label="SEO設定の下書きプレビュー">
    <div className="admin-card admin-search-preview">
      <h3>検索結果の表示イメージ（下書き）</h3>
      <div className="admin-search-site"><img src={photoUrl(icon)} alt="下書きのファビコン" width={32} height={32} /><div><b>{site.siteName}</b><small>{site.url}</small></div></div>
      <p className="admin-search-title">{site.title}</p><p>{site.description}</p>
      <small>表示内容・反映時期・追加リンクは検索エンジンが判断します。</small>
    </div>
    <div className="admin-card admin-share-preview">
      <h3>SNS共有の表示イメージ（下書き）</h3>
      <img src={photoUrl(og)} alt={og.alt} width={1200} height={630} />
      <small>{site.siteName}</small><strong>{site.title}</strong><p>{site.description}</p>
      <small>公開時に1200×630へ中央で切り抜きます。SNS側のキャッシュにより反映が遅れる場合があります。</small>
    </div>
    <p className="admin-help">{site.indexing === "noindex" ? "現在の下書きは「検索エンジンに掲載しない」です。" : "現在の下書きは「検索エンジンへの掲載を許可」です。"} 下書き保存だけでは公開設定は変わりません。</p>
  </section>;
}
