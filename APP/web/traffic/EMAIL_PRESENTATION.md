# Traffic email presentation

Anthony requested generous gaps between sites and a more polished email after
receiving the aggregate test. This is presentation only.

## Rendering
- Existing Fina Calle ink/graphite/gold/paper palette from comic.module.css.
- Single fluid640px email surface, inline styles and layout tables marked
  presentation; conditional fixed-width wrapper for classic Outlook.
- System fonts, strong site headings, tabular metric numerals,30px top/32px
  bottom spacing per site and quiet partial dividers. Daily/weekly values stack
  independently for narrow clients; no cross-brand total is introduced.
- Waiting/missing/unverified-zero entries prominently say Data not yet available.
  The actual recorded zero, if present, remains smaller detail with the caveat;
  missing data is not converted into a measured zero.
- All original coverage/identifier/QR caveats and exact interval boundaries remain.
- Plain text has a blank line between every site and clear period labels.
- HTML and text are derived from the same existing per-site values. The mailer
  adds only the HTML body field. Subject, recipient, sender, auth, periods,
  idempotency key, single-attempt behavior, scheduler and ingestion are unchanged.
- Dynamic HTML text is escaped. No images, remote fonts, scripts, external style
  sheets, tracking assets or new services are included. One fixed private
  dashboard link;50px target in the browser preview.

## Offline verification
Run from APP/web:

    node scripts/traffic-morning-selftest.mjs
    node scripts/traffic-email-presentation-selftest.mjs --preview .next/email-preview

Synthetic figures are used in tests/previews; no customer traffic records are
published as fixtures. Checks cover all18registry sites, identical text/HTML
values, unavailable-versus-recorded-zero states, escaping, raw-ID omission,
independently displayed Monday periods, fixed subject/link, no tracked assets,
contrast >=4.5:1 and HTML size below100000bytes. Daily/combined fixture output is
22450/34932bytes respectively. Existing report/auth/idempotency/drain boundaries
and actual offline established-drain PGlite continuity pass.

Chrome previews checked at320px,390px and768px: no horizontal overflow,18site
headings and50.39px link height. Before/after390x1600 captures share the same
synthetic figures and interval; Monday390px preview separately verifies stacking.
Production webpack build, TypeScript,58static pages and focused ESLint pass.
Reviewed against repository frontend-design and fresh Web Interface Guidelines;
email-safe inline/table equivalents apply. Preview browser used an isolated local
profile, closed after screenshots. No styled email was sent for this change.

## Closed gates and cadence handoff
Delivery/readback/schedule flags and both GitHub variables remain false. Do not
send another test or activate recurring from this presentation PR.

After parent coordination, the already requested cadence is08:00America/New_York
daily October18-31inclusive, then Mondays weekly. October19/26combine yesterday
and previous completed Monday-Sunday independently in one message; November2
is weekly-only. Existing12Z/13Z workflow slots defer to the server's DST check.

Activation requires these non-secret settings (not activated here):

| Location | Setting | Value for coordinated activation |
| --- | --- | --- |
| Vercel Production | TRAFFIC_EMAIL_ENABLED | true |
| Vercel Production | TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED | true |
| Vercel Production | TRAFFIC_SCHEDULE_ENABLED | true |
| Vercel Production | TRAFFIC_EMAIL_TEST_ENABLED | false |
| GitHub repository variable | TRAFFIC_REPORT_SCHEDULE_ENABLED | true |
| GitHub repository variable | TRAFFIC_REPORT_TEST_ENABLED | false |

Production environment updates require a fresh deployment using current project
settings. Do not reuse an old deployment's environment snapshot. Existing drain,
optional collector and health recording settings stay untouched.
