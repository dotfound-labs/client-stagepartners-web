# SEO settings work in progress

Saved for continuation without access to the original PC. Do not merge or deploy production.

## Implemented, not yet fully verified
- Common settings editor now includes site name, search title/description, canonical origin and indexing preference; existing company identity is reused.
- Added favicon and OGP image slots using existing original assets as defaults. Icon files moved from app to public to preserve URLs while allowing dynamic metadata.
- Published-only metadata, robots, sitemap, Organization/WebSite data and normalized image routes are connected to common settings.
- Common save validates fields and uploaded favicon dimensions. Existing draft/publish/history and permission model is retained.

## Database
- Nine prior migrations are applied to stagepartners-cms only.
- 20261025134033_cms_site_seo_settings.sql is LOCAL ONLY and NOT applied to hosted database. It updates the existing content validator for the new fields and slots; it does not create roles, change grants or publish content.
- Review/apply this migration through the authorized Supabase workflow before attempting real SEO draft save. Do not alter earlier migration bodies or operate other projects.

## Validation status
- TypeScript check passed during implementation.
- Local PGlite regression passed 41 tests after the migration generator fix. One additional SEO validation test was added afterward and has NOT yet been rerun.
- Full lint/build, SEO browser verification, hosted draft save/revisit and latest Preview verification remain pending.
- Live favicon.ico, icon.png and apple-icon.png returned HTTP 200; the reported missing browser/search icon was not reproduced or fully diagnosed.

## Resume
1. Install pinned dependencies with npm ci; install test dependencies with npm ci in supabase/tests.
2. Read AGENTS.md and relevant installed Next.js documentation.
3. Run database tests in supabase/tests, TypeScript, lint and build; add focused metadata and image-route regression coverage.
4. Review child-page metadata inheritance and Preview/admin noindex protection.
5. Coordinate the pending migration, then verify authenticated common-settings draft save and revisit without publishing or overwriting user changes.
6. Push only feat/admin-cms and inspect Preview results. PR #7 already exists; do not create another or merge.

Existing local admin URL: http://127.0.0.1:3102/admin, Settings > site information/SEO/common settings. Local server availability ends when the PC sleeps. Cloud continuation may use code and synthetic tests without secrets; it cannot assume an authenticated session or live configuration.

Do not copy .env.local, .env.web3forms-input, browser sessions, credentials or private data. Real integration tests require a separately authorized environment. Instagram live connection remains deferred. No additional emails are authorized by this checkpoint.
