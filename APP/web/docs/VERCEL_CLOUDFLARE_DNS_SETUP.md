# Vercel Cloudflare DNS Setup for Fina Calle OS

## Status

`finacalleos.com` has been purchased in Cloudflare. DNS connection is pending manual Cloudflare record entry by Anthony.

No Cloudflare DNS records were changed by Codex.

## Vercel Project

- Project name: `amma-fina-calle`
- Project owner scope: `anthonycolmenaresanandres-8844's projects`
- Root directory: `APP/web`
- Framework: Next.js
- Current production Vercel alias: `https://amma-fina-calle.vercel.app`
- Current production deployment inspected: `https://amma-fina-calle-qen022cmr.vercel.app`
- Production deployment status: Ready

## Domains Being Connected

- `finacalleos.com`
- `www.finacalleos.com`

Both domains were added to the confirmed Vercel project `amma-fina-calle` on June 6, 2026. Vercel reports both as third-party domains using Cloudflare nameservers:

- `lilyana.ns.cloudflare.com`
- `roman.ns.cloudflare.com`

## Exact Cloudflare DNS Records

Enter these records manually in Cloudflare DNS.

| Type | Name | Value / Target | TTL | Proxy Status |
| --- | --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | Auto | DNS only |
| A | `www` | `76.76.21.21` | Auto | DNS only |

Notes:

- Vercel's CLI output specifically recommended `A finacalleos.com 76.76.21.21`.
- Vercel's CLI output specifically recommended `A www.finacalleos.com 76.76.21.21`.
- Keep Cloudflare proxy disabled until Vercel verifies the domains and issues SSL successfully.
- Do not switch Cloudflare nameservers to Vercel. The current plan keeps Cloudflare as DNS provider.

## Vercel Verification State

`finacalleos.com`:

- Added to Vercel project: yes.
- Vercel status: not configured properly / pending DNS record.
- Required DNS record: `A finacalleos.com 76.76.21.21`.
- TXT verification record required by Vercel CLI: none shown.

`www.finacalleos.com`:

- Added to Vercel project: yes.
- Vercel status: not configured properly / pending DNS record.
- Required DNS record: `A www.finacalleos.com 76.76.21.21`.
- TXT verification record required by Vercel CLI: none shown.

Vercel indicated it will run verification after the records are set and will send an email upon completion.

## Recommended Redirect

Final recommended canonical routing:

- `finacalleos.com` is the canonical domain.
- `www.finacalleos.com` redirects to `finacalleos.com`.

Do not configure this redirect until both domains verify in Vercel. After verification, set the redirect in Vercel's project domain settings or routing configuration so `www.finacalleos.com` permanently redirects to `finacalleos.com`.

## Manual Cloudflare Steps for Anthony

1. Sign in to Cloudflare.
2. Open the `finacalleos.com` zone.
3. Confirm WHOIS/domain privacy remains enabled.
4. Go to DNS > Records.
5. Add or update the apex/root record:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   - TTL: Auto
   - Proxy status: DNS only
6. Add or update the `www` record:
   - Type: `A`
   - Name: `www`
   - Value: `76.76.21.21`
   - TTL: Auto
   - Proxy status: DNS only
7. Save the records.
8. Return to Vercel and re-check domain verification for both domains.
9. Wait for Vercel SSL issuance.
10. After both domains are verified, configure `www.finacalleos.com` to redirect to `finacalleos.com`.

## Guardrails

- Do not purchase domains.
- Do not expose Cloudflare or Vercel credentials.
- Do not print tokens, API keys, or auth values.
- Do not change Cloudflare DNS from Codex.
- Do not modify app code for this DNS setup task.
- Keep Cloudflare proxy set to DNS only until Vercel verification and SSL are complete.
