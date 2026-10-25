# Fina Calle Seasonal Skins — Engineering Work Orders

> **Queue registration — September 29, 2026:** Anthony requested that this specification be saved and placed in the engineering queue. It is tracked as **queue item 75 — QUEUED, NOT STARTED** in [the Codex queue](../../CODEX_QUEUE.md). This repository copy preserves the original handoff below; its original delivery-status statement describes preparation of the specification. “Ready for planning” in the work orders and CSV does not mean implementation has started. No engineer has been assigned. Revalidate current integration and release state in FC-SEAS-00 when this item is picked up.

Version 1.0 • September 29, 2026 • Product owner: Anthony Colmenares

**Purpose:** Build a reusable seasonal-theme service for restaurant menus and compatible existing games. Make choosing, previewing, scheduling and pausing a theme simple enough for a busy restaurant owner to use on a phone.

**Delivery status:** Engineering specification and proposed backlog. No application implementation, ticket-system assignment, repository mutation, production migration, customer message or release occurred as part of this handoff. Named owners below are responsibility roles, not people already assigned. All orders start **Ready for planning**; dependency gates control implementation readiness.

**Primary proposal:** `Fina_Calle_Seasonal_Packages.pptx`, read September 29, 2026. Basic is proposed to include four distinct catalog themes per subscription year, with a permanent branded design covering gaps. Prices, contractual entitlement dates and commercial exceptions remain unapproved. Additional rules below are explicit engineering defaults for review, not existing contract terms.

## 1. Evidence and integration boundaries

| Verified source | What it establishes | Engineering consequence |
|---|---|---|
| `amma-fina-calle/APP/web/package.json` | Next 16.2.11, React 19.2.4, Phaser ^4.1.0, Supabase dependencies, owner and Bodega self-test scripts | Extend the existing application and tests. Verify lockfile-resolved versions before coding. |
| `colattao-cafe-rush/package.json` | Separate application using Next 16.2.6, React 19.2.4 and Phaser ^4.1.0 | A central dashboard alone cannot change Colattao's separately hosted guest menu. Build and verify its adapter. |
| `OPERATIONS/CODEX_QUEUE.md`, entries 73–74 | Owner-portal simplification and self-service Phase 0 are documented as local/review-ready. Phase 1 has not started in that record. | Reconcile actual branch and production state before choosing a base. Do not assume the documented local changes are live. |
| `OPERATIONS/HANDOFF_LOG.md`, September 29 entry | Bodega uses an open ivory/black/pine owner desk. Colattao uses espresso, ivory and champagne with request-first tools. | Fit the approved owner interfaces. Retain request mode where self-service is not authorized. |
| Repository `AGENTS.md` and operating instructions | Managed Windows workspace, scoped branches, queue and handoff process, approval boundaries | Implement in the approved workspace; preserve current operational gates. |

The referenced historical `APP/FINA_CALLE_CLIENT_OS_STATUS.md` returned 404. Use the current queue, handoff and actual source as the starting point. This packet does not claim to have inspected every menu component, database table, deployment, environment or live permission. WO-00 closes those gaps. No new subscriptions, repricing or billing writes belong to this project.

### Repository coordination

The primary repository is `anthonycolmenaresanandres-lang/amma-fina-calle`, application root `APP/web`. The separate guest application is `anthonycolmenaresanandres-lang/colattao-cafe-rush`. Confirm deployment ownership and canonical locations in WO-00; do not assume both use the same database or hosting project.

On Anthony's engineering workstation, honor `C:\dev\amma\` and the existing managed clone/worktree policy. This handoff itself is a document, not a new application checkout. Read `AGENTS.md`, `OPERATIONS/DATA_CENTER.md`, `OPERATIONS/SKILL_ROUTING.md`, the relevant current queue item and newest relevant handoff before coding. Read repository frontend and game-visual skills when implementing those surfaces. The technical lead records these orders in the existing queue without replacing unrelated entries. Resolve the current owner-portal/self-service branches before touching the same files.

The current request authorizes creation of work orders. Each implementation order is a scope to assign subsequently. Existing repository rules reserve production changes, credentials, access grants, customer communications and release actions for separate authorization. Prepare reviewable work up to those gates.

## 2. Product behavior engineers must preserve

| Rule | Required behavior |
|---|---|
| Permanent design | Every restaurant retains its approved base design. It does not use one of the four selections. |
| Basic allowance | Four **distinct theme IDs per verified subscription term**. This is an annual allowance, not four per month or four activations. |
| Default recommendation | Spring, Summer, Fall and Winter. Recommend them in setup; do not activate or reserve them until the owner confirms or an authorized operator approves a request. |
| Substitutions | Any released, compatible catalog theme can replace an unstarted selection. Completed or started themes remain used for that term. |
| Duration | Owner-selected dates, including a whole season. There is no arbitrary 30-day limit. Dates cannot silently exceed verified entitlement coverage. |
| Reuse | Returning to the same selected theme within the same term uses no additional selection. A new theme version is the same selection ID. |
| Extra themes | Offer “Request an extra theme.” Show a verified quote if available. Do not invent a price or charge a card. |
| Existing access | `request_only` owners submit requests. `self_service` owners may confirm schedules only after that capability is explicitly enabled for their tenant and role. |
| Preview | Preview never changes the public site, consumes allowance, grants access or starts a reward. |
| One active theme | An approved temporary override takes priority over an event, then a season, then the base design. Pausing all themes forces the base design. |
| Conflict resolution | Same-priority overlaps require an explicit edit. Never select an arbitrary last-writer winner. Explain intentional event-over-season replacement before confirmation. |
| Protected content | Preserve item names, prices, allergens, availability, links, categories, rewards, gameplay rules and printed QR destinations. Promotional copy needs separate explicit approval. |
| Catalog honesty | “Coming soon” cannot be scheduled. Only released, tenant-compatible versions count as available. |

### Allowance lifecycle — proposed implementation default

1. Browsing and saving a draft use zero selections. A request awaiting review uses zero, and shows “Subject to availability and your plan.”
2. Confirming/approving a schedule atomically reserves one selection for `(tenant, term, theme_id)`. Additional occurrences of that same theme reuse it.
3. The reservation becomes used when its first approved occurrence reaches its start time, even if nobody visits the menu and a background worker is delayed. Usage must derive from durable approved schedule history, not page views or a cron success flag.
4. Cancelling every occurrence before any starts releases the reservation. A paused or hidden interval still counts once its approved start passed; pausing does not refund it. Show this before confirmation.
5. A cancellation or date change after the first approved start cannot erase past usage. Administrative corrections need a reason and an audit record.
6. When two distinct themes race for the last slot, exactly one succeeds. A retry for the same theme succeeds idempotently. The server/database enforces the limit.
7. Every activation path, including operator overrides, passes the same entitlement check. A manual override cannot create an uncounted fifth theme. Base design and pausing are free.
8. Term boundaries come from the verified account record or an authorized manual entitlement record. Do not infer annual terms from the current date or a monthly invoice. If unknown, preserve request mode and ask the operator to verify the plan.
9. Cross-term schedules are split into explicit occurrences with coverage in each term. Never consume next year's allowance without an approved next-term plan. An annual repeat is a draft until that check succeeds. No automatic payment or silent renewal.

## 3. What “very user friendly” means

### Owner entry and primary journey

Add one clear **Seasonal themes** action inside the existing authenticated owner tools. Preserve the live-menu action before sign-in. Use “theme” in owner-facing copy; “skin” may remain an internal implementation term.

