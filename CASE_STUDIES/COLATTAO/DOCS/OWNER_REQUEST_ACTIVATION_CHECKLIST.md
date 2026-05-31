# Owner Request Activation Checklist

Use this checklist before enabling live owner request storage.

## 1) Supabase Project Setup
- Create a dedicated Supabase project for Colattao owner requests.
- Confirm project region and access are set for your team.
- Do not place service-role keys in client-side code or public docs.

## 2) Run SQL Schema
- Open Supabase SQL Editor.
- Run [`supabase/owner_requests_schema.sql`](/C:/Users/antho/OneDrive/Desktop/Colattao%20Rush/supabase/owner_requests_schema.sql).
- Confirm execution completes without errors.

## 3) Confirm `owner_requests` Table Exists
- In Supabase Table Editor, verify `owner_requests` exists.
- Verify expected columns, constraints, and timestamps are present.

## 4) Confirm RLS Is Enabled
- In Supabase, open the `owner_requests` table settings.
- Confirm Row Level Security (RLS) is enabled.

## 5) Confirm No Public Read Policy Exists
- Review all RLS policies on `owner_requests`.
- Confirm there is no policy granting anonymous/public read access.
- Confirm there is no broad authenticated read policy unless explicitly required.

## 6) Confirm Service-Role-Only Write Path
- Confirm app writes occur through server-side route logic only.
- Confirm service role key is only used on the server (`src/lib/supabaseServer.ts`).
- Confirm no browser-exposed key can write to `owner_requests`.

## 7) Add Vercel Environment Variables
In Vercel Project Settings -> Environment Variables, add:
- `REQUESTS_DB_ENABLED=true`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_OWNER_REQUEST_DEMO_CODE`

Notes:
- Use the exact key names above.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code.

## 8) Redeploy Vercel
- Trigger a new deployment after env vars are set.
- Wait for deploy status to become successful.

## 9) Test Wrong Access Code
- Open `/request-update`.
- Enter an incorrect code.
- Confirm message appears: `Código incorrecto. Inténtalo de nuevo.`
- Confirm form remains locked.

## 10) Test Correct Access Code
- Enter the configured demo code.
- Confirm form unlocks.

## 11) Submit a Test Request
- Submit one valid test request through the form.
- Confirm UI success response is returned.

## 12) Confirm Row Appears in Supabase
- Open `owner_requests` table.
- Confirm a new row exists with expected request fields and timestamps.

## 13) Confirm No Customer/Public Read Access
- Validate that public/anonymous users cannot list owner requests.
- Re-check policies if anything is unexpectedly readable.

## 14) Rollback Plan
If anything fails or security is uncertain:
- Set `REQUESTS_DB_ENABLED=false` in Vercel.
- Redeploy.
- Re-test `/request-update` to confirm fallback behavior.

## 15) Go / No-Go Signoff
Record decision before announcing live owner request storage:
- Supabase schema verified: Yes/No
- RLS/policies verified: Yes/No
- Env vars verified: Yes/No
- End-to-end submit verified: Yes/No
- Public read blocked verified: Yes/No
- Decision: `GO` or `NO-GO`
- Signoff by:
- Date:
