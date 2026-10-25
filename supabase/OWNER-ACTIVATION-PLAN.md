# Owner activation proposal — not executed

Target only: apkfyxfmsndwqjfetdad (stagepartners-cms).
Intended initial owner: info@stagepartners.co.jp.

Read-only dashboard findings on 2026-10-24 UTC: Site URL is
http://localhost:3000, no Redirect URLs are registered, custom SMTP is disabled,
and standard email templates are in use. No setting or credential was changed.
The Auth users grid showed no users; its estimated footer was inconsistent.

The implemented /auth/callback supports standard invite/recovery fragments and
PKCE code exchange; template edits are unnecessary. It clears credentials from
the address bar, requires a confirmation click, verifies through Supabase, and
uses fixed local redirects and HttpOnly cookies. It does not assign CMS roles.

Minimum activation sequence requiring approval:
1. Confirm delivery through an approved SMTP provider and recipient. Default
   Supabase delivery has recipient restrictions; do not grant organization
   membership merely to bypass them. No SMTP credentials acquired.
2. Confirm a working callback URL and approve this project's Site URL / exact
   redirect allowlist. Local http://127.0.0.1:3102/auth/callback is only usable
   after the local dev server is started on the recipient's computer; it is
   currently stopped. Do not send an unusable localhost link to another device.
3. Send one standard dashboard invite to the intended owner after approval.
   The recipient enters/sets their own password, never through chat.
4. Read the resulting verified Auth user UUID through a trusted administration
   channel. Explicitly grant that exact UUID owner status in cms_members after
   authorization; do not infer owner privileges from email text/user_metadata.
5. Perform real login, permission, draft/publish/restore and Storage tests.

For later CMS invitations, see INTEGRATION-ACTIVATION.md. Server-secret
configuration is separately approved and confined to ignored local environment
or an approved server secret store, never the public repository or browser.
No invite, owner grant, password action, privileged key storage or live E2E has
been performed by this executor.
