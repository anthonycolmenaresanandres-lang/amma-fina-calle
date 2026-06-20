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
import { getTenantById, getTenantByNumber, allTenants } from "./tenant";
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
  if (url.pathname === "/tenants") {
    // Ops view — who's wired up, on which numbers, with which connector. No secrets.
    const list = allTenants().map((t) => ({
      id: t.id, business: t.business.name, kind: t.business.kind,
      phoneNumbers: t.phoneNumbers, connector: t.connector, hours: t.business.hours,
      services: t.business.services.map((s) => s.name),
    }));
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ count: list.length, tenants: list }, null, 2));
    return;
  }
  if (url.pathname === "/twiml") {
    // Twilio posts form-encoded (To, From); also accept query for GET. Route by `To`.
    const body = await readBody(req);
    const params = new URLSearchParams(body || "");
    const to = params.get("To") ?? url.searchParams.get("To") ?? undefined;
    const from = params.get("From") ?? url.searchParams.get("From") ?? "";
    const tenant = getTenantByNumber(to ?? undefined);
    res.writeHead(200, { "Content-Type": "text/xml" }).end(connectStreamTwiML(tenant.id, from));
    return;
  }
  res.writeHead(404).end("not found");
});

const wss = new WebSocketServer({ server, path: "/media" });

wss.on("connection", (twilioWs: WebSocket) => {
  let call: CallRecord | null = null;
  let streamSid = "";
  let realtime: RealtimeSession | null = null;
  let latestMediaTs = 0; // Twilio media clock (ms) — how much caller-side audio has elapsed
  let responseStartTs: number | null = null; // media clock when the current assistant turn began
  let lastItem: string | undefined; // current assistant turn id, mirrored from realtime

  twilioWs.on("message", (raw) => {
    let msg: { event?: string; start?: { streamSid?: string; customParameters?: Record<string, string> }; media?: { payload?: string; timestamp?: string } };
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    switch (msg.event) {
      case "start": {
        streamSid = msg.start?.streamSid ?? "";
        const tenant = getTenantById(msg.start?.customParameters?.tenant) ?? getTenantByNumber(undefined);
        const fromPhone = msg.start?.customParameters?.from || undefined;
        call = store.createCall(fromPhone, tenant.id);
        realtime = new RealtimeSession(tenant, call.callId, {
          onAudio: (b64, itemId) => {
            if (!streamSid) return;
            // New assistant turn → mark when it began on the caller's media clock.
            if (itemId && itemId !== lastItem) { lastItem = itemId; responseStartTs = latestMediaTs; }
            twilioWs.send(mediaFrame(streamSid, b64));
          },
          onUserSpeechStarted: () => {
            // Caller barged in: tell the model how much it actually got to say, then clear Twilio's buffer.
            if (realtime && responseStartTs !== null) realtime.truncate(latestMediaTs - responseStartTs);
            if (streamSid) twilioWs.send(clearFrame(streamSid));
            responseStartTs = null; lastItem = undefined;
          },
        });
        break;
      }
      case "media":
        if (msg.media?.timestamp) latestMediaTs = Number(msg.media.timestamp);
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