The owner sees their restaurant name, current theme, next change, and “2 of 4 themes selected.” Explain reserved versus used only when needed. Put **Preview** and **Choose dates** next to each available theme. Start with four recommended seasons; let the owner replace a selection without starting over.

Use three steps: **1 Choose theme → 2 Preview and dates → 3 Review and confirm.** This is an interaction sequence, not a mandatory visual stepper. Keep the interface open and uncluttered, consistent with the current owner portals. On mobile, one primary action remains visible without covering the last field or help text. No CSS controls, manifest fields, database terminology or technical IDs in the owner's workflow.

The review screen states: restaurant, theme, visible start/end dates, timezone, any override, effect on remaining selections, promotional text and exactly what becomes public. The primary button says **Schedule theme** for authorized self-service, or **Send theme request** in request mode. Immediate activation is a separate explicit **Start now** choice with confirmation.

### Required states and copy

| State | Owner-facing behavior or example copy |
|---|---|
| First visit | “Choose four themes for the year. You can change a selection before it starts.” Offer recommended dates and a base-design preview. |
| Published schedule | “Halloween is scheduled for October 15–31. Fall returns November 1.” Show Edit dates, Cancel upcoming and Preview. |
| Request-only | “Your request is waiting for review. Your current menu stays live.” Never label a request Scheduled. |
| Plan full | “All four themes are selected. Replace an upcoming theme or request an extra.” Identify eligible replacements. |
| Used slot | “This theme has already started and counts toward this year's four selections.” Offer Pause, not a false refund. |
| Date overlap | “These dates overlap another event. Change the dates or replace that event.” Keep the entered dates. |
| Intentional override | “Halloween will show October 15–31. Fall will return November 1.” Confirm this before committing. |
| No entitlement dates | “We need to confirm your plan dates. You can still preview and request a theme.” |
| Failed save | “We couldn't save this change. Your current schedule is unchanged.” Preserve the form and provide Retry. |
| Unknown network outcome | “Checking whether your change saved…” Query the original operation ID before offering another submission. |
| Paused | “Seasonal themes are paused. Your regular design is showing.” Offer Resume schedule. |
| Retired/unsupported | Explain unavailability and offer compatible choices. Do not count an invalid selection. |

### Measurable UX acceptance targets

- A first-time owner can choose one theme and schedule default dates in **three minutes or less**, without staff coaching. Validate with five representative owner/operator participants; at least four complete the task independently. Treat this as a release target, not an observed result.
- A returning owner can pause all seasonal visuals in **two deliberate interactions or fewer** from the Seasonal themes page. Resume is equally obvious.
- Support 320, 390, 768 and 1440 CSS-pixel widths, 200% zoom, touch, keyboard and a screen reader. No horizontal scrolling for ordinary content.
- Use at least 44×44 CSS-pixel primary touch targets as the product target. Keep visible focus, real labels and concise error text. Meet WCAG 2.2 AA for applicable behavior; test rather than merely claiming compliance.
- Keep body text comfortably readable, normally at least 16 CSS pixels in the owner interface. Preserve text contrast of 4.5:1 for normal text and 3:1 for large text. Do not use color alone for state.
- Respect `prefers-reduced-motion` and provide a visible effect toggle when motion is available. Decorative effects must never intercept menu taps, obscure prices or hide focus.
- Dates use the restaurant's timezone and a human-readable review sentence. Show inclusive display dates. Avoid asking owners to enter UTC or interpret technical timestamps.
- Keep menu prices and product photos separate from theme previews. A preview may use current approved items, but never invent a seasonal product or price.
- Use the existing supported language system. All new UI strings go through that system, with English/Spanish strings prepared if those locales are supported. The selected theme must not change the restaurant's menu language.

## 4. Architecture contract

The design below is a target contract. WO-00 maps it to real routes, tenant IDs and current infrastructure before implementation. File and table names are proposals, not claims that those objects already exist.

### System responsibilities

| Layer | Responsibility |
|---|---|
| Existing owner portal in `APP/web` | Catalog, preview, requests, date editing, confirmation and pause/resume. Reuse authentication, tenant membership and account context. |
| Seasonal domain module | Manifest validation, plan/allowance calculation, deterministic resolution, conflict checks and public snapshot generation. One set of domain rules. |
| Existing verified database | Tenant settings, versioned schedules, approved promotions, entitlement ledger and audit records. No duplicate customer directory. |
| Bodega rendering adapter | Apply the resolved contract to the existing menu and compatible game in the main application. |
| Colattao rendering adapter | Read a public-safe theme snapshot from its existing application server and apply the same contract. Keep separate-repository version compatibility explicit. |
| Operator tools | Review requests, release catalog versions, inspect a tenant schedule, disable a bad version and manage approved entitlement exceptions. |
| Optional reconciliation worker | Catch up audit/status materialization and purge caches. Correct public rendering and allowance enforcement must not depend on this worker running at midnight. |

Use a pure resolver such as `resolveTheme(tenantSnapshot, serverNow)` with no network access or writes inside the function. Share the typed contract and fixtures across the two applications. Prefer the repository's existing sharing mechanism. Do not introduce a new paid service or publish a package merely to move a few schema types.

### Suggested module boundaries after WO-00

Inside the discovered application source root, use a single `lib/seasonal/` area for `contracts`, `manifest-validation`, `entitlements`, `schedule-resolver`, `public-snapshot` and `audit` responsibilities. Keep UI under existing owner routes and a shared seasonal component area. Add a thin adapter in each guest renderer. Use the real migration directory and its normal migration-generation workflow. Do not rename existing routes or reorganize the application to fit these proposed names.

### Minimum logical records

| Record | Required fields or constraints |
|---|---|
| Catalog theme | Stable `theme_id`, slug, category, display strings, status (`planned`, `ready`, `retired`), recommended window, preview reference. |
| Theme version | Immutable version ID, theme ID, schema version, asset checksums, allowed design tokens, slots, supported adapters/game types, accessibility settings, state and release metadata. |
| Tenant settings | Existing tenant key, feature flag, access mode, verified timezone, base design reference, pause state, configuration revision. |
| Term entitlement | Existing tenant key, verified term ID/start/end, included limit default 4, approved extra allowance, source reference, status. Unique tenant/term. |
| Selection ledger | Tenant, term, theme ID, reservation/first-effective-start/history references. Unique tenant/term/theme; concurrent updates lock the term. |
| Schedule revision | Tenant, immutable revision, pinned theme version, term/selection reference, start/end instants, original local dates and timezone, priority class, lifecycle state, approval actor/time. |
| Change request | Tenant, requester, proposed schedule/promotion, pending/approved/declined state, review reason and version. No public effect while pending. |
| Approved promotion | Tenant, plain-text heading/body, optional vetted link, separate validity window and approval. Display only while both promotion and theme are valid. |
| Audit and operation record | Tenant, actor, action, before/after revision IDs, timestamp, reason, idempotency key, request hash and outcome. Keep private fields out of the public snapshot. |

Reuse existing audit/request/entitlement tables if they fit. Keep published versions immutable. Store dates as server-validated instants with original local date/timezone intent. Exposed data needs minimal grants and tenant-scoped policies. A service-role client on the server does not remove the requirement to verify membership before acting.

### Manifest v1: allowed presentation data

Require identity, schema version, compatible adapters, immutable asset references, preview metadata, CSS token allowlist, decorative slots, motion/static variants and an optional game-visual mapping. Suggested tokens include seasonal accent, decorative surface, border tint and approved display accent. Preserve the existing brand logo, menu body font and readable primary surfaces. A theme cannot inject arbitrary CSS, JavaScript, remote HTML, routes, product data or reward rules. Use bounded asset types and trusted asset origins. Reject scripts or active SVG content rather than trusting a filename.

