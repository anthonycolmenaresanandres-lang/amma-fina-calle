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

## Safe Primary-Domain Recommendation

Root canonicalization is complete and verified.

`https://finacalleos.com` is safe as the canonical production domain from a DNS, SSL, route-health, and redirect standpoint.

Do not redeploy from current `main` until the Client OS route-set risk is resolved.

## Next Action

Commit this docs-only domain operations update if desired.

Separate next engineering action:
- Resolve the main-branch redeploy risk by merging or otherwise preserving the live Client OS dynamic route set before any future production redeploy from GitHub main.
