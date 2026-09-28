import assert from "node:assert/strict";
import { clipSms, emptyTwiML, escapeXml, helpReply, isOptOutKeyword, messageTwiML } from "./sms";
import type { Tenant } from "./tenant";

const tenant: Tenant = {
  id: "fina-calle",
  phoneNumbers: ["17573001118"],
  connector: "proposeconfirm",
  tools: ["take_message"],
  voice: "marin",
  language: "English",
  soundGate: { bargeInMinMs: 150 },
  disclosure: "Automated assistant",
  business: {
    name: "Fina Calle",
    kind: "consulting and digital delivery company",
    timezone: "America/New_York",
    services: [],
    hours: "Monday through Friday",
    openDays: [1, 2, 3, 4, 5],
    openHour: 9,
    closeHour: 18,
  },
};

assert.equal(escapeXml('<tag a="b">Tom & Ana\'s</tag>'), "&lt;tag a=&quot;b&quot;&gt;Tom &amp; Ana&apos;s&lt;/tag&gt;");
assert.equal(messageTwiML("A & B"), '<?xml version="1.0" encoding="UTF-8"?><Response><Message>A &amp; B</Message></Response>');
assert.equal(emptyTwiML(), '<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
assert.match(helpReply(tenant), /^Fina Calle:/);
assert.match(helpReply(tenant), /Reply STOP to opt out\.$/);
assert.equal(clipSms("  hello   there  ", 20), "hello there");
assert.equal(clipSms("abcdefghij", 7), "abcdef…");
assert.equal(isOptOutKeyword(" STOP "), true);
assert.equal(isOptOutKeyword("stop by tomorrow"), false);

console.log("SMS simulator: 9/9 deterministic checks passed (no keys or messages sent).");
