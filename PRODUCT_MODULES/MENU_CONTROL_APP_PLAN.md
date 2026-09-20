# Menu Control — owner app plan

_Written 2026-09-20. Plan only. Nothing in here is built, queued for production, or shown to a client until Anthony approves._

Goal, in Anthony's words: make the Fina Calle customer menu QR **an app**, make it **as simple as possible**, let the owner **customize their own menu** or **have us do it**, and **gamify the task** so it actually gets done.

This plan does three things: corrects two assumptions in that goal, maps what already exists so Codex doesn't rebuild it, and lays out five phases with a ready-to-paste Codex queue entry.

---

## 0. Two corrections before anything gets built

**0a. The guest side must NOT become an installable app.**

The research is one-directional on this. Every source on QR menu conversion says the same thing: an install prompt or account wall at the table is where guests drop. "There is no app to install and no learning curve" is the *feature*, not a gap. The bar is a menu that loads in under two seconds on 4G from the worst seat in the room.

So: `/m/[id]` stays a fast web page. It gets a performance budget, not a manifest.

**The app is the owner's app.** And it already exists — `OPERATIONS/OWNER_PORTAL_APP_RUNBOOK.md` decided Phase 1 PWA, and `/owner/[id]/manifest.webmanifest` + `/owner/[id]/app-icon/{192,512}` are live in the codebase. Installable, standalone, per-tenant. That decision is made and correct. What's missing is not the app shell — it's what's inside it.

**0b. Gamification splits cleanly into what works and what will cost us clients.**

| Works on professionals | Backfires on professionals |
| --- | --- |
| Making invisible progress visible (progress indicators ≈ +28% completion) | Badges for trivial or unavoidable actions — devalues the whole system |
| Goal-gradient: pre-fill step 1 so the bar never starts at zero | Leaderboards between peers — breeds resentment faster than motivation |
| Streaks tied to a real operational truth | Tangible expected rewards (Deci/Koestner/Ryan 1999, 128 experiments: they reliably *reduce* intrinsic motivation) |
| Verbal recognition | Loss-framed streak punishment |

The hard line for us: **never a leaderboard across clients.** These are paying restaurants, some in the same market, some competitors. Ranking Las Palmas against Colattao is a client-loss event, not engagement.

The design rule that follows: **every game element must point at money or at the guest's experience.** A ring that says "3 items have no price — guests are seeing a blank" is a to-do list wearing a game. A ring that says "You earned 420 points" is noise.

---

## 1. What already exists (do not rebuild)

| Piece | Where | State |
| --- | --- | --- |
| Public menu | `APP/web/src/app/m/[id]/page.tsx` | Server-rendered, `force-dynamic`, reads `get_public_menu()` RPC. Categories, items, sizes, photos, hours, promos, sticky section nav. Good. |
| Owner app shell | `owner/[id]/manifest.webmanifest`, `app-icon/`, `lib/owner/app-manifest.ts` | Installable PWA, per-tenant `id`/`start_url`/`scope`. Deliberately no service worker. |
| Owner auth | `lib/owner/auth.ts`, `is_owner_email()` security-definer | Tenant-scoped, re-authorized on every write. |
| Write rail | `lib/owner/rail.ts`, `menu-control-actions.ts` | Audited to `audit_log`, optimistic-concurrency guarded (`expectedValue` compare-before-write), never leaks DB internals. **This is the best asset we have.** |
| Menu editor | `owner/[id]/MenuQuickEdit.tsx` | Works, but see §2. |
| Request desk | `owner/[id]/AskBar.tsx` (496 lines) | Natural-language request + file upload + triage/confirm. Already has a deterministic "86 the X" matcher. |
| Schema | `supabase/migrations/0001…0014` | `restaurants`, `menu_categories`, `menu_items` (+ `sizes` jsonb), `hours`, `promos`, `audit_log`, `change_requests`. Multi-tenant, RLS. |

**The rail is why this project is cheap.** Authorization, audit, and concurrency are solved. Most of the work is widening it and putting a better surface on top.

---

## 2. The actual gap

`MenuQuickEdit` edits **one field, on one existing item, one at a time**, behind a two-step review. That is a superb design for *"don't let the owner break the menu."* It is the wrong design for *"the owner runs their own menu."*

What an owner cannot do today: add an item. Add a category. Delete anything. Reorder. Add a photo. 86 four things in one pass during a rush.

And the deeper mistake most menu tools make — one we should not repeat — is building **one editor for three completely different jobs**:

