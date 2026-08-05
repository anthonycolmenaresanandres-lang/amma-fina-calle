import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  OWNER_REQUEST_MAX_FILE_BYTES,
  OWNER_REQUEST_MAX_FILES,
  hasOwnerRequestFileSignature,
  isOwnerRequestFileSlot,
  isOwnerRequestId,
  isOwnerRequestReference,
  ownerRequestAttachmentPath,
  validateOwnerRequestFile,
  validateOwnerRequestFiles,
} from "../src/lib/owner/request-desk/files";
import {
  triageRequest,
  type MenuSnapshot,
} from "../src/lib/owner/request-desk/triage";

const validFile = (name: string, type: string, size = 1_000) => ({ name, type, size });

assert.equal(OWNER_REQUEST_MAX_FILES, 5);
assert.equal(OWNER_REQUEST_MAX_FILE_BYTES, 4_000_000);
assert.equal(
  validateOwnerRequestFiles(Array.from({ length: 5 }, (_, index) => validFile(`${index}.png`, "image/png"))),
  null,
);
assert.match(
  validateOwnerRequestFiles(Array.from({ length: 6 }, (_, index) => validFile(`${index}.png`, "image/png"))) ?? "",
  /up to 5/i,
);
assert.equal(validateOwnerRequestFile(validFile("menu.pdf", "application/pdf", 4_000_000)), null);
assert.match(
  validateOwnerRequestFile(validFile("menu.pdf", "application/pdf", 4_000_001)) ?? "",
  /larger than 4 MB/i,
);
assert.match(validateOwnerRequestFile(validFile("empty.png", "image/png", 0)) ?? "", /empty/i);
assert.match(validateOwnerRequestFile(validFile("unsafe.svg", "image/svg+xml")) ?? "", /not supported/i);
assert.match(validateOwnerRequestFile(validFile("fake.pdf", "image/png")) ?? "", /not supported/i);

assert.equal(hasOwnerRequestFileSignature("image/jpeg", Uint8Array.from([0xff, 0xd8, 0xff])), true);
assert.equal(
  hasOwnerRequestFileSignature(
    "image/png",
    Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  ),
  true,
);
assert.equal(
  hasOwnerRequestFileSignature(
    "image/webp",
    Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
  ),
  true,
);
assert.equal(
  hasOwnerRequestFileSignature("application/pdf", new TextEncoder().encode("%PDF-1.7")),
  true,
);
assert.equal(hasOwnerRequestFileSignature("application/pdf", new TextEncoder().encode("<html>")), false);

const menuSnapshot: MenuSnapshot = {
  restaurantId: "test-kitchen",
  businessName: "Test Kitchen",
  items: [
    {
      id: "mocha",
      categoryId: "coffee",
      name: "Mocha",
      description: "Chocolate and espresso",
      price: 7,
      isAvailable: true,
      sizes: [],
    },
  ],
  categories: [{ id: "coffee", name: "Coffee" }],
  hours: [],
};

for (const request of [
  "run a $5 Mocha promo",
  "hide the Mocha promotion",
  "rename the Mocha campaign to Summer",
]) {
  assert.equal(triageRequest(request, menuSnapshot).decision, "review", request);
}
assert.equal(triageRequest("change Mocha to $8", menuSnapshot).decision, "apply");

const reference = "AMMA-ME8D19-7CF21A4B";
const requestId = "7df4c42e-a857-4ea5-9c47-441953b70c5e";
const secondRequestId = "31854c98-4564-4ee6-a417-2da0e18cfbe8";
assert.equal(isOwnerRequestReference(reference), true);
assert.equal(isOwnerRequestReference("../../unsafe"), false);
assert.equal(isOwnerRequestId(requestId), true);
assert.equal(isOwnerRequestId("../../unsafe"), false);
assert.equal(isOwnerRequestFileSlot(0), true);
assert.equal(isOwnerRequestFileSlot(4), true);
assert.equal(isOwnerRequestFileSlot(5), false);
assert.equal(
  ownerRequestAttachmentPath(reference, requestId, 0),
  `${reference}/${requestId}/owner-0`,
);
assert.notEqual(
  ownerRequestAttachmentPath(reference, requestId, 0),
  ownerRequestAttachmentPath(reference, requestId, 1),
);
assert.notEqual(
  ownerRequestAttachmentPath(reference, requestId, 0),
  ownerRequestAttachmentPath(reference, secondRequestId, 0),
);

const dashboardSource = readFileSync(
  new URL("../src/app/owner/[id]/OwnerDashboard.tsx", import.meta.url),
  "utf8",
);
const ownerPageSource = readFileSync(
  new URL("../src/app/owner/[id]/page.tsx", import.meta.url),
  "utf8",
);
const uploadRouteSource = readFileSync(
  new URL("../src/app/api/owner/[id]/requests/[referenceId]/attachments/route.ts", import.meta.url),
  "utf8",
);
const askBarSource = readFileSync(
  new URL("../src/app/owner/[id]/AskBar.tsx", import.meta.url),
  "utf8",
);
const intakeSource = readFileSync(
  new URL("../src/lib/requests/intake.ts", import.meta.url),
  "utf8",
);
const requestMenuSource = readFileSync(
  new URL("../src/lib/owner/request-desk/menu.ts", import.meta.url),
  "utf8",
);
const triageSource = readFileSync(
  new URL("../src/lib/owner/request-desk/triage.ts", import.meta.url),
  "utf8",
);

assert.doesNotMatch(dashboardSource, /owner-campaigns|label="Campaigns"|data\.promos|livePromos/);
assert.doesNotMatch(ownerPageSource, /promosRes|type Promo/);
assert.match(ownerPageSource, /\.neq\("table_name", "promos"\)/);
assert.doesNotMatch(requestMenuSource, /\.from\("promos"\)|promosRes/);
assert.doesNotMatch(triageSource, /tryPromo|"promos"/);
assert.match(uploadRouteSource, /getOwnerContext\(id\)/);
assert.match(uploadRouteSource, /\.eq\("restaurant_id", id\)/);
assert.match(uploadRouteSource, /hasOwnerRequestFileSignature/);
assert.match(uploadRouteSource, /new URL\(request\.url\)\.origin/);
assert.match(askBarSource, /maxLength=\{OWNER_REQUEST_MAX_TEXT_LENGTH\}/);
assert.match(askBarSource, /files\.length >= OWNER_REQUEST_MAX_FILES/);
assert.match(intakeSource, /getSupabaseAdmin\(\)/);
assert.match(intakeSource, /\.from\("change_request_attachments"\)/);
assert.match(intakeSource, /\.remove\(\[path\]\)/);

console.log("owner request intake self-test: PASS");
