# Integration code and activation boundaries

All activation flags default off. Vercel Preview forcibly disables contact intake
and Instagram sync/image fetching even if flags are accidentally set. No cron
schedule or cleanup task is installed by this branch. Migration 7 is pending
review and must follow migrations 5 and 6. Existing applied files are unchanged.

## Standard invite / recovery

Use the default Supabase email template with redirect to `/auth/callback`.
The public callback removes fragments/query immediately, retains credentials
only in memory, and requires a recipient confirmation click. Its same-origin
POST validates the session with Supabase before writing HttpOnly cookies; all
redirect destinations are hardcoded local paths. PKCE code exchange is supported
when the initiating browser has the verifier cookie. No email address or token
claims grant CMS roles. Password entry remains the recipient's own action.

Before sending: approve target-project Site URL / exact redirect allowlist,
configure approved SMTP delivery (currently off), confirm the callback is live,
and approve the one recipient invite. Use a verified Auth UUID for the separately
authorized owner bootstrap. Do not put passwords or secrets in chat.
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

## Contact

Approve the delivery provider, actual recipient, autoresponder behavior and all downstream integrations first. The existing
Web3Forms adapter uses its documented server Submissions API (PRO feature):
WEB3FORMS_SECRET_KEY with Create submissions permission and WEB3FORMS_FORM_ID,
SUPABASE_SECRET_KEY and CONTACT_INTAKE_ENABLED=true are required. Server status
controls whether the form is enabled. No real inquiry has been submitted.
Service-only intake validates data, deduplicates request UUIDs, caps 3 submissions
per email/hour and 100 total/hour. A honeypot supplements these caps. Privacy
and provider processing disclosures must be confirmed before activation.
No paid subscription or key has been acquired. This adapter must stay disabled
until the provider, plan/cost and verified recipient are approved; it does not
proxy the browser-only free submit endpoint.
CMS receipt is durable before one notification attempt. Failure/timeout is
shown to admins as unconfirmed and is never automatically retried; inspect
provider delivery before any manual resend. These caps are basic abuse controls,
not a claim of bot-proof production protection.

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
