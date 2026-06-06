# Upload / Intake Integration Assessment — Fina Calle Client OS

Assessment only — **no implementation.** Locates existing owner-intake/upload code
and recommends how (if at all) it should feed the Client OS. Awaiting approval
before any code.

## 1. Files found & what each does

### Legacy reference — `CASE_STUDIES/COLATTAO/CODE_REFERENCE/`
| File | Role | Upload behavior |
|---|---|---|
| `src/components/OwnerRequestForm.tsx` | Bilingual owner request form | File input `image/*,.pdf`; client validates ≤10 files / 4 MB total; honeypot; **previews names, posts to API** (no client storage) |
| `src/app/api/owner-requests/route.ts` | Owner-request API | **Production-grade:** validates types (jpeg/png/webp/gif/heic/heif/pdf), **8 MB/file**, **sanitizes filenames**, honeypot, env-gated (503 if unconfigured), **stores files in Vercel Blob** (public, random suffix), **emails owner via Resend** with file links, partial-failure tolerant |
| `src/components/FeedbackBox.tsx` | Feedback widget | Uses FormData for **text** feedback — **not** a file uploader |

### Live app — `APP/web/src/`
| File | Role | Upload behavior |
|---|---|---|
| `src/lib/owner/actions.ts` → `uploadItemImage()` | Menu photo upload | **Real Supabase Storage upload** (`menu-images`), types png/jpeg/webp, 4 MB, **ownership-checked** (`getOwnerContext`+RLS), writes `photo_url` via the **audited rail** (`apply_owner_change`) |
| `src/components/CustomerRequestForm.tsx` | Public intake form | File input `image/*,.pdf`, ≤10 / 4 MB, honeypot; **previews only** |
| `src/app/api/customer-requests/route.ts` | Intake API (Phase B) | Validates files, **persists request text** (`submit_change_request`), emails via Resend-over-fetch; **files validated but NOT stored** |
| `src/lib/requests/intake.ts` | Persist + email helpers | No file storage |

## 2. Stores / validates / sends / previews?

| Capability | Legacy owner-requests | Live menu-photo upload | Live customer-requests |
|---|---|---|---|
| Stores files | ✅ Vercel Blob (public) | ✅ Supabase Storage | ❌ validate only |
| Validates type | ✅ images+pdf | ✅ png/jpeg/webp | ✅ images+pdf |
| Max size | 8 MB/file | 4 MB/file | 4 MB total |
| Filename sanitization | ✅ `sanitizeFilename` | n/a (path = id+timestamp) | n/a |
| Sends/email | ✅ Resend + links | n/a | ✅ Resend (fetch) |
| Auth/ownership | ❌ public | ✅ owner + RLS | ❌ public |
| Audit log | ❌ | ✅ `apply_owner_change` | n/a |
| Preview | ✅ filenames | n/a | ✅ filenames |

## 3. Dependencies & production-safety
- **Legacy** depends on `@vercel/blob` + `resend` SDK and env `BLOB_READ_WRITE_TOKEN`,
  `OWNER_NOTIFICATION_EMAIL`, `FROM_EMAIL`. **None are in the live app**
  (`package.json` has neither Blob nor Resend SDK; Phase B emails via `fetch`).
  It's production-grade but a **separate storage stack** and stores to a **public**
  bucket (fine for menu/marketing images, **not** for sensitive attachments).
- **Live menu upload** is production-safe and already integrated with the Client OS
  auth + RLS + audit on **Supabase Storage** — this is the canonical pattern.

## 4. Comparison vs the built Supabase Storage path
The live `uploadItemImage()` is **better architected** for the Client OS than the
legacy route: same-stack storage, ownership-scoped, audit-logged, no extra secret.
The legacy route's *value* is its **robustness details** — type allowlist, filename
sanitization, partial-failure tolerance, and email-with-links — which the live path
can borrow.

## 5. Recommendation — **standardize on Supabase Storage; keep legacy as reference**
Do **not** adopt Vercel Blob (would add a second storage system, a second secret,
and divergent ACLs). Instead:

| Need | Path |
|---|---|
| Menu item photo | ✅ already live (`uploadItemImage`) — keep |
| Logo / banner (owner brand) | **Refactor** `uploadItemImage` into a shared `uploadImage()` util; add a `brand-assets` bucket; owner action via the audited rail |
| Owner onboarding / Colattao asset intake / future setup | Reuse the same shared util |
| Customer request attachments | **Re-implement on Supabase Storage** (private bucket) using the legacy route as the *reference* for validation/sanitization/partial-failure/email-links — **defer** (needs a `request_files` migration, currently blocked) |

So: **refactor into a shared upload component** for menu+brand now; **keep legacy as
reference** for the (later) attachment flow; **replace** any Blob notion with Supabase.

## 6. Safe upload rules
- **Types:** PNG/WebP/JPEG for images; logos prefer PNG (alpha); PDF only for request
  attachments (never menu/brand). Avoid gif/heic unless a real need appears.
- **Max size:** 4 MB images (match live); up to 8 MB allowed for brand/logo if needed.
- **Filename:** never trust the raw name — build the path as
  `{restaurantId}/{kind}/{id-or-timestamp}-{rand}.{ext}` (legacy `sanitizeFilename`
  is a good reference for any user-visible name).
- **Storage destination:** Supabase Storage buckets — `menu-images` (exists, public),
  `brand-assets` (public), `request-attachments` (**private**, signed URLs).
- **Permissions:** owner uploads gated by `getOwnerContext` + RLS (own restaurant
  only); admin/onboarding via the admin gate; anonymous request attachments must use
  a validated server path + private bucket + strict caps (abuse surface).
- **Audit:** brand/menu writes go through `apply_owner_change`; attachments recorded
  in `change_requests` / a future `request_files` table.

## 7. Risks
- Two storage systems (Blob + Supabase) = complexity + extra secret → avoid.
- Public bucket misuse for sensitive docs → request attachments must be **private**.
- Anonymous attachment upload = abuse/DoS vector → rate-limit, size caps, private bucket, no direct table write.
- Porting legacy "email links" verbatim would leak **public** URLs — attachments need **signed** URLs.
- Adding `@vercel/blob`/`resend` SDK unnecessarily widens the dependency surface.

## 8. Required changes (when approved)
1. Refactor `uploadItemImage` → shared `uploadImage({ restaurantId, kind, file })`.
2. Create `brand-assets` bucket (+ policy) in the Supabase **dashboard** (no repo migration).
3. Owner brand/logo/banner upload action via the shared util + audited rail; surface in the dashboard.
4. **Defer** request-attachment storage (needs a `request_files` migration — blocked while migrations are paused).
5. Keep legacy code as reference; do **not** wire Vercel Blob.

## 9. Safest next implementation prompt (for when approved)
> Refactor the existing Supabase menu-photo upload (`uploadItemImage`) into a shared
> `uploadImage()` helper, then add an owner-only **logo/banner upload** to the owner
> dashboard using a new public `brand-assets` Supabase Storage bucket, written
> through the audited `apply_owner_change` rail. Reuse the legacy
> `CODE_REFERENCE/api/owner-requests` route only as a reference for type allowlist +
> filename sanitization + partial-failure handling. No Vercel Blob, no Resend SDK,
> no new repo migration (bucket is created in the Supabase dashboard), no second
> restaurant, no changes to `/conquest`, payment, auth model, or registry data.
> Run lint/build, commit, push.

Defer customer-request **attachment storage** to a later phase (it needs a
`request_files` migration, currently blocked).
