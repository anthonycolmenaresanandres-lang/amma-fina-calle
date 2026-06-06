# finacalleos.com — Domain Integration Plan (Assets + Operations)

We own **finacalleos.com**. This is the production domain-lock (runbook gap G1)
that unblocks production deploy, QR generation, and OG images. Planning/ops only —
no app code change is required to adopt the domain (it's env + DNS + dashboard
config). The app already reads `NEXT_PUBLIC_APP_URL` for magic-link redirects, so
pointing everything at the domain is configuration, not a rewrite.

## 1. What the domain unblocks
- **Production URL** for the Client OS (currently only branch previews exist).
- **Stable QR targets** — `finacalleos.com/m/colattao` (public) and
  `finacalleos.com/owner/colattao` (owner). QR codes can finally be generated +
  printed without reprint risk.
- **Branded email** — `requests@finacalleos.com` (Resend) and auth emails from the
  domain (fixes deliverability gap G2).
- **OG/social** previews on a real domain.

## 2. URL architecture (recommended)
Keep the **path-based** structure already built — it needs zero new code:

| Surface | URL |
|---|---|
| Parent / marketing | `https://finacalleos.com/` (AMMA/Fina Calle, client-agnostic) |
| Intake funnel | `https://finacalleos.com/request-update` |
| Public menu | `https://finacalleos.com/m/{id}` → `…/m/colattao` |
| Owner portal | `https://finacalleos.com/owner/{id}` → `…/owner/colattao` |
| Admin registry | `https://finacalleos.com/customers` |

- **Canonical host:** pick **apex `finacalleos.com`** as canonical and 301 `www`
  → apex (or the reverse — just be consistent). Set it once; QR/OG depend on it.
- **Per-restaurant subdomains** (`colattao.finacalleos.com`) are a *future* option —
  nicer branding but needs wildcard DNS + a proxy rewrite layer + per-tenant
  resolution. **Not now.** Path-based ships today; revisit subdomains post-scale.

## 3. Vercel setup (production)
1. **Merge PR #1 → `main`** so production reflects the Client OS (production tracks `main`).
2. Vercel → project **amma-fina-calle** → **Settings → Domains** → add
   `finacalleos.com` (and `www.finacalleos.com`), set the canonical + redirect.
3. Add the DNS records Vercel shows at your registrar (apex `A`/`ALIAS` + `www`
   `CNAME`). SSL is automatic once DNS resolves.

## 4. Environment variables
- Set **`NEXT_PUBLIC_APP_URL=https://finacalleos.com`** in Vercel (Production).
  This makes magic-link redirects + any absolute URLs canonical regardless of host.
- `NEXT_PUBLIC_APP_URL` is build-time inlined → **redeploy** after setting it.
- Keep `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` as-is.

## 5. Supabase Auth URLs
Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://finacalleos.com`.
- **Redirect URLs:** add `https://finacalleos.com/**` (covers
  `/owner/*/auth/callback` and `/customers/auth/callback`). Keep the preview
  `*.vercel.app/**` entry if you still test on previews.

## 6. Email + DNS (deliverability — gap G2)
- **Resend (request notifications):** add `finacalleos.com` as a Resend domain,
  add the **SPF/DKIM** records at the registrar, verify, then set
  `REQUESTS_FROM_EMAIL="Fina Calle OS <requests@finacalleos.com>"`.
- **Auth emails (magic links):** Supabase default email is rate-limited/unbranded.
  Configure **custom SMTP** (Resend SMTP or similar) under Supabase → Auth → SMTP,
  sending from e.g. `auth@finacalleos.com`, so owner/admin sign-in links are
  reliable and branded.
- Add a **DMARC** record (`p=none` to start) once SPF/DKIM pass.

## 7. QR + OG (now unblocked)
- Generate the two Colattao QR codes encoding the **final** URLs:
  `https://finacalleos.com/m/colattao` (public) and
  `https://finacalleos.com/owner/colattao` (owner). Specs in
  `APP/COLATTAO_QR_AND_OG_PLAN.md` (ECC H, matte, scan-test).
- Create the OG image `colattao-og-1200x630-v1.png`; wire later via the brand
  resolver. Update `ASSET_REGISTRY/COLATTAO/QR_DESTINATIONS.md` with the new
  verified destinations and mark the old `cafe-rush` ones superseded.

## 8. Assets / registry alignment
- Brand chrome already lives in `public/assets/colattao/` (domain-agnostic — no change).
- New domain-bound assets: QR posters + OG image (per §7).
- Record the canonical domain in the asset/destination registries so future
  restaurants inherit `finacalleos.com/m/{id}` + `/owner/{id}` by default.

## 9. Operations
- **Redirects:** `www` ↔ apex 301 (Vercel handles); ensure no mixed-canonical.
- **SSL:** automatic via Vercel; confirm the padlock on all routes.
- **Old destinations:** the legacy `colattao-cafe-rush.vercel.app` stays as the
  current `site_url`; decide later whether to redirect/retire it (out of scope now).
- **Monitoring/analytics:** optional later; avoid fake analytics per the infra guardrails.

## 10. Execution sequence & owners
1. **Anthony:** finish the Supabase migrations + Colattao verification on preview (in progress).
2. **Anthony:** merge PR #1 → `main`; add `finacalleos.com` in Vercel + DNS.
3. **Anthony:** set `NEXT_PUBLIC_APP_URL=https://finacalleos.com`; redeploy.
4. **Anthony:** update Supabase Auth Site/Redirect URLs to the domain.
5. **Anthony:** verify Resend domain + (optional) Supabase SMTP DNS.
6. **Anthony:** confirm `/m/colattao`, `/owner/colattao` sign-in, `/customers` on the live domain.
7. **Claude:** once the domain is live + verified, generate QR codes + OG image and
   update the destination registry; you print + mount.

## 11. Decision points (pick before QR print)
- **Canonical host:** apex `finacalleos.com` (recommended) vs `www`.
- **Subdomains later?** path-based now; subdomain per restaurant deferred.
- **Auth email sender:** confirm `auth@finacalleos.com` (needs SMTP) vs Supabase default for launch.

No code change is required to adopt the domain — it's merge + DNS + env + dashboard
config. QR/OG generation waits until the domain is live and Colattao is verified.
