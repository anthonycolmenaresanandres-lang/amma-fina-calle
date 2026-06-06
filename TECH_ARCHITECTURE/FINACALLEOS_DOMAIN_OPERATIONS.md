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

No DNS, SSL, route, redirect, or main-branch route-preservation blocker remains for the checked custom domain operation.

## Main Branch Redeploy Risk Verification

Date checked: 2026-06-06

Final status:
- PR #2 was reviewed and merged into `main`.
- Merge commit: `fbad670caaefb77507e6f5195a0e0c4ddd3ded7f`.
- Local `main` was fast-forwarded to latest `origin/main` after merge.
- `origin/main` now contains the full live Client OS route set needed for future redeploys.

Required route files verified on `main` after pull:
- `APP/web/src/app/page.tsx`
- `APP/web/src/app/request-update/page.tsx`
- `APP/web/src/app/m/[id]/page.tsx`
- `APP/web/src/app/owner/[id]/page.tsx`
- `APP/web/src/app/customers/page.tsx`
- `APP/web/src/app/customers/[id]/page.tsx`

Stale main-only conflict files verified removed:
- `APP/web/src/app/customers/layout.tsx`
- `APP/web/src/lib/auth/internal-admin.ts`

Final build verification from `main`:
- Command: `npm.cmd run build --prefix APP/web`
- Result: passed.
- Verified build routes included:
  - `/`
  - `/request-update`
  - `/m/[id]`
  - `/owner/[id]`
  - `/customers`
  - `/customers/[id]`

Production redeploy status:
- A future production redeploy from current `main` is now safe from the previously documented missing-route risk.
- No production redeploy was performed during this verification.

## Safe Primary-Domain Recommendation

Root canonicalization is complete and verified.

`https://finacalleos.com` is safe as the canonical production domain from a DNS, SSL, route-health, and redirect standpoint.

Current `main` is safe from the previously documented missing-route redeploy risk. Do not redeploy production unless a deployment is explicitly requested and verified.

## Next Action

Final docs-only redeploy-risk update recorded after PR #2 merge and final main build verification.

Separate next engineering action:
- No route-preservation action remains.
- If production redeploy is requested later, run a fresh build and route verification first.

