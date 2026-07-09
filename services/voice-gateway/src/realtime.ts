// OpenAI Realtime WebSocket client (GA API). Bridges μ-law/8k telephony audio straight
// to Realtime (G.711 μ-law = audio/pcmu in/out — no transcoding), advertises our tools,
// and routes function calls to the orchestrator. Migrated off the beta interface, which
// OpenAI retired 2026-05-12: nested session.audio config, audio/pcmu format objects,
// output_modalities, no beta header, and response.output_audio.delta for streamed audio.
// Re-confirm the function-call event name by logging raw events on the first live call.

import WebSocket from "ws";
import { config, requireOpenAI } from "./config";
import { tools, systemInstructions } from "./tools";
import { runTool } from "./orchestrator";
import { BargeInGate } from "./soundgate";
import { store } from "./store";
import type { Tenant } from "./tenant";

export interface RealtimeHooks {
  onAudio: (base64ulaw: string, itemId?: string) => void; // play to caller (itemId = assistant turn)
  onUserSpeechStarted: () => void; // for barge-in (clear queued audio)
  onClosed?: () => void; // OpenAI socket dropped unexpectedly (so the caller isn't left in dead air)
}

export function buildRealtimeSessionUpdate(tenant: Tenant): Record<string, unknown> {
  const b = tenant.business;
  // A tenant may fully override the instructions (e.g. an info/Q&A line) and ship its own
  // knowledge pack; otherwise use the default booking-receptionist script. A tenant may also
  // restrict which tools are advertised (e.g. an info line that can only take_message).
  const instructions = tenant.instructions
    ? [tenant.instructions, tenant.knowledge].filter(Boolean).join("\n\n")
    : systemInstructions(b.name, b.kind, b.hours, tenant.language);
  const advertisedTools = tenant.tools?.length
    ? tools.filter((t) => tenant.tools!.includes(t.name))
    : tools;
  return {
    type: "session.update",
    session: {
      type: "realtime",
      instructions,
      output_modalities: ["audio"],
      audio: {
        input: {
          format: { type: "audio/pcmu" }, // G.711 μ-law from Twilio
          // Tuned for noisy phone lines: a higher threshold + longer trailing silence than
          // the defaults means fewer false barge-ins, which otherwise clip/stutter the reply.
          turn_detection: { type: "server_vad", threshold: 0.6, prefix_padding_ms: 300, silence_duration_ms: 700 },
        },
        output: {
          format: { type: "audio/pcmu" }, // G.711 μ-law back to Twilio
          voice: tenant.voice,
        },
      },
      tools: advertisedTools,
      tool_choice: "auto",
    },
  };
}

export function buildGreetingResponse(tenant: Tenant): Record<string, unknown> {
  const disclosure = tenant.disclosure.replace("{business}", tenant.business.name);
  return { type: "response.create", response: { instructions: `Say exactly, warmly: "${disclosure}"` } };
}

export class RealtimeSession {
  private ws: WebSocket;
  private tenant: Tenant;
  private callId: string;
  private hooks: RealtimeHooks;
  private ready = false;
  private lastAssistantItem: string | null = null; // current assistant audio turn (for barge-in truncate)
  private truncatedItemId: string | null = null; // suppress audio still in flight after a truncate
  private closedByUs = false; // tell an intentional close() apart from an unexpected drop
  private readonly gate: BargeInGate; // SoundGate barge-in referee (transient-noise debounce)
  private bargeInTimer: ReturnType<typeof setTimeout> | null = null; // pending debounce check
  private userTurnEndedAt = 0; // last caller speech_stopped — for time-to-first-audio (TTFA)

