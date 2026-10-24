# Additional review: typed pages and verified media

Only target: `apkfyxfmsndwqjfetdad`. No hosted change executed here.
The first four applied SQL files are unchanged.

Pending files, in order:

1. Revised `20261024164822_cms_page_content.sql`. The site-policy lead now uses
   www.stagepartners.co.jp in source, descriptor and published seed. Its stable
   suffix `text_c02d9817` is explicitly bound and scoped as
   `site-policy.text_c02d9817`. All page/common fields are namespaced. The seed
   remains unapplied according to parent; if that changes, stop and write a new
   data migration instead of replaying/replacing it.
2. `20261024170841_cms_typed_pages_and_verified_media.sql`. Replaces validation
   functions with a static allowlist of each page's typed fields and image slots.
   Link protocols and phone format are checked in API and DB. Legacy image paths
   must match the registered slot. Arbitrary nested image keys cannot create
   references. Media visibility is checked before reference creation, including
   draft, published and revision references; in-use deletion checks remain.

Page/common renderer contexts are separate, so a page heading cannot shadow a
common navigation label. Typed links change href, typed image slots change src
and alt, and telephone text/link helpers share the same common setting. Metadata
title/description now read the published fields. Hidden company-group fields
were removed from the form rather than advertising inactive editing controls.

Authenticated `cms_mutate_media(...,'finalize')` now always rejects. A new
`cms_finalize_verified_media` is executable only by service_role. It validates
uploader, current active membership/media read+edit permissions, WebP metadata,
expected size and Storage existence. The application verifies/normalizes bytes
with Sharp, overwrites any prior untrusted object with that result using a
separately approved server credential, rechecks the current user's session and
permissions, then finalizes. Duplicate untrusted bytes are never accepted as an
already-uploaded successful sanitized image. Without the private server key the
handler stops before reservation. No key has been obtained or configured.

The DB trusts that service-only finalizer's caller actually performed the byte
verification. Protecting that credential is therefore part of the trust boundary;
metadata alone is not treated as proof of safe content for untrusted callers.

Local SQL regression coverage includes direct-finalize denial, service RPC
denial for ordinary users, unverified-image publication denial, page-slot
allowlists, unsafe links, scoped fields and inaccessible private-image reference
denial. Tests use real PostgreSQL WASM with fixture Auth/Storage schemas. They
do not replace live Storage/Auth and concurrent E2E, which remain pending.

The app's image proxy uses current authorization and no-store. Directly issued
Supabase signed URLs can remain valid until expiry; no blanket immediate URL
revocation guarantee is made. The application itself does not mint signed URLs.

Migration timestamps still need reconciliation with connector-generated hosted
versions before any CLI push. No migration-history repair has been performed.
