# 有効化チェックリスト

対象は新規Supabase **stagepartners-cms**（`apkfyxfmsndwqjfetdad`）だけです。
本番サイトへの反映と、各外部サービスの有効化は別々に確認します。

## 1. データベースと接続

- [ ] 7本目 `20261024180000_cms_integration_runtime.sql` のレビューと適用を完了する。
- [ ] 適用済みSQL本文とローカル本文の一致を確認する。
- [ ] migration番号は `supabase/HOSTED-MIGRATION-MAPPING.md` に従って照合する。
      一致確認前の再適用・履歴修復・`--include-all` は行わない。
- [ ] URLとpublishable keyが対象プロジェクトのものであることを確認する。
- [ ] 承認済みの場合のみ、対象プロジェクトのサーバー用秘密鍵を
      Shinya_PCのGit管理外 `.env.local` の `SUPABASE_SECRET_KEY` に保存する。
      ブラウザ・Git・ログ・共有資料に出さない。Vercelへの保存は別途承認する。

## 2. 初期オーナーと招待

- [ ] `info@stagepartners.co.jp` を本人が受信できることを確認する。
- [ ] SMTPの送信元・利用条件・配送先を確認し、設定と送信の承認を得る。
- [ ] 実際に開ける `/auth/callback` のURLを決め、SupabaseのSite URLと
      許可するRedirect URLを設定する。localhostは同じPCでのみ使える。
- [ ] 承認された1通の招待を送り、本人が確認済みメール表示を見てパスワードを設定する。
- [ ] 検証済みAuth UUIDを確認して、明示的に初期ownerを付与する。
- [ ] CMSから招待する場合は `CMS_INVITATIONS_ENABLED=true` と
      `CMS_AUTH_CALLBACK_URL` を設定する。実メールが送られるボタン表示を確認する。
- [ ] 一般編集者・公開担当者で許可／拒否、権限剥奪、下書き、公開、復元、画像を実接続検証する。

## 3. Instagram

- [ ] 公式プロフィールURLとBusiness／Creator資格を確認する。
- [ ] 公式APIの必要権限・OAuthを承認し、対象アカウントを確認する。
- [ ] `INSTAGRAM_ACCESS_TOKEN`、`INSTAGRAM_API_VERSION`、`CRON_SECRET`を
      承認済みサーバー環境へ安全に設定する。
- [ ] アカウント設定と `INSTAGRAM_SYNC_ENABLED=true` を設定し、明示した自動公開方針を確認する。
- [ ] 取得・出典・画像・重複防止・手動非公開・期限切れ／回数制限を実APIで検証する。
- [ ] 定期実行の承認後にだけ、1時間ごとのジョブを設定する。
      `deployment/instagram-cron.example.json` は見本で、現在は実行設定ではない。

## 4. 問い合わせ

- [ ] 実際の通知先、送信元、自動返信、連携先サービスを確認し、承認する。
- [ ] プライバシー表示とサービスへのデータ送信が一致することを確認する。
- [ ] Web3FormsサーバーAPIの契約条件・費用を確認する（PRO機能）。
- [ ] 承認済み `WEB3FORMS_SECRET_KEY` と `WEB3FORMS_FORM_ID` を設定し、
      `CONTACT_INTAKE_ENABLED=true` で受付を有効にする。
- [ ] 承認済みテスト1件で、CMS受付・サービス受付ID・実際の受信を個別に確認する。
- [ ] 基本的な回数制限とhoneypotだけでは、受付枠を使い切るDoSは防げない。
      公開前に追加の迷惑送信対策と監視を判断する。

## 5. 公開前

- [ ] 施工実績30件・ニュース6件、会社情報、写真、リンク先を確認する。
- [ ] PC／スマートフォン表示、canonical、robots、sitemapを確認する。
- [ ] 建築士登録情報などの未確認項目を正式資料と照合する。
- [ ] 本番への反映を別途承認する。PRの作成・レビューだけでmergeしない。

Previewでは招待送信・問い合わせ送信・Instagram取得を停止します。
画像の整理ジョブは未設定です。結果が不確かなアップロードをエラーだけで削除しません。