  constructor(tenant: Tenant, callId: string, hooks: RealtimeHooks) {
    this.tenant = tenant;
    this.callId = callId;
    this.hooks = hooks;
    this.gate = new BargeInGate(tenant.soundGate);
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(config.realtimeModel)}`;
    this.ws = new WebSocket(url, {
      headers: { Authorization: `Bearer ${requireOpenAI()}` }, // GA: no beta header
    });
    this.ws.on("open", () => this.onOpen());
    this.ws.on("message", (d) => this.onMessage(d));
    this.ws.on("error", (e) => console.error("[realtime] error", e));
    this.ws.on("close", () => { this.ready = false; if (!this.closedByUs) this.hooks.onClosed?.(); });
  }

  private send(obj: unknown): void {
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }

  private onOpen(): void {
    this.send(buildRealtimeSessionUpdate(this.tenant));
    this.ready = true;
    // Greet + AI disclosure as the first turn.
    this.send(buildGreetingResponse(this.tenant));
  }

  /** Append caller audio (base64 μ-law). */
  appendAudio(base64ulaw: string): void {
    if (this.ready) this.send({ type: "input_audio_buffer.append", audio: base64ulaw });
  }

  /** Nudge the model to close the call warmly and briefly, just before the hard time cap —
   *  so the caller gets a graceful goodbye instead of being cut off mid-sentence. */
  promptWrapUp(): void {
    if (!this.ready) return;
    this.send({ type: "response.create", response: { instructions:
      "You're almost out of time on this call. Warmly and briefly wrap up in one or two short sentences: " +
      "make sure they got what they needed, thank them sincerely for calling, and warmly invite them to call back " +
      "anytime. Sound genuinely warm, like you enjoyed helping them — do not mention time limits, systems, or that you must go." } });
  }

  /** Barge-in: tell the model how much of its current turn the caller actually heard, so its
   *  memory matches reality (prevents context desync that garbles later turns). audioEndMs
   *  comes from the Twilio media clock; no-ops if the turn already finished. */
  truncate(audioEndMs: number): void {
    const item = this.lastAssistantItem;
    if (!item) return;
    this.send({ type: "conversation.item.truncate", item_id: item, content_index: 0, audio_end_ms: Math.max(0, Math.floor(audioEndMs)) });
    this.truncatedItemId = item;
    this.lastAssistantItem = null;
  }

  /** Caller speech began. SoundGate decides whether it's a real interruption: with a debounce
   *  (soundGate.bargeInMinMs) we wait to confirm the speech is *sustained* before yielding, so a
   *  transient clink/cough/blender-burst — or a one-word backchannel like "mm-hm" — doesn't kill
   *  the agent's turn. bargeInMinMs=0 yields instantly (legacy behavior). */
  private onSpeechStarted(): void {
    store.recordSpeechStart(this.callId, this.tenant.id);
    const { yieldNow, delayMs } = this.gate.onSpeechStarted(Date.now());
    if (yieldNow) { this.yieldFloor(); return; }
    if (this.bargeInTimer) clearTimeout(this.bargeInTimer);
    this.bargeInTimer = setTimeout(() => {
      this.bargeInTimer = null;
      if (this.gate.evaluate(Date.now()) === "yield") this.yieldFloor();
    }, delayMs);
  }

  /** Caller speech stopped before the debounce elapsed — a transient. Cancel the pending
   *  barge-in so the agent keeps talking uninterrupted. */
  private onSpeechStopped(): void {
    if (this.bargeInTimer) {
      clearTimeout(this.bargeInTimer);
      this.bargeInTimer = null;
      store.recordTransientSuppressed(this.callId, this.tenant.id);
    }
    this.gate.onSpeechStopped();
    this.userTurnEndedAt = Date.now(); // start the TTFA clock for the agent's reply
  }

  /** Sustained speech confirmed → yield the floor. Delegates to the existing barge-in hook,
   *  which flushes the audio queued at Twilio and truncates the model's memory to what the
   *  caller actually heard, using the accurate Twilio media clock (see server.ts). */
  private yieldFloor(): void {
    if (this.bargeInTimer) { clearTimeout(this.bargeInTimer); this.bargeInTimer = null; }
    store.recordBargeIn(this.callId, this.tenant.id);
    this.gate.reset();
    this.hooks.onUserSpeechStarted();
  }

  private async onMessage(data: WebSocket.RawData): Promise<void> {
    let evt: { type?: string; [k: string]: unknown };
    try { evt = JSON.parse(data.toString()); } catch { return; }
    switch (evt.type) {
      case "response.output_audio.delta": {
        const itemId = typeof evt.item_id === "string" ? evt.item_id : "";
        if (itemId && itemId === this.truncatedItemId) break; // drop audio still in flight after a barge-in
        if (itemId && itemId !== this.lastAssistantItem) {
          this.lastAssistantItem = itemId; // a new assistant turn has started
          this.truncatedItemId = null;
          if (this.userTurnEndedAt) { // first audio since the caller stopped → record TTFA
            store.recordTtfa(this.callId, this.tenant.id, Date.now() - this.userTurnEndedAt);
            this.userTurnEndedAt = 0;
          }
        }
        if (typeof evt.delta === "string") this.hooks.onAudio(evt.delta, this.lastAssistantItem ?? undefined);
        break;
      }
      case "response.output_audio.done":
      case "response.done":
        this.lastAssistantItem = null; // turn finished normally — nothing to truncate
        break;
      case "input_audio_buffer.speech_started":
        this.onSpeechStarted();
        break;
      case "input_audio_buffer.speech_stopped":
        this.onSpeechStopped();
        break;
      case "response.function_call_arguments.done": {
        const name = String(evt.name ?? "");
        const callId = String(evt.call_id ?? "");
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(String(evt.arguments ?? "{}")); } catch { /* keep {} */ }
        const output = await runTool(this.tenant, this.callId, name, args);
        this.send({ type: "conversation.item.create", item: { type: "function_call_output", call_id: callId, output } });
        this.send({ type: "response.create" });
        break;
      }
      case "error": {
        // Capture the Realtime failure (e.g. insufficient_quota) so a silent hang-up is
        // visible in /stats instead of looking like a clean call.
        const errObj = (evt.error ?? {}) as { code?: string; type?: string };
        store.recordRealtimeError(this.callId, this.tenant.id, errObj.code ?? errObj.type);
        console.error("[realtime] server error", evt);
        break;
      }
      default:
        break;
    }
  }

  close(): void {
    this.closedByUs = true;
    if (this.bargeInTimer) { clearTimeout(this.bargeInTimer); this.bargeInTimer = null; }
    try { this.ws.close(); } catch { /* ignore */ }
  }
}
