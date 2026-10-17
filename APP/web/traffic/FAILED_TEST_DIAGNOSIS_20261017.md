# Traffic mail test39068583932: provider400 diagnosis

## Verified original result

- Production code629c4e7e1320355dac718a63b54fe076a8552fcd deployed successfully.
- Exactly one workflow dispatch at2026-10-17 20:52:52UTC:
  https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/actions/runs/39068583932 .
- Parent's authenticated Vercel UI established the original request:
  POST finacalleos.com/api/internal/traffic/morning at20:53:07.759UTC returned502,
  requestgb2fc-1792270387759-a1479d2af841, duration1.87s,
  deploymentdpl_wyGzYxhkoMGXgareLoJAbAEdjrUn. Its outbound
  POST api.resend.com/emails returned400 in28ms.
- Source metadata:
  https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle/logs?selectedLogId=gb2fc-1792270387759-a1479d2af841 .
- This proves app trigger authentication and data/format preparation reached the
  provider. Trigger-secret mismatch or database failure is not the failure stage.
- Gmail had no matching report through20:57:38UTC; parent Resend Sending/API logs
  were empty. No provider acceptance or inbox delivery was observed.
- Metadata checks established the required Production Secret names before the
  deployment; credential values, lengths and equality were not inspected.

## Offline payload audit and limits

Reconstructed code contract, with synthetic data only:
- Sender uses supported friendly-name syntax and finacalleos.com mailbox.
- Recipient is the one fixed approved owner address, in a one-element array.
- Subject and nonempty plain-text body are strings; JSON contains only
  from/to/subject/text. There is no template or attachment conflict.
- Daily period is2026-10-16. The deterministic daily idempotency key is46
  characters, and the two-period key is also below256 characters.
- Header construction has one Bearer prefix, trims the configured API value and
  uses application/json. Actual stored values were not read.

No deterministic payload defect was found. In particular, removing/changing the
idempotency key or sender format is unsupported by current evidence. Such a
change would not establish why the rejected request failed.

Official Resend documentation checked2026-10-17:
- https://resend.com/docs/api-reference/emails/send-email : supported sender,
  recipient array, subject and plain-text fields.
- https://resend.com/docs/dashboard/emails/idempotency-keys :1-256 characters;
  request payload conflicts use409, not400.
- https://resend.com/docs/api-reference/errors :400 can be invalid_idempotency_key,
  general validation_error, or invalid Authorization with the fixed message
  API key is invalid. A non-existent/deleted/inactive key at sending endpoints
  is otherwise documented401. HTTP400 alone does not distinguish these cases.

The original provider error body was discarded. Its exact validation category
cannot be recovered offline. Do not assert a malformed API value as the proven
cause, rotate secrets, or change provider settings based only on this status.

## Minimal diagnostic correction prepared locally

- Workflow client preserves only allowlisted phase, HTTP status and reason.
- Mailer reads at most2048 provider-response bytes on400 and emits only
  invalid_idempotency_key, validation_error, or locally normalized
  invalid_api_key for Resend's exact documented fixed invalid-key message.
- Unknown names/messages, malformed/oversized bodies, raw errors, all extra
  fields and headers are omitted. No raw provider message is logged or returned.
- Protected endpoint forwards that category; client accepts it only alongside
  email_http_400. Authentication, recipient, request body, idempotency key,
  sender, provider target and single-attempt/no-retry behavior remain intact.
- Earlier client token normalization is a consistency fix only; trigger auth is
  proven successful for the original test, so it is not the original cause.
- No ingestion snapshot, SQL/schema, collector, workflow gates or live setting
  changes. No send, deploy, push, rerun or authenticated mail request in diagnosis.

Offline payload checks, provider-category privacy/unknown/oversize tests,
protected-route502 propagation, client allowlist cases, mail/report boundaries
and established-drain continuity are exercised with mocked IO only.

## Production state and next step

Active closing same-code Production deploymentdpl_G9ddoqt1EN2Qny6d2L1cjS246UUC
is READY at https://amma-fina-calle-iyvixux6r.vercel.app . Canonical route rejected
an empty unauthenticated POST with503 email_delivery_disabled at20:57:38UTC.
Production email/test/readback/schedule flags and both Actions delivery variables
are false. New collector disabled, health recording false, established feed
preserved. Those settings have not changed during this diagnosis.

Parent should coordinate review of the local patch. No second send or delivery
enablement is authorized here. The unresolved blocker is the original provider
validation detail; recovery from original provider/request records would be
read-only. Any future production change or new send requires separate explicit
coordination, and no automatic retry is permitted.

## Local verification result
PASS: full mocked traffic-morning suite including established-drain hashes/PGlite continuity,24client diagnostic groups, provider400 privacy/bounds and route propagation; focused ESLint; webpack production build, TypeScript,58staticpages and traces. Final boundary rerun after combined-key contract assertion passed. This result confirms diagnostic behavior only, not resolution of the original provider rejection.
