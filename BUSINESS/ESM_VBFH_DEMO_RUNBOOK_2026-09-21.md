# ESM / VBFH 15-Minute Demo Runbook

Prepared: September 21, 2026
Audience: Bryan Schmidt (ESM operations) with Steve Cariello as VBFH context contact.
Goal: earn permission for a limited operational pilot. Do not sell an enterprise rollout in the first meeting.

## Demo rule

Show only capabilities that are already evidenced in source, tests, or scheduled runs. If a capability is pre-production, label it pre-production.

## 0:00–1:30 — Why this exists

- Repetitive facility questions and missed calls create front-desk load.
- League results can become useful customer-facing content, but accuracy matters more than volume.
- Fina Calle is testing two narrow automation systems around those operational problems.

## 1:30–5:30 — AI Front Desk

Show:
1. `services/voice-gateway` architecture: Twilio transport, OpenAI voice session, tenant knowledge, tools, orchestrator, adapters, store/analytics.
2. `vbfh-info` tenant with the September 21 verified knowledge refresh.
3. Keyless/mock simulator only if a live demonstration is required without spend.
4. Honesty behavior: no live score, field, roster, account, check-in, or registration claims without a verified source.
5. Message capture and call analytics design.

Say explicitly:
- The VBFH tenant is currently informational/message-capture only.
- It is not connected to DaySmart check-in, account balances, or payment.
- GPT-Live-1 is being evaluated but has not been migrated into production.

## 5:30–10:00 — VBFH Media Engine

Show:
1. Current scheduled GitHub Action history.
2. A verified prior result package / broadcast-style card.
3. Fail-closed behavior: missing or conflicting data becomes `needs_review`; it is not turned into a score.
4. The stronger dual-team-page verification path from the current media-engine upgrade.
5. Evidence retention: parsed data / source URLs / artifacts.

Say explicitly:
- The MVP reads public DaySmart pages. It is not an official DaySmart API integration.
- Human approval remains the publication gate.
- Scheduled AI visual review and email delivery are disabled by default to keep the system zero-spend/no-send until approved.

## 10:00–12:30 — Pilot proposal

Offer a narrow VBFH pilot:
- Voice: informational front-desk assistant on a test number or controlled demo environment.
- Media: one or two supported leagues, previous-day results, human approval before publishing.

Measure:
- verified-answer rate;
- unsupported-answer/hallucination rate;
- messages captured;
- front-desk minutes saved;
- verified result packages generated;
- review/rejection rate;
- staff time per usable post.

## 12:30–15:00 — Discovery / close

Ask:
1. Which operational problem would matter most across ESM properties: calls, registration questions, league communications, or content?
2. Which systems would we eventually need permission to integrate with?
3. Who would own approval for a small VBFH pilot?
4. What would make the pilot useful enough to continue?

Close with a request for permission to define a small pilot and success criteria. Do not quote enterprise pricing until scope, data access, and ownership are known.

## Demo backups

- Keep screenshots/video of working flows in case live services fail.
- Keep a known-good Media Engine artifact ready.
- Keep the keyless Voice simulator available.
- Never improvise a live VBFH fact if the source cannot be shown.