| Job | Frequency | Duration | Context |
| --- | --- | --- | --- |
| **86 something / bring it back** | ~300×/year | 10 seconds | Mid-rush, one thumb, standing up |
| **Change a price, add a special, fix a description** | ~20×/year | 5 minutes | Office, sitting down |
| **Get the whole menu in** | Once | 30–60 minutes | Onboarding, painful, high abandon |

Three jobs, three surfaces, one data model. That is the architecture.

---

## 3. The three surfaces

### Surface A — "Tonight" (the 86 board)
The **default screen** of the owner app. Not a tab they have to find.

A flat searchable list of every item. One large toggle each. Tap = available/sold out, saved immediately, optimistic UI with an unmistakable "didn't save — retry" state. A "Everything's on" confirm button at the bottom for the common case.

No review step. 86-ing is reversible in one tap, so the two-step confirm that protects price edits is pure friction here. Price edits keep their confirm.

Target: **under 10 seconds from home screen to item 86'd.** That is the number that decides whether this product is used or abandoned.

Cheapest phase to build: `is_available` is *already* a supported field on the existing rail.

### Surface B — "Menu" (the real editor)
Card per item. Tap to expand inline — name, description, price, sizes, photo, availability. Save per card. Drag handle to reorder. "+ Add item" at the bottom of each category, "+ Add category" at the bottom of the list.

Price changes keep the compare-before-write guard and the confirm step. Everything else saves inline.

### Surface C — "Get it in" (import + the 'let us do it' path)
The owner photographs their paper menu. We extract to a **draft**. The owner **approves item by item** rather than typing from scratch — approving is an order of magnitude less work than authoring, and it keeps a human on every price.

This is also the systematic version of "or let us do it": the same draft pipeline, with AMMA doing the capture and the owner doing one approval pass. Same code, two operators.

**Never bulk-publish an extracted menu.** Prices specifically require a typed confirmation, not a tap.

---

## 4. The gamification layer (Surface D — "How's my menu?")

Lives on its **own screen**. Never interrupts the 86 board. A busy owner mid-rush must never meet a celebration animation.

### Menu Health ring (0–100)
Each component is a real defect with a one-tap fix, not a vanity metric:

| Component | Points | Why it's real |
| --- | --- | --- |
| Every visible item has a price | 25 | A blank price on the guest menu is a lost order |
| All 7 days of hours set | 10 | Guests check hours more than any other field |
| Every category has ≥1 available item | 10 | Empty sections look broken |
| Top 10 items have a description | 20 | Descriptions are the whole pitch |
| Top 6 items have a photo | 20 | Photos are the single biggest conversion lever |
| No available item untouched in 120 days | 15 | Stale menu = wrong prices = guest disputes |

The ring is a to-do list. Every gap renders as `3 items have no price → Fix now` and deep-links straight to the fix.

### Kitchen Match streak
*"Your menu matched your kitchen 12 days running."* Increments on any day the owner touches the 86 board — including tapping "Everything's on."

It measures the one thing that makes a digital menu trustworthy. **Breaking it is silent.** No loss animation, no red, no shaming. Professionals resent that.

### First Menu ceremony
The one-time import (Surface C) as a checklist with **step 1 pre-completed** ("Your restaurant is set up ✓") — goal-gradient, the bar never starts at zero.

The reward at the end is not a badge. It is their own guest menu, with their own logo, sliding in on a phone frame. The payoff is seeing their thing look good. That's intrinsic and it doesn't decay.

### Explicitly excluded
Points currency · leaderboards across clients · badges for trivial actions · streak-loss punishment · any reward with cash value.

---

## 5. What has to change underneath

| Change | Notes |
| --- | --- |
| Widen the rail: insert / delete / reorder | Same authorization + audit + compare-before-write discipline as `applyOwnerChange`. New security-definer RPCs: `owner_menu_upsert_item`, `owner_menu_add_category`, `owner_menu_reorder`, `owner_menu_archive_item`. |
| `menu_items.updated_at` | Needed for the staleness component of Menu Health. Trigger-maintained. |
| Photo storage | Supabase Storage bucket, **client-side downscale before upload**, hard size cap, server-side transform. See premortem P-4. |
| Menu Health | A **read-only RPC**, computed on read. Do not store a score. |
| Streak | **Derive from `audit_log`** — it already carries `restaurant_id`, `actor_email`, `created_at`. No new table. |
| Soft delete | Archive, never hard-delete. Deletions on a live menu need to be reversible. |

