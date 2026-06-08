import "server-only";
import { EDITABLE_FIELDS } from "@/lib/owner/rail";

/**
 * Deterministic triage for the AI Request Desk (Phase 0 — NO model, NO OpenAI).
 *
 * Given an owner's free-text request and a snapshot of their own menu, decide:
 *   - "apply": a confident, single-field edit on an existing row whose
 *     {table, field} is on the apply_owner_change allowlist. Always previewed
 *     and confirmed before it runs; the SQL rail re-checks ownership + allowlist.
 *   - "review": everything else — add/remove/delete, photos, billing, auth,
 *     outages/security, or anything ambiguous / low-confidence. These never
 *     auto-apply; they become a change_requests row for the AMMA team.
 *
 * Design rule: high precision. When in any doubt, return "review". The
 * preview-before-confirm step and the DB allowlist are the safety floor, but
 * this parser is conservative on its own.
 *
 * Supported L2 (apply) patterns, all on the existing allowlist:
 *   - menu item price        "change the Mocha to $8", "set latte price to 5.50"
 *   - menu item availability "86 the Flan Latte", "we're out of churro latte",
 *                            "mark the latte available again"
 *   - menu item name         "rename the Mocha to Mocha Clásico"
 *   - menu item description  "set the latte description to Smooth and bright"
 *   - menu category name     "rename the Espresso category to Coffee"
 *   - promo text / on-off    "change the promo to 2x1 Tuesdays", "turn off the promo"
 *   - hours open/close/closed"Sunday open at 8:00 am", "mark Monday closed"
 */

// ---------------------------------------------------------------------------
// Snapshot shape (read by menu.ts from the owner's own RLS-scoped rows)
// ---------------------------------------------------------------------------

export interface SnapSize {
  label: string;
  price: number | string;
}
export interface SnapItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number | string;
  isAvailable: boolean;
  sizes: SnapSize[];
}
export interface SnapCategory {
  id: string;
  name: string;
}
export interface SnapPromo {
  id: string;
  text: string;
  isActive: boolean;
}
export interface SnapHours {
  id: string;
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}
export interface MenuSnapshot {
  restaurantId: string;
  businessName: string;
  items: SnapItem[];
  categories: SnapCategory[];
  promos: SnapPromo[];
  hours: SnapHours[];
}

// ---------------------------------------------------------------------------
// Result shape
// ---------------------------------------------------------------------------

export type EditableTable = "menu_items" | "menu_categories" | "promos" | "hours";

export interface ChangeProposal {
  table: EditableTable;
  field: string;
  rowId: string;
  entityLabel: string;
  fieldLabel: string;
  currentDisplay: string;
  newDisplay: string;
  newValue: string;
  /**
   * When set, this proposal edits the price of ONE size inside
   * menu_items.sizes (routed through apply_owner_size_price), not a scalar
   * column. The `field` stays "price" for display/labeling only.
   */
  sizeLabel?: string;
}

export type ReviewRequestType =
  | "Menu/content update"
  | "Image/file upload"
  | "Operational support"
  | "Question for AMMA";
export type ReviewPriority = "Low" | "Normal" | "Urgent";

export interface ReviewOutcome {
  reason: string;
  requestType: ReviewRequestType;
  priority: ReviewPriority;
}

export type TriageResult =
  | { decision: "apply"; proposal: ChangeProposal }
  | { decision: "review"; review: ReviewOutcome };

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

function review(
  reason: string,
  requestType: ReviewRequestType,
  priority: ReviewPriority,
): TriageResult {
  return { decision: "review", review: { reason, requestType, priority } };
}

function isEditable(table: EditableTable, field: string): boolean {
  const allowed = EDITABLE_FIELDS[table];
  return Array.isArray(allowed) && allowed.includes(field);
}

