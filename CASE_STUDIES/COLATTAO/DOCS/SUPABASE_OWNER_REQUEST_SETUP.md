# Supabase Owner Request Setup
This setup enables live database saving for `/request-update` Phase 1.

## 1. Create a Supabase Project
1. Go to Supabase and create a new project.
2. Wait until the database is ready.

## 2. Run the SQL Schema
1. Open the Supabase SQL Editor.
2. Paste and run:
   - `supabase/owner_requests_schema.sql`
3. Confirm table creation:
   - `public.owner_requests`
4. Confirm RLS is enabled on `owner_requests`.

## 3. Get Required Supabase Values
From project settings/API, copy:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Important:
- Never expose the service role key to the browser.
- Use it only in server-side code (API route / server helpers).

## 4. Configure Vercel Environment Variables
Set these variables in Vercel for the deployed project:

- `REQUESTS_DB_ENABLED=true`
- `SUPABASE_URL=<your-supabase-url>`
- `SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>`
- `NEXT_PUBLIC_OWNER_REQUEST_DEMO_CODE=<your-demo-code>` (optional; defaults to `COLATTAO`)

Notes:
- If `REQUESTS_DB_ENABLED` is not `true`, the API returns a graceful demo fallback.
- If URL/key are missing, the API also falls back safely (no DB write).

## 5. Test Checklist
1. Deploy with env vars configured.
2. Open `/request-update`.
3. Enter owner access code:
   - from `NEXT_PUBLIC_OWNER_REQUEST_DEMO_CODE`
   - or fallback `COLATTAO`
4. Submit a valid request.
5. Verify a new row appears in `public.owner_requests`.
6. Submit with invalid payload (e.g. missing main request text) and verify API validation response.
7. Confirm no public table browsing from client roles (`anon`/`authenticated`).

## 6. Rollback / Safe Disable
To disable live DB saving without code changes:
- Set `REQUESTS_DB_ENABLED=false`

The form remains available in demo/fallback mode, and no DB writes occur.