Validate theme colors against each supported brand. If a combination fails contrast, use its approved fallback pair or block publication. Do not ship one universal palette that makes a client's text unreadable. Individual client adaptations are constrained brand overrides, not copied components for every theme.

### Public snapshot and API behavior

The public read contract includes only `schemaVersion`, public tenant identity, `configRevision`, effective theme/version, approved tokens/assets, public promotion if valid, `serverNow`, `nextTransitionAt`, `validUntil` and effective source. The source can be `base`, `season`, `event` or `override`. Do not expose account terms, owner details, drafts, approval notes or future private campaigns.

Owner mutations reuse existing authenticated server actions or routes. Conceptual operations are `getCatalog`, `previewTheme`, `submitRequest`, `approveRequest`, `saveSchedule`, `cancelSchedule`, `pauseThemes`, `resumeThemes` and `getOperationStatus`. Exact route/action names follow the current application. Every mutation verifies tenant membership, capability, expected revision and payload on the server. Persist idempotency outcomes atomically. Reject reuse of a key with a different payload.

Use structured domain errors: `PLAN_LIMIT_REACHED`, `TERM_UNVERIFIED`, `DATE_OVERLAP`, `VERSION_CONFLICT`, `THEME_UNAVAILABLE`, `CAPABILITY_REQUIRED`, `PREVIEW_EXPIRED`. Map them to the copy above. Validation/conflict errors must not partially reserve allowance or modify the live schedule.

### Scheduling and cache rules

- The UI displays inclusive dates. Persist intervals as `[start, endExclusive)`, where an end date of October 31 ends at local midnight starting November 1. Use a timezone-aware library already supported by the project, or justify a narrowly scoped dependency.
- Resolve with authoritative server time. Account for daylight-saving days lasting 23 or 25 hours. Do not add a fixed 24 hours to a local date. For nonexistent/ambiguous local midnight in other timezones, show the normalized instant for confirmation or reject with a clear error.
- First apply tenant pause/feature-disable, then validate entitlement, asset version and adapter compatibility, then approved finite manual override, approved event, approved season, or base. A broken candidate must not blank the menu.
- Reject overlapping published intervals of the same priority transactionally. Different-priority overlaps are intentional only after review. Order changes, reservations and audit entries commit together.
- Pin published schedules to a version. Updating the catalog must not silently redesign live customers. Support a version kill switch that falls back to the next valid candidate or the base design.
- Initial server render and hydration must use the same snapshot. No flash from a client-only `active_theme` fetch after a generic first paint.
- Tenant and adapter identity belong in every cache key. Preview and authenticated responses stay private and uncached by shared caches.
- Public state may be cached for at most 60 seconds and never beyond `nextTransitionAt` or `validUntil`. Do not serve expired promotional content via a stale-while-revalidate policy. Explicitly invalidate after an approved change.
- Open, visible pages refresh by the next boundary or within 60 seconds. Promotional text has a separate hard-expiry timer calculated from trusted server time plus monotonic elapsed time, so it disappears at its known deadline even if refresh fails. On return to visibility, hide expired promotional text before refreshing. Client wall-clock errors cannot activate a future campaign.
- A slow or unavailable theme service returns the local base design within a proposed 300 ms resolution budget, without blocking the existing menu-data path. Never continue expired promotional copy as a fallback.
- Inspect the app's actual Next.js cache mode and installed-version docs before implementing invalidation. Do not copy an obsolete `revalidateTag` signature or assume its default behavior forces immediate freshness.

## 5. Work-order index and delivery sequence

P0 = required to prevent an incorrect, inaccessible or unsafe release. P1 = required for the usable first launch. Estimates below are relative scopes, not promised dates.

| ID | Work order | Responsible role | Priority | Depends on |
|---|---|---|---|---|
| FC-SEAS-00 | Confirm the integration map and approved baseline | System lead | P0 | None |
| FC-SEAS-01 | Specify and prototype the owner experience | Product designer + frontend engineer | P1 | FC-SEAS-00 |
| FC-SEAS-02 | Build the tenant-safe domain and persistence layer | Backend/database engineer | P0 | FC-SEAS-00 |
| FC-SEAS-03 | Create the catalog contract and four production-quality theme packs | Design systems engineer + visual designer | P1 | FC-SEAS-00; FC-SEAS-01; FC-SEAS-02 contracts |
| FC-SEAS-04 | Implement menu rendering adapters and safe fallback | Frontend/platform engineer | P0 | FC-SEAS-00; FC-SEAS-02; FC-SEAS-03 contracts |
| FC-SEAS-05 | Enforce the four-theme entitlement lifecycle | Backend engineer | P0 | FC-SEAS-02 |
| FC-SEAS-06 | Build deterministic scheduling, timezone handling and freshness | Platform/backend engineer | P0 | FC-SEAS-02; FC-SEAS-05 |
| FC-SEAS-07 | Build the owner catalog, private preview and scheduling workflow | Frontend engineer | P1 | FC-SEAS-01; FC-SEAS-03; FC-SEAS-04; FC-SEAS-05; FC-SEAS-06 |
| FC-SEAS-08 | Build operator review, catalog release and recovery tools | Full-stack engineer | P0 | FC-SEAS-02; FC-SEAS-03; FC-SEAS-05; FC-SEAS-06 |
| FC-SEAS-09 | Adapt existing game visuals without changing gameplay | Game engineer | P1 | FC-SEAS-03; FC-SEAS-04; FC-SEAS-06 |
| FC-SEAS-10 | Add operational diagnostics and lightweight measurement | Platform/observability engineer | P1 | FC-SEAS-02; FC-SEAS-04; FC-SEAS-06; FC-SEAS-07 |
| FC-SEAS-11 | Verify behavior, accessibility, isolation and recovery | QA engineer + technical reviewer | P0 | FC-SEAS-02 through FC-SEAS-10 as applicable |
| FC-SEAS-12 | Prepare the pilot, release package and operating handoff | Technical lead + client operations | P0 | FC-SEAS-11; product review of commercial defaults |

Suggested sequencing: WO-00 establishes the real integration map. WO-01 and the WO-02 contract can then progress independently. WO-03/04 use that contract; WO-05/06 stabilize entitlement and time behavior; WO-07/08 connect the owner and operator experiences; WO-09 adds compatible game visuals; WO-10/11 verify the integrated system; WO-12 prepares the pilot. Separate work on shared owner files only after the lead assigns explicit ownership. This is a dependency plan, not authorization to spawn or assign agents automatically.

Each order must finish with: changed files and source revision, exact checks run, evidence paths, unresolved risks, and the next dependency it unblocks. If the order is documentation-only, do not run an unrelated app build.


## 6. Detailed work orders

Assign one order at a time with its dependency evidence and the shared contracts above.

### FC-SEAS-00 — Confirm the integration map and approved baseline

**Owner role:** System lead  
**Priority:** P0  
**Dependencies:** None  
**Status:** Ready for planning

**Scope:** Read-only discovery in the two verified repositories and the relevant current operating records.

**Build requirements**

