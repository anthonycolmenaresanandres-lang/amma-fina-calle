import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import type Stripe from "stripe";
import { approvedTrialEnd, automaticCollectionEnabled, BillingSetupPendingError, priceMatchesApprovedTerms, trustedStripeUrl, webhookClaimState, type ApprovedBillingTerms } from "../src/lib/billing/policy";
import { recurringCheckoutDestination } from "../src/lib/billing/checkout";
import { billingEventCustomer, currentBillingSnapshot, retrieveCurrentBilling } from "../src/lib/billing/reconciliation";

let passed = 0;
async function test(name: string, run: () => void | Promise<void>) { await run(); passed++; console.log(`PASS ${name}`); }
const now = Date.parse("2026-09-14T12:00:00Z");
const terms: ApprovedBillingTerms = { amount_cents: 12345, currency: "usd", billing_interval: "month", billing_interval_count: 1, scheduled_first_charge_on: "2026-09-20" };
const price = { id: "price_fixture", active: true, type: "recurring", billing_scheme: "per_unit", unit_amount: 12345, currency: "usd", recurring: { interval: "month", interval_count: 1, usage_type: "licensed" } } as Stripe.Price;
const subscription = (patch: Partial<Stripe.Subscription> = {}) => ({ id: "sub_fixture", customer: "cus_fixture", status: "active", created: 100, collection_method: "charge_automatically", cancel_at_period_end: false, cancel_at: null, pause_collection: null, items: { data: [{ current_period_end: 1900000000, price }] }, ...patch }) as Stripe.Subscription;
const invoice = (patch: Partial<Stripe.Invoice> = {}) => ({ id: "in_fixture", customer: "cus_fixture", created: 100, status: "paid", status_transitions: { paid_at: 100 }, parent: null, ...patch }) as Stripe.Invoice;
const options = { customerId: "cus_fixture", restaurantId: "sample-restaurant", priceId: "price_fixture", trialEnd: approvedTrialEnd(terms, now), appUrl: "https://finacalleos.com" };

function fakeStripe(subscriptions: Stripe.Subscription[] = []) {
  let creates = 0, portalCreates = 0, hideOpen = false;
  let status: Stripe.Checkout.Session.Status = "open";
  let open: Stripe.Checkout.Session[] = [];
  const requests: Stripe.Checkout.SessionCreateParams[] = [];
  const sessions = new Map<string, Stripe.Checkout.Session>();
  const client = {
    subscriptions: { list: async () => ({ data: subscriptions, has_more: false }) },
    invoices: { list: async () => ({ data: [invoice()], has_more: false }) },
    billingPortal: { sessions: { create: async () => { portalCreates++; return { url: "https://billing.stripe.com/p/session_fixture" }; } } },
    checkout: { sessions: {
      list: async () => ({ data: hideOpen ? [] : open, has_more: false }),
      create: async (params: Stripe.Checkout.SessionCreateParams, request: Stripe.RequestOptions) => {
        requests.push(params);
        const key = request.idempotencyKey!;
        if (sessions.has(key)) return sessions.get(key)!;
        creates++;
        const session = { id: "cs_fixture", mode: "subscription", status, url: "https://checkout.stripe.com/c/pay/cs_fixture", metadata: params.metadata, client_reference_id: params.client_reference_id } as Stripe.Checkout.Session;
        sessions.set(key, session); open = [session]; return session;
      },
    } },
  } as unknown as Stripe;
  return { client, requests, counts: () => ({ creates, portalCreates }), setOpen: (value: Stripe.Checkout.Session[]) => { open = value; }, hideOpen: () => { hideOpen = true; }, setStatus: (value: Stripe.Checkout.Session.Status) => { status = value; } };
}

