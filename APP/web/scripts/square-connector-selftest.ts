import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { guestNoteClientKey } from "../src/lib/requests/guest-note-policy";
import { canonicalSquareConnectUrl, resolveSquareOAuthCallbackUrl } from "../src/lib/square/oauth-origin";
import { onlyActiveSquareLocation } from "../src/lib/square/location-choice";

async function text(relative: string) { return readFile(path.resolve(relative), "utf8"); }

async function main() {
  const canonical = resolveSquareOAuthCallbackUrl("", "https://finacalleos.com", "production");
  assert.equal(canonical?.toString(), "https://finacalleos.com/api/integrations/square/callback");
  assert.equal(canonicalSquareConnectUrl(canonical!, "bodega").toString(),
    "https://finacalleos.com/api/integrations/square/connect?restaurant_id=bodega");
  assert.equal(resolveSquareOAuthCallbackUrl("http://finacalleos.com/api/integrations/square/callback", "", "production"), null);
  assert.equal(resolveSquareOAuthCallbackUrl("https://evil.example/callback", "https://finacalleos.com", "production"), null);
  assert.equal(resolveSquareOAuthCallbackUrl("http://localhost:3000/api/integrations/square/callback", "", "sandbox")?.origin, "http://localhost:3000");
  assert.equal(resolveSquareOAuthCallbackUrl("", "", "sandbox"), null);
  assert.equal(onlyActiveSquareLocation([]), undefined);
  assert.equal(onlyActiveSquareLocation([{ id: "A", name: "Bodega", status: "ACTIVE" }]), "A");
  assert.equal(onlyActiveSquareLocation([{ id: "A", name: "Bodega", status: "ACTIVE" }, { id: "B", name: "Other", status: "ACTIVE" }]), undefined);
  assert.equal(onlyActiveSquareLocation([{ id: "A", name: "Bodega", status: "ACTIVE" }, { id: "B", name: "Closed", status: "INACTIVE" }]), "A");
  const deployed = { vercel: true, production: true };
  const key = (address: string) => guestNoteClientKey(new Headers({ "x-vercel-forwarded-for": address }), deployed);
  assert.match(key("192.0.2.1")!, /^[a-f0-9]{64}$/);
  assert.equal(key("192.0.2.1"), key("192.0.2.1"));
  assert.notEqual(key("192.0.2.1"), key("192.0.2.2"));
  assert.equal(key("2001:db8::1"), key("2001:0db8:0:0:0:0:0:1"));
  assert.equal(key("192.0.2.1, 192.0.2.2"), null);
  assert.equal(guestNoteClientKey(new Headers({ "x-forwarded-for": "192.0.2.1" }), deployed), null);
  assert.equal(guestNoteClientKey(new Headers(), { vercel: false, production: true }), null);
  assert(guestNoteClientKey(new Headers(), { vercel: false, production: false }));

  const [env, config, catalog, connection, webhook, menu, guest, migration, connect, oauth, locationRoute, callback, manualSync] = await Promise.all([
    text(".env.example"), text("src/lib/square/config.ts"), text("src/lib/square/catalog.ts"),
    text("src/lib/square/connection.ts"), text("src/app/api/integrations/square/webhook/route.ts"),
    text("src/app/(internal)/demo/bodega/page.tsx"), text("src/app/api/bodega/guest-notes/route.ts"),
    text("supabase/migrations/0022_square_lifecycle_and_guest_note_cleanup.sql"),
    text("src/app/api/integrations/square/connect/route.ts"), text("src/lib/square/oauth.ts"),
    text("src/app/api/integrations/square/location/route.ts"),
    text("src/app/api/integrations/square/callback/route.ts"), text("src/app/api/integrations/square/sync/route.ts"),
  ]);
  assert(!env.includes("SQUARE_BODEGA_ACCESS_TOKEN"));
  assert.match(config, /ITEMS_READ/);
  assert.match(config, /MERCHANT_PROFILE_READ/);
  assert.match(config, /getSquareOAuthCallbackUrl/);
  assert.match(connect, /canonicalSquareConnectUrl/);
  assert.match(connect, /buildSquareAuthorizationUrl\(config, state, callbackUrl\)/);
  assert(!oauth.includes('location.status === "ACTIVE" && location.id'), "OAuth must not choose the first active location");
  assert.match(locationRoute, /isSameOrigin\(request\)/);
  assert.match(locationRoute, /selectSquareLocation/);
  assert.match(locationRoute, /syncSquareCatalog/);
  assert.match(callback, /onlyActiveSquareLocation/);
  assert.match(callback, /syncSquareCatalog/);
  assert(callback.indexOf("await saveSquareOAuthConnection") < callback.indexOf("await syncSquareCatalog"), "A connection must be saved before its catalog is read");
  assert.match(manualSync, /!connection\?\.locationId/);
  assert(!config.includes("ITEMS_WRITE"));
  assert(!menu.includes("@/lib/square/"), "Square imports must not auto-publish to the public menu");
  assert.match(menu, /BodegaGuestNoteForm/);
  assert.match(guest, /restaurantId: null/);
  assert(!guest.includes('restaurantId: "bodega"'), "Guest contact details stay out of tenant RLS");
  assert.match(guest, /consume_bodega_guest_note_limits/);
  assert(guest.indexOf("const rateLimit = await") < guest.indexOf("persistChangeRequest(payload)"));
  assert.match(connection, /square_replace_oauth_connection/);
  assert.match(catalog, /square_store_catalog_page/);
  assert.match(catalog, /p_connection_generation: connection.generation/);
  assert.match(webhook, /square_claim_webhook_event/);
  assert.match(migration, /on delete cascade/);
  console.log("PASS: client bucket identity, trusted-header rejection, private intake, read-only permissions, and public-menu approval boundary. Database behavior is tested separately.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
