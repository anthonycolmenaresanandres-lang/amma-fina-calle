// Twilio helpers: the TwiML that connects an inbound call to our Media Stream,
// and the JSON frames we send back to play audio / clear the buffer (barge-in).

import { config } from "./config";

// The tenant is resolved from the dialled number at /twiml and carried into the Media
// Stream as <Parameter>s, which surface in the stream's `start` event as
// customParameters — that's how one gateway serves many businesses and knows who called.
// We pass the resolved tenant id and the caller's number (for callbacks/alerts).
function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function connectStreamTwiML(tenantId: string, fromNumber = ""): string {
  const wss = `wss://${config.publicHost}/media`;
  const fromParam = fromNumber ? `\n      <Parameter name="from" value="${xmlEscape(fromNumber)}" />` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wss}">
      <Parameter name="tenant" value="${xmlEscape(tenantId)}" />${fromParam}
    </Stream>
  </Connect>
</Response>`;
}

export function mediaFrame(streamSid: string, payloadBase64Ulaw: string): string {
  return JSON.stringify({ event: "media", streamSid, media: { payload: payloadBase64Ulaw } });
}

/** Flush audio already queued at Twilio — used when the caller barges in. */
export function clearFrame(streamSid: string): string {
  return JSON.stringify({ event: "clear", streamSid });
}
