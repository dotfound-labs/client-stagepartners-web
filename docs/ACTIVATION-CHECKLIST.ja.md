# 有効化チェックリスト

対象は新規Supabase **stagepartners-cms**（`apkfyxfmsndwqjfetdad`）だけです。
本番サイトへの反映と、各外部サービスの有効化は別々に確認します。

## 1. データベースと接続

- [x] 全7本を対象DBへ適用済み。最終版は `20261024183541_cms_integration_runtime.sql`。
- [x] 適用済みSQL本文とレビュー資料・ローカル本文の一致を確認済み。
- [x] migration番号は `supabase/HOSTED-MIGRATION-MAPPING.md` に従って照合する。
      一致確認前の再適用・履歴修復・`--include-all` は行わない。
- [ ] URLとpublishable keyが対象プロジェクトのものであることを確認する。
- [ ] 承認済みの場合のみ、対象プロジェクトのサーバー用秘密鍵を
      Shinya_PCのGit管理外 `.env.local` の `SUPABASE_SECRET_KEY` に保存する。
      ブラウザ・Git・ログ・共有資料に出さない。Vercelへの保存は別途承認する。

外部連携は無効・未設定です。DB適用はメール送信やInstagram取得の有効化を意味しません。

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

- [ ] 対象アカウントを確定する。特定ユーザー名への固定はない。Business／Creator資格を本人が確認する。
- [ ] Metaアプリの Instagram API with Instagram Login を設定し、instagram_business_basic の必要なアクセスレベル・審査を確認する。
- [ ] 管理画面の「接続の準備」でアプリID・HTTPS戻り先・APIバージョンを確認する。ここは入力の準備用で、保存・認証はしない。
- [ ] 承認済みのサーバー専用設定へ INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET / INSTAGRAM_REDIRECT_URI / INSTAGRAM_API_VERSION を保存する。
- [ ] 本番では INSTAGRAM_TOKEN_STORE=encrypted-db と INSTAGRAM_TOKEN_ENCRYPTION_KEY（64桁16進数）、対象DBの SUPABASE_SECRET_KEY を準備する。秘密に NEXT_PUBLIC_ を付けない。
- [ ] Metaの有効なリダイレクトURIとサーバー設定を完全一致させ、同じHTTPSドメインの管理画面を開く。戻り先パスは /api/admin/instagram/oauth。HTTP localhostとVercel Previewでは実認証しない。
- [ ] 承認後 INSTAGRAM_OAUTH_ENABLED=true とし、管理画面で対象ユーザー名を入力して公式認証する。サーバーは認証開始時の指定名を照合し、実アカウントIDへトークンを紐付ける。
- [ ] 切替は新しいユーザー名で公式再認証する。接続後は同期停止状態となる。既存の記事は削除しない。認証失敗時は接続状態を再確認する。
- [ ] INSTAGRAM_SYNC_ENABLED=true と CRON_SECRET を設定し、対象を確認して自動取込・公開を開始する。独立したASCII #お知らせ のみ対象。全角＃や #お知らせ一覧 は除外。
- [ ] 取得・出典・画像・重複防止・手動非公開・期限切れ／回数制限を実APIで検証する。
- [ ] 定期実行の承認後にだけ、1時間ごとのジョブを設定する。deployment/instagram-cron.example.json は見本で、現在は実行設定ではない。

トークンは暗号化形式v2で保存し、更新後もアカウントIDとの紐付けを保持する。旧v1やアカウント未紐付けのトークンは再認証が必要。手入力の環境変数トークンでは同期しない。Metaの交換・更新リクエストURLとOAuth callbackには秘密が含まれるため、ホスティングのログ・トレースでもqueryを記録しない設定を実認証前に確認する。

公式資料: https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login

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