- Reconcile current main, production revision and owner/self-service branches. Record which changes are merged, local, deployed or unknown.
- Map each tenant's real public menu/game route, stable printed QR destination, adapter host, owner entry, authenticated membership check, request mode and deployment project. Follow redirects to the actual rendering application.
- Inspect package/lockfile, relevant route/layout/configuration code, existing tenant/request/audit models and newest migration numbering. Confirm the correct database project without exposing credentials or applying changes.
- Identify existing seasonal CSS/effects, game fallback path, feature flags, cache policy and test harness. Record exact proposed touch points and known collisions.
- Produce a short architecture decision record: shared contract location, central source of truth, adapter delivery, private preview mechanism, unknown entitlement dates and integration sequence.

**Deliverables:** Architecture/integration map with exact paths and source revisions; scoped backlog dependencies; no application changes.

**Acceptance criteria**

1. Bodega and Colattao each have a verified route-to-renderer mapping or an explicitly recorded blocker.
2. A redirect in the main app is not mistaken for control over a separately hosted menu.
3. The lead resolves the Phase 0/owner-portal branch dependency before approving implementation paths.
4. Unknown database, billing, permission or deployment facts remain unknown; no guessed IDs enter code.

**Codex effort:** HIGH  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** Avoid building a dashboard that cannot control the real guest menus or conflicts with unpublished owner work.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Execute FC-SEAS-00 only. Read the current repository instructions and the smallest relevant source set, verify the two applications and their real guest-menu destinations, and produce the integration ADR with exact file paths, revisions, permissions, cache behavior and unresolved dependencies. Make no application, account or production changes.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-01 — Specify and prototype the owner experience

**Owner role:** Product designer + frontend engineer  
**Priority:** P1  
**Dependencies:** FC-SEAS-00  
**Status:** Ready for planning

**Scope:** Seasonal themes owner journey and operator-review states, using the existing portal design language.

**Build requirements**

- Map choose, preview, dates, review/confirm, request-only, pause/resume and cancellation flows. Use current branded Bodega and Colattao screens as references.
- Produce mobile and desktop prototypes for first setup, a full plan, one intentional override, a same-priority conflict, a failed save and pending review.
- Add a simple date-list view before considering a calendar grid. A visual calendar is optional; the list must support all actions accessibly.
- Define the content hierarchy, visible primary actions, focus order, labels, live announcements, loading feedback and error recovery.
- Prepare localized strings through the existing language mechanism. Keep requests visibly different from approved schedules.
- Conduct the specified five-person usability check before general release; an engineer walkthrough cannot substitute for owner evidence.

**Deliverables:** Screen/interaction specification, approved copy table, prototype and usability test script/results when participants are available.

**Acceptance criteria**

1. The prototype covers every state in section 3, including unknown-save outcomes.
2. No owner must see a manifest, CSS value, tenant ID or UTC timestamp.
3. Default scheduling requires only the three stated steps, with optional fields deferred.
4. The test script measures independent completion time and recoverability. If participants are unavailable, mark the release usability gate pending.

**Codex effort:** HIGH  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** The service must work for an owner on a phone without explaining engineering concepts.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Execute FC-SEAS-01 only after WO-00. Use the current owner portals and repository frontend-design instructions to specify the three-step Seasonal themes flow and all failure/request-only states. Produce a mobile-first prototype and objective acceptance script. Do not change authorization, billing or production behavior.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-02 — Build the tenant-safe domain and persistence layer

**Owner role:** Backend/database engineer  
**Priority:** P0  
**Dependencies:** FC-SEAS-00  
**Status:** Ready for planning

**Scope:** Versioned catalog/schedules, tenant settings, existing-request integration, audit and authenticated commands.

**Build requirements**

- Map the logical records in section 4 onto existing tenant/customer, request and audit structures. Add only missing tables and indexes.
- Create migrations through the repository's normal Supabase migration workflow. Test locally/staging as authorized. RLS and grants ship together for exposed tables.
- Implement server-verified membership and capability checks. Do not authorize from user-editable profile metadata, a client tenant ID or a trusted-looking route alone.
- Owners read only their tenant's private records. Public users read only released catalog metadata and effective public snapshots. Operator privileges come from existing verified roles.
- Add optimistic revision checks and durable idempotency operation records. Persist schedules, reservations and audit in one transaction through an existing transaction pattern or tightly scoped database function.
- Avoid privileged functions unless required. If used, document the reason, tenant checks, constrained search path and explicit execution grants. Never expose server credentials to browsers.

**Deliverables:** Reviewed schema migration, domain types, command/read services, permission tests and migration rollback/forward-fix notes.

**Acceptance criteria**

1. Tenant A cannot read/write Tenant B by direct API, forged path, altered body or database policy path.
2. Anonymous and request-only users cannot approve/publish or allocate extra allowance.
3. A failed transaction leaves schedule, allowance and audit consistent.
4. Repeating the same operation returns the original outcome; a changed payload with the same key fails.
5. Migration tests pass against the intended engine. Local emulation results are not misrepresented as full hosted RLS verification.

**Codex effort:** HIGHEST  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** Owner simplicity depends on reliable isolation, atomic writes and recoverable state.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Implement FC-SEAS-02 in an isolated approved branch after WO-00. Reuse actual tenant/request/audit patterns, create the smallest versioned seasonal model and server command layer, and verify tenant isolation, atomicity, idempotency and optimistic concurrency. Prepare migrations and evidence without applying production changes or granting access.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-03 — Create the catalog contract and four production-quality theme packs

**Owner role:** Design systems engineer + visual designer  
**Priority:** P1  
**Dependencies:** FC-SEAS-00; FC-SEAS-01; FC-SEAS-02 contracts  
**Status:** Ready for planning

**Scope:** Manifest v1, validator, asset production specification, 25 catalog records and the four default packs.

**Build requirements**

- Implement the allowlisted manifest contract and version validator from section 4, including compatibility, checksum and reduced-motion/static alternatives.
- Seed the 25 stable IDs in section 7. Keep unbuilt entries planned and nonselectable. Only release four defaults after all their assets and QA exist.
- Produce Spring Refresh, Summer Vibes, Autumn Harvest and Winter Glow with each supported tenant's constrained brand adaptation. Winter is not automatically Christmas.
- Define slots by responsive behavior and aspect ratio, with fallbacks and size limits. Do not require every asset to have an identical pixel dimension if the slot serves different devices.
- Keep the menu body typeface and official logos. Use approved assets and required repository art workflows; do not regenerate customer logos or licensed sports marks.
- Keep versions immutable and provide a static preview, release status, supported touchpoints and accessibility result for each pack.

**Deliverables:** Manifest schema and fixtures; catalog seed; four approved versioned packs and previews; repeatable new-pack checklist.

**Acceptance criteria**

1. Invalid tokens, unsafe asset URLs, unsupported schemas, missing required assets and active content fail validation.
2. All four packs work with both target menu adapters before both are claimed supported.
3. Planned themes cannot be scheduled or consume allowance.
4. Each skin has a static reduced-motion presentation and a readable brand-safe palette.
5. A fifth pack can use the same slots/configuration without duplicating a menu component.

**Codex effort:** HIGH  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** Themes must be reusable across brands without copying or rebuilding menu components.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Implement FC-SEAS-03 using the approved theme schema and existing brand assets. Create the 25 catalog records with truthful availability, build the four default versioned packs, and validate assets, contrast, reduced-motion variants and adapter compatibility. Follow the repository visual workflow. Do not create a new game or change menu data.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-04 — Implement menu rendering adapters and safe fallback

**Owner role:** Frontend/platform engineer  
**Priority:** P0  
**Dependencies:** FC-SEAS-00; FC-SEAS-02; FC-SEAS-03 contracts  
**Status:** Ready for planning

**Scope:** Theme application in the main guest renderer and the separate Colattao application.

**Build requirements**

