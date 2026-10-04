import assert from "node:assert/strict";
import { isTableVisit, sameOrigin } from "../src/table-os/maracaibo/visit-contract";

const check = (url: string, headers: Record<string, string>) => sameOrigin(new Request(url, { headers }));
assert.equal(check("https://finacalleos.com/api/x", { origin: "https://finacalleos.com", host: "finacalleos.com" }), true);
assert.equal(check("http://localhost:3020/api/x", { origin: "http://127.0.0.1:3020", host: "127.0.0.1:3020" }), true);
assert.equal(check("https://finacalleos.com/api/x", { origin: "https://attacker.invalid", host: "finacalleos.com" }), false);
assert.equal(check("https://finacalleos.com/api/x", { origin: "null" }), false);
assert.equal(check("https://finacalleos.com/api/x", {}), false);
assert.equal(check("https://finacalleos.com/api/x", { origin: "https://finacalleos.com", "sec-fetch-site": "cross-site" }), false);
assert.equal(check("https://finacalleos.com/api/x", { origin: "https://finacalleos.com/path" }), false);
assert.equal(check("https://finacalleos.com/api/x", { origin: "https://finacalleos.com:123" }), false);
const good = { status: "active", visitId: "11111111-1111-4111-8111-111111111111", guestId: "22222222-2222-4222-8222-222222222222", tableId: "1", expiresAt: new Date().toISOString() };
assert.equal(isTableVisit(good), true);
for (const value of [null, {}, { ...good, expiresAt: "never" }, { ...good, visitId: "x" }, { ...good, status: "ended" }]) assert.equal(isTableVisit(value), false);
console.log("PASS: 14 request origin and visit response boundary checks");
