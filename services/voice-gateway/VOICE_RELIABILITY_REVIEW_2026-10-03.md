# Voice reliability review - 2026-10-03

Status: tested local source change only. Not pushed, published as a PR, merged or deployed.

## Authority and verified base

Anthony requested the next improvements from the voice-manager-reporting and misleading-call-statistics plan. The delegated scope authorizes source edits, synthetic offline tests and a local commit; fresh approval is required before any publication or production change.

Branch: codex/voice-reliability-20261002.
Base: 8415eea025debb3122b81481d8aef368970833ae (latest main rechecked before completion).
Bodega PR #295 and its completion record #296 are included unchanged.
Render service srv-d8qq4tegvqtc73e42s20 remains on approved PR #294 merge bd7210115e7f3b23e7ff56e463ef180215248b46, deploy dep-db02kcgae00c73e7d4d0, confirmed through a read-only deploy list. The base has no intervening voice-service, voice-CI or root Render changes relative to that live revision.

## Defects and resulting behavior

1. Previously, every ended call without a booking or message was classified missed, even if the caller received an informational response. New calls record whether response audio was forwarded after a caller speech turn. Explicit greeting/wrap-up responses, pre-caller responses, empty audio, cancelled responses, and closed-call output do not provide that evidence.
2. Previously, handled percentage added booking and message records, allowing one call to count repeatedly. Both percentages now count distinct ended calls. Active calls do not enter either numerator or denominator.
3. Pending booking requests previously appeared booked in summaries and retry wording. They now remain booking_requested/unconfirmed, including idempotent replays.
4. Missing webhooks merely logged the message, non-2xx statuses were ignored, and caller wording promised follow-up. A message is captured first, then one bounded webhook attempt is awaited and its actual result recorded. Callers receive truthful status with no guaranteed callback, timeline or named-manager receipt.
5. Tenant-specific audit counts previously returned the global count. They now attribute events through their owning call/draft/message/notification; unattributable legacy events appear only in the all-tenant count.

## Metric contract

Raw record counts remain separate: calls, drafts, bookings, confirmedBookings, pendingBookings, messages, syncErrors and audits. Booking/message records can exceed the number of calls and can include actions on active calls.

Each ended call occupies exactly one bucket, using the following precedence:

| Outcome / count | Evidence |
| --- | --- |
| booked / confirmedBookingCalls | At least one committed, non-pending booking |
| booking_requested / pendingBookingCalls | Pending request(s), without a confirmed booking |
| message / messageCalls | Captured message(s), without a booking/request |
| answered / answeredCalls | Response audio sent after a caller speech turn, without a recorded booking/request/message |
| missed / missedCalls | Newly instrumented call with none of the above |
| unknown / unknownCalls | Legacy call without enough evidence for any known outcome |

endedCalls equals the sum of these six buckets. handledCalls equals the first four buckets combined.
handledPct = round(100 * handledCalls / endedCalls).
conversionPct = round(100 * confirmedBookingCalls / endedCalls).
Both JSON percentages are 0 when endedCalls is 0; the CLI displays n/a and the denominator.

Unknown historical calls remain in the ended-call denominator, visibly separate from missed calls. These percentages measure the share with a recorded outcome, not inferred success, satisfaction or failure. Historical audit text is not rewritten; there is no fabricated answer backfill. Old calls with proven booking/message records retain that known outcome.

answered is a deliberately limited transport observation. Existing Realtime VAD/event metadata and response IDs identify the reply; no new transcription or model request is introduced. Audio queued to the carrier is not proof of completed playback, a correct answer, caller comprehension or resolution. Noise-triggered VAD remains possible. missed is retained for API compatibility and means no recorded handling; it is not a carrier-reported missed ring or an assertion that the telephone was unanswered.

## Notification contract

Every existing message, pending-booking or no-handling-call alert gets a tenant/call/entity-linked record:

- pending: attempt in progress, or interrupted before a final result; acceptance unconfirmed.
- not_configured: no nonempty destination; no outbound request.
- accepted: the configured endpoint returned HTTP 2xx. Human receipt/review remains unverified.
- failed: HTTP rejection/redirect, network error or the existing four-second timeout.

The payload remains the existing one-line Slack-style JSON text. No destination, email/SMS provider, manager identity, credential, queue, retry worker or new cloud resource is added. Redirects are not followed as proof of acceptance. Results retain status/failure category/HTTP code, not destination URLs, response bodies or exception strings. Missing configuration no longer logs private message contents as if an alert were sent.

Messages and pending delivery state are stored before awaiting the endpoint. A failed alert does not discard the captured message. A pending booking replay does not send another alert. Concurrent call finalization remains idempotent. Unknown historical tenant IDs do not send missed-call alerts through another tenant's configuration; phone-number fallback routing is untouched.