- Introduce bounded CSS design tokens and slots at the appropriate tenant menu root. Keep business data, links and category navigation unchanged.
- Implement adapter capability declarations and a shared-contract compatibility check. A central snapshot unsupported by an adapter falls back safely and reports the issue.
- Resolve the initial server snapshot before hydration. Keep the menu-data path independent of theme service availability. Apply the same snapshot on the first client render.
- Apply approved decorations behind content with pointer-events disabled. Prevent stacking-context collisions with sticky categories, modals, play controls and footer branding.
- Implement immutable asset URLs, loading failure handling and per-tenant base fallback. Colattao reads through its server layer rather than receiving administrative credentials.
- Preserve exact QR destinations and existing redirects. Theme selection must never rewrite a printed URL or trigger reprinting.

**Deliverables:** Two thin rendering adapters, CSS/token integration, documented fallback and matched before/after screenshots.

**Acceptance criteria**

1. All approved menu items, prices, unknown-price treatment, categories and links match the baseline.
2. Disable the theme service and block decorative assets: both menus remain readable and navigable.
3. No flash/hydration mismatch, hidden menu button, tap interception or horizontal overflow at target widths.
4. Cross-tenant snapshot cache tests pass.
5. A theme change can appear on both apps without a new code deployment once compatible assets and manifests are released.

**Codex effort:** HIGH  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** The existing QR menu must stay usable during theme changes, asset failures and cross-app outages.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Implement FC-SEAS-04 in the two mapped renderers. Reuse the shared manifest contract and a server-resolved snapshot, apply tokens only to the tenant menu surface, and prove base fallback and unchanged QR/menu behavior. Keep all business data and existing game rules untouched. Return adapter and visual regression evidence.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-05 — Enforce the four-theme entitlement lifecycle

**Owner role:** Backend engineer  
**Priority:** P0  
**Dependencies:** FC-SEAS-02  
**Status:** Ready for planning

**Scope:** Term verification, selection reservation/usage, substitutions, cancellations and approved extra allowance.

**Build requirements**

- Implement the full lifecycle in section 2 as server/domain rules. Keep catalog identity separate from asset version identity.
- Lock the tenant/term record during schedule approval and slot changes. Enforce unique tenant/term/theme selection and the current included-plus-approved-extra limit.
- Reconcile effective starts from durable schedule history before any slot release or mutation. Worker failures, no page views, pauses or later amendments cannot erase use.
- Make request-only drafts nonreserving. At operator approval, recheck entitlement and conflict state and return a reviewable failure if circumstances changed.
- Require verified annual entitlement boundaries. Stage next-year defaults as drafts and explicitly handle schedules that cross term boundaries.
- Add a manual, audited extra-entitlement path restricted to authorized operators. It records an approved commercial source; it does not charge, infer a price or edit the billing platform.

**Deliverables:** Entitlement service, ledger/migration changes as needed, concurrency tests and owner-safe allowance read model.

**Acceptance criteria**

1. Four distinct confirmed themes pass; a fifth fails without an extra approved allowance.
2. Two concurrent last-slot requests yield exactly one new selection.
3. Repeated activation or a new version of an existing selected theme uses no extra slot.
4. Cancelling all never-started occurrences releases one slot; cancelling after a start does not.
5. No-traffic and missed-worker cases still retain past usage.
6. Unknown terms and unsupported cross-term coverage cannot silently publish.

**Codex effort:** HIGHEST  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** Owners need a clear allowance that cannot overbook or disappear after retries or date edits.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Implement FC-SEAS-05 exactly against the documented allowance lifecycle. Focus on transactional reservation, immutable use history, same-theme reuse, cancellation and term-boundary behavior. Add meaningful race/retry tests. Preserve all current billing integrations and prices. Do not invent entitlement dates or automate charges.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-06 — Build deterministic scheduling, timezone handling and freshness

**Owner role:** Platform/backend engineer  
**Priority:** P0  
**Dependencies:** FC-SEAS-02; FC-SEAS-05  
**Status:** Ready for planning

**Scope:** Pure resolver, overlap rules, pause/override, temporal boundaries and shared/public cache policy.

**Build requirements**

- Build a pure resolver with injected authoritative time and fixtures for every precedence branch. Public reads perform no entitlement writes.
- Convert owner date-only values into local start/end-exclusive instants with the verified tenant timezone. Preserve local intent for review.
- Enforce same-priority nonoverlap in the transaction, with tenant-level locking or equivalent constraints that also handle concurrent edits.
- Explain cross-priority overrides before approval. Support tenant pause, resume, finite manual override, and asset-version disable with defined fallback.
- Compute nextTransitionAt and validUntil. Bound every CDN/server/browser cache to those values and 60 seconds, whichever is earlier. Invalidate on changes.
- Reconcile visible pages at boundaries and on focus/visibility return. Keep promotional expiry strict. A worker may aid reconciliation but cannot determine whether a schedule is valid.
- Choose Next.js invalidation behavior from installed-version documentation and actual cache mode. Verify production-build behavior rather than relying only on development mode.

**Deliverables:** Resolver, timezone/date service, conflict enforcement, cache integration and a boundary-test matrix.

**Acceptance criteria**

1. Fall appears, Halloween overrides, and Fall returns at the exact local boundaries in the proposal example.
2. DST spring-forward/fall-back, leap day, year rollover and cross-term limits pass.
3. Competing event edits cannot both publish; an old revision returns a recoverable conflict.
4. A midnight worker failure has no impact on the effective public theme.
5. Expired promotion text never survives a configured freshness boundary.
6. Pause shows base; resume evaluates the current schedule rather than restoring an expired theme.

**Codex effort:** HIGHEST  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** A scheduled theme must appear and disappear on the promised local dates even without a midnight job.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Implement FC-SEAS-06 after the domain and entitlement contracts. Use a pure clock-injected resolver and timezone-aware half-open intervals. Enforce deterministic overlaps, pause/override and cache deadlines with transaction and production-build tests. Do not make correctness depend on cron, browser time or an active_theme flag alone.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-07 — Build the owner catalog, private preview and scheduling workflow

**Owner role:** Frontend engineer  
**Priority:** P1  
**Dependencies:** FC-SEAS-01; FC-SEAS-03; FC-SEAS-04; FC-SEAS-05; FC-SEAS-06  
**Status:** Ready for planning

**Scope:** Existing owner tools, three-step selection flow, private preview, plan feedback and request/self-service modes.

**Build requirements**

- Implement the approved screens and copy, keeping the public menu action ahead of sign-in and the current tenant branding.
- Default to the four-season recommendation; let owners review/change selections, preview their actual approved menu and choose suggested or custom dates.
- Use an authenticated same-renderer preview, or a short-lived tenant-bound signed preview when crossing application origins. Pin the preview version and configuration hash. Do not expose draft data through a public query flag.
- Suppress tracking, rewards, submission side effects and live mutations in previews. A demonstration game cannot create redeemable rewards.
- Implement separate Schedule theme and Send theme request actions based on verified capability. Disable repeated submissions and reconcile unknown outcomes by operation ID.
- Include a clear date list, usage explanation, cancel upcoming, request extra, pause and resume. Restore draft inputs after validation/network errors.
- Keep defaults in the main flow and optional promotion/motion settings secondary. Do not add a complex theme editor to Basic.

**Deliverables:** Working responsive owner flow, safe preview integration, localization strings and UX/accessibility evidence.

**Acceptance criteria**