function applyResult(
  table: EditableTable,
  field: string,
  rowId: string,
  entityLabel: string,
  fieldLabel: string,
  currentDisplay: string,
  newDisplay: string,
  newValue: string,
): TriageResult {
  // Defense in depth: never propose a field outside the rail's allowlist.
  if (!isEditable(table, field)) {
    return review(
      "That edit isn’t available automatically. Sent to the AMMA team.",
      "Operational support",
      "Normal",
    );
  }
  return {
    decision: "apply",
    proposal: { table, field, rowId, entityLabel, fieldLabel, currentDisplay, newDisplay, newValue },
  };
}

function matchesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function singular(token: string): string {
  return token.length > 3 && token.endsWith("s") ? token.slice(0, -1) : token;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singular);
}

/** Length of `name` if it appears as a contiguous token run inside `text`, else 0. */
function contiguousSpan(nameTokens: string[], textTokens: string[]): number {
  if (nameTokens.length === 0) return 0;
  for (let i = 0; i + nameTokens.length <= textTokens.length; i++) {
    let ok = true;
    for (let j = 0; j < nameTokens.length; j++) {
      if (textTokens[i + j] !== nameTokens[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return nameTokens.length;
  }
  return 0;
}

type Resolution<T> = { kind: "one"; row: T } | { kind: "none" } | { kind: "ambiguous" };

/** Resolve a named row by requiring its name to appear as a contiguous token run. */
function resolveByName<T extends { name: string }>(subject: string, rows: T[]): Resolution<T> {
  const textTokens = tokenize(subject);
  let best: T[] = [];
  let bestSpan = 0;
  for (const row of rows) {
    const span = contiguousSpan(tokenize(row.name), textTokens);
    if (span > bestSpan) {
      bestSpan = span;
      best = [row];
    } else if (span > 0 && span === bestSpan) {
      best.push(row);
    }
  }
  if (bestSpan === 0) return { kind: "none" };
  if (best.length > 1) return { kind: "ambiguous" };
  return { kind: "one", row: best[0] };
}

function formatMoney(value: number | string): string {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(value);
}

/** The substring before the last occurrence of any marker word (the "subject"). */
function subjectBeforeMarker(raw: string, markers: string[]): string {
  let cut = raw.length;
  for (const mk of markers) {
    const re = new RegExp(`\\b${mk}\\b`, "i");
    const idx = raw.search(re);
    if (idx >= 0 && idx < cut) cut = idx;
  }
  return raw.slice(0, cut);
}

/** The trimmed value after the last occurrence of any marker word. */
function valueAfterMarker(raw: string, markers: string[]): string | null {
  let end = -1;
  for (const mk of markers) {
    const re = new RegExp(`\\b${mk}\\b`, "gi");
    let m: RegExpExecArray | null;
    let last = -1;
    while ((m = re.exec(raw)) !== null) last = m.index + m[0].length;
    if (last > end) end = last;
  }
  if (end < 0) return null;
  const rest = raw
    .slice(end)
    .trim()
    .replace(/^["'“”]+|["'“”.!?]+$/g, "")
    .trim();
  return rest.length ? rest.slice(0, 200) : null;
}

function extractPrice(raw: string): string | null {
  let m = raw.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  if (!m) m = raw.match(/\bto\s+\$?\s*(\d+(?:\.\d{1,2})?)\b/i);
  if (!m) m = raw.match(/\b(\d+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 0) return null;
  return String(n);
}

function extractTime(raw: string): string | null {
  const ap = raw.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/i);
  if (ap) {
    const h = Number(ap[1]);
    if (h < 1 || h > 12) return null;
    const min = ap[2] ?? "00";
    const suffix = ap[3].toLowerCase().startsWith("p") ? "PM" : "AM";
    return `${(h % 12) || 12}:${min} ${suffix}`;
  }
  const hhmm = raw.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (hhmm) return `${hhmm[1].padStart(2, "0")}:${hhmm[2]}`;
  return null;
}

function uniqueDays(textTokens: string[]): number[] {
  const found = new Set<number>();
  for (const t of textTokens) {
    if (t in DAYS) found.add(DAYS[t]);
  }
  return [...found];
}

// ---------------------------------------------------------------------------
// Escalation / review keyword sets (checked before any apply detector)
// ---------------------------------------------------------------------------

const BILLING_WORDS = [
  "charged", "double charged", "charge me", "overcharge", "refund", "payment",
  "invoice", "billing", "subscription", "credit card", "debit card", "paid twice",
];
const AUTH_WORDS = [
  "log in", "login", "logged out", "sign in", "signin", "cant sign in",
  "can t sign in", "password", "locked out", "cant log in", "can t log in",
  "access my account", "verification code",
];
const OUTAGE_WORDS = [
  "is down", "site down", "website down", "not working", "broken", "outage",
  "hacked", "someone changed", "didn t do", "did not do", "unauthorized",
  "menu disappeared", "page is blank", "error 500", "crash",
];
const ADD_WORDS = ["add ", "add a", "add an", "add new", "new item", "create ", "introduce a", "put a new"];
const REMOVE_WORDS = [
  "remove ", "delete ", "get rid of", "take off", "take it off",
  "off the menu", "no longer offer", "discontinue",
];
const PHOTO_WORDS = ["photo", "picture", "image", "logo", "headshot", "upload a pic"];

// ---------------------------------------------------------------------------
// L2 apply detectors — each returns a confident proposal, a review for the
// specific "ambiguous entity" case, or null to let the chain continue.
// ---------------------------------------------------------------------------

const PRICE_SIGNAL = /(\$|\bprice\b|\bcost\b|\bcharge\b|\bdollars?\b|\bbucks?\b|\bto\b|\bnow\b)/;

// Common spoken size words → matched against an item's real size labels by the
// label's lead word. Single letters (s/m/l) are deliberately excluded: the
// tokenizer can emit a stray "s" from possessives ("latte's"), which would
// otherwise false-match "Small".
const SIZE_SYNONYMS: Record<string, string[]> = {
  small: ["small", "sm", "short", "mini", "kids", "kid"],
  medium: ["medium", "med", "mid", "regular", "reg", "grande"],
  large: ["large", "lg", "big", "venti", "jumbo", "xl"],
};

/** Does the request mention this size label (by its own words or a synonym)? */
function sizeMentioned(label: string, textTokens: string[]): boolean {
  const labelTokens = tokenize(label);
  if (contiguousSpan(labelTokens, textTokens) > 0) return true;
  const lead = labelTokens[0] ?? "";
  const bucket = SIZE_SYNONYMS[lead];
  return bucket ? textTokens.some((t) => bucket.includes(t)) : false;
}

function sizePriceProposal(item: SnapItem, size: SnapSize, price: string): TriageResult {
  // Defense in depth: the underlying field is still menu_items.price.
  if (!isEditable("menu_items", "price")) {
    return review("That edit isn’t available automatically. Sent to the AMMA team.", "Operational support", "Normal");
  }
  return {
    decision: "apply",
    proposal: {
      table: "menu_items",
      field: "price",
      rowId: item.id,
      sizeLabel: size.label,
      entityLabel: `${item.name} (${size.label})`,
      fieldLabel: `${size.label} price`,
      currentDisplay: formatMoney(size.price),
      newDisplay: formatMoney(price),
      newValue: price,
    },
  };
}

/**
 * Price change for an item that has multiple sizes (S/M/L). Resolves which
 * size the owner means and proposes an edit to THAT size's price via the
 * apply_owner_size_price rail. Owns every sized item: if the size is missing
 * or ambiguous it returns a review (so a sized item never silently edits its
 * unused base `price` column). Returns null only when no priced item matched
 * or the matched item has no sizes (the base-price path handles those).
 */
function trySizePrice(raw: string, lower: string, snap: MenuSnapshot): TriageResult | null {
  if (/\b(hour|hours|opening|closing)\b/.test(lower)) return null;
  const price = extractPrice(raw);
  if (price === null) return null;
  if (!PRICE_SIGNAL.test(lower)) return null;
  const r = resolveByName(raw, snap.items);
  if (r.kind === "none") return null;
  if (r.kind === "ambiguous") {
    return review("More than one item matches that name — tell the AMMA team which one.", "Question for AMMA", "Normal");
  }
  const item = r.row;
  const sizes = item.sizes ?? [];
  if (sizes.length === 0) return null; // single-price item → tryPrice handles it

  const textTokens = tokenize(raw);
  const matched = sizes.filter((s) => sizeMentioned(s.label, textTokens));

  if (matched.length === 1) {
    return sizePriceProposal(item, matched[0], price);
  }
  if (matched.length > 1) {
    const which = matched.map((s) => s.label).join(", ");
    return review(`“${item.name}” matched more than one size (${which}) — name just one.`, "Question for AMMA", "Normal");
  }
  if (sizes.length === 1) {
    return sizePriceProposal(item, sizes[0], price);
  }
  const labels = sizes.map((s) => s.label).join(" or ");
  return review(
    `“${item.name}” has ${labels} prices — say which one (e.g. “change the large ${item.name} to ${formatMoney(price)}”).`,
    "Question for AMMA",
    "Normal",
  );
}

function tryPrice(raw: string, lower: string, snap: MenuSnapshot): TriageResult | null {
  // Defer to hours when the sentence is clearly about hours.
  if (/\b(hour|hours|opening|closing)\b/.test(lower)) return null;
  const price = extractPrice(raw);
  if (price === null) return null;
  if (!PRICE_SIGNAL.test(lower)) return null;
  const r = resolveByName(raw, snap.items);
  if (r.kind === "none") return null;
  if (r.kind === "ambiguous") {
    return review("More than one item matches that name — tell the AMMA team which one.", "Question for AMMA", "Normal");
  }
  // Sized items are owned by trySizePrice; never edit their unused base price.
  if ((r.row.sizes?.length ?? 0) > 0) {
    const labels = r.row.sizes.map((s) => s.label).join(" or ");
    return review(`“${r.row.name}” has ${labels} prices — say which one to change.`, "Question for AMMA", "Normal");
  }
  return applyResult(
    "menu_items", "price", r.row.id,
    r.row.name, "price",
    formatMoney(r.row.price), formatMoney(price), price,
  );
}

const AVAIL_OUT = [
  "86 ", "86s", "sold out", "out of stock", "out of", "we re out", "were out",
  "ran out", "run out", "unavailable", "not available", "mark unavailable",
  "make unavailable", "hide ", "stop selling", "temporarily",
];
const AVAIL_IN = [
  "back in stock", "back in", "available again", "restock", "re stock",
  "mark available", "make available", "show again", "in stock", "back on the menu",
];

function tryAvailability(raw: string, lower: string, snap: MenuSnapshot): TriageResult | null {
  let next: "true" | "false" | null = null;
  if (matchesAny(lower, AVAIL_IN)) next = "true";
  else if (matchesAny(lower, AVAIL_OUT)) next = "false";
  if (next === null) return null;
  const r = resolveByName(raw, snap.items);
  if (r.kind === "none") return null;
  if (r.kind === "ambiguous") {
    return review("More than one item matches that name — tell the AMMA team which one.", "Question for AMMA", "Normal");
  }
  return applyResult(
    "menu_items", "is_available", r.row.id,
    r.row.name, "availability",
    r.row.isAvailable ? "Available" : "Hidden",
    next === "true" ? "Available" : "Hidden (sold out)",
    next,
  );
}

function tryRenameItem(raw: string, lower: string, snap: MenuSnapshot): TriageResult | null {
  if (/\b(category|section)\b/.test(lower)) return null; // category detector handles these
  const isRename = /\brename\b/.test(lower) || (/\bname\b/.test(lower) && /\bto\b/.test(lower)) || /\bcall it\b/.test(lower);
  if (!isRename) return null;
  const subject = subjectBeforeMarker(raw, ["to", "call it"]);
  const r = resolveByName(subject, snap.items);
  if (r.kind === "none") return null;
  if (r.kind === "ambiguous") {
    return review("More than one item matches that name — tell the AMMA team which one.", "Question for AMMA", "Normal");
  }
  const newName = valueAfterMarker(raw, ["to", "call it"]);
  if (!newName) return review("Tell me the new name (e.g. “rename Mocha to Mocha Clásico”).", "Question for AMMA", "Normal");
  return applyResult("menu_items", "name", r.row.id, r.row.name, "name", r.row.name, newName, newName);
}

function tryItemDescription(raw: string, lower: string, snap: MenuSnapshot): TriageResult | null {
  if (!/\b(description|describe|desc|tagline|blurb)\b/.test(lower)) return null;
  const subject = subjectBeforeMarker(raw, ["to", "as"]);
  const r = resolveByName(subject, snap.items);
  if (r.kind === "none") return null;
  if (r.kind === "ambiguous") {
    return review("More than one item matches that name — tell the AMMA team which one.", "Question for AMMA", "Normal");
  }
  const newText = valueAfterMarker(raw, ["to", "as"]);
  if (!newText) return review("Tell me the new description text.", "Question for AMMA", "Normal");
  return applyResult(
    "menu_items", "description", r.row.id,
    r.row.name, "description",
    r.row.description ?? "—", newText, newText,
  );
}

function tryCategoryRename(raw: string, lower: string, snap: MenuSnapshot): TriageResult | null {
  if (!/\b(category|section)\b/.test(lower)) return null;
  if (!/\brename\b/.test(lower) && !(/\bname\b/.test(lower) && /\bto\b/.test(lower))) return null;
  const subject = subjectBeforeMarker(raw, ["to"]).replace(/\b(category|section)\b/gi, " ");
  const r = resolveByName(subject, snap.categories);
  if (r.kind === "none") return null;
  if (r.kind === "ambiguous") {
    return review("More than one category matches that name — tell the AMMA team which one.", "Question for AMMA", "Normal");
  }
  const newName = valueAfterMarker(raw, ["to"]);
  if (!newName) return review("Tell me the new category name.", "Question for AMMA", "Normal");
  return applyResult("menu_categories", "name", r.row.id, `${r.row.name} category`, "name", r.row.name, newName, newName);
}

function tryPromo(raw: string, lower: string, snap: MenuSnapshot): TriageResult | null {
  if (!/\b(promo|promotion|special|deal|banner)\b/.test(lower)) return null;
  if (snap.promos.length === 0) {
    return review("There’s no promo to change yet — the AMMA team can add one.", "Menu/content update", "Normal");
  }
  if (snap.promos.length > 1) {
    return review("You have more than one promo — tell the AMMA team which to change.", "Question for AMMA", "Normal");
  }
  const promo = snap.promos[0];
  const turnOff = /\b(turn off|disable|deactivate|pause|stop|hide)\b/.test(lower);
  const turnOn = /\b(turn on|enable|activate|resume|show)\b/.test(lower);
  if (turnOff || turnOn) {
    const next = turnOn ? "true" : "false";
    return applyResult(
      "promos", "is_active", promo.id,
      "Promo", "status",
      promo.isActive ? "On" : "Off",
      next === "true" ? "On" : "Off",
      next,
    );
  }
  const newText = valueAfterMarker(raw, ["to", "say", "read"]);
  if (!newText) return review("Tell me the new promo text.", "Question for AMMA", "Normal");
  return applyResult("promos", "text", promo.id, "Promo", "text", promo.text, newText, newText);
}

function tryHours(raw: string, lower: string, snap: MenuSnapshot): TriageResult | null {
  const hasHourSignal = /\b(hour|hours|open|opens|opening|close|closes|closing|closed|reopen)\b/.test(lower);
  if (!hasHourSignal) return null;
  if (/\b(every day|everyday|daily|all week|weekend|weekends|weekday|weekdays)\b/.test(lower)) {
    return review("Changing several days’ hours at once needs the AMMA team.", "Operational support", "Normal");
  }
  const days = uniqueDays(tokenize(raw));
  if (days.length === 0) return review("Tell me which day’s hours to change (e.g. “Sunday”).", "Question for AMMA", "Normal");
  if (days.length > 1) return review("Changing several days at once needs the AMMA team.", "Operational support", "Normal");
  const day = days[0];
  const row = snap.hours.find((h) => h.dayOfWeek === day);
  if (!row) return review("I couldn’t find that day’s hours. Sent to the AMMA team.", "Operational support", "Normal");
  const label = `${DAY_LABELS[day]} hours`;

  if (/\bclosed\b/.test(lower)) {
    return applyResult("hours", "is_closed", row.id, label, "status", row.isClosed ? "Closed" : "Open", "Closed", "true");
  }
  if (/\b(reopen|open all day)\b/.test(lower)) {
    return applyResult("hours", "is_closed", row.id, label, "status", row.isClosed ? "Closed" : "Open", "Open", "false");
  }

  const wantsOpen = /\bopen(s|ing)?\b/.test(lower);
  const wantsClose = /\bclos(e|es|ing)\b/.test(lower);
  const time = extractTime(raw);
  if ((wantsOpen || wantsClose) && !time) {
    return review(`Tell me the time (e.g. “${DAY_LABELS[day]} opens at 8:00 am”).`, "Question for AMMA", "Normal");
  }
  if (wantsClose && !wantsOpen && time) {
    return applyResult("hours", "close_time", row.id, label, "closing time", row.closeTime ?? "—", time, time);
  }
  if (wantsOpen && !wantsClose && time) {
    return applyResult("hours", "open_time", row.id, label, "opening time", row.openTime ?? "—", time, time);
  }
  return review("Tell me whether to change the opening or the closing time.", "Question for AMMA", "Normal");
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function triageRequest(text: string, snap: MenuSnapshot): TriageResult {
  const raw = text.trim();
  if (!raw) return review("Empty request.", "Question for AMMA", "Normal");
  const lower = ` ${raw.toLowerCase()} `;

  // 1. Escalations — always win.
  if (matchesAny(lower, BILLING_WORDS)) {
    return review("This looks like a billing or payment issue — sending it to the AMMA team as urgent.", "Operational support", "Urgent");
  }
  if (matchesAny(lower, AUTH_WORDS)) {
    return review("This looks like a sign-in or account issue — sending it to the AMMA team as urgent.", "Operational support", "Urgent");
  }
  if (matchesAny(lower, OUTAGE_WORDS)) {
    return review("This looks like an outage or something broken — escalating to the AMMA team as urgent.", "Operational support", "Urgent");
  }

  // 2. Structural changes the rail can't do (insert/delete) — review.
  if (matchesAny(lower, REMOVE_WORDS)) {
    return review(
      "Removing or deleting an item needs the AMMA team in this version. To temporarily stop selling something, say “86 the …” or “we’re out of …”.",
      "Menu/content update",
      "Normal",
    );
  }
  if (matchesAny(lower, ADD_WORDS)) {
    return review("Adding a new item needs the AMMA team in this version.", "Menu/content update", "Normal");
  }

  // 3. Photos — no file can be attached from the text bar.
  if (matchesAny(lower, PHOTO_WORDS)) {
    return review("To change a photo, use the “Upload photo” button on the item below.", "Image/file upload", "Normal");
  }

  // 4. Confident single-field edits (each falls through to review if unsure).
  return (
    trySizePrice(raw, lower, snap) ??
    tryPrice(raw, lower, snap) ??
    tryAvailability(raw, lower, snap) ??
    tryRenameItem(raw, lower, snap) ??
    tryItemDescription(raw, lower, snap) ??
    tryCategoryRename(raw, lower, snap) ??
    tryPromo(raw, lower, snap) ??
    tryHours(raw, lower, snap) ??
    review(
      "I couldn’t confidently match that to a safe edit, so I’ve prepared it for the AMMA team.",
      "Question for AMMA",
      "Normal",
    )
  );
}
