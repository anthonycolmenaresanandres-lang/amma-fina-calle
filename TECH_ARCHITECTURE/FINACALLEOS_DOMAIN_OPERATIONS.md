# finacalleos.com Domain Operations Status

Date checked: 2026-06-06

## Scope

Custom domain connection verification and canonical-domain finalization for the Vercel project `amma-fina-calle`.

Protected surfaces:
- No app code changes.
- No DNS changes made from this repo.
- No redeploy from `main`.
- No Stripe, POS, AI automation, QR generation, `/conquest`, secrets, or customer data changes.

## Current Production Baseline

- Canonical production domain: `https://finacalleos.com`
- `www` redirect: `https://www.finacalleos.com` redirects to `https://finacalleos.com`
- Vercel production alias: `https://amma-fina-calle.vercel.app`
- Known-good deployment currently aliased: `https://amma-fina-calle-qen022cmr.vercel.app`
- Project link verified in `APP/web/.vercel/project.json`:
  - project name: `amma-fina-calle`
  - project id: `prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4`

## Vercel Domain Status

Project domain list shows these domains attached to `amma-fina-calle`:

| Domain | Attached to project | Vercel verified field | Redirect |
| --- | --- | --- | --- |
| `finacalleos.com` | yes | `true` | none |
| `www.finacalleos.com` | yes | `true` | `finacalleos.com`, status `308` |
| `amma-fina-calle.vercel.app` | yes | `true` | none |

Vercel domain config API reports:

| Domain | configuredBy | misconfigured | Detected value |
| --- | --- | --- | --- |
| `finacalleos.com` | `A` | `false` | `76.76.21.21` |
| `www.finacalleos.com` | `CNAME` | `false` | `cname.vercel-dns.com.` |

## Public DNS Detected

Checks were performed with the default resolver, Cloudflare `1.1.1.1`, and Google `8.8.8.8`.

| Hostname | Record detected | Result |
| --- | --- | --- |
| `finacalleos.com` | `A 76.76.21.21` | Correct for Vercel |
| `www.finacalleos.com` | `CNAME cname.vercel-dns.com` | Correct for Vercel |

Cloudflare DNS appears propagated for both root and `www`.

## Cloudflare Status

Detected nameservers:
- `lilyana.ns.cloudflare.com`
- `roman.ns.cloudflare.com`

Recommended Cloudflare proxy status remains DNS-only / gray cloud while Vercel owns SSL and routing.

## SSL Status

SSL is live.

Directly verified:
- `vercel certs list` shows certificates for `finacalleos.com` and `www.finacalleos.com`, both auto-renewing and expiring in 90 days.
- `https://finacalleos.com` returns `200 OK` with `Strict-Transport-Security`.
- `https://www.finacalleos.com` returns `308 Permanent Redirect` with `Strict-Transport-Security`.
- TLS certificate probe verified Let's Encrypt certificates for both domains.

## HTTPS Route Verification

| URL | Status | Evidence |
| --- | --- | --- |
| `https://finacalleos.com` | 200 | loads root page |
| `https://www.finacalleos.com` | 308 | redirects to `https://finacalleos.com/` |
| `https://www.finacalleos.com/m/colattao` | 308 | redirects to `https://finacalleos.com/m/colattao` |
| `https://finacalleos.com/m/colattao` | 200 | signals: `Colattao`, `Espresso`, `Almond Croissant` |
| `https://finacalleos.com/owner/colattao` | 200 | signals: `Colattao`, `Owner Sign-In`, `Email` |
| `https://finacalleos.com/customers` | 200 | signals: `Admin Sign-In`, `Email` |
| `https://finacalleos.com/customers/colattao` | 200 | signals: `Colattao`, `Admin Sign-In`, `Email` |

## Redirect Behavior

- Root is canonical: `https://finacalleos.com` returns `200 OK`.
- `www` redirects to root with `308 Permanent Redirect`.
- Path preservation verified: `https://www.finacalleos.com/m/colattao` redirects to `https://finacalleos.com/m/colattao`.

