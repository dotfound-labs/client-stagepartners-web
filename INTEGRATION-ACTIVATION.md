# Integration code and activation boundaries

All activation flags default off. Vercel Preview forcibly disables contact intake
and Instagram sync/image fetching even if flags are accidentally set. No cron
schedule or cleanup task is installed by this branch. All nine migrations are applied. Existing applied files are unchanged.

## Standard invite / recovery

Use the default Supabase email template with redirect to `/auth/callback`.
The public callback removes fragments/query immediately, retains credentials
only in memory, and requires a recipient confirmation click. Its same-origin
POST validates the session with Supabase before writing HttpOnly cookies; all
redirect destinations are hardcoded local paths. PKCE code exchange is supported
when the initiating browser has the verifier cookie. No email address or token
claims grant CMS roles. Password entry remains the recipient's own action.

Before sending: approve target-project Site URL / exact redirect allowlist,
confirm SMTP delivery and the callback are live before inviting any additional
recipient. Use a verified Auth UUID for a separately authorized owner bootstrap. Do not put passwords or secrets in chat.
After activation, admin email invitations use CMS_INVITATIONS_ENABLED=true,
CMS_AUTH_CALLBACK_URL (exact approved /auth/callback URL) and the new project
server key. Preview always disables sending. A DB claim rechecks the grantor's
current permissions and allows only one delivery attempt per reservation.
Unknown delivery results require manual verification, not an automatic resend.
No invitation has been sent from this implementation.

## Instagram

Official Business/Creator eligibility and account URL still need verification.
Obtain Instagram Login permission/OAuth separately; never scrape. Required
server settings are INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_API_VERSION, CRON_SECRET
(at least 32 characters), SUPABASE_SECRET_KEY for this project, plus explicit
INSTAGRAM_SYNC_ENABLED=true and owner DB configuration. No values are provided.
An approved scheduler can invoke GET /api/jobs/instagram hourly with Bearer
CRON_SECRET. DB claim prevents overlapping hourly runs. Do not activate a
scheduler before approval. `deployment/instagram-cron.example.json` is a non-active
configuration example; it is intentionally not in vercel.json. Fetch covers the latest 50 posts per run; older-history
backfill is not automatic. Video uses thumbnail; carousel uses its cover.
Source IDs deduplicate; hidden news remains hidden. Current image URLs refresh
on later fetches without republishing hidden content. Image proxy only returns
published Instagram articles and allows official CDN hosts; failures show a
source-link fallback. No posting back to Instagram.

## Contact: standard and PRO options

The existing Web3Forms plan is unknown. Do not assume PRO or purchase a plan.
WEB3FORMS_MODE=browser with WEB3FORMS_ACCESS_KEY uses the supported standard
browser /submit route without requiring a PRO Secret API key. The access key is
an intentionally public form identifier, returned only after CMS validation and
receipt. Do not substitute a server Secret API key. Standard /submit is never
proxied server-side: official documentation requires a paid plan and IP allowlist
for server-side use.

WEB3FORMS_MODE=server (the backward-compatible default) retains the optional
PRO /v1/submissions API with WEB3FORMS_SECRET_KEY (WRITE permission) and
WEB3FORMS_FORM_ID. Both modes need target SUPABASE_SECRET_KEY and explicit
CONTACT_INTAKE_ENABLED=true. Preview remains disabled.

CMS input validation, honeypot, UUID deduplication and per-email/global caps
remain. Only the first receipt permits a notification attempt. The browser-mode
client then sends directly to Web3Forms. The UI requires actual provider
acceptance before reporting acceptance; DB persistence alone is not success.
Provider refusal/timeout/malformed response reports saved-but-unconfirmed and
blocks repeat submission. An uncertain receipt response can leave a DB record
without a notification; the user is told to call rather than resend blindly.

Standard browser mode cannot independently prove provider acceptance to the
server. Admin notification status stays unconfirmed even if the browser observed
acceptance. There is no browser-accessible success-report RPC. PRO mode records
the provider submission ID. Neither acceptance means recipient delivery. No
uncertain attempt is automatically retried.