1. The preview matches the proposed published version and never changes another guest session.
2. The correct primary action appears for each capability; no client-side toggle grants publishing rights.
3. All required states and exact mutation/confirmation semantics in section 3 work.
4. The browser back button, dialog focus return, keyboard date selection and unsaved-change warning work.
5. Repeating a failed-looking save cannot double-book or double-count a selection.
6. Target owner usability results are documented before general release.

**Codex effort:** HIGH  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** The main product experience must be fast, understandable and honest about what has actually changed.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Implement FC-SEAS-07 from the approved UX specification and stable backend contracts. Build the mobile-first choose/preview/dates/confirm journey inside the existing owner portal. Preserve request-only behavior, make previews nonmutating, and verify all plan/conflict/failure states with keyboard and mobile screenshots.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-08 — Build operator review, catalog release and recovery tools

**Owner role:** Full-stack engineer  
**Priority:** P0  
**Dependencies:** FC-SEAS-02; FC-SEAS-03; FC-SEAS-05; FC-SEAS-06  
**Status:** Ready for planning

**Scope:** Existing internal admin tools for requests, immutable releases, entitlement exceptions and emergency recovery.

**Build requirements**

- Reuse existing operator authentication. Add a tenant selector with unmistakable restaurant identity and the same preview component used by owners.
- Show pending requests with before/after schedule, plan effect and conflicts. Require a reason for decline or material adjustment. Changed dates/text require the appropriate renewed approval.
- Release only validated immutable versions. Record author, reviewer, compatibility and QA evidence. A new release cannot change already pinned schedules automatically.
- Provide per-tenant pause, per-version disable and global seasonal-feature disable. Show a confirmation that identifies affected tenants; record every change.
- Allow approved allowance corrections/extra entitlements with source and reason. Keep account billing writes outside this screen.
- Display audit history and effective-state diagnostics in internal tools only. Do not add outbound customer email/SMS by default.

**Deliverables:** Operator screens, release workflow, recovery controls and audit readback.

**Acceptance criteria**

1. A nonoperator cannot access any admin action by direct request.
2. Request approval revalidates the current plan and schedule atomically.
3. Disabling a broken version produces a safe fallback and leaves a traceable record.
4. Publishing a catalog version leaves existing pinned schedules unchanged.
5. Staff can restore base appearance without deleting data or changing the public QR URL.

**Codex effort:** HIGH  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** Staff must resolve exceptions without editing raw database rows or surprising customers.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Implement FC-SEAS-08 in existing operator tools. Add request review, immutable catalog release, tenant/version/global fallback controls and auditable entitlement corrections. Reuse real roles, confirm affected tenants and preserve billing/access boundaries. Produce recovery evidence without sending messages or changing production.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-09 — Adapt existing game visuals without changing gameplay

**Owner role:** Game engineer  
**Priority:** P1  
**Dependencies:** FC-SEAS-03; FC-SEAS-04; FC-SEAS-06  
**Status:** Ready for planning

**Scope:** Optional theme-to-game visual mappings for compatible existing games and their primitive/DOM fallbacks.

**Build requirements**

- Read the current game module and repository game-visual guidance. Confirm the actual Phaser 4 version and fallback architecture per tenant.
- Add allowed slots for background/decorative effects and existing collectible/scene skins. Retain object types, collision shapes, timing, scoring, speed, reward eligibility and cooldowns.
- Latch the theme at a round's start. If a calendar boundary occurs during play, apply the new visuals on the next round rather than resetting or replacing gameplay state.
- Honor motion preferences for decorative effects independently from essential input/game mechanics. Keep fallback controls playable if renderer or sprites fail.
- Preload only the chosen game's assets when game entry requires them. Do not load Phaser merely to show seasonal menu decoration.
- Mark unsupported game/theme combinations accurately in preview and owner scope. Do not promise game visuals where only menu theming works.

**Deliverables:** Game visual adapter, compatible theme mappings, static/primitive fallback and gameplay regression evidence.

**Acceptance criteria**

1. Identical input sequences produce the same scores, outcomes and reward behavior before/after the skin adapter.
2. Active rounds survive a schedule transition without resetting state.
3. Missing sprites/renderer failures preserve a playable supported fallback.
4. Menu-only navigation does not load a new game bundle.
5. Every supported skin is checked on both the enhanced and fallback game path.

**Codex effort:** HIGH  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** Seasonal polish must preserve the game people already know and keep it playable on slower phones.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Implement FC-SEAS-09 only for verified compatible existing games. Follow the repository Phaser 4 and visual-asset workflow, add a visual-only theme adapter, latch versions per round, and test enhanced/fallback paths. Do not change scoring, duration, collisions, speed, rewards or cooldowns, and do not build a new game.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-10 — Add operational diagnostics and lightweight measurement

**Owner role:** Platform/observability engineer  
**Priority:** P1  
**Dependencies:** FC-SEAS-02; FC-SEAS-04; FC-SEAS-06; FC-SEAS-07  
**Status:** Ready for planning

**Scope:** Effective-state diagnostics, structured error events, lightweight usage measures and theme performance budgets.

**Build requirements**

- Record theme resolution failures, fallback reasons, schedule conflicts, approval failures, stale-state breaches and unknown mutation outcomes with tenant/version/revision identifiers.
- Keep owner identities, private menu drafts, tokens and credentials out of public telemetry. Reuse existing analytics/consent behavior; do not add session replay or fingerprinting.
- Surface an internal status view: expected theme, observed adapter version, last resolution result, next boundary and fallback state.
- Measure theme-added bytes and page performance against the same tenant's base theme at the same viewport/network profile.
- Where already permitted, collect aggregate theme impressions, promotion clicks, game starts and completion rates. Preview sessions are excluded.
- Keep scheduled transitions separate from observed page impressions. A zero-traffic day is not proof that scheduling failed or that no slot was used.

**Deliverables:** Structured events, internal diagnostics, performance report and metric definitions.

**Acceptance criteria**

1. A forced invalid manifest or unreachable service yields a diagnosable event and a usable menu.
2. No preview traffic contaminates public engagement metrics.
3. Proposed incremental budgets: menu theme JavaScript ≤20 KB Brotli, theme CSS ≤10 KB Brotli, initial decorative media ≤150 KB compressed. Any exception needs an explicit measured rationale.
4. Target LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 where reliable field data exist. Use a documented lab baseline during pilot and show regressions honestly.
5. No dashboard labels clicks or skin activation as proven restaurant revenue.

**Codex effort:** MEDIUM  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** Fina Calle needs to see whether a theme is working without adding latency or overstating sales impact.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Implement FC-SEAS-10 with existing logging and analytics facilities. Add tenant-safe diagnostics, preview exclusion and measured theme byte/performance budgets. Report actual observed metrics and limits. Do not add paid monitoring, outbound alerts, session replay or unsupported revenue attribution.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-11 — Verify behavior, accessibility, isolation and recovery

**Owner role:** QA engineer + technical reviewer  
**Priority:** P0  
**Dependencies:** FC-SEAS-02 through FC-SEAS-10 as applicable  
**Status:** Ready for planning

**Scope:** Risk-based automated cases, exact UI journeys, two-renderer integration and release evidence.

**Build requirements**

- Implement the release matrix in section 8 using the existing harness. Use a controllable clock, two test tenants and a verified annual term fixture.
- Run domain and permission checks early, then focused owner/menu/game integration tests. Test the actual cross-application Colattao path and cache boundaries.
- Audit touched UI with the required repository web-design guidance and same-viewport before/after captures. Verify keyboard, zoom, screen-reader announcements, reduced motion and focus order.
- Check real QR payloads/route behavior, approved menu data, images, category anchors and current game/reward invariants against the baseline.
- Test slow/offline requests, asset failures, old adapter versions, worker outage and a real pause/disable/rollback drill in the approved environment.
- Run targeted lint/test commands while iterating and one production build per changed app for final verification. Use discovered scripts, not guessed test commands. Re-run only affected checks after small corrections unless a release gate requires broader coverage.

