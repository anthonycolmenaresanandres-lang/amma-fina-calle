# VBFH voice knowledge and routing review - 2026-10-02

Status: PREPARED LOCALLY; not pushed, merged or deployed. Both Bryan and DASH emails remain held.

## Exact proposed production change

Base: anthonycolmenaresanandres-lang/amma-fina-calle main 8eb6239758ff3ad0b969b54c149de354048b205e.
Branch/worktree: codex/vbfh-knowledge-20261002 at C:/dev/amma/worktrees/vbfh-knowledge-20261002.

1. Replace only vbfh-info knowledge/instruction content with the October 2 official-site snapshot: 30 source/date/status-scoped topic records. Preserve disclosure, English/marin voice, message-only tool allowance, honesty, callback readback, account/check-in/registration/payment/booking limits.
2. Add voicePhoneNumbers=["+1 757 300 1118"] to VBFH and use its optional override only for /twiml. Keep shared phoneNumbers unchanged: 666 -> VBFH; 300 -> Fina Calle. /sms stays on the shared resolver. Expose the override in /tenants.
3. Remove the inactive larissa-offgrid definition at Anthony's explicit request. It has no assigned number. Preserve Git history and all call/log/customer data; preserve Colattao, French volleyball and Fina Calle definitions exactly.
4. Add offline routing/session/HTTP checks to the existing voice CI. No dependency, Dockerfile or root render.yaml changes.

Impact: voice on 300 would replace the Fina Calle greeting with the VBFH League Assistant if that number's carrier Voice webhook reaches this gateway. SMS identity on 300 stays Fina Calle. The 666 identity stays VBFH with refreshed facts. The real Field House business main number 757-427-3955 is not changed. No ESM phone system, live schedule source, DASH integration, booking or payment capability is added.

The knowledge text grows from 6,664 to 20,475 characters; actual speech quality, latency and model behavior remain unmeasured because no paid generation was authorized.

## Official sources and coverage

Forty direct official HTML reads returned HTTP 200 at 2026-10-02T21:06:48Z-21:06:51Z. Full per-page timestamps and text hashes are in VBFH_KNOWLEDGE_SOURCES.md; record metadata is included in the runtime knowledge. These timestamps are review times, not page publication dates.

Coverage: facility/contact/hours/staff; adult and youth leagues; all nine children's classes; parties/rentals/drop-ins; general policies; seasonal childcare/sports camps; Parents Night Out; Hoops/Wave; cafe/sponsorship; expired promotions. This is broad caller-focused coverage, not a claim to ingest every historical post, image, PDF or partner checkout.

Important corrections:
- Adult volleyball Holiday published price is $84, not the old Fall $98.
- Holiday soccer October 26-December 8; basketball/flag October 30-December 18; adult volleyball October 26-December 17, 2026. Deadlines are attributed to each season, not claims of open registration.
- Fresh origin youth volleyball says November 15-December 20, deadline November 2. It supersedes the parent's older cached November 11-December 13/October 18 result.
- Fielders baseball $17.50/class, Skills Institute $19.50; other listed classes $18.50, plus published annual admin fee.
- Conflicting ages/rosters, cleat rules, refund timing, start-year omissions, weekday lists, stale camp dates and expired homepage discount all trigger qualifications/referral.
- Parent-reviewed older linked rules/partner pages inform caution only; their stale data is not treated as current program availability.

The existing engine injects no trusted current date or live website lookup. Instructions therefore forbid treating the review date as today or calling a dated session upcoming/open from the snapshot. This is prompt-level temporal restraint, not an automatic expiry engine.

The intended email document was identified as a private historical administrative event CSV and the user asked to disregard it. It was excluded entirely. No raw export or customer/child/private booking rows were received in this engineering checkout.

## Serving evidence and identity limits

Read-only evidence is outside Git at C:/dev/amma/evidence/vbfh-knowledge-20261002/:
- healthz.json: HTTP 200, ok.
- runtime.json: publicHost fina-calle-voice-gateway.onrender.com; five loaded tenants; TENANTS_FILE configured; line not paused; model gpt-realtime-2; max call 300 seconds; webhook validation false. Only credential presence boolean was exposed.
- tenants.json: vbfh-info owns 17576660078; fina-calle owns 17573001118; Larissa, Colattao and French volleyball unassigned.
- twiml-17576660078.json and twiml-17573001118.json: HTTP 200 non-audio XML selects vbfh-info and fina-calle respectively. No caller number or media connection was supplied.
- stats-fina-calle.json: one stored call, zero active/messages, one classified missed.
- stats-vbfh-info.json: eighteen stored calls, zero active/messages, eighteen classified missed.

Aggregate records do not establish why a call ended or whether a user depends on the 300 persona. Do not claim that number is unused.

Root render.yaml describes an auto-deployed Docker service named fina-calle-voice-gateway, rootDir services/voice-gateway, TENANTS_FILE=/app/tenants.json. Dockerfile copies the registry; src/tenant.ts reads it lazily once and memoizes it. src/realtime.ts appends that tenant's instructions/knowledge to the actual Realtime session and filters advertised tools.