Before activation verify the existing form/plan, info@stagepartners.co.jp as
recipient, notification settings, autoresponder, downstream integrations,
allowed domains and CAPTCHA requirements. Existing mandatory CAPTCHA must be
matched before enabling; no unapproved CAPTCHA service was added. The existing
honeypot and provider spam checks remain, but CMS caps cannot prevent direct
use of the intentionally public key at Web3Forms. These are basic abuse controls,
not comprehensive bot/quota protection. Confirm processing disclosures and
approve a real delivery test. No provider keys/settings or paid plan were changed.

Official standard API: https://docs.web3forms.com/getting-started/api-reference

## Orphan upload cleanup (design only)

Each verified upload owns a random immutable path. RPC timeout can occur after
commit, so never remove that attempt based on an error/timeout alone. A future
reviewed cleanup must inventory only this bucket's verified/ namespace, record
candidates with age and digest, wait longer than the request/lease window, then
recheck every cms_media.object_path before deletion. Exclude all referenced or
recent attempts and any uncertain live transaction. Use a per-media lock shared
with finalization while rechecking/deleting, or implement an explicit expired
attempt claim that finalization rejects. Do not use a list-then-delete race.
Existing automatic cleanup is limited to a confirmed successful identical-byte
retry whose returned winning path differs from its own fresh path. No orphan
cleanup job or broad Storage deletion has been activated.

Tests use local SQL Auth/Storage fixtures, mock API responses, and unconfigured
browser routes. Real invitation, OAuth, image delivery and inquiry receipt remain
unverified until the above activation approvals and real E2E are completed.

Official references checked during implementation:
- https://supabase.com/docs/guides/auth/sessions/implicit-flow
- https://supabase.com/docs/reference/javascript/auth-setsession
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login
- https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media
- https://docs.web3forms.com/getting-started/submissions-api

Notification status `accepted` means the provider accepted the submission, not
that the recipient received email. The provider submission ID is stored for
reconciliation. Honeypot and email/global caps do not prevent quota-exhaustion
denial of service; evaluate stronger abuse controls before public activation.

## Instagram lifecycle and tagged-news update (not activated)

Only an exact standalone ASCII #お知らせ hashtag imports news. Fullwidth ＃,
#お知らせ一覧, combining-mark suffixes and embedded word fragments do not match.
No Unicode normalization is performed. Missing/removed tags skip the post;
existing imported content is retained, never deleted or automatically hidden.

The official refresh endpoint supports unexpired Instagram Login long-lived
tokens aged at least 24 hours, renewing for up to 60 days. The worker refreshes
within seven days of expiry, validates expires_in, saves before using new tokens,
and backs off on rate limits/timeouts. Expired/revoked tokens require OAuth again.
Short-lived, Facebook Login and unknown tokens are not automatically refreshed.
No provider error body, request URL or token may be logged.

The optional local-file adapter uses an exclusive lock and atomic replacement.
Provision .cms-secrets with owner-only ACLs, outside cloud sync/backups, before
setting INSTAGRAM_TOKEN_STORE=local-file. Its JSON contains accessToken, kind
instagram-login-long-lived, issuedAt and expiresAt. No file is provisioned by
this change. A stale lock after crash requires reviewed manual recovery; do not
remove a live lock. Failed replacement can leave a protected temporary file.

OAuth uses owner-only same-origin POST, random HttpOnly Secure state bound to
the current owner, ten-minute expiry, one-use provider code, and verifies the
returned username is aim_architecture. Configure INSTAGRAM_OAUTH_ENABLED,
INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_REDIRECT_URI and API version
only after approval. Redirect must be HTTPS /api/admin/instagram/oauth on the
app origin and registered with Meta. Suppress callback query-string and outbound
refresh URL logging before activation; both can contain credentials.

IMPORTANT: the local-file adapter and local-file OAuth configuration refuse Vercel (including
Production). Vercel has no durable local credential filesystem. Production
unattended refresh uses the encrypted-db adapter described below after its
migration and separately approved provisioning; environment-only tokens are not
silently rotated. The UI reports unconnected/expired/expiring and job responses warn when
environment token expiry is untracked. This is not a completed live integration.
No OAuth grants, keys, schedules or SMTP changes were made.