function webhookFixture() {
  let tick = now, providerFails = true, stateReads = 0;
  const rows: Record<string, Record<string, unknown>[]> = {
    stripe_webhook_events: [],
    restaurant_billing: [{ restaurant_id: "sample-restaurant", stripe_customer_id: "cus_fixture", updated_at: new Date(now - 1000).toISOString(), last_payment_at: null }],
  };
  const admin = { from: (table: string) => {
    const filters: [string, unknown][] = [];
    let patch: Record<string, unknown> | null = null;
    const query = {
      insert: async (row: Record<string, unknown>) => {
        if (rows[table].some((item) => item.id === row.id)) return { error: { code: "23505" } };
        rows[table].push({ processed_at: null, ...row }); return { error: null };
      },
      select: () => query,
      eq: (key: string, value: unknown) => { filters.push([key, value]); return query; },
      is: (key: string, value: unknown) => { filters.push([key, value]); return query; },
      update: (value: Record<string, unknown>) => { patch = value; return query; },
      maybeSingle: async () => {
        const found = rows[table].find((row) => filters.every(([key, value]) => row[key] === value));
        if (found && patch) Object.assign(found, patch);
        return { data: found ? { ...found } : null, error: null };
      },
    };
    return query;
  } };
  const fake = fakeStripe([subscription({ status: "unpaid" })]);
  const event = { id: "evt_fixture", type: "invoice.paid", data: { object: invoice() } } as Stripe.Event;
  const provider = { ...fake.client, webhooks: { constructEvent: () => event } };
  const originalList = fake.client.subscriptions.list;
  provider.subscriptions.list = (async (...args: Parameters<typeof originalList>) => {
    stateReads++;
    if (providerFails) throw new Error("Synthetic provider timeout");
    return originalList(...args);
  }) as typeof originalList;
  const exports: { POST?: (request: unknown) => Promise<{ status: number; body: Record<string, unknown> }> } = {};
  const compiled = ts.transpileModule(readFileSync("src/app/api/stripe/webhook/route.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  class FixtureDate extends Date { constructor() { super(tick); } static now() { return tick; } }
  runInNewContext(compiled, { exports, Date: FixtureDate, require: (name: string) => {
    if (name === "next/server") return { NextResponse: { json: (body: unknown, init?: { status: number }) => ({ body, status: init?.status ?? 200 }) } };
    if (name === "@/lib/supabase/admin") return { getSupabaseAdmin: () => admin };
    if (name === "@/lib/stripe/server") return { getStripe: () => provider, getStripeWebhookSecret: () => "synthetic-fixture-only" };
    if (name === "@/lib/billing/policy") return { webhookClaimState: (row: Parameters<typeof webhookClaimState>[0]) => webhookClaimState(row, tick) };
    if (name === "@/lib/billing/reconciliation") return { billingEventCustomer, retrieveCurrentBilling };
    throw new Error(`Unexpected webhook dependency: ${name}`);
  } });
  return {
    send: () => exports.POST!({ headers: { get: () => "synthetic-signature" }, text: async () => "{}" }),
    retryAfterLease: () => { tick += 300001; providerFails = false; },
    rows,
    reads: () => stateReads,
  };
}

async function main() {
  await test("invoice management needs no enrollment price or webhook configuration", () => {
    const env: Record<string, string> = {
      NODE_ENV: "production", STRIPE_SECRET_KEY: "synthetic-provider-value",
      SUPABASE_SECRET_KEY: "synthetic-database-value", NEXT_PUBLIC_SUPABASE_URL: "https://fixture.invalid",
      NEXT_PUBLIC_APP_URL: "https://finacalleos.com",
    };
    const exports: Record<string, (...args: string[]) => boolean | string> = {};
    const compiled = ts.transpileModule(readFileSync("src/lib/stripe/server.ts", "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    runInNewContext(compiled, { exports, URL, process: { env }, require: (name: string) => {
      if (name === "server-only" || name === "stripe") return {};
      throw new Error(`Unexpected configuration dependency: ${name}`);
    } });
    assert.equal(exports.isBillingManagementConfigured(), true);
    assert.equal(exports.isBillingRuntimeConfigured("sample-restaurant"), false);
    env.STRIPE_RECURRING_PRICE_ID = "price_fixture";
    assert.equal(exports.isBillingRuntimeConfigured("sample-restaurant"), false);
    env.STRIPE_WEBHOOK_SECRET = "synthetic-webhook-value";
    assert.equal(exports.isBillingRuntimeConfigured("sample-restaurant"), true);
    env.STRIPE_RECURRING_PRICE_ID_SAMPLE_RESTAURANT = "price_specific_fixture";
    assert.equal(exports.getRecurringPriceId("sample-restaurant"), "price_specific_fixture");
    delete env.STRIPE_SECRET_KEY;
    assert.equal(exports.isBillingManagementConfigured(), false);
  });
  await test("past, missing, near and invalid first-charge dates never charge immediately", () => {
    for (const date of ["2026-07-20", "2026-09-15", "2026-02-30", "2026-13-01", null]) {
      assert.throws(() => approvedTrialEnd({ ...terms, scheduled_first_charge_on: date }, now), BillingSetupPendingError);
    }
    assert.throws(() => approvedTrialEnd(null, now), BillingSetupPendingError);
    assert.throws(() => approvedTrialEnd({ ...terms, amount_cents: null }, now), BillingSetupPendingError);
    assert.equal(approvedTrialEnd({ ...terms, scheduled_first_charge_on: "2026-09-16" }, now), now / 1000 + 172800);
  });
  await test("another tenant's price and recurring interval cannot be adopted", () => {
    assert.equal(priceMatchesApprovedTerms(price, terms), true);
    assert.equal(priceMatchesApprovedTerms(price, { ...terms, amount_cents: 50000 }), false);
    assert.equal(priceMatchesApprovedTerms(price, { ...terms, billing_interval: "year" }), false);
    assert.equal(priceMatchesApprovedTerms({ ...price, active: false }, terms), false);
    assert.equal(priceMatchesApprovedTerms({ ...price, recurring: { ...price.recurring!, usage_type: "metered" } }, terms), false);
  });
  await test("provider redirects reject lookalike hosts, credentials and insecure URLs", () => {
    for (const url of ["http://checkout.stripe.com/c/pay/x", "https://checkout.stripe.com.evil.invalid/x", "https://evil.invalid/?checkout.stripe.com", "https://user@checkout.stripe.com/x", "https://checkout.stripe.com:444/x", "javascript:alert(1)"]) assert.throws(() => trustedStripeUrl(url, "checkout"));
    assert.throws(() => trustedStripeUrl("https://billing.stripe.com/p/test", "checkout"));
    assert.equal(trustedStripeUrl("https://billing.stripe.com/p/test", "portal"), "https://billing.stripe.com/p/test");
  });
  await test("repeat click reuses the open session without a second checkout", async () => {
    const fake = fakeStripe();
    const first = await recurringCheckoutDestination(fake.client, options);
    assert.equal(await recurringCheckoutDestination(fake.client, options), first);
    assert.equal(fake.counts().creates, 1);
    assert.equal(fake.requests[0].subscription_data?.trial_end, options.trialEnd);
    assert.deepEqual(fake.requests[0].line_items, [{ price: "price_fixture", quantity: 1 }]);
  });
  await test("simultaneous clicks converge on the same Stripe idempotency key", async () => {
    const fake = fakeStripe(); fake.hideOpen();
    const [first, second] = await Promise.all([recurringCheckoutDestination(fake.client, options), recurringCheckoutDestination(fake.client, options)]);
    assert.equal(first, second); assert.equal(fake.counts().creates, 1);
  });
  await test("unpaid, paused, incomplete and active subscriptions route to management", async () => {
    for (const status of ["unpaid", "paused", "incomplete", "active", "trialing", "past_due"] as const) {
      const fake = fakeStripe([subscription({ status })]);
      assert.match(await recurringCheckoutDestination(fake.client, options), /^https:\/\/billing.stripe.com/);
      assert.deepEqual(fake.counts(), { creates: 0, portalCreates: 1 });
    }
  });
  await test("changed approved schedule and foreign pending checkout require review", async () => {
    const fake = fakeStripe(); await recurringCheckoutDestination(fake.client, options);
    await assert.rejects(recurringCheckoutDestination(fake.client, { ...options, trialEnd: options.trialEnd + 86400 }), BillingSetupPendingError);
    fake.setOpen([{ mode: "subscription", client_reference_id: "another-restaurant", metadata: {} } as Stripe.Checkout.Session]);
    await assert.rejects(recurringCheckoutDestination(fake.client, options), BillingSetupPendingError);
    assert.equal(fake.counts().creates, 1);
  });
  await test("completed or expired idempotent session cannot start another subscription", async () => {
    for (const status of ["complete", "expired"] as const) {
      const fake = fakeStripe(); fake.setStatus(status);
      await assert.rejects(recurringCheckoutDestination(fake.client, options), BillingSetupPendingError);
      assert.equal(fake.counts().creates, 1);
    }
  });
  await test("a paid one-off invoice does not enroll automatic payments", () => {
    const state = currentBillingSnapshot([], [invoice()]);
    assert.equal(state.subscription_status, "not_started");
    assert.equal(state.stripe_subscription_id, null);
    assert.equal(state.recurring_enabled, false);
    assert.equal(state.latest_invoice_status, "paid");
  });
  await test("active subscription and paid invoice remain distinct", () => {
    const state = currentBillingSnapshot([subscription()], [invoice({ status: "open", status_transitions: {} as Stripe.Invoice.StatusTransitions })]);
    assert.equal(state.subscription_status, "active"); assert.equal(state.latest_invoice_status, "open");
    assert.equal(state.last_payment_at, undefined);
    assert.equal(automaticCollectionEnabled(subscription({ collection_method: "send_invoice" })), false);
    assert.equal(automaticCollectionEnabled(subscription({ cancel_at_period_end: true })), false);
    assert.equal(automaticCollectionEnabled(subscription({ status: "unpaid" })), false);
    assert.equal(currentBillingSnapshot([subscription({ status: "past_due" })], []).next_payment_at, null);
  });
  await test("out-of-order paid event reconciles provider's current unpaid state", async () => {
    const old = { type: "invoice.paid", data: { object: invoice() } } as Stripe.Event;
    const fake = fakeStripe([subscription({ status: "unpaid" })]);
    const state = await retrieveCurrentBilling(fake.client, billingEventCustomer(old)!);
    assert.equal(state.subscription_status, "unpaid"); assert.equal(state.recurring_enabled, false);
    assert.deepEqual(await retrieveCurrentBilling(fake.client, billingEventCustomer(old)!), state);
  });
  await test("cross-customer provider data and multiple subscriptions fail closed", async () => {
    const fake = fakeStripe([subscription({ customer: "cus_other" })]);
    await assert.rejects(retrieveCurrentBilling(fake.client, "cus_fixture"), /customer mismatch/);
    assert.throws(() => currentBillingSnapshot([subscription(), subscription({ id: "sub_other" })], []), /Multiple subscriptions/);
  });
  await test("crashed event remains retryable; only processed event is a duplicate", () => {
    const received = { processed_at: null, received_at: new Date(now).toISOString() };
    assert.equal(webhookClaimState(received, now + 60000), "busy");
    assert.equal(webhookClaimState(received, now + 300000), "retry");
    assert.equal(webhookClaimState({ ...received, processed_at: new Date(now + 100).toISOString() }, now + 300000), "processed");
    const route = readFileSync("src/app/api/stripe/webhook/route.ts", "utf8");
    assert.doesNotMatch(route, /\.delete\(/);
    assert.match(route, /\.eq\("updated_at", account.updated_at\)/);
    assert.match(route, /\.eq\("received_at", previous.received_at\)\.is\("processed_at", null\)/);
  });
  await test("real webhook handler retries a failed claim then acknowledges only a completed duplicate", async () => {
    const fixture = webhookFixture();
    assert.equal((await fixture.send()).status, 500);
    assert.equal(fixture.rows.stripe_webhook_events.length, 1);
    assert.equal(fixture.rows.stripe_webhook_events[0].processed_at, null);
    assert.equal((await fixture.send()).status, 503);
    assert.equal(fixture.reads(), 1);
    fixture.retryAfterLease();
    assert.equal((await fixture.send()).status, 200);
    assert.equal(fixture.rows.restaurant_billing[0].subscription_status, "unpaid");
    assert.equal(fixture.rows.restaurant_billing[0].recurring_enabled, false);
    assert.ok(fixture.rows.stripe_webhook_events[0].processed_at);
    const duplicate = await fixture.send();
    assert.equal(duplicate.status, 200); assert.equal(duplicate.body.duplicate, true);
    assert.equal(fixture.reads(), 2);
  });
  await test("admin detail prefers the private billing ledger and labels legacy status unavailable", async () => {
    const compiled = ts.transpileModule(readFileSync("src/data/customers.ts", "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const calls: string[] = [];
    let ledgerAvailable = true;
    const row = { id: "sample-restaurant", business_name: "Sample restaurant", billing_status: "active", notes: "Preserved note" };
    const exports: Record<string, (...args: string[]) => Promise<Record<string, unknown>>> = {};
    // Execute the real data-reader module with only its Supabase import mocked.
    runInNewContext(compiled, { exports, require: (name: string) => {
      if (name === "server-only") return {};
      if (name === "@/lib/supabase/config") return { isSupabaseConfigured: true };
      if (name === "@/lib/supabase/server") return { createServerSupabase: async () => ({ rpc: async (method: string) => {
        calls.push(method);
        return method.startsWith("get_client_") && !ledgerAvailable
          ? { data: null, error: { message: "fixture unavailable" } } : { data: [row], error: null };
      } }) };
      throw new Error(`Unexpected dependency: ${name}`);
    } });
    const current = await exports.getCustomerById("sample-restaurant");
    assert.deepEqual(calls, ["get_client_account"]);
    assert.equal(current.billingStatus, "active");
    ledgerAvailable = false; calls.length = 0;
    const legacy = await exports.getCustomerById("sample-restaurant");
    assert.deepEqual(calls, ["get_client_account", "get_customer"]);
    assert.equal(legacy.billingStatus, "unavailable"); assert.equal(legacy.businessName, "Sample restaurant");
    assert.equal(legacy.notes, "Preserved note");
    calls.length = 0;
    const registry = await exports.getCustomers() as unknown as Record<string, unknown>[];
    assert.deepEqual(calls, ["get_client_ledger", "get_customer_registry"]);
    assert.equal(registry[0].billingStatus, "unavailable");
  });
  console.log(`${passed} billing checks passed with synthetic fixtures only; no provider calls, credentials, database writes or charges.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
