# Company Change Register — 2026-09-21 AI Workforce / Revenue Sprint

Purpose: evidence-backed record of the work performed in the September 21, 2026 ChatGPT operating session. This separates completed work from drafts, internal branches, scheduled workers, and blocked/planned work.

## 1. Revenue operating model

Completed:
- Defined a 30-day revenue operating model centered on selling existing capability before starting speculative product work.
- Established the core scorecard: qualified contacts, replies, demos booked, dollars generated.
- Established the rule that a zero-contact day makes outreach the first business block before coding/design/research.
- Prepared a staged prompt chain: product inventory → voice audit → knowledge audit → offer packaging → demo → outreach → recurring revenue execution.
- Verified Bryan Schmidt as the ESM operations target from prior Gmail correspondence and current ESM context; Steve Cariello remains the VBFH context contact.

## 2. ESM / VBFH outreach

Gmail:
- Draft exists: Two VBFH systems I'd like to show you.
- Recipient: Bryan Schmidt; Steve Cariello is CC'd.
- Status: DRAFT ONLY — not sent.
- Purpose: request a 15-minute demonstration of AI Front Desk + GameDay Content.
- External-send authority remains with Anthony.

Repo:
- BUSINESS/ESM_VBFH_DEMO_RUNBOOK_2026-09-21.md
- BUSINESS/REVENUE_READINESS_2026-09-21.md

## 3. Voice AI / VBFH knowledge

Merged to main via PR #239 on 2026-09-21:
- services/voice-gateway/GPT_LIVE_1_MIGRATION_PLAN.md
- services/voice-gateway/VBFH_KNOWLEDGE_AUDIT_2026-09-21.md
- services/voice-gateway/VBFH_KNOWLEDGE_SOURCES.md
- services/voice-gateway/tenants.json
- ESM demo/revenue-readiness docs listed above.

Outcome:
- VBFH voice knowledge was refreshed for Fall 2026 and stale Summer II language was gated/removed from current-answer behavior.
- Current architecture remains Twilio Media Streams ⇄ OpenAI Realtime.
- GPT-Live-1 / Twilio Agent Connect were documented as migration candidates, not silently substituted into production.
- No paid GPT-Live-1 / telephony comparison calls were made.

Merged to main via PR #240 on 2026-09-21:
- .github/workflows/ci-voice-gateway.yml
- services/voice-gateway/VOICE_20_CALL_COMPARISON_PROTOCOL.md

Outcome:
- Keyless booking simulation and check-in simulation are now part of CI verification.
- The paid 20-call comparison remains a gated future test.

## 4. VBFH Media Engine

Merged to master via PR #8 on 2026-09-21.

Major touched areas:
- stronger DaySmart result acquisition and parsing;
- dual team-page corroboration for final scores;
- fail-closed content generation;
- stable intake IDs/merge logic;
- broadcast rendering/publishing planning;
- optional structured AI content review;
- email packaging;
- pilot runtime/runbook;
- scheduled workflow.

Current scheduled-mode policy:
- EMAIL_ENABLED=false
- AI_REVIEW_ENABLED=false
- AI_REVIEW_REQUIRED=false
- no automatic Instagram publish step in the scheduled workflow;
- scheduled pipeline remains deterministic/zero-spend by default and retains run artifacts for review.

This means stronger verification code is merged while paid AI review and external delivery are not silently activated in the production schedule.

## 5. Email pilot / delivery proof

Verified Gmail evidence:
- VBFH Pilot 1/7 was sent to Anthony on 2026-09-19 with real September 18 results and image/caption attachments.
- Fina Calle AI Workforce — Activation Test was sent to Anthony on 2026-09-21.
- VBFH Daily Mail Pilot automation is active again and is authorized to email Anthony only.
- It is explicitly prohibited from emailing Field House management, Dash, marketing, or Instagram without new authorization.

## 6. AI Workforce — merged company SOP layer

