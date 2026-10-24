# Read-only deployment review

2026-10-24 UTC, authenticated Vercel project client-stagepartners-web,
team carrerleger55-5086s-projects, repository dotfound-labs/client-stagepartners-web.
Project ID prj_1RLL2YQzP7IpnuQhkuEJRa1e7x8V.

Environments settings explicitly show Production tracks main, with primary
domain www.stagepartners.co.jp. Preview tracks all unassigned git branches,
with no custom domains. Project Environment Variables displays
"No Environment Variables Added". No settings changed or values revealed.
The overview identifies production commit 220b25e9217308332ea41fb50697eb631128564d
and says pushing main updates Production. No repo CI workflows were found.

Thus feat/admin-cms is mapped to Preview rather than Production. A branch push
may start a Preview build. No push has yet been performed in this review.
No hosted migration or Auth operation is executed during build. Integrations
remain unconfigured. This observation does not authorize a production merge.

npm audit on the pinned checkout returned zero vulnerabilities. This describes
the new branch dependency graph, not an update to the deployed production code.

## First branch push verified

Commit 19e865d pushed successfully. GitHub deployment records verify two
integrations, both production_environment=false and success:
- client-stagepartners-web deployment 7302175078, Preview:
  https://client-stagepartners-2lnnl5g0y-carrerleger55-5086s-projects.vercel.app
- old stagepartners-hp1 deployment 7302184437, Preview:
  https://stagepartners-hp1-immg9atox-ryota-demo.vercel.app

The second integration was discovered in commit statuses after push. No
Production deployment is recorded for that commit. Draft PR creation through
GitHub connector failed with 403 Resource not accessible by integration; it has
not been retried through another identity. Required access is repository Pull
requests: write for that integration. Manual compare link:
https://github.com/dotfound-labs/client-stagepartners-web/compare/main...feat/admin-cms

## Authenticated Preview QA (5032b02)

The login prompt came from selecting a different Chrome session. The current
session containing the user's GitHub work opened the protected Preview without
changing protection or signing in again. Verified /admin shows disabled inputs
and the honest unconfigured notice, with noindex/nofollow metadata. Rendered
admin HTML contained no secret-key patterns (a bounded DOM check, not a claim
about every possible response). Works list has 30 items; news list has six.
At 390px the admin and settled public home have no horizontal overflow; the
mobile menu layout and home text remain readable. Temporary viewport reset.
Canonical points to the verified production domain; font preloads remain zero.
A literal ampersand entity in the home subtitle was found visually and corrected
in the next patch, with stable field identity and guarded seed-history repair.

## Reviewed fix Preview (e7a62c7)

Vercel deployment 62zqqtX5QmMgXehv4E5LPx89hcQw was visibly Ready in Preview,
source feat/admin-cms at e7a62c75c52af30dc58c09a5fbd0704ef8f10c13.
https://client-stagepartners-ht2z57tgq-carrerleger55-5086s-projects.vercel.app
Authenticated browser checks: home subtitle displays an ampersand, not a literal
entity; home, works, news and admin have noindex/nofollow. Works=30, news=6.
Admin input/button disabled with unconfigured notice; rendered HTML contains no
secret-key patterns. Local compiled client JavaScript: 29 files scanned, zero
server-secret identifiers/prefix matches. No secret values were printed.
No protection settings changed. No additional login or user handoff was needed.