---

## 6. Phases

**P0.5 — Connect Colattao's guest menu to live data.** *Prerequisite, discovered after Anthony selected Colattao as the P1 pilot (2026-09-20). See §6a.*

**P1 — The 86 board.** Highest value per unit of effort in the whole plan. Mostly a UI reshape; `is_available` already rides the existing rail. Ships in days and teaches us real usage before we design anything bigger.

**P2 — The real editor.** Add / edit / archive / reorder / photo. New RPCs + storage bucket. This is the bulk of the backend work.

**P3 — Menu Health + streak + ceremony.** Only meaningful once P1/P2 have produced something worth measuring. Building gamification first would be measuring an empty room.

**P4 — Import assist.** Photo → draft → per-item approval. Turns "let us do it" from a favour into a repeatable service.

**P5 — Guest menu performance.** Budget (<2s on 4G), tag-based revalidation on owner save, image transforms, offline-safe fallback. No manifest, no install prompt.

The order is deliberate: **P1 before P3.** Ship the useful thing, then make it sticky.

---

## 6a. P0.5 — why Colattao needs one piece of work first

Anthony chose Colattao as the P1 pilot on 2026-09-20. I had recommended against it. **He is right and I was wrong about the reason — but the choice needs one prerequisite, because of a disconnect I only found by checking.**

**The finding:** Colattao's guest menu at the printed QR is a **static TypeScript file in a different repo** — `colattao-cafe-rush/src/data/colattaoMenu.ts`, imported directly by `src/app/menu/page.tsx:4`. Café Rush uses Supabase for owner-requests, onboarding and CRM, but **not for the menu**.

The owner app writes to Supabase. The guest menu reads a hardcoded file. **They are not connected.** That is exactly why `OwnerDashboard.tsx:194` gives Colattao a request-based path — the existing code is being honest about a real gap.

So without P0.5, an 86 board on Colattao means the owner taps "sold out" and **no guest sees any change.** That is theatre, and the worst possible client to perform it for.

**Why Anthony's pick is still the right one.** The two menus are *already meant to mirror each other* — migration `0007_menu_sizes_and_colattao_seed.sql` seeded Supabase from `colattaoMenu.ts` — and they have **already drifted**:

| | Static file (what guests see) | Supabase (what the owner would edit) |
| --- | --- | --- |
| Categories | 7, incl. **"Fall Drinks"** | 7, incl. **"Seasonal Drinks"** |
| Items | 51 | ~54 |

Two sources of truth for one menu, already disagreeing. That drift is a live liability regardless of this project, and Colattao is the client where it costs the most. Connecting them is work we owe anyway — Anthony's pick just forces us to do it first instead of later.

**The QR guardrail permits this.** `CLAUDE.md` forbids migrating Colattao's menu to `/m/colattao` or changing the printed URL. It explicitly allows the opposite: *"any Colattao menu redesign happens IN that app at the same URL."* P0.5 changes Café Rush's **data source**, not its URL and not its design. The printed QR at `colattao-cafe-rush.vercel.app/menu` is untouched.

