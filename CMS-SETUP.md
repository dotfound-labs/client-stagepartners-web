Current implementation update: standard invite/recovery callback, disabled-by-default
admin invitation sender, Instagram image proxy/hourly job endpoint, and durable
inquiry intake/provider adapter are implemented. See INTEGRATION-ACTIVATION.md
for exact activation requirements and limits. Migration 7 remains pending review;
parent confirmed migrations 1–6 applied. No live Auth/Storage/integration E2E yet.
PR #7 exists (user-created, open, not merged); subsequent branch pushes update it.
Earlier setup status below is retained as historical implementation notes.

# CMS implementation and remaining activation

Only project `apkfyxfmsndwqjfetdad` (stagepartners-cms, Tokyo) is supported.
Parent-authorized URL/publishable key are now in Git-ignored local `.env.local`.
No secret/service_role key, owner, email invitation, OAuth grant or deployment
was created. Never use another project or put credentials in Git.

## Parent coordination

1. Review/apply the additional page-text seed after the four approved migrations.
   It contains only existing public text, creates seven page documents and common
   settings, and uses database-generated document IDs. All five migrations run
   locally in the SQL test suite. Reconcile versions as described in
   `supabase/HOSTED-MIGRATION-MAPPING.md`; do not blindly run `db push`.
   Also review/apply `20261024170841_cms_typed_pages_and_verified_media.sql`
   before issuing users: it validates typed page fields and images, preserves
   authorization before media-reference creation, and replaces user-callable
   media finalization with a trusted-server-only verifier.
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

Page fields now have explicit page/common namespaces and separate contexts.
Typed link and phone fields update their attributes/values; page image slots
support private CMS media with descriptions and in-use checks. Metadata title
and description use published fields. Hidden group-company fields were removed.
Page fields preserve the existing DOM and design. Home, company, service,
work/news previews use their public layouts; policy/common previews show field
content. Common
settings uses edit permission for save and publish, explicitly shown in the UI.
Registered-architect details remain unchanged pending owner verification.

Actual read-only connection to the authorized project returned 30 works and six
news records; anonymous draft/member/inquiry reads were rejected with HTTP 401.
Pages/settings were empty before the pending seed. Authenticated E2E remains
unperformed. `supabase/OWNER-ACTIVATION-PLAN.md` contains the concrete initial-owner
proposal and the separately required server-secret configuration for image
verification. Without that secret uploads stop before reserving an image.
The app creates no signed image URLs, but Storage SELECT permits a user to obtain
one directly; an already-issued bearer URL may outlive a permission revocation
until expiry. The no-store proxy does not make all prior signed URLs expire.

No analytics were added. Live homepage measured 487 font preload links and
208714 bytes of HTML; font preload is disabled while retaining the same fonts
and CSS. This is a request-hint fix, not a claimed measured Core Web Vitals gain.

## Push/deployment hold

No repository workflow was found; vercel.json defines only npm ci. External
Vercel production-branch settings and preview environment isolation are unknown.
Before pushing, verify feat/admin-cms cannot deploy production or expose private
runtime values. No merge or deployment is authorized. A draft PR may follow a
safe dedicated-branch push after that verification.
