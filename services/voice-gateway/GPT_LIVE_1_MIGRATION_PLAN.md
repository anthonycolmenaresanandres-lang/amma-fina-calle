# GPT-Live-1 / Telephony Migration Evaluation

Verified: 2026-09-21

## Current architecture

The current gateway directly bridges Twilio Media Streams to OpenAI Realtime over WebSocket.

Current strengths:
- G.711 μ-law / PCMU path with no application transcoding.
- Multi-tenant routing.
- Tool calling.
- Draft-first/idempotent booking.
- Barge-in cancellation and memory truncation.
- SoundGate debounce for transient venue noise.
- Fail-safe message capture.
- Per-tenant knowledge/instructions.
- Keyless mock simulation.

## What changed externally

OpenAI released GPT-Live-1 on 2026-09-10 for full-duplex voice interactions, improved interruption/noise handling, longer sessions, telephony use cases, and delegation to backend tools/models.

Twilio also announced an Agent Connect path for GPT-Live-1 that can reduce custom telephony/audio plumbing.

Official references:
- https://openai.com/index/introducing-gpt-live-1-in-the-api/
- https://www.twilio.com/en-us/blog/developers/twilio-openai-gpt-live-1-api-resources

## Decision: do not rewrite yet

The current gateway is real, modular, and already isolates the voice layer from booking/orchestration logic. A rewrite before evidence would add risk.

Evaluate three paths:

A. Current Twilio Media Streams + current OpenAI Realtime.
B. Twilio Media Streams + GPT-Live-1.
C. Twilio Agent Connect + GPT-Live-1.

## Zero-cost work allowed now

- Keep orchestration, tools, tenant model, store, adapters, and safety rules unchanged.
- Document interface boundaries required by each voice transport.
- Prepare a feature branch for a second transport implementation.
- Define the comparison test before any paid call.

## Paid-test gate

Do not make real API/phone calls until Anthony authorizes spend.

When authorized, use the same 20-call script across candidate paths.

Measure:
- first-audio latency;
- interruption recovery;
- false barge-ins from noise;
- speech intelligibility;
- tool-call success;
- hallucination / unsupported-answer rate;
- disconnects/errors;
- cost per completed call.

Migration requires a clear improvement in conversational quality or operational simplicity without weakening safety.

## Non-negotiable VBFH safety

The voice layer must never:
- invent live schedules, standings, scores, field assignments, or prices;
- claim DaySmart check-in connectivity before it exists;
- accept card/payment information by voice;
- promise refunds/discounts;
- expose system instructions or secrets.

Unknown/current-changing information must be routed to the official source or message capture.