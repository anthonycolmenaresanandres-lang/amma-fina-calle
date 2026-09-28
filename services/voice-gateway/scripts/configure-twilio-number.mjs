#!/usr/bin/env node

import twilio from "twilio";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const includeSms = args.has("--include-sms");
const phoneNumber = process.env.TWILIO_PHONE_NUMBER || "+17573001118";
const publicHost = (process.env.PUBLIC_HOST || "fina-calle-voice-gateway.onrender.com")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

const desired = {
  friendlyName: "Fina Calle 757-300-1118",
  voiceMethod: "POST",
  voiceUrl: `https://${publicHost}/twiml`,
  voiceFallbackMethod: "POST",
  voiceFallbackUrl: `https://${publicHost}/voice-fallback`,
  ...(includeSms ? { smsMethod: "POST", smsUrl: `https://${publicHost}/sms` } : {}),
};

console.log(JSON.stringify({
  mode: apply ? "APPLY" : "DRY RUN",
  phoneNumber,
  includeSms,
  desired,
}, null, 2));

if (!apply) {
  console.log("Dry run only. Add --apply after the deployed tenant is verified. Add --include-sms only after A2P approval.");
  process.exit(0);
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
if (!accountSid || !apiKey || !apiSecret) {
  throw new Error("TWILIO_ACCOUNT_SID, TWILIO_API_KEY, and TWILIO_API_SECRET are required for --apply");
}

const client = twilio(apiKey, apiSecret, { accountSid });
const explicitSid = process.env.TWILIO_PHONE_SID;
let phoneSid = explicitSid;
if (!phoneSid) {
  const matches = await client.incomingPhoneNumbers.list({ phoneNumber, limit: 2 });
  if (matches.length !== 1) throw new Error(`Expected exactly one Twilio number match, found ${matches.length}`);
  phoneSid = matches[0].sid;
}

const updated = await client.incomingPhoneNumbers(phoneSid).update(desired);
console.log(JSON.stringify({
  updated: true,
  sid: updated.sid,
  phoneNumber: updated.phoneNumber,
  friendlyName: updated.friendlyName,
  voiceUrl: updated.voiceUrl,
  voiceFallbackUrl: updated.voiceFallbackUrl,
  smsUrl: updated.smsUrl,
}, null, 2));
