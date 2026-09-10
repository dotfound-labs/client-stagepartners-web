Stage Partners コーポレートサイト（Next.js App Router / Vercel）

## 開発

```bash
npm run dev     # 開発サーバー (http://localhost:3000)
npm run build   # 本番ビルド
npm run lint    # ESLint
```

## ディレクトリ構成

| ディレクトリ | 役割 |
|---|---|
| `app/` | ページ。フォルダ構造がそのまま URL（`app/works/page.tsx` → `/works`）。`layout.tsx` が全ページ共通の枠、`globals.css` がデザインの基準値。 |
| `components/` | 複数ページで使い回す表示パーツ（`.tsx`）。 |
| `content/` | サイトに載せる「中身」。実績・お知らせのデータ。**ここだけが唯一の情報源**で、一覧・詳細・TOP は必ずこの中の関数経由で参照する。 |
| `lib/` | 技術ユーティリティ（アニメーション設定など）。 |
| `hooks/` | React フック（GSAP のラッパー）。 |
| `public/` | 加工せず配信する画像・SVG。`public/works/` は実績写真、`manifest.json` はその目録。 |
| `scripts/` | 実績写真をリサイズ・書き出しする手動ツール（サイトの動作には非依存）。 |

## バックエンド担当への引き継ぎ（CMS/API 化）

差し替え対象は **`content/` 配下のみ**。`app/` `components/` `lib/` は原則触らない
（各ページに `await` を1行足す程度）。手順の詳細は各ファイル冒頭のコメントに記載：

- `content/news.ts` … お知らせ。実装する関数は `getLatestNews` / `getAllNews` / `getNewsPost` / `getNewsSiblings` の4つ。
- `content/works.ts` … 施工実績。

現状の配列はフロント確認用のダミーデータ。配列を CMS/API 呼び出しに置き換えれば
TOP・一覧・詳細すべてが自動で追従する。