**Deliverables:** Test matrix with pass/fail/evidence, source revision, screenshots, accessibility findings and explicit remaining gaps.

**Acceptance criteria**

1. Every P0 case passes on the exact candidate revision.
2. Both guest adapters and both owner capability modes have evidence, not only mocks of a single app.
3. Any failed usability, isolation, expiry or basic-menu recovery case blocks general release.
4. Build/preview tests are not described as production verification. Record tools and environments honestly.
5. A reviewer can follow the results to the exact commits and reproducible steps.

**Codex effort:** HIGHEST  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** The release must be verified as a working owner-to-guest experience, not a set of passing component tests.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Execute FC-SEAS-11 against the integrated candidate, following the shared acceptance matrix. Prioritize entitlement races, tenant isolation, temporal/cache boundaries, private previews and end-to-end owner usability. Verify both apps and fallback game paths. Run proportional final builds, record evidence, and stop at unresolved release blockers.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

### FC-SEAS-12 — Prepare the pilot, release package and operating handoff

**Owner role:** Technical lead + client operations  
**Priority:** P0  
**Dependencies:** FC-SEAS-11; product review of commercial defaults  
**Status:** Ready for planning

**Scope:** Feature-flagged pilot plan, release sequencing, rollback and reusable operator/client instructions.

**Build requirements**

- Package reviewed source changes, migrations, immutable assets, compatibility versions, QA evidence and exact environment mapping. Leave all tenants off by default.
- Select one authorized pilot restaurant and one compatible released theme. Confirm the owner has reviewed the preview/dates and that the tenant capability matches the agreed mode.
- Plan backward-compatible deployment: additive schema/contract support and adapters first, validated assets next, central controls last, then tenant enablement. Older adapters continue using the base design.
- Rehearse a scheduled transition and rollback in staging. Prepare owner instructions in plain language and an operator playbook for request approval, date changes, full allowance, asset failure and pause/resume.
- Define pilot exit: correct boundaries, reliable base fallback, no menu/QR/game regression, measured performance and completed owner usability gate. Monitor one controlled transition plus the first real campaign window.
- Update the existing company briefing, queue and handoff through the approved repository process when implementation is assigned. Record exactly what is prepared, merged, deployed or enabled; keep those states distinct.
- Prepare release authorization with concrete commits, affected tenants, migration steps and rollback. Do not apply production changes, send customer instructions or auto-enable the rest of the catalog under this work order alone.

**Deliverables:** Pilot checklist, release/rollback runbook, owner quick guide, operator SOP and review-ready release package.

**Acceptance criteria**

1. A reviewer can identify the exact source, database and host for each action without guessing.
2. Rollback restores each tenant's base design and current stable QR route without deleting schedules or commercial records.
3. The feature stays disabled for nonpilot tenants.
4. Catalog availability matches actual completed packs; no future theme appears ready prematurely.
5. The handoff separates prepared work from production execution and identifies the specific remaining approval.

**Codex effort:** HIGH  
**Scope:** This work order only, after its dependency gates pass.  
**Token-saving rule:** Read only this order, its shared contracts, dependency handoffs and directly affected files. Use targeted search and the existing test harness. Do not rescan the whole repository or rewrite unchanged files. Run broader verification only for a documented release risk or required gate.  
**Why:** A controlled rollout proves the system before it affects every restaurant.

**Exact prompt to paste:**

```text
Use Fina_Calle_Seasonal_Engineering_Work_Orders.md as the shared specification.
Prepare FC-SEAS-12 after QA passes. Assemble the exact release package, one-tenant pilot, backward-compatible deployment sequence, plain-language owner guide, operator SOP and rollback drill evidence. Keep production flags off and present the concrete release actions for the existing approval gate. Do not send or deploy.
Follow the work order's build requirements and acceptance criteria. Read current repository instructions, relevant skill guidance and installed-version docs before implementation. Do not infer release authorization from an implementation assignment. Report exact changes, checks, evidence and remaining gaps.
```

## 7. Catalog registry and build priority

These are proposed stable IDs. The permanent `base` theme is not a catalog selection and does not consume allowance. Categories affect default scheduling priority. Suggested windows are marketing defaults; moving holidays and organizer dates need annual verification. First release builds the four core seasons. The other 21 entries remain planned until ready.

| ID | Owner name | Category | Suggested window | Release wave |
|---|---|---|---|---|
| `spring-refresh` | Spring Refresh | Season | March–May | 1 |
| `summer-vibes` | Summer Vibes | Season | June–August | 1 |
| `autumn-harvest` | Autumn Harvest | Season | September–November | 1 |
| `winter-glow` | Winter Glow | Season | December–February | 1 |
| `valentines-day` | Valentine's Day | Event | February | 2 |
| `st-patricks-day` | St. Patrick's Day | Event | March | Demand-led |
| `easter` | Easter | Event | March/April | Demand-led |
| `cinco-de-mayo` | Cinco de Mayo | Event | Late April–May | Demand-led |
| `mothers-day` | Mother's Day | Event | Early May | 2 |
| `fathers-day` | Father's Day | Event | June | Demand-led |
| `independence-day` | Independence Day | Event | Late June–July 4 | Demand-led |
| `halloween` | Halloween | Event | October | Demand-led |
| `thanksgiving` | Thanksgiving | Event | November | Demand-led |
| `christmas-holidays` | Christmas / Holidays | Event | Late November–December | 2 |
| `new-years-eve` | New Year's Eve | Event | Late December–early January | Demand-led |
| `game-day` | Game Day | Event | Selected games | Demand-led |
| `soccer-tournament` | Soccer Tournament | Event | Verified tournament dates | Demand-led |
| `restaurant-week` | Restaurant Week | Event | Verified organizer dates | Demand-led |
| `coffee-day` | Coffee Day | Event | Selected US/international observance | Demand-led |
| `graduation` | Graduation | Event | May–June | Demand-led |
| `back-to-school` | Back to School | Event | August–September | Demand-led |
| `anniversary` | Anniversary | Event | Restaurant's dates | Demand-led |
| `hispanic-heritage` | Hispanic Heritage | Event | September–October | Demand-led |
| `dia-de-muertos` | Día de Muertos | Event | Late October–early November | Demand-led |
| `local-festival` | Local Festival | Event | Verified organizer dates | Demand-led |

For every released pack, require a standard record: theme/version IDs; owner name and description; brand adaptations; menu and game compatibility; preview; default dates; token values; asset slots/checksums; motion/static variants; media budgets; contrast results; approval and release status; rollback target. Add a new pack through data and assets, not a new menu fork. Cultural celebrations require suitable restaurant context and approved artwork.

## 8. Integrated release acceptance matrix

