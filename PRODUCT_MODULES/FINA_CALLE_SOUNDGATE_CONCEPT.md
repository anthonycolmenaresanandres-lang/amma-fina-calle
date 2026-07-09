# Fina Calle SoundGate — product concept (R&D)

> **Status: CONCEPT captured + FIRST SLICE SHIPPED.** The turn-taking foundation
> (semantic VAD + client-owned barge-in with playback-accurate truncation) is live in
> `services/voice-gateway/` (see "Already shipped"). The full environment-intelligence
> layer (noise classification, confidence scoring, cross-talk/diarization, mistakes
> dashboard) is **queued as the next voice bet after VBFH** — not an active build (WIP=1).

## One-liner
A **voice-agent control layer that sits between the phone audio and the AI brain.** It
gives the agent human turn-taking intelligence: know when to **listen, wait, ignore
noise, stop talking, or politely ask for clarification** — so it behaves like a person,
not a walkie-talkie. The goal is **not** "make the AI say umm"; it's knowing whose turn
it is.

## Why it fits AMMA (the Managerial Factory thesis)
Turn-taking is a recurring, mechanizable *judgment* on every call — exactly the kind of
work to hand to code. It's also a clean **premium tier**: the same engine, a smarter gate,
sold to **noisy businesses** (coffee shops, restaurants, salons, repair shops) where a
dumb VAD makes the assistant unusable. Colattao — a café with an espresso machine in
earshot — is the natural first proof.

## The core architectural principle (read this first)
**SoundGate is local, synchronous middleware UPSTREAM of the brain — never an LLM tool.**
The flow is `Call → SoundGate → AI Brain → Tools → Voice`. The gate decides whether audio
and turn-events even reach the brain; it must run in **sub-millisecond, in-process** logic.
Making `analyzeAudioContext` a *function the model calls* would add a network round-trip
into the hot path and blow the <700ms conversational latency budget. **LLM tools stay for
business actions (booking) only.** This reconciles the two framings in the original
sketch: keep the local `analyzeAudioContext()` function; drop the "tool definition."

## Architecture
```
Inbound call → Twilio Media Streams (8kHz μ-law) → SoundGate (local referee)
   → OpenAI Realtime brain (reason / speak / tool-call) → Fina Calle OS (menu/hours/orders/FAQ)
```
1. **Twilio** streams raw bidirectional call audio over WebSocket (already wired:
   `server.ts` ⇄ `realtime.ts`).
2. **SoundGate referee** scores each audio window: speech vs. silence vs. noise; is the
   speech *directed at the agent*; interruption intent; confidence.
3. **Turn Manager** picks one action: keep talking · stop & listen · wait longer · ask to
   repeat · ignore background noise · escalate to a human.
4. **Realtime brain** handles conversation, reasoning, voice, tool calls.
5. **Fina Calle OS** supplies the knowledge pack + receives the call summary/log.

## The noise problem is really TWO problems (don't conflate them)
- **(A) Suppress non-speech barge-ins** — a blender / espresso machine / horn must NOT make
  the agent stop. Split again by duration:
  - **Transients / backchannels** (clink, cough, "mm-hm") → solved by the **barge-in
    debounce** (only yield to *sustained* speech). **DONE** — `soundgate.ts` `BargeInGate`.
  - **Sustained mechanical noise** (a running blender) → leans on `semantic_vad`'s speech/
    non-speech discrimination now; a real classifier is Phase 3.
  - ⚠️ **A raw energy/RMS threshold is the WRONG primitive** and was rejected: a loud blender
    is *high*-energy (slips through) while a soft-spoken caller is *low*-energy (wrongly
    suppressed). Energy can be one *input* to a classifier later, never the gate by itself.
- **(B) Label the noise type** ("car_horn" vs "blender") and **diarization / "is this
  directed at me"** (cross-talk). At **8kHz mono telephone audio** this is genuinely hard
  and is mostly dashboard candy. **Research → Phase 3, defer.**
Keeping these separate is the line between a shippable differentiator and a rabbit hole.

## Types (MVP shape)
```ts
interface SoundGateAudioContext {
  agentState: "speaking" | "listening" | "thinking";
  vadState: "speech_started" | "speech_stopped" | "silence";
  transcriptPartial: string;
  audioWindowMs: number;        // e.g. 1500
  energyScore: number;          // RMS of the window (noise gating)
  lastAgentUtterance?: string;
  lastUserUtterance?: string;
}

interface SoundGateDecision {
  eventType: "directed_speech" | "background_noise" | "unclear_audio"
           | "silence" | "cross_talk" | "user_interruption";
  confidence: number;
  noiseLabel?: string;          // Phase 3
  shouldInterruptAgent: boolean;
  shouldAskRepeat: boolean;
  shouldWait: boolean;
  recommendedBehavior: "continue_speaking" | "stop_and_listen" | "wait" | "ask_repeat" | "ignore" | "escalate";
  recommendedPhrase?: string;   // e.g. "One moment, I'm checking that now."
}
```
`analyzeAudioContext(ctx): SoundGateDecision` — **rule-based MVP**, local & synchronous:
- user speech starts while agent speaking → `user_interruption`, `shouldInterruptAgent`.
- energy without speech → `background_noise`, `continue_speaking` (ignore).
- low-confidence speech (`<~0.55`) → `unclear_audio`, `ask_repeat` + repair phrase.
- caller paused but thought likely incomplete → `wait` (brief).
- long tool lookup → recommend a holding phrase ("One moment, I'm pulling that up.").
Placeholder classifiers (energy, confidence, noise label) are swappable for real audio
models later without touching the Turn Manager interface.

