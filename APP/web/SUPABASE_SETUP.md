# Supabase Setup — Owner Portal Foundation (Pass 001)

The owner portal (`/owner/[id]`) and public menu (`/m/[id]`) run on Supabase.
The app builds and runs **without** Supabase configured — those two routes show a
"setup needed" notice and nothing else breaks. Follow these steps to turn it on.

## 1. Create the Supabase project
1. Create a project at https://supabase.com.
2. Copy the **Project URL** and the **anon/public** API key (Project Settings → API).

## 2. Apply the schema
In the Supabase **SQL Editor**, run, in order:
1. `supabase/migrations/0001_owner_portal_foundation.sql` — tables, RLS, the
   `apply_owner_change` audited write rail, and the public read function.
2. `supabase/migrations/0002_change_requests_intake.sql` — intake columns + the
   `submit_change_request` RPC used to persist public change requests.
3. `supabase/migrations/0003_customer_registry_reads.sql` — read functions for
   the `/customers` registry.
4. `supabase/migrations/0004_admin_gating.sql` — `admin_emails` table + admin
   allowlist functions; locks the registry reads to admins and revokes anon.
5. `supabase/seed.sql` — seeds the Colattao restaurant + a starter menu and one
   authorized owner email.

> `/customers` and `/customers/[id]` are admin-gated: only emails in
> `admin_emails` can sign in (via the same magic link) and read the registry.
> `0004` seeds `anthonycolmenaresanandres@gmail.com` as the first admin.

> Edit `supabase/seed.sql` first if you want a different owner email. Only emails
> in `owner_emails` can sign in for a restaurant.

## 3. Enable email magic links
In **Authentication → Providers → Email**, enable email sign-in and "Email OTP /
magic link." Add your deployed domain under **Authentication → URL Configuration →
Redirect URLs**, including `https://YOUR_DOMAIN/owner/*`.

## 4. Create the storage buckets
In **Storage**, create a **public** bucket named `menu-images` (owner menu photos).
Add an insert/update policy for the `authenticated` role so signed-in owners can
upload. (Public read is fine — menu photos are public.)

```sql
create policy "authenticated upload menu-images" on storage.objects
  for insert to authenticated with check (bucket_id = 'menu-images');
create policy "authenticated update menu-images" on storage.objects
  for update to authenticated using (bucket_id = 'menu-images');
```

**Optional — brand assets:** to enable logo/banner/brand uploads later, also create
a **public** bucket named `brand-assets` with the same two policies (swap the bucket
id). The shared uploader (`src/lib/storage/uploadImage.ts`, `BRAND_ASSET_BUCKET`)
targets it. Not required until a brand-upload UI is wired.

### Shared image uploader
`uploadImage({ bucket, keyPrefix, file, name })` (`src/lib/storage/uploadImage.ts`)
is the one place image uploads go through. It validates type (PNG/WebP/JPEG) and
size (≤4 MB), sanitizes the name (never trusts the raw filename), uploads under a
collision-resistant key, and returns `{ path, publicUrl }`. Callers add their own
authorization. Example for a future brand upload:

```ts
const { publicUrl } = await uploadImage({
  bucket: BRAND_ASSET_BUCKET,
  keyPrefix: `${restaurantId}/brand`,
  name: "logo",
  file,
});
```

## 5. Set environment variables
Locally, copy `.env.example` to `.env.local`; in production, set the same in Vercel
(Project → Settings → Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (your production origin, e.g. `https://your-app.vercel.app`)

Optional (Phase B — change-request notifications; intake still works without them):

- `RESEND_API_KEY` — Resend API key (server-only secret).
- `REQUESTS_NOTIFICATION_EMAIL` — inbox that receives new requests.
- `REQUESTS_FROM_EMAIL` — verified Resend sender.

With Supabase set, change requests from `/request-update` are saved to the
`change_requests` table (via the `submit_change_request` RPC, so no direct insert
policy is exposed). With the Resend vars also set, each request is emailed to your
inbox. The API response reports `persistenceActive` / `emailActive` honestly.

## 6. Verify
- `/m/colattao` → public menu renders from the database (read-only).
- `/owner/colattao` → enter the authorized email → receive a sign-in link → land on
  the dashboard → edit an item price → confirm it changes on `/m/colattao` and a row
  appears in **Change history**.

## Security model (how the rails are locked)
- **Auth:** Supabase email magic link. No passwords stored.
- **Allowlist:** sign-in only for emails in `owner_emails`; the login step uses a
  boolean-only RPC, so emails cannot be enumerated.
- **Authorization:** the signed-in email must own the restaurant in the URL.
- **RLS:** owners can only read their own restaurant's rows. No direct write grants.
- **Write rail:** the only mutation path is `apply_owner_change`, which re-checks
  ownership, enforces an editable-field allowlist, and writes the change + audit row
  in one transaction.
- **Public reads:** `get_public_menu` exposes only safe menu columns — never owner
  contact info or notes.
- **No service-role key** is used by the app, so there is no god-key to leak.