Official reference: https://developers.facebook.com/documentation/instagram-platform/reference/refresh_access_token

## Publication dates (applied)

Migration 20261025030912_cms_publication_dates is applied to stagepartners-cms.
All nine applied migration bodies remain unchanged.
Existing publication times stay unknown; migration timestamps are never shown as
original publication dates. New publications record first_published_at, retained
across unpublish/republish. content_updated_at changes only when public content
changes or becomes visible again. Version-only republishes do not advance it.
The admin site timestamp also includes unpublication; draft saves/restores do not
advance it. Dates are displayed in Asia/Tokyo. Unconfigured older DBs omit these
public dates and report the dashboard timing feature as awaiting setup.

Local PostgreSQL regression now includes page save/reread persistence, unchanged
public snapshots after draft changes, date privacy and publication transitions.
Real Auth UI editing/publishing remains unverified until initial owner setup.
Low-level real target-project Storage upload/download/duplicate rejection, anon
read denial and cleanup of the uniquely named synthetic object were verified;
this does not replace administrator upload UI E2E.

## Encrypted database token store (code complete, not activated)

INSTAGRAM_TOKEN_STORE=encrypted-db supports Vercel Production. Preview is always
blocked. The applied cms_encrypted_instagram_tokens migration creates one empty
private row, RLS, and a service-role-only RPC; it does not store credentials or
enable syncing. No existing content or Auth membership changes.

The server encrypts the complete token envelope with AES-256-GCM, random 96-bit
nonce and project/account/version-bound authenticated data. Only ciphertext is
stored in cms_private. INSTAGRAM_TOKEN_ENCRYPTION_KEY must be a separately
provisioned 32-byte key encoded as 64 hexadecimal characters, never NEXT_PUBLIC.
Do not reuse the Supabase key or paste either key into chat. Provisioning this
key and Supabase server secret in Vercel still needs specific approval.

Claim/commit/release RPCs use row locks and a 120-second expiring lease with a
random fencing identifier. Concurrent refreshes cannot claim the same lease;
stale or expired writers cannot overwrite a successor. Successful refresh is
persisted before use. Uncertain persistence errors stop syncing. A crash releases
no uncertain data: the lease simply expires. Read-only status returns only expiry
and connection state to authorized admins, never token/envelope/key.

The operator must approve the Meta app/HTTPS redirect and credentials, retain a
secure recoverable copy of the encryption key, then connect aim_architecture
through the owner-only OAuth screen. Initial connection leaves sync disabled;
explicit start enables only #お知らせ imports. Run a real reconnect, refresh and
initial-sync acceptance test before scheduling. Key loss requires reauthorization;
key rotation needs an explicit decrypt/re-encrypt procedure or reauthorization,
not blindly replacing the environment value. No live key, OAuth or job was enabled.

Auth delivery status: localhost callback http://127.0.0.1:3102/auth/callback is
registered in stagepartners-cms; Site URL was not changed. Custom SMTP was configured
by the operator and invitation delivery was confirmed. The initial owner completed
email verification and the separately approved owner bootstrap. Full authenticated
CMS editing/publishing QA remains a separate validation step.

## Password completion feedback

Password saving now stays on an explicit completion screen with a login link.
CMS membership is read separately; unavailable or unverified access never implies
the password failed to save. A post-save sign-out failure is also reported separately.
No role is granted by this flow.

Supabase supports the project-level `mailer_notifications_password_changed_enabled`
notification, configured under Auth email templates. Current upstream Auth user-update
code sends it for password updates, including a first password, when enabled and an
email exists. The hosted version and current project flag still need read-only
verification; this change does not enable notifications or add an application mail sender.
Delivery failure does not invalidate password saving, so the UI makes no email-delivery
claim. Use the native notification alone to avoid duplicate completion emails.
Sources: https://supabase.com/docs/guides/auth/auth-email-templates and
https://github.com/supabase/auth/blob/master/internal/api/user.go (UserUpdate).
