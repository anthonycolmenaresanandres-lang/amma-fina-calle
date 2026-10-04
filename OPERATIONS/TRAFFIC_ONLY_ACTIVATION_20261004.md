# Traffic-only report activation - October 4, 2026

Anthony approved daily traffic reports to **anthonycolmenaresanandres@gmail.com**, the scoped code release and **one** controlled verification email. Persistent credential setup remains owner-only with action-time approval. Do not give secret values to an agent or paste them in chat, source control, a screenshot or a command shared with an agent.

## Isolation and current evidence

The morning mailer uses only `TRAFFIC_RESEND_API_KEY`, `TRAFFIC_FROM_EMAIL` and `TRAFFIC_MORNING_REPORT_EMAIL`. Shared request/pitch mail settings have no fallback. Native Vercel cron still authenticates with `CRON_SECRET`; Square scheduled refresh additionally requires the exact value `SQUARE_REFRESH_CRON_ENABLED=true`. Keep that flag absent or false for this activation. Square OAuth/manual sync/webhook remain unchanged; the previously unconfigured scheduled refresh stays inactive.

The schedule remains **12:12 UTC daily**, 08:12 EDT / 07:12 EST, covering the previous complete `America/New_York` day. October 5's report covers October 4. It includes each registered site's own verified figures and explicit missing coverage, and requires at least one ready site. No historical backfill or invented zeros.

Verified before implementation: production main `de44790b96d40e5ecd2c81ef47161e3657831e8a`; READY deployment `dpl_G3fFmDTkgzrgpEdZ5vHy11j3UC7e`. Delegated evidence: October 4 morning returned 503 at 12:12:15 UTC; CRON_SECRET, shared RESEND_API_KEY and report recipient were missing, while request sender/recipient settings existed and Bodega/Colattao were recording. This does **not** prove the previous day's coverage, sender domain verification or a key's permissions. Those remain unknown until safe dashboard/readiness checks below. No secret values have been read.

## Owner secure setup, after the isolation deployment is READY

1. Open [Resend Domains](https://resend.com/domains). Inspect only domain names/statuses. Use an existing **Verified** domain you control, and an approved sender mailbox on that domain. If no suitable verified domain exists, stop and report the blocker; this task does not authorize DNS/access changes, new services or spending.
2. Open [Resend API Keys](https://resend.com/api-keys). Inspect metadata only. If you already hold a suitable dedicated key securely, verify its **Sending access** permission and restriction to the chosen sender domain. If creation is needed, you personally approve/create it at that moment, name it `Fina Calle traffic reports`, choose **Sending access**, restrict it to that domain, and keep its value in your password manager. The agent must not create/reveal/copy/enter it. Do not reuse a customer-request, pitch, Colattao or general full-access key.
3. Open [AMMA Production Environment Variables](https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle/settings/environment-variables). Select **Production only** for every setting below. Do not use team/shared, Preview, Development or `NEXT_PUBLIC_*` variables.

   | Name | Value to enter yourself | Type |
   | --- | --- | --- |
   | `SQUARE_REFRESH_CRON_ENABLED` | `false` (or leave absent) | Non-secret |
   | `TRAFFIC_FROM_EMAIL` | Your approved sender on the verified domain, e.g. `Fina Calle traffic <your-mailbox@your-verified-domain>` | Non-secret |
   | `TRAFFIC_MORNING_REPORT_EMAIL` | `anthonycolmenaresanandres@gmail.com` | Non-secret |
   | `TRAFFIC_RESEND_API_KEY` | The dedicated domain-restricted sending key, entered directly by you | Sensitive |
   | `CRON_SECRET` | A strong random credential generated/held by you in your password manager (at least 16 characters), entered directly by you | Sensitive |

   Approve each persistent secret save yourself at action time. Leave existing `RESEND_API_KEY`, `REQUESTS_FROM_EMAIL`, `REQUESTS_NOTIFICATION_EMAIL`, Square credentials and traffic database/drain secrets unchanged. Do not enable `SQUARE_REFRESH_CRON_ENABLED`.
4. Redeploy the merged isolation version in **Production** from the official Vercel dashboard so the saved variables reach a new deployment. Verify READY and its source commit. Saving environment variables alone does not update an existing deployment.
5. Sign in to the existing [private operations dashboard](https://finacalleos.com/customers/traffic), then open [readiness metadata](https://finacalleos.com/api/internal/traffic/morning?dryRun=1). This is an authenticated, private/no-store **no-send** path and needs no cron key in your browser. It returns the previous Eastern date, ready/missing site states, configuration presence, and Square opt-in state; it returns no credentials, addresses or traffic counts. Confirm the date is the prior New York calendar date, `readyToSend=true`, expected site states, and `squareRefreshEnabled=false`. A site's `waiting`/`empty`/`unavailable` state is unknown coverage, never a zero-count claim. Any missing key/sender, invalid recipient, failed read, or no ready sites blocks sending.
6. Tell the agent only the non-secret confirmation: production secrets saved/redeployed; sender domain Verified; key Sending access and domain restriction confirmed; report recipient above; readiness date/site states; Square disabled. Do not share key fragments, screenshots containing keys or any key values. Sender-domain/key-scope checks rely on Resend metadata, not on retrieving credentials or test sends.

## One controlled verification, only after secure setup is confirmed

The activation/send remains blocked until step 6. In [AMMA Cron Jobs](https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle/settings/cron-jobs), inspect the morning job's logs first. If today's report already succeeded, use that receipt as verification and do **not** run another send. Otherwise use **Run** exactly once on `/api/internal/traffic/morning` (never the Square job). Vercel supplies the credential automatically; the agent does not need to handle it.

The verification is the normal previous-day report to the approved recipient; there is no separate test destination or test payload. Check the route's status/date/site metadata and Resend's email delivery status. HTTP 200 means Resend accepted the request; inspect delivery metadata and ask the owner to confirm inbox receipt before claiming delivery. A failed/ambiguous run is a blocker: inspect metadata/logs, do not press Run again or generate a new idempotency key. At most one verification email is authorized.

The mailer retains `fina-calle-traffic-<YYYY-MM-DD>` idempotency. Resend retains these keys for 24 hours; this is a duplicate guard within that window, not permanent send accounting. Do not use a changed date, query or body to bypass it. Subsequent daily reports follow the existing schedule. No Square refresh or customer-request/pitch mail is activated by this setup.

## Verification and evidence

Offline tests mock every environment, email/network call, admin session, database/report query and Square refresh. They check isolation, authorization, no-send readiness, partial reports, provider failures, unchanged schedule and the per-date idempotency key. Existing traffic attribution/dashboard self-tests, scoped ESLint, production build and exact-head CI/preview remain release gates. No live email is part of code validation.

Official references: [Vercel native cron authentication](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [Production variables and redeployment](https://vercel.com/docs/environment-variables/managing-environment-variables), [Resend API key permissions/domain metadata](https://resend.com/docs/dashboard/api-keys/introduction), [Resend 24-hour idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
