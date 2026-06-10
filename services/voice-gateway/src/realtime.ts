// OpenAI Realtime WebSocket client. Bridges μ-law/8k telephony audio straight to
// Realtime (g711_ulaw in/out — no transcoding), advertises our tools, and routes
// function calls to the orchestrator. NOTE: Realtime event names evolve — verify
// against current docs before production (see the plan's "re-verify" note).

import WebSocket from "ws";
import { config, requireOpenAI } from "./config";
import { tools, systemInstructions } from "./tools";
import { runTool } from "./orchestrator";
import type { Tenant } from "./tenant";

export interface RealtimeHooks {
  onAudio: (base64ulaw: string) => void; // play to caller
  onUserSpeechStarted: () => void; // for barge-in (clear queued audio)
}

export class RealtimeSession {
  private ws: WebSocket;
  private tenant: Tenant;
  private callId: string;
  private hooks: RealtimeHooks;
  private ready = false;

  constructor(tenant: Tenant, callId: string, hooks: RealtimeHooks) {
    this.tenant = tenant;
    this.callId = callId;
    this.hooks = hooks;
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(config.realtimeModel)}`;
    this.ws = new WebSocket(url, {
      headers: { Authorization: `Bearer ${requireOpenAI()}`, "OpenAI-Beta": "realtime=v1" },
    });
    this.ws.on("open", () => this.onOpen());
    this.ws.on("message", (d) => this.onMessage(d));
    this.ws.on("error", (e) => console.error("[realtime] error", e));
    this.ws.on("close", () => { this.ready = false; });
  }

  private send(obj: unknown): void {
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(obj));
  }

  private onOpen(): void {
    const b = this.tenant.business;
    this.send({
      type: "session.update",
      session: {
        instructions: systemInstructions(b.name, b.kind, b.hours),
        voice: this.tenant.voice,
        modalities: ["audio", "text"],
        input_audio_format: "g711_ulaw",
        output_audio_format: "g711_ulaw",
        turn_detection: { type: "server_vad", silence_duration_ms: 500 },
        tools,
        tool_choice: "auto",
      },
    });
    this.ready = true;
    // Greet + AI disclosure as the first turn.
    const disclosure = this.tenant.disclosure.replace("{business}", b.name);
    this.send({ type: "response.create", response: { instructions: `Say exactly, warmly: "${disclosure}"` } });
  }

  /** Append caller audio (base64 μ-law). */
  appendAudio(base64ulaw: string): void {
    if (this.ready) this.send({ type: "input_audio_buffer.append", audio: base64ulaw });
  }

  private async onMessage(data: WebSocket.RawData): Promise<void> {
    let evt: { type?: string; [k: string]: unknown };
    try { evt = JSON.parse(data.toString()); } catch { return; }
    switch (evt.type) {
      case "response.audio.delta":
        if (typeof evt.delta === "string") this.hooks.onAudio(evt.delta);
        break;
      case "input_audio_buffer.speech_started":
        this.hooks.onUserSpeechStarted();
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
      case "error":
        console.error("[realtime] server error", evt);
        break;
      default:
        break;
    }
  }

  close(): void { try { this.ws.close(); } catch { /* ignore */ } }
}