## Remaining Blockers

No DNS, SSL, route, or redirect blocker remains for the checked custom domain operation.

Operational blocker still open:
- Main branch redeploy risk remains documented: current `origin/main` does not contain the full Client OS dynamic route set that is live in the promoted known-good deployment.

## Main Branch Redeploy Risk Verification

Date checked: 2026-06-06

Current status:
- `origin/main` contains `/`, `/request-update`, `/customers`, and `/customers/colattao`.
- `origin/main` does not contain the full live Client OS route set.
- Live Client OS route set exists on remote branch `origin/claude/restaurant-owner-page-status-TUOJ6` at commit `48f49f8`.

Missing or incompatible route-set files on `origin/main`:
- `APP/web/src/app/m/[id]/page.tsx`
- `APP/web/src/app/owner/[id]/page.tsx`
- `APP/web/src/app/owner/[id]/OwnerDashboard.tsx`
- `APP/web/src/app/owner/[id]/OwnerLogin.tsx`
- `APP/web/src/app/owner/[id]/auth/callback/route.ts`
- `APP/web/src/app/owner/[id]/signout/route.ts`
- `APP/web/src/app/customers/AdminGate.tsx`
- `APP/web/src/app/customers/AdminLogin.tsx`
- `APP/web/src/app/customers/auth/callback/route.ts`
- `APP/web/src/app/customers/signout/route.ts`
- `APP/web/src/lib/admin/*`
- `APP/web/src/lib/owner/*`
- `APP/web/src/lib/requests/*`
- `APP/web/src/lib/storage/uploadImage.ts`
- `APP/web/src/lib/supabase/config.ts`
- Supabase migrations `APP/web/supabase/migrations/0001` through `0004`
- `APP/web/supabase/seed.sql`

Compatibility files needed with the Client OS route set:
- Update `APP/web/package.json` and `APP/web/package-lock.json`.
- Update `APP/web/src/app/api/customer-requests/route.ts`.
- Update `APP/web/src/app/request-update/page.tsx`.
- Update `APP/web/src/app/customers/page.tsx`.
- Update `APP/web/src/app/customers/[id]/page.tsx`.
- Update `APP/web/src/data/customers.ts`.
- Update `APP/web/src/lib/supabase/server.ts`.
- Remove stale main-only file `APP/web/src/app/customers/layout.tsx`.
- Remove stale main-only file `APP/web/src/lib/auth/internal-admin.ts`.

Build verification:
- A temporary worktree from `origin/main` was created.
- The minimal Client OS route-set import above was applied from `origin/claude/restaurant-owner-page-status-TUOJ6`.
- `npm.cmd install --prefix APP/web` was run inside the temporary worktree only.
- `npm.cmd run build --prefix APP/web` passed.
- Verified build routes included:
  - `/`
  - `/request-update`
  - `/m/[id]`
  - `/owner/[id]`
  - `/customers`
  - `/customers/[id]`

Recommended PR path:
1. Create a branch from `origin/main`.
2. Apply only the minimal route-set and compatibility files listed above from `origin/claude/restaurant-owner-page-status-TUOJ6`.
3. Build with `npm.cmd run build` from `APP/web`.
4. Open a PR to `main`.
5. Do not deploy production until the PR is reviewed and the known-good route set is preserved on `main`.

## Safe Primary-Domain Recommendation

Root canonicalization is complete and verified.

`https://finacalleos.com` is safe as the canonical production domain from a DNS, SSL, route-health, and redirect standpoint.

Do not redeploy from current `main` until the Client OS route-set risk is resolved.

## Next Action

Commit this docs-only redeploy-risk update if desired.

Separate next engineering action:
- Create the minimal Client OS route-set PR described above.
- Do not redeploy production from GitHub `main` until that PR is merged and verified.
