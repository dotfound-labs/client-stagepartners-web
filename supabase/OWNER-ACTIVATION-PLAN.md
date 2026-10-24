# Initial owner activation: proposal only, not executed

Target exclusively `apkfyxfmsndwqjfetdad`, intended owner `info@stagepartners.co.jp`.
The available Supabase connector has no Auth invitation/user-management action.
Do not insert passwords into auth.users or ask for one in chat.

The local development server was started on Shinya_PC at
`http://127.0.0.1:3102`. Read-only HTTP checks returned 200 for `/admin` and 307
for unauthenticated `/auth/set-password`. This is loopback only, not an Internet
preview URL. The user must open the email link on this same PC while the server
is running. Recheck reachability immediately before any approved send.

The code now provides `/auth/confirm` (explicit confirmation button, then server
verifyOtp) and `/auth/set-password` (verified session required, user privately
enters password). They have not been tested with a real invitation/token.

## Concrete approval package for parent

1. Read only the target project's Auth email/SMTP, URL and template settings in
   its authenticated dashboard. Dashboard login/SMTP state is not verified yet.
2. If the user agrees to use this PC for setup, approve setting this new project's
   temporary Site URL to `http://127.0.0.1:3102` and exact redirect allowlist entry
   `http://127.0.0.1:3102/auth/confirm`. No broad wildcard or production change.
3. Approve replacing the **Invite user** template link with
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`.
   Recovery needs the corresponding type=recovery template if later enabled.
4. Confirm email delivery eligibility first. Supabase's default SMTP only sends
   to organization team members. Do not add an organizational admin merely to
   bypass this restriction. If info@ is not eligible, approve a suitable existing
   SMTP sender/provider and configure its credentials directly in Supabase's
   private SMTP settings. No SMTP credentials in Git or chat. DNS/provider costs
   require their own concrete approval if needed.
5. After those checks and explicit send authorization, use dashboard
   Authentication → Users → Invite user to send **one** setup email to info@.
   Confirm the actual dashboard UI before acting. If outcome is uncertain, inspect
   Auth users/delivery logs rather than resending automatically.
6. User opens the email on this PC, confirms and privately sets their password.
   Parent reads the resulting UUID and email_confirmed_at from this project,
   checks exact intended email and that no owner exists, then performs a controlled
   transaction granting that verified UUID the initial active owner membership.
   Record an audit entry. No role is inferred from user_metadata or email alone.
7. User logs in. Run real E2E for edits, publication/restore, permissions, invites
   and Storage, using approved test accounts/data. No test credentials yet exist.

## Separate privileged configuration for validated uploads

The reviewed additional migration removes authenticated `finalize`. The server
must replace uploaded bytes with its Sharp-generated WebP and invoke the
service-only `cms_finalize_verified_media` RPC. This requires separately approved
`SUPABASE_SECRET_KEY` for **this project only**, stored initially in the existing
Git-ignored local `.env.local`, never NEXT_PUBLIC, source, logs or Library. No key
has been retrieved, issued or stored. Upload fails closed without it.

The service credential is broadly privileged in Supabase; application use is
restricted to the authenticated upload handler after current media read/edit
checks. It is not sent to the browser. A future hosted environment requires its
own private secret setting and approval; local setup is not deployment consent.

## Signed-image links

The application's proxy is no-store and applies current authorization. A user
with Storage SELECT may separately obtain a Supabase signed URL. Such a bearer
URL can remain usable until expiry after permissions are revoked. We do **not**
guarantee immediate revocation of every previously issued URL. No signed URL is
created by this app, but direct Storage issuance must be assessed in live QA.

Sources: https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail
https://supabase.com/docs/guides/auth/redirect-urls
https://supabase.com/docs/guides/auth/auth-smtp