| Test | Setup/action | Required result |
|---|---|---|
| T01 — first setup | New verified Basic term, four ready defaults | Owner previews then confirms; four selections reserve once; public state follows dates. |
| T02 — request mode | Existing request-only tenant | Owner submits a request; current menu stays unchanged; no slot reserves until authorized approval. |
| T03 — plan full | Four distinct selections, then fifth | Recoverable plan-limit response; no partial schedule or charge; replacement/extra-request path works. |
| T04 — same-theme reuse | Fall, Halloween, Fall again | Two distinct selections, not three. New Fall asset version does not add a slot. |
| T05 — reservation release | Cancel all never-started Fall occurrences | One reserved slot releases. Cancelling after a start retains usage. |
| T06 — last-slot race | Two different themes approve concurrently with one slot left | Exactly one succeeds; loser sees current allowance and its unchanged draft. |
| T07 — retry/unknown outcome | Drop response after commit and retry operation | Same outcome returns; no duplicate reservation, audit event or schedule. |
| T08 — tenant isolation | Tenant A token with Tenant B paths, IDs and API bodies | All private reads/writes denied. Public snapshot contains only public approved data. |
| T09 — private preview | Preview unscheduled/unpublished draft; open guest menu separately | Owner sees the preview; guest sees actual current state; no metrics/reward side effects. |
| T10 — overlap | Two concurrent same-priority events overlap | One schedule fails or requires explicit edit; no arbitrary winner. |
| T11 — intentional override | Fall Sep 1–Nov 30, Halloween Oct 15–31 | Halloween wins only in its window, Fall resumes Nov 1, base follows if no next theme. |
| T12 — clock and DST | New York DST transitions, leap day, year rollover, wrong client clock | Server/local-date intent controls, inclusive end date converts correctly, no fixed-24-hour bug. |
| T13 — annual boundary | Winter crosses term end without next-term coverage | Clear review block or split draft; no silent allowance/payment/renewal action. |
| T14 — worker absent | Disable scheduled worker and provide no traffic until after start | Resolver remains correct; usage cannot be reclaimed as never-started. |
| T15 — freshness | Existing open tab and cached page span boundary | Visible state changes within 60 seconds maximum and never serves an expired promotion past validity. |
| T16 — pause/return | Pause during event, resume after event has ended | Base appears while paused; resume resolves current season/base rather than expired event. |
| T17 — bad version/asset | Disable version, break image, send unknown schema to old adapter | Menu remains usable with valid lower-priority candidate/base; diagnostics identify cause. |
| T18 — menu invariants | Compare approved item/price/category/link data before and after | No unintended changes, including null/unknown prices, allergens and QR destinations. |
| T19 — game invariants | Repeat input sequence; cross a theme boundary midround | Same rules/results/rewards; current round continues; next round may adopt new visuals. |
| T20 — accessible owner flow | Keyboard, screen reader, reduced motion, 200% zoom, target widths | Labels, focus and errors work; no covered controls or horizontal overflow. |
| T21 — owner comprehension | Five representative operators schedule and pause a theme | At least four independently schedule within three minutes; pause uses ≤2 interactions. |
| T22 — network recovery | Disconnect during preview/save; slow theme service | Inputs persist; outcome is reconciled; guest menu falls back within resolution budget. |
| T23 — phased integration | New control service with old/updated adapters in both apps | Compatible contract works; incompatible version uses base; rollout cannot blank either menu. |
| T24 — rollback | Exercise tenant pause, bad-version disable and prior deployment | Base/menu/QR remain available; no data deletion or unintended entitlement reset. |

**Definition of done:** Required acceptance cases pass on the candidate revision; no unresolved tenant leak, unauthorized publish, allowance race, expired promotion, inaccessible critical action or broken base-menu fallback; four launch packs have truthful compatibility; measured performance meets the agreed budget or a documented exception; documentation identifies exact rollout and rollback actions. A test blocked by unavailable owners, permissions or staging resources stays blocked, not passed.

## 9. Product decisions to resolve before general release

The engineering defaults are sufficiently specific to build a reviewable implementation. Keep these configurable and obtain final business decisions before turning them into customer commitments:

| Decision | Proposed default | Gate |
|---|---|---|
| Annual term source | Verified account entitlement or explicit operator record | No self-service scheduling without known coverage |
| Cancellation/allowance wording | Unstarted selections can release; started selections remain used | Final terms and owner review copy |
| Selection renewal | New term starts with a reviewable draft recommendation | No silent next-term reservation |
| Extra-theme price | Request a quote using current approved commercial terms | No invented pricing or automatic charge |
| Self-service access | Off until tenant capability is explicitly enabled | Preserve Colattao request mode and current auth |
| Revision limits and lead times | Do not enforce an invented limit or promise a turnaround | Operator SOP and commercial review |
| Promotion content | Owner supplies and approves exact text/validity | No invented discounts, products or availability |
| Pilot tenant/date | Choose from compatible, authorized clients after QA | Named pilot and explicit release authorization |

## 10. Source register and technical references

Repository files were read from the default branches on September 29, 2026. The hashes below identify **file blobs**, not deployment or repository commit SHAs. The work orders require engineers to refresh current state before editing.

- [Main repository AGENTS.md](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/blob/main/AGENTS.md), blob `28c6e9f52f94da732201a1cbb99764e3d6841b62`.
- [Main application package.json](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/blob/main/APP/web/package.json), blob `072ce26a6c752269696ebc68b18bcf25020a6f9e`.
- [Colattao package.json](https://github.com/anthonycolmenaresanandres-lang/colattao-cafe-rush/blob/main/package.json), blob `b75bbfab41b381d5143fbaea935619649212449a`.
- [Colattao AGENTS.md](https://github.com/anthonycolmenaresanandres-lang/colattao-cafe-rush/blob/main/AGENTS.md), blob `8bd0e39085d5260e7f8faffcad2fdc45e10aef33`.
- [Current Codex queue](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/blob/main/OPERATIONS/CODEX_QUEUE.md), relevant entries 73–74, blob `8038a656bdc0623f6970f6a3e278ac12ab5ed666`.
- [Handoff log](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/blob/main/OPERATIONS/HANDOFF_LOG.md), newest relevant September 29 owner-portal entry, blob `55e54694f51f9973760b4d027bf1421ad44a3571`.
- [Data center instructions](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/blob/main/OPERATIONS/DATA_CENTER.md), blob `7331abe51176e7693bd2fc257931eb953f324214`.
- [Skill routing](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/blob/main/OPERATIONS/SKILL_ROUTING.md), blob `471a08055bd104a2e6a973aa018282364daaa10e`.
- **Business source:** `Fina_Calle_Seasonal_Packages.pptx`, September 29 proposal. Its contents were read in full for this work-order packet.
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security): current guidance for combining minimal grants and row policies. Apply the existing tenant membership model, not a generic policy copied blindly.
- [Next.js revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) and [caching guide](https://nextjs.org/docs/app/guides/caching): consult installed-version guidance and the app's actual cache mode before implementation. Live docs may be newer than installed packages.
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/): reference for the accessibility acceptance work. The 44-pixel touch size and three-minute task time are product targets, not claims that WCAG requires those exact values.
- [Reduced-motion media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/prefers-reduced-motion): browser preference mechanism for optional decorative effects.

The Supabase markdown changelog could not be read by the retrieval service because of its content type. Engineers must check the current changelog and installed-version documentation before database implementation. No dependency upgrade is authorized by this packet.

## 11. Assignment and handoff template

For each assigned order record: ID, responsible engineer, reviewer, dependency evidence, approved branch/base commit, exact scope, current state, changed files, commands/check results, visual or database evidence, rollback, unresolved decisions and next owner. Use `Ready for planning`, `Ready to build`, `In progress`, `Blocked`, `In review`, `Verified locally`, `Released` as distinct states. A document, merged PR or successful build is not by itself evidence that a tenant has the feature live.

The accompanying CSV contains one full description per work order for controlled import into the team's chosen tracker. It does not create tickets or notify engineers automatically.