Committed on main on 2026-09-21 under OPERATIONS/AI_WORKFORCE/:
- README.md
- WORKER_REGISTRY.md
- SOP_SALES_PIPELINE.md
- SOP_CLIENT_SUCCESS.md
- SOP_PRODUCT_QA.md
- SOP_KNOWLEDGE_MARKETING.md
- SOP_HANDOFF_ESCALATION.md

Operating model:
- Anthony = owner/final authority.
- Executive Ops = chief-of-staff coordinator.
- Department workers own bounded functions.
- Unknown is not zero.
- Draft is not sent.
- Scheduled is not completed without outcome evidence.
- Revenue work precedes speculative feature work.

## 7. Active business workers / automations

Active business workers at the end of this session:
1. Executive Ops Brief — weekday executive brief / chief-of-staff function.
2. Daily Revenue Agent — weekday revenue prioritization and new actions.
3. Sales Follow-up Desk — weekday Gmail-grounded warm follow-ups.
4. Client Success Desk — Mon/Wed/Fri material client risks/opportunities.
5. Product QA Watch — daily condition watch for sellable-product risk.
6. Marketing Studio — Tue/Thu publish-ready internal marketing packages.
7. Accounts Receivable Desk — monthly payment-action watch.
8. Demo Proposal Desk — condition watch for buying signals / meeting preparation.
9. AI Workforce Review — Friday worker performance and noise review.
10. VBFH Knowledge Watch — weekly official-fact drift monitoring.
11. Revenue Scorecard — weekday four-number accountability.
12. VBFH Daily Mail Pilot — private VBFH result package to Anthony only.

Refinement performed:
- Executive Ops was narrowed to coordination rather than duplicating specialist work.
- Revenue Agent was narrowed toward new revenue actions / prioritization.
- Follow-up Agent was narrowed to warm Gmail threads and evidence-backed stage changes.
- Client Success, Product QA, and Demo/Proposal were instructed to use shared-state/handoff standards when accessible.

## 8. AI Workforce v2 — internal shared-state branch

Branch: ops/ai-workforce-state
Status: INTERNAL / UNMERGED. It is ahead of main and intentionally separated from production.

Created under BUSINESS/AI_WORKFORCE/:
- OPERATING_SYSTEM.md
- STATE.json
- RUN_LOG.md
- SOP_HANDOFF.md
- SOP_SALES_PIPELINE.md
- SOP_PROCESS_ENGINEERING.md

Also touched on that branch:
- OPERATIONS/CODEX_QUEUE.md
- OPERATIONS/HANDOFF_LOG.md

Purpose:
- give workers shared internal state;
- enforce pipeline stages and handoff packets;
- allow evidence-backed worker coordination instead of isolated recurring prompts;
- define process-engineering rules for turning repeated work into SOPs.

This branch has NOT been merged to main.

## 9. Worker capacity / blocked expansion

A new Prospect Research Desk automation was attempted but NOT created because the account reached the limit of 15 active scheduled tasks.

Therefore:
- Prospect Research Desk is not currently active as a separate worker.
- A separate Pipeline Controller and scheduled Process Engineer were designed conceptually but are not active scheduled tasks.
- Their responsibilities are partially covered by the refined Revenue/Follow-up/Executive workers and the unmerged shared-state operating branch until capacity is freed.

## 10. Spending / external-action audit

During the zero-spend preparation and refinement work:
- no paid GPT-Live-1 comparison calls were executed;
- no phone number was purchased;
- no new paid hosting was purchased;
- no ESM outreach email was sent;
- the Bryan/Steve message remains a draft;
- production VBFH scheduled AI/email remains disabled by default;
- the only verified outbound emails from this sprint are internal/test deliveries to Anthony.

## 11. Canonical status labels for future agents

Use these labels in future briefs:
- MERGED — present on main/master.
- ACTIVE WORKER — scheduled and enabled.
- DRAFT — prepared but not sent/published.
- INTERNAL BRANCH — persistent but not production/canonical.
- BLOCKED — attempted but stopped by a real system dependency/limit.
- PLANNED — designed but not yet created or executed.

Do not collapse these labels into done.