/**
 * お知らせのデータ。TOPのお知らせセクション・一覧(/news)・詳細(/news/[slug])が
 * 共有する唯一の情報源。
 *
 * このファイルは content/ 配下（サイトに載せる「中身」を置く層）にある。
 * 技術ユーティリティは lib/ に分けてあるので、CMS/API 差し替えの作業は
 * 原則この content/ の中だけで完結する。
 *
 * ---------------------------------------------------------------------------
 * バックエンド実装者へ
 * ---------------------------------------------------------------------------
 * 現在の NEWS 配列はフロント確認用のダミーデータです。CMS/API に差し替える際は、
 * この配列だけを置き換えれば、TOP・一覧・詳細の全てが自動的に追従します
 * (どの画面も直接 NEWS を見ず、必ず下の関数経由で取得しているため)。
 *
 * 差し替え時に実装すべき関数は4つだけです。
 *
 *   getLatestNews(limit)  … TOP用。公開済みを新しい順に limit 件
 *   getAllNews()          … 一覧用。公開済みを新しい順に全件
 *   getNewsPost(slug)     … 詳細用。slug 1件。無ければ undefined
 *   getNewsSiblings(slug) … 詳細の「前の記事/次の記事」導線
 *
 * 想定する差し替え方(Next.js App Router):
 *   - これらを async 関数にする(`export async function getAllNews()`)
 *   - 呼び出し側の app/news/page.tsx・app/news/[slug]/page.tsx は
 *     既にサーバーコンポーネントなので `await` を足すだけで動きます
 *   - TOPの components/News.tsx は client component のため、
 *     app/page.tsx 側で await して props で渡す形に変えてください
 *     (News.tsx は既に posts を props で受け取る作りにしてあります)
 *   - 一覧のISR/再検証が必要なら app/news/page.tsx に
 *     `export const revalidate = 60` などを追加してください
 *   - 現在は generateStaticParams で全記事をSSGしています。記事が動的に
 *     増える運用にする場合は app/news/[slug]/page.tsx の
 *     `dynamicParams = false` を外してください
 *
 * カテゴリを増やす場合は NewsCategory と NEWS_CATEGORY_LABEL の両方に追加します
 * (一覧のカテゴリ絞り込みタブは NEWS_CATEGORY_LABEL から自動生成されます)。
 * ---------------------------------------------------------------------------
 */

/** お知らせの区分。一覧のタブ・詳細のラベルに使う。 */
export type NewsCategory = "info" | "works" | "instagram";

export type NewsPost = {
  sourceUrl?: string;
  /** URLになる。半角英数とハイフンのみ。CMS側でも一意になるよう担保すること。 */
  slug: string;
  /** 公開日。ISO 8601(YYYY-MM-DD)で持ち、表示形式は formatNewsDate() に寄せる。 */
  date: string;
  category: NewsCategory;
  title: string;
  /** 一覧・OGPで使う短い説明。1〜2文。 */
  excerpt: string;
  /**
   * 本文。段落の配列として持つ。
   * CMS移行時にリッチテキスト(HTML)へ変えるなら、NewsDetail.tsx の
   * 本文描画箇所だけを差し替えれば済むようにしてある。
   */
  body: string[];
};

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  info: "お知らせ",
  works: "施工実績",
  instagram: "Instagram",
};

/**
 * ダミーデータ。日付の新しい順に並べておく(取得関数側でもソートしている)。
 * バックエンド接続時はこの配列ごと削除してよい。
 */
