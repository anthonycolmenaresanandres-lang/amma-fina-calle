// Twilio helpers: the TwiML that connects an inbound call to our Media Stream,
// and the JSON frames we send back to play audio / clear the buffer (barge-in).

import { config } from "./config";

export function connectStreamTwiML(): string {
  const wss = `wss://${config.publicHost}/media`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wss}" />
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