The tool result may now wait up to four seconds for the existing webhook timeout, a deliberate latency tradeoff for truthful delivery feedback. Existing single-instance JSON persistence remains best effort; this is not a durable guaranteed-delivery system. A crash can leave a pending/unconfirmed record and there is no automatic resend. Existing global/per-tenant notification configuration is consumed without modification. The actual live destination, permissions and manager receipt were not inspected or verified.

Shared voice handoff instructions apply to default and custom tenant prompts. They distinguish capture from acceptance and prohibit guaranteed callback/manager receipt claims. The static call.summary audit is an outcome label only. No conversational per-call summary/report is generated or delivered.

## Exact proposed deployment impact

After a separately approved PR/merge, Render would rebuild the same Docker service from main. Future calls would use the corrected event evidence and handoff wording; /stats and npm run report would expose corrected counts and separate notification states. Historical no-action calls would appear unknown instead of being automatically counted missed. New additive fields are persisted in the existing /data/store.json snapshot: outcomeTrackingVersion, replyAudioSentAt and the notifications array. No SQL migration or history deletion is involved.

The existing four tenant definitions, VBFH knowledge, 666/300 voice routing, Fina Calle SMS on 300, allowed tools, unknown-number fallback, Twilio validation, models, call caps, dependencies, Dockerfile and root render.yaml are unchanged. No Bodega application files are touched. This source-only pass has not changed production or contacted anyone.

## Validation

Final local verification on Node v24.18.0, with provider/staff/snapshot variables cleared for existing suites:

| Check | Result |
| --- | --- |
| npm run typecheck | PASS |
| npm run simulate | PASS, 53 checks |
| npm run simulate:sms | PASS, 9/9 |
| npm run simulate:checkin | PASS, 17/17 |
| npm run simulate:vbfh | PASS, 18/18; actual local HTTP/channel routing and persona preservation |
| npm run simulate:reliability | PASS, 17 cases |
| git diff --check | PASS |

The new suite blocks external fetches with a synthetic stub, uses no Realtime socket, and exercises the real event handler on an inert instance. Coverage includes absent/whitespace/2xx/3xx/4xx/5xx/timeout/network webhook outcomes, persisted pending/results, capture survival, caller wording, idempotent replay/finalization, greeting/wrap-up/cancelled/empty audio, distinct-call math, active calls, tenant separation, legacy snapshots and the actual CLI report.

During implementation, a WebSocket type-only import and an optional test-field access caused typecheck failures; both were corrected. No final check fails. Existing dependencies were reused; no install/upgrade was performed.

Evidence: C:/dev/amma/evidence/voice-reliability-20261003/verification.json and per-command logs.
Unrun: remote GitHub/Node 22 CI (no push), Render deployment, actual carrier calls/audio playback, paid model behavior/latency evaluation, real webhook delivery and named-manager receipt. No live alert, email, SMS or model generation was triggered.

## Operational acceptance after separate release approval

1. Publish the reviewed commit, pass required Node 22 CI, recheck current main/diff and active calls, obtain explicit production approval, then merge and confirm Render's exact live revision and health.
2. Read /stats?tenant=vbfh-info and /stats?tenant=fina-calle. Check mutually exclusive buckets sum to endedCalls; active calls are excluded; unknown legacy calls stay visible; notifications are tenant-scoped. Do not interpret the historical change in missed counts as newly recovered calls.
3. Owner-authorized calls to both numbers: confirm VBFH identity, ask one supported information question, then end without leaving a message. The call should appear response-only, without a missed-call alert. Confirm Fina Calle SMS identity remains on 300 separately.
4. A greeting-only/no-response call should enter no-recorded-handling. Verify a normal exchange, interruption and hard-wrap-up do not make greetings/wrap-ups into answer evidence. Assess actual speech quality; synthetic events cannot establish it.
5. Before any real manager test, the owner confirms the tenant-specific recipient/destination and permission to send caller contact details. Test a consenting message and confirm both the gateway status and the intended person's receipt. HTTP acceptance alone does not complete this acceptance.
6. Missing/rejected/timeout handoffs should preserve capture, expose the correct result and give direct-contact guidance without promising follow-up. Use an explicitly authorized test destination/environment for failure injection; do not disrupt a live recipient route.

## Remaining owner decisions

- Confirm the appropriate VBFH manager destination, tenant separation and permission for caller contact/message content.
- Choose event alerts versus proposed conversational per-call reports. The latter still need agreed fields, format, recipient, privacy/retention policy and explicit implementation/delivery authorization.
- Authorize publication/release of this exact reviewed source change. Actual phone/model and manager-delivery acceptance remain unverified until separately authorized.
