// Voice gateway server: HTTP for Twilio's TwiML webhook + a WebSocket endpoint for
// the bidirectional Media Stream. Each call bridges Twilio <-> a RealtimeSession.
// Run on an always-on host (Render/Fly/Railway/VM), NOT serverless — media streams
// are long-lived. PUBLIC_HOST must be the public wss host (e.g. voice.finacalleos.com).

import http from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { config } from "./config";
import { connectStreamTwiML, mediaFrame, clearFrame } from "./twilio";
import { RealtimeSession } from "./realtime";
import { store } from "./store";
import { finalizeCall } from "./orchestrator";

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  if (url.pathname === "/healthz") { res.writeHead(200).end("ok"); return; }
  if (url.pathname === "/stats") {
    res.writeHead(200, { "Content-Type": "application/json" })
      .end(JSON.stringify({ business: config.business.name, connector: config.connector, ...store.stats() }, null, 2));
    return;
  }
  if (url.pathname === "/twiml") {
    res.writeHead(200, { "Content-Type": "text/xml" }).end(connectStreamTwiML());
    return;
  }
  res.writeHead(404).end("not found");
});

const wss = new WebSocketServer({ server, path: "/media" });

wss.on("connection", (twilioWs: WebSocket) => {
  const call = store.createCall();
  let streamSid = "";
  let realtime: RealtimeSession | null = null;

  const startRealtime = () => {
    realtime = new RealtimeSession(call.callId, {
      onAudio: (b64) => { if (streamSid) twilioWs.send(mediaFrame(streamSid, b64)); },
      onUserSpeechStarted: () => { if (streamSid) twilioWs.send(clearFrame(streamSid)); },
    });
  };

  twilioWs.on("message", (raw) => {
    let msg: { event?: string; start?: { streamSid?: string }; media?: { payload?: string } };
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    switch (msg.event) {
      case "start":
        streamSid = msg.start?.streamSid ?? "";
        startRealtime();
        break;
      case "media":
        if (msg.media?.payload) realtime?.appendAudio(msg.media.payload);
        break;
      case "stop":
        realtime?.close(); void finalizeCall(call.callId);
        break;
      default:
        break;
    }
  });

  twilioWs.on("close", () => { realtime?.close(); void finalizeCall(call.callId); });
  twilioWs.on("error", () => { realtime?.close(); void finalizeCall(call.callId); });
});

server.listen(config.port, () => {
  console.log(`[voice-gateway] http+ws on :${config.port}`);
  console.log(`[voice-gateway] connector=${config.connector}  business=${config.business.name}`);
  if (!config.publicHost) console.warn("[voice-gateway] PUBLIC_HOST is empty — set it to your public wss host for Twilio <Stream>.");
  if (!config.openaiApiKey) console.warn("[voice-gateway] OPENAI_API_KEY is empty — live calls will fail (simulator still works).");
});