Expected monorepo identity is supported by source/runbook plus matching live configuration, but the exact deployed Render repository, branch and SHA were NOT verified. Public endpoints omit them. Main's GitHub combined status exposes Vercel only. No Render/Twilio connector or ready environment credential was available; no key was created, copied or exposed. The Windows browser automation runtime was not callable in this selected toolset, and no existing Chrome debugging endpoint was discovered.

A distinct private anthonycolmenaresanandres-lang/fina-calle-voice-gateway repo exists on master, head 497a5731931171dde91e5700e150159923a4c01e (July 9 import); root tenants.json was not found. Its existence is why the deployment source must be inspected rather than inferred from a similar name. No edit was made there.

Twilio's saved number webhooks and fallback destinations remain unverified. Registry/XML evidence proves gateway selection, not carrier configuration or successful audio.

## Validation

Passed:
- npm run typecheck.
- npm run simulate: existing gateway/connector/tenant/SoundGate simulator, all checks.
- npm run simulate:sms: 9/9.
- npm run simulate:checkin: 17/17.
- npm run simulate:vbfh: 18/18, covering exact persona preservation, removal, normalization, channel separation, actual model payload/tool limits, metadata, stale-source corrections and real local HTTP /twiml, deterministic /sms HELP and /tenants.
- git diff --check.

Existing installed dependencies were reused through a worktree-local junction; no package was installed or upgraded. Tests clear provider/staff/snapshot settings and use local fixtures only. CI now includes SMS and VBFH suites; remote CI is unrun because no branch was pushed.

Not run: paid model output evaluation, Realtime/session probes, Twilio calls, actual spoken answers, staff notification delivery, deployment, live check-in, bookings/payments, any email/send. Deterministic tests establish configuration/routing, not no-hallucination behavior of generated speech.

Manual acceptance questions for a later owner-authorized call:
- Tuesday 9am opening, drop-in tonight, age-14 adult volleyball eligibility.
- Holiday soccer dates/deadline, current youth-volleyball window, Fielders versus Skills fee.
- Cheapest turf, party deposit versus full rental payment, birthday cake exception.
- Refund timing conflict, expired summer flag enrollment, Kickers cleats.
- Next tournament availability, weather closure versus school closure.
- Card payment/enrollment/check-in refusal; unknown question; callback digits.
- Both numbers' spoken identity, interruption/fallback and no cross-tenant content.

## Separate blockers, not silently repaired

1. Notification delivery: notifyStaff logs when its URL is absent, sends fire-and-forget otherwise and does not establish a named manager's receipt. Live destination/delivery unknown. takeMessage still returns a general follow-up promise; the updated prompt avoids adding guaranteed recipients/timelines, but wording alone cannot prove a functioning workflow.
2. Informational calls are classified missed when they produce neither a booking nor a saved message. The live counts above cannot be used as a failed-call rate.
3. Unknown/missing To still falls to the first empty-number tenant (Colattao). Preserve existing behavior for this scoped change; exact-number carrier tests are required.
4. Live webhook validation is false. Its existing activation/setup is outside this knowledge/routing change.

## Approval, rollout and smallest real-phone verification

Before approval, an authorized owner must read Render Settings/Deploys and record service ID, repository URL, branch and currently deployed SHA; then read Twilio's Voice URL/method/fallback for each number without exposing credentials. Existing owner access suffices; this proposal does not inherently require new keys or access grants.

After approval of the exact commit:
1. Publish/review the branch and run its required voice CI. Merge/deploy only the reviewed revision to the verified existing Render service. Because root configuration says autoDeploy, a main merge is a production action and remains held.
2. Confirm healthy deployment and recorded SHA. Read /tenants: four tenants, VBFH shared 666 and voice-only 300, Fina Calle shared 300, no Larissa. Read non-audio /twiml for both numbers; each must select VBFH. Validate SMS separation with offline HELP, not an unsolicited live text.
3. If 300's Voice webhook is not already this gateway's /twiml, review and separately approve the exact number-only URL/method/fallback update. Preserve its SMS settings and all 666 settings.
4. Smallest remaining end-to-end proof is an owner-placed brief call to 666 and then 300, checking automated VBFH greeting plus one corrected fact (e.g. published adult volleyball $84) and an unavailable live schedule question. No agent-paid call is authorized here.

Rollback: record the actual prior Render deployment and both existing Voice configurations first. If verification fails, restore that prior service deployment/Voice setting. Reverting the voicePhoneNumbers override alone returns 300 voice to Fina Calle without changing SMS or 666. Git history retains the removed persona. No data-store reset.

An ESM/VBFH after-hours forwarding pilot is a separate future change: confirm their carrier/PBX, administrator authority, after-hours/no-answer rules, destination number, voicemail/fallback behavior and forwarding charges; test exact To handling and reversal in a controlled window. Their existing published number can be retained if that phone system supports the approved forwarding rule. Compatibility, effort and absence of disruption cannot be promised before those checks. No actual business-main-line forwarding is configured by this work.