## Human-like behaviors
1. **Barge-in** — caller interrupts, agent stops immediately. *(shipped)*
2. **Floor-holding** — during a tool lookup: "One moment, I'm pulling that up."
3. **Polite repair** — unclear audio: "Sorry, I caught some background noise — could you
   repeat the last part?"
4. **Noise awareness** — horn/espresso/blender/crowd: don't react unless it's speech.
   *(transient bursts handled by the debounce now; sustained-noise classification = Phase 3.)*
5. **Thought patience** — "umm, I think…" → wait, don't jump in. *(tuned server_vad silence window helps now; semantic VAD is a proposed upgrade)*

## Already shipped (voice-gateway, first slice)
- **Barge-in debounce** (`soundGate.bargeInMinMs`, env `BARGE_IN_MIN_MS`) over the gateway's
  client-owned floor control, on top of the tuned `server_vad` — holds through transient
  noise / one-word backchannels so the agent isn't cut off. (`semantic_vad` by default, via a
  per-tenant `turnDetection` override, is a **proposed** next step — not in this slice.)
- **Client-owned barge-in:** on caller interruption the gateway flushes Twilio's queued
  audio, `response.cancel`s the model, and `conversation.item.truncate`s its memory to what
  the caller *actually heard* (so the agent doesn't think it finished a cut-off sentence).
  Played position is approximated by elapsed audio time; **refine with Twilio `mark` acks.**
- **SoundGate referee seam (`soundgate.ts`)** — the local, synchronous `BargeInGate`. First
  rule: **barge-in debounce** (`soundGate.bargeInMinMs`, env `BARGE_IN_MIN_MS`, default 150;
  per-tenant) — only yield to *sustained* speech, so transients/backchannels don't kill the
  turn. Time-injected and unit-tested keyless (`npm run simulate`, Scenario 10). This is the
  seam Phase 2/3 plug into — energy/confidence/noise-label are marked extension points.
- **Turn-quality telemetry in `/stats`** (TTFA, barge-ins, suppressed transients, Realtime
  errors, hang-up-after-interruption) so the debounce/VAD are *tunable* — you can't tune
  what you don't measure. Engineering spec + KPI definitions + phase plan: the colocated
  `services/voice-gateway/SOUNDGATE.md` (this doc stays the product/strategy canonical).

## MVP build phases
- **Phase 1 — basic agent (DONE/▣):** Twilio + Realtime + business script + barge-in + call
  summary to Fina Calle OS. *(barge-in + summary live; semantic VAD live.)*
- **Phase 2 — SoundGate Lite (▣ started):** barge-in **debounce** for transients/backchannels
  is **DONE**; remaining: floor-holding phrase on slow tool calls, "could you repeat that?"
  repair, and patience tuning. (Note: the originally-listed "energy-gate" was reconsidered —
  see problem A; debounce is the correct transient primitive.)
- **Phase 3 — environment intelligence:** noise classification, confidence scoring,
  caller-vs-background separation, an "interruption mistakes" dashboard. *(research, problem B.)*
- **Phase 4 — client product:** package as tiers — basic assistant · smart turn-taking ·
  premium **SoundGate** for noisy venues.

## Compliance (carry over from the phone-assistant plan)
The FCC treats AI-generated voices in **outbound** robocalls as regulated "artificial"
voices under TCPA; the gateway is **inbound-only with AI disclosure on by default**, the
conservative posture. SoundGate does **not** change that — keep outbound a separate gated
phase, and for recorded/analyzed calls use clear disclosure + conservative (stricter-state)
consent for multi-state calling.

## Risks / cautions
- **Latency** — the referee must be local/synchronous; never an LLM round-trip (see core
  principle).
- **Audio fidelity** — 8kHz μ-law mono caps Phase-3 classification/diarization accuracy.
- **False interruptions** — over-eager barge-in in noisy rooms is the #1 real-world failure;
  Phase 2 energy gating targets exactly this.
- **Don't overbuild** — ship the rule-based gate; swap in audio models only when call data
  justifies it.

## Where it sits in AMMA & resume sequence
A premium layer on the **AI Phone Assistant** (`PRODUCT_MODULES/AI_PHONE_ASSISTANT_PLAN.md`).
Resume after VBFH clears: **Phase 2** (energy noise-gate + floor-holding + repair), then a
**Colattao café pilot** to prove it in a noisy room, then the Phase-3 dashboard for sales
evidence. Build only one phase at a time (WIP cap).
