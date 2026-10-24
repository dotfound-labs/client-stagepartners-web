# CMS implementation and remaining activation

Only project `apkfyxfmsndwqjfetdad` (stagepartners-cms, Tokyo) is supported.
No environment file, credential, owner, email invitation, OAuth grant or deployment
was created by this code change. Never use another project or put secrets in Git.

## Parent coordination

1. Review/apply the additional page-text seed after the four approved migrations.
   It contains only existing public text, creates seven page documents and common
   settings, and uses database-generated document IDs. All five migrations run
   locally in the SQL test suite. Reconcile versions as described in
   `supabase/HOSTED-MIGRATION-MAPPING.md`; do not blindly run `db push`.
2. Authorize configuring the project's URL and publishable key in the intended
   private test runtime: `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. These are public identifiers, not an
   administrator credential. Never substitute a secret/service_role key.
3. Authorize a verified Auth account for info@stagepartners.co.jp and controlled
   owner bootstrap for its verified UUID. Do not infer owner from email claims
   or user_metadata. Use the normal secure password setup channel; no passwords
   in chat. No owner bootstrap route is exposed by this application.
4. Verify actual sessions, cookie refresh, every permission combination,
   revoked-session access, parallel last-owner changes, Storage operations,
   publication/restore and invite acceptance against the new project.

Admin invitations currently reserve email/permissions only; UI says no email was
sent. Delivery/password setup remains gated pending approved Auth settings and
redirect URLs. Inquiry intake/notification is disabled; existing records can be
managed when authorized. Public contact has no dummy key and stays disabled
without an approved Web3Forms configuration. Do not send test emails yet.

## Instagram

Official documentation: https://developers.facebook.com/documentation/instagram-platform
and https://developers.facebook.com/documentation/instagram-platform/overview .
The account must meet Meta's professional-account eligibility and authorize the
selected official API. Exact account, supported API version and secure OAuth
authorization still need verification. No scraping or posting back is implemented.

`lib/cms/instagram-worker.ts` is an unwired server-only adapter. It reads at most
50 recent posts per run; historical pagination is not implemented. A future
approved worker injects the bearer token and service RPC adapter, checks current
DB enabled/next_attempt_at configuration, and records sanitized health statuses.
No worker route, cron, token storage or OAuth grant is installed. DB import is
idempotent by source ID; manual hiding is retained. News links attribute Instagram.
Actual API fetching, image display and automatic scheduling remain unactivated.

## Verification and limits

`npm run lint`, `npx tsc --noEmit`, `npm run build`,
`npm --prefix supabase/tests ci`, `npm --prefix supabase/tests test`.
Browser tests: `npx playwright test tests/cms.spec.ts --workers=1`.
Playwright starts its own production server on 127.0.0.1:3101.
These tests use no hosted credentials. SQL uses real PostgreSQL WASM with local
Auth/Storage fixtures; it does not prove live Auth, Storage or concurrent locking.

Public work/news reads use published snapshots only when configured. Missing
configuration retains the current public baseline, while admin login is disabled.
Configured query errors never fall back to resurrect unpublished baseline data.
Private images use a no-store authenticated proxy; Next image optimization is
disabled for that route. Previously shipped static work images remain public.

Page fields preserve the existing DOM and design. Home, company, service,
work/news previews use their public layouts; policy/common previews show field
content. Common
settings uses edit permission for save and publish, explicitly shown in the UI.
Registered-architect details remain unchanged pending owner verification.

No analytics were added. Live homepage measured 487 font preload links and
208714 bytes of HTML; font preload is disabled while retaining the same fonts
and CSS. This is a request-hint fix, not a claimed measured Core Web Vitals gain.

## Push/deployment hold

No repository workflow was found; vercel.json defines only npm ci. External
Vercel production-branch settings and preview environment isolation are unknown.
Before pushing, verify feat/admin-cms cannot deploy production or expose private
runtime values. No merge or deployment is authorized. A draft PR may follow a
safe dedicated-branch push after that verification.