**P0.5 scope:**
1. **Reconcile first.** Diff `colattaoMenu.ts` against the Supabase rows and resolve every difference *with Anthony* — including Fall Drinks vs Seasonal Drinks. Supabase becomes the source of truth only once it provably matches what guests see today.
2. Point `colattao-cafe-rush/src/app/menu/page.tsx` at `get_public_menu('colattao')`.
3. Keep `colattaoMenu.ts` as a **build-time fallback** — if Supabase is unreachable, guests get the current menu, never an error page. A restaurant's menu must not have a runtime dependency that can 500 at the table.
4. Same URL, same design, same seasonal components. Data source only.
5. Fix the zero-price bug (premortem #2) **before** the switch — `House Brew` is seeded at `0::numeric`, so the very first item of the very first category is a live instance.

Only after P0.5 verifies end-to-end does the P1 86 board mean anything on Colattao.

---

## 7. Premortem — it's 2027 and this failed. Why?

1. **The owner opened it twice and went back to texting Anthony.** The only defence is that the 86 board is genuinely faster than a text. If it isn't under 10 seconds, nothing else in this plan matters. *Measure this before building P2.*
2. **An owner set a price to 0 meaning "Ask staff" and guests saw `$0.00` — a free item.** This is a **confirmed live bug**, not a hypothetical. Five places in the codebase agree that a zero price means "Ask staff":

   | File | Renders `0` as |
   | --- | --- |
   | `lib/owner/menu-control.ts:50` | `Ask staff` |
   | `lib/owner/public-menu-adapter.ts:15` | `Ask staff` |
   | `owner/[id]/MenuQuickEdit.tsx:94` (owner hint) | *"0 means 'Ask staff,' not a free item"* |
   | `owner/guide/page.tsx:73` (owner manual) | *"A zero price means 'Ask staff,' not a free item"* |
   | `owner/[id]/AskBar.tsx:46` | `Ask` |
   | **`m/[id]/page.tsx:26`** | **`$0.00`** |

   One file disagrees with the other five — and it is **the only screen a guest ever sees**. We document the rule to owners in two places, then break it on the menu. Fix this in P1, before any owner can create items; today it needs only a deliberate price edit to trigger.
3. **Two managers edited at once and one silently overwrote the other.** The single-field path is guarded. Insert/reorder/delete need equivalent guards or the guarantee is a half-guarantee.
4. **Photos from phones are 12MB; the menu got slow and blew the P5 budget.** Downscale client-side, cap hard, transform server-side. Non-negotiable — it directly undoes P5.
5. **A Colattao manager edited items and nothing changed on the Café Rush menu.** Colattao's guest menu is a separate app at a printed QR. The editor must be gated per tenant by connected state, with honest copy. `OwnerDashboard.tsx:194` already does this for the current editor — the new surfaces must inherit it, not re-derive it.
6. **Extraction misread prices, the owner tapped through, wrong prices went live.** Per-item approval, typed confirmation on price. Never bulk-publish.
7. **The storage bucket was misconfigured and owner uploads were listable.** This lands next to `0006_private_uploads_and_admin.sql`. Explicit RLS review, not an assumption.
8. **The "we'll do it" path had no visible state, requests vanished, trust died.** `change_requests` already has `status`. Surface it: received → in progress → live.
9. **Gamification interrupted a rush and the owner found it insulting.** Separate screen. No interruptions. No celebration during service hours.
10. **Scope crept into ordering and payments.** Menu Control changes what a menu *says*. It does not take orders or move money. That line is the whole reason this phase is shippable.

Seven of ten are operational or product-judgement failures, not technical ones. That's the usual ratio and it's why the phasing matters more than the stack.

---

## 8. Decisions taken, and what's still Anthony's

**Settled 2026-09-20:**
- **Branch:** own branch + own draft PR. PR #225 (Instagram add-on) stays clean.
- **P1 pilot:** **Colattao.** Which adds P0.5 as a prerequisite — see §6a.

**Still Anthony's, and blocking where noted:**
1. **The Colattao menu reconciliation (blocks P0.5).** Fall Drinks vs Seasonal Drinks, 51 items vs ~54. Supabase cannot become the source of truth until every difference is resolved by a human who knows which one is correct. This needs a sit-down with the real current menu, not a guess from either file.
2. **Whether `House Brew` at price 0 should read "Ask staff" or carry a real price.** It is the first item of the first category, and today it renders `$0.00` to guests.
3. Storage/transform cost approval before P2.
4. Any client-facing send, print, or production deploy.

---

## 9. Codex queue entries

Queue **P0.5 first**. P1 is written out below it but must not start until P0.5 is verified end-to-end — until Colattao's guest menu actually reads live data, an 86 board there changes nothing a guest can see. P2–P5 get their own entries once P1 produces usage data.

```
## [ ] 49 - Menu Control P0.5: connect Colattao's guest menu to live data

**State:** QUEUED - BLOCKED ON ANTHONY'S MENU RECONCILIATION
**Authority:** Anthony selected Colattao as the P1 pilot on 2026-09-20. Plan: PRODUCT_MODULES/MENU_CONTROL_APP_PLAN.md §6a. Colattao's guest menu is currently a static file (colattao-cafe-rush/src/data/colattaoMenu.ts) imported by src/app/menu/page.tsx:4, while the owner portal writes to Supabase. They are not connected, and they have already drifted.
**Blocked by:** Anthony must reconcile the two menus item by item before any switch — static has "Fall Drinks" / 51 items, Supabase has "Seasonal Drinks" / ~54 items. Do not guess which is correct. Do not start implementation before this is resolved and recorded.
**Scope:** In the colattao-cafe-rush repo only: point src/app/menu/page.tsx at get_public_menu('colattao'); retain colattaoMenu.ts as a build-time fallback so an unreachable Supabase renders the current menu rather than an error; fix the zero-price rendering so 0 renders "Ask staff" (House Brew is seeded at 0::numeric and is the first item of the first category). Data source only.
**Preserve:** The exact printed QR URL colattao-cafe-rush.vercel.app/menu — no redirect, no path change. The current visual design, autumn/seasonal components, FallPromo, guest note form. No migration of Colattao's menu to /m/colattao — CLAUDE.md forbids it.
**PASS:** Guest menu at the exact QR URL renders byte-for-byte equivalent content to today's static menu after reconciliation, verified item by item. Supabase-unreachable path renders the fallback, never a 5xx. Zero-price items read "Ask staff" on the guest screen. Targeted ESLint, tsc --noEmit, production build. 320/390/1440 with no overflow. Scan the real printed QR on a physical phone and confirm zero redirects.
**STOP:** No URL change, no redirect, no reprint, no /m/colattao migration, no design change, no owner-portal change, no schema migration. No production merge without Anthony. If reconciliation is unresolved, stop and report — do not pick a winner.

## [ ] 50 - Menu Control P1: the 86 board

**State:** QUEUED - DO NOT START UNTIL 49 IS VERIFIED LIVE
**Authority:** Anthony asked on 2026-09-20 for the owner menu app to be as simple as possible, owner-editable, with gamification. Plan: PRODUCT_MODULES/MENU_CONTROL_APP_PLAN.md. This entry covers P1 only. Pilot tenant: colattao.
**Depends on:** Queue 49. Until Colattao's guest menu reads live data, an 86 board changes nothing a guest can see.
**Scope:** A default "Tonight" screen in the existing /owner/[id] PWA: searchable flat list of menu items, one-tap available/sold-out per item, optimistic UI with an explicit failed-save retry state, and an "Everything's on" confirm. Reuses the existing audited rail (lib/owner/rail.ts, menu-control-actions.ts) and the is_available field it already supports. Replaces Colattao's request-based menu gating at OwnerDashboard.tsx:194 with the live editor for availability only — every other Colattao menu change stays request-based until P2.
**Preserve:** /m/[id] and /owner/[id] URL shapes. Colattao's printed QR. Existing MenuQuickEdit two-step confirm for price/name/description edits — 86-ing is the only action that loses the review step, because it is one-tap reversible.
**PASS:** Time-to-86 under 10s from app launch on a 390px viewport, measured and recorded. An 86 in the owner app is visible on the real Colattao guest menu at the printed QR within one refresh. Tenant authorization re-checked per write. Every toggle written to audit_log. Failed save is visibly distinguishable from a successful one. Targeted ESLint, tsc --noEmit, production build. 320/390/1440 with no overflow. Keyboard focus visible on every toggle.
**STOP:** No schema migration, no new RPC, no storage bucket, no photo upload, no add/delete/reorder — those are P2. No gamification — that is P3. No guest-menu manifest or install prompt ever. No secrets, access grants, billing, client send, print, or production merge. Anthony approves deploy.
```

---

## 10. Sources

Best-practice research behind §0 and §4:

- [QR Code Menus: The Complete Restaurant Owner's Guide — Evergreen](https://www.evergreenhq.com/blog/qr-code-menus-the-complete-restaurant-owners-guide/)
- [QR code menu for restaurants: best practices — QRshuffle](https://qrshuffle.com/blog/qr-code-menu-restaurants)
- [QR Code Menu Best Practices for Restaurants — Ogent](https://restaurant.ogent.ai/qr-code-menu-best-practices-for-restaurants/)
- [Onboarding Gamification: What Works in B2B SaaS (and What Backfires) — Kompassify](https://kompassify.com/blog/onboarding-gamification-guide)
- [Overjustification Effect: Why Rewards Backfire — Yu-kai Chou](https://yukaichou.com/behavioral-analysis/overjustification-effect-lepper-greene-intrinsic-motivation/)
- [Negative Effects of Gamification in Software: Systematic Mapping and Practitioner Perceptions (arXiv)](https://arxiv.org/pdf/2305.08346)
- [Onboarding Gamification — Chameleon](https://www.chameleon.io/blog/gamify-user-onboarding)
- [86 an Item on the POS or Toast Web — Toast support](https://support.toasttab.com/en/article/86-an-Item)
- [Digital Menu Ordering: Best Practices for Restaurants — Menu Manager](https://menumanager.in/digital-menu-best-practices/)
