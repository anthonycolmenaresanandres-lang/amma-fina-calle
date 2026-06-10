// Voice gateway server: HTTP for Twilio's TwiML webhook + a WebSocket endpoint for
// the bidirectional Media Stream. Each call bridges Twilio <-> a RealtimeSession.
// Multi-tenant: the dialled number (Twilio `To`) selects the tenant at /twiml, and the
// tenant id rides into the Media Stream so the session uses that business's Knowledge
// Pack + connector. Run on an always-on host (Render/Fly/Railway/VM), NOT serverless.

import http from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { config } from "./config";
import { connectStreamTwiML, mediaFrame, clearFrame } from "./twilio";
import { RealtimeSession } from "./realtime";
import { store } from "./store";
import { finalizeCall } from "./orchestrator";
import { getTenantById, getTenantByNumber } from "./tenant";
import type { CallRecord } from "./types";

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => resolve(body));
    req.on("error", () => resolve(""));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  if (url.pathname === "/healthz") { res.writeHead(200).end("ok"); return; }
  if (url.pathname === "/stats") {
    const tenantId = url.searchParams.get("tenant") ?? undefined;
    res.writeHead(200, { "Content-Type": "application/json" })
      .end(JSON.stringify({ tenant: tenantId ?? "all", ...store.stats(tenantId) }, null, 2));
    return;
  }
  if (url.pathname === "/twiml") {
    // Twilio posts form-encoded (To, From); also accept query for GET. Route by `To`.
    const body = await readBody(req);
    const params = new URLSearchParams(body || "");
    const to = params.get("To") ?? url.searchParams.get("To") ?? undefined;
    const tenant = getTenantByNumber(to ?? undefined);
    res.writeHead(200, { "Content-Type": "text/xml" }).end(connectStreamTwiML(tenant.id));
    return;
  }
  res.writeHead(404).end("not found");
});

const wss = new WebSocketServer({ server, path: "/media" });

wss.on("connection", (twilioWs: WebSocket) => {
  let call: CallRecord | null = null;
  let streamSid = "";
  let realtime: RealtimeSession | null = null;

  twilioWs.on("message", (raw) => {
    let msg: { event?: string; start?: { streamSid?: string; customParameters?: Record<string, string> }; media?: { payload?: string } };
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    switch (msg.event) {
      case "start": {
        streamSid = msg.start?.streamSid ?? "";
        const tenant = getTenantById(msg.start?.customParameters?.tenant) ?? getTenantByNumber(undefined);
        call = store.createCall(undefined, tenant.id);
        realtime = new RealtimeSession(tenant, call.callId, {
          onAudio: (b64) => { if (streamSid) twilioWs.send(mediaFrame(streamSid, b64)); },
          onUserSpeechStarted: () => { if (streamSid) twilioWs.send(clearFrame(streamSid)); },
        });
        break;
      }
      case "media":
        if (msg.media?.payload) realtime?.appendAudio(msg.media.payload);
        break;
      case "stop":
        realtime?.close(); if (call) void finalizeCall(call.callId);
        break;
      default:
        break;
    }
  });

  twilioWs.on("close", () => { realtime?.close(); if (call) void finalizeCall(call.callId); });
  twilioWs.on("error", () => { realtime?.close(); if (call) void finalizeCall(call.callId); });
});

server.listen(config.port, () => {
  console.log(`[voice-gateway] http+ws on :${config.port}`);
  console.log(`[voice-gateway] connector=${config.connector}  business=${config.business.name}`);
  if (!config.publicHost) console.warn("[voice-gateway] PUBLIC_HOST is empty — set it to your public wss host for Twilio <Stream>.");
  if (!config.openaiApiKey) console.warn("[voice-gateway] OPENAI_API_KEY is empty — live calls will fail (simulator still works).");
});