export const NEWS: NewsPost[] = [
  {
    slug: "summer-holiday-2026",
    date: "2026-07-01",
    category: "info",
    title: "夏季休業期間のお知らせ",
    excerpt:
      "誠に勝手ながら、下記の期間を夏季休業とさせていただきます。期間中のお問い合わせは翌営業日以降に順次ご対応いたします。",
    body: [
      "平素は格別のご高配を賜り、厚く御礼申し上げます。",
      "誠に勝手ながら、当社では下記の期間を夏季休業とさせていただきます。休業期間中にいただいたお問い合わせにつきましては、翌営業日以降に順次ご対応いたします。",
      "夏季休業期間：2026年8月13日(木)〜2026年8月16日(日)",
      "お客様には大変ご不便をおかけいたしますが、何卒ご理解いただきますようお願い申し上げます。",
    ],
  },
  {
    slug: "mansion-renovation-published",
    date: "2026-06-15",
    category: "works",
    title: "賃貸マンションのリノベーション事例を公開しました",
    excerpt:
      "マンション一室のリノベーション事例を施工実績に追加しました。建具と壁の色を決め直し、キッチンを入れ替えた事例です。",
    body: [
      "施工実績に、賃貸マンション一室のリノベーション事例を追加しました。",
      "既存の間取りを活かしながら、建具と壁の色を決め直し、キッチンを入れ替えています。床はヘリンボーン張りに変更し、居室の印象を大きく変えました。",
      "施工前後の様子は施工実績ページよりご覧いただけます。",
    ],
  },
  {
    slug: "instagram-update-202605",
    date: "2026-05-28",
    category: "instagram",
    title: "現場の様子を更新しました",
    excerpt:
      "公式Instagramにて、進行中の現場の様子を更新しました。日々の施工の記録を随時お届けしています。",
    body: [
      "公式Instagramにて、進行中の現場の様子を更新しました。",
      "図面や完成写真だけでは伝わりにくい、日々の施工の過程や職人の手仕事の様子を随時お届けしています。",
      "ぜひ併せてご覧ください。",
    ],
  },
  {
    slug: "office-relocation-2026",
    date: "2026-04-20",
    category: "info",
    title: "沼津オフィス開設のお知らせ",
    excerpt:
      "業務体制の強化に伴い、沼津オフィスを開設いたしました。静岡県東部エリアのご相談により迅速に対応してまいります。",
    body: [
      "このたび、業務体制の強化に伴い、沼津オフィスを開設いたしました。",
      "静岡県東部エリアにおける不動産・建築のご相談に、これまで以上に迅速に対応してまいります。",
      "今後とも変わらぬご愛顧を賜りますよう、よろしくお願い申し上げます。",
    ],
  },
  {
    slug: "restaurant-works-published",
    date: "2026-03-11",
    category: "works",
    title: "飲食店の新装工事事例を公開しました",
    excerpt:
      "厳選焼鳥店の新装工事事例を施工実績に追加しました。炉端を囲むカウンターを軸に、和の設えで組み立てた事例です。",
    body: [
      "施工実績に、飲食店の新装工事事例を追加しました。",
      "炉端を囲むカウンターを軸に、和の設えで店内を組み立てています。外観は石張りのファサードに木格子を合わせ、夜の見え方まで含めて設計しました。",
      "施工前後の比較は施工実績ページよりご覧いただけます。",
    ],
  },
  {
    slug: "company-established",
    date: "2026-06-15",
    category: "info",
    title: "株式会社ステージパートナーズ設立のお知らせ",
    excerpt:
      "このたび株式会社ステージパートナーズを設立いたしました。不動産と建築を一社でつなぐ体制で事業を開始します。",
    body: [
      "このたび、株式会社ステージパートナーズを設立いたしました。",
      "不動産の仲介・管理から建物のリフォーム・内装工事まで、これまで別々の会社に分かれていた領域を一社でつなぎ、土地と建物の可能性を一貫して引き出す体制で事業を開始いたします。",
      "オーナー様の資産に、次の価値を。社員一同、誠実に取り組んでまいります。",
    ],
  },
];

/** 表示用の日付(2026.07.01)に整える。データ側はISO形式で統一しておく。 */
export function formatNewsDate(date: string): string {
  return date.replace(/-/g, ".");
}

/** 新しい順に並べ替えた配列を返す(元配列は変更しない)。 */
function sortedByDateDesc(posts: NewsPost[]): NewsPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 一覧用。公開済みのお知らせを新しい順に全件返す。
 * バックエンド接続時はここをAPI取得に差し替える。
 */
export function getAllNews(): NewsPost[] {
  return sortedByDateDesc(NEWS);
}

/**
 * TOP用。最新n件だけ返す。TOPのお知らせセクションが常に一覧と同じ内容を
 * 見るようにするため、TOP側で独自の配列を持たせない。
 */
export function getLatestNews(limit = 3): NewsPost[] {
  return getAllNews().slice(0, limit);
}

/** 詳細用。該当がなければ undefined(呼び出し側で notFound() する)。 */
export function getNewsPost(slug: string): NewsPost | undefined {
  return NEWS.find((post) => post.slug === slug);
}

/**
 * 詳細ページの「前の記事 / 次の記事」。一覧と同じ並び(新しい順)を基準にする。
 * 端では null を返すので、呼び出し側でリンクを出し分ける。
 */
export function getNewsSiblings(slug: string): {
  prev: NewsPost | null;
  next: NewsPost | null;
} {
  const posts = getAllNews();
  const i = posts.findIndex((post) => post.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? posts[i - 1] : null,
    next: i < posts.length - 1 ? posts[i + 1] : null,
  };
}
