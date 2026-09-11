import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ownerAccountProfile } from "../src/lib/owner/account-profile";

let passed = 0;
function test(name: string, run: () => void) { run(); passed++; console.log(`PASS ${name}`); }
test("missing account remains unavailable", () => assert.equal(ownerAccountProfile(null), null));
test("array is not an account", () => assert.equal(ownerAccountProfile([]), null));
test("empty fields are not invented", () => assert.deepEqual(ownerAccountProfile({}), { billingName: null, contactName: null, contactEmail: null, contactPhone: null, billingAddress: [] }));
test("explicit display allowlist", () => {
  const profile = ownerAccountProfile({ billing_name: " Sample restaurant ", contact_name: " Sample contact ", contact_email: " sample@example.invalid ", contact_phone: " ", billing_address_line1: "Sample street", billing_address_city: "Sample city", billing_address_state: "VA", billing_address_postal_code: "00000", billing_address_country: "US", stripe_customer_id: "never-render", owner_emails: ["never-render"] });
  assert.deepEqual(profile, { billingName: "Sample restaurant", contactName: "Sample contact", contactEmail: "sample@example.invalid", contactPhone: null, billingAddress: ["Sample street", "Sample city VA 00000", "US"] });
});
test("non-text fields are excluded", () => assert.equal(ownerAccountProfile({ contact_email: { secret: true } })?.contactEmail, null));
const page = readFileSync("src/app/owner/[id]/page.tsx", "utf8");
test("account query remains behind owner and reset gates", () => {
  const query = page.indexOf('.select("billing_name, contact_name');
  assert.ok(query > page.indexOf('ctx.state !== "authorized"'));
  assert.ok(query > page.indexOf('ctx.state === "password_reset_required"'));
  assert.match(page.slice(query, query + 330), /\.eq\("id", id\)/);
  assert.match(page, /account: accountRes.error \? null : ownerAccountProfile\(accountRes.data\)/);
});
const billing = readFileSync("src/app/owner/[id]/BillingCard.tsx", "utf8");
test("existing tenant-bound payment actions reused", () => {
  assert.match(billing, /startRecurringBilling.bind\(null, restaurantId\)/);
  assert.match(billing, /openBillingPortal.bind\(null, restaurantId\)/);
});
test("read-only preview has no payment form", () => {
  assert.match(billing, /readOnly \? <div[\s\S]*?<Button type="button"[\s\S]*?disabled[\s\S]*?: <form action=\{action\}/);
  assert.match(billing, /Opening this page does not enroll you/);
});
const actions = readFileSync("src/lib/billing/actions.ts", "utf8");
test("both payment endpoints reauthorize", () => assert.equal((actions.match(/await requireOwner\(restaurantId\)/g) ?? []).length, 2));
test("checkout price is server-configured", () => { assert.match(actions, /const priceId = getRecurringPriceId\(\)/); assert.match(actions, /line_items: \[\{ price: priceId, quantity: 1 \}\]/); });
test("billing portal uses tenant mapping", () => assert.match(actions, /\.select\("stripe_customer_id"\)[\s\S]*?\.eq\("restaurant_id", restaurantId\)/));
test("preview does not adopt Colattao terms", () => {
  const preview = readFileSync("src/app/(internal)/pilot/las-palmas/PilotWorkspace.tsx", "utf8");
  assert.match(preview, /amountCents: null/);
  assert.match(preview, /scheduledFirstChargeOn: null, actionsEnabled: false/);
  assert.match(preview, /billing=\{pendingBilling\} readOnly/);
});
test("Colattao separate guest site stays request-managed", () => {
  const dashboard = readFileSync("src/app/owner/[id]/OwnerDashboard.tsx", "utf8");
  assert.match(dashboard, /data.restaurantId === "colattao" \? <p[\s\S]*?separate Colattao site[\s\S]*?: <MenuQuickEdit/);
});
console.log(`${passed} account/payment presentation checks passed. No Stripe calls or database writes performed.`);
