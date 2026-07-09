# Fina Calle OS — Seasonal Change-Cycle & Purchasing Playbook (Internal)

> Internal operating guide for AMMA / Fina Calle. How we keep every café client's
> **menu, prices, promos, visuals, and hours seasonally current — proactively** —
> so the owner never has to remember to update anything. This is the managed-service
> layer that sits on top of the AI Request Desk.
>
> **The promise we're operationalizing:** *"You never have to think about updating
> your menu. We stay on top of it for you — you just approve."*

---

## 1. Two engines (how change happens)

| Engine | Who starts it | Example | Tech path |
|---|---|---|---|
| **Reactive** | The owner | "86 the Flan Latte", "change Mocha to $8" | AI Request Desk → `applyOwnerChange` |
| **Proactive (this doc)** | **Fina Calle** | "Summer's coming — switch to the iced lineup + a cold-brew 2x1?" | Seasonal calendar → draft → owner one-tap approve → `applyOwnerChange` / `change_requests` |

The owner can always *ask* anytime. The differentiator is the **proactive** engine: we
get ahead of the calendar and hand them a ready-to-approve change.

---

## 2. The owner experience (keep it to one tap)

We never make the owner author seasonal changes. We send a **nudge with a pre-built
proposal**:

> ☀️ *Summer starts in 3 weeks. Want me to switch your hot specials to iced, add a
> Cold Brew 2x1 (weekdays), and update your cover photo?*
> **[ Approve all ]   [ Edit ]   [ Not now ]**

Approve → it publishes (now or scheduled). Edit → opens the Request Desk pre-filled.
Decline → we log it and move on. **That's the whole job for the owner.**

---

## 3. The year-round change calendar

Tailored for a Latino-rooted U.S. coffee house (bilingual ES/EN). "Lead" = how far
ahead we prep the proposal. Pick the moments that fit each client's brand — don't run
all of them.

| Window | Moment | Lead | What we change | Purchasing note |
|---|---|---|---|---|
| **Jan** | New Year / "reset" + Three Kings (Reyes, Jan 6) | 2 wk | Lighter/"healthy" drinks, matcha push; Roscón de Reyes pastry | Post-holiday low traffic — lean specials |
| **Feb** | Valentine's (14) | 3 wk | Chocolate/rose lattes, "for two" promo, warm visuals | Pre-buy chocolate/syrups |
| **Feb–Mar** | Lent / Cuaresma | 2 wk | Non-dairy + lighter options featured | Oat/almond milk stock up |
| **Mar–Apr** | Spring shift + Easter/Semana Santa | 3 wk | Begin hot→iced mix, floral/fruit flavors | Citrus/berry coming into season |
| **May** | Mother's Day + Cinco de Mayo | 3 wk | Gift/duo promos; horchata latte, Mexican-mocha | Spanish-language push |
| **Late May** | **Summer kickoff** (the big one) | 4 wk | **Hot → iced lineup**, cold brew, fruit refreshers, hours extend | Switch to cold-supply; iced cups/lids |
| **Jun** | Father's Day + school's out | 2 wk | "Treat dad" duo; kid/teen-friendly add-ons | Volume up — staff/hours |
| **Jun–Jul** | **World Cup / soccer windows** | 4 wk | Match-day promos + Penalty Shootout game tie-in (cross-sell) | Coordinate with game module |
| **Aug** | **Back-to-school** | 3 wk | Study combos, loyalty re-launch, morning rush hours | Beans/volume up |
| **Sep–Oct** | **Fall + Pumpkin/Spiced** | 4 wk | Iced→hot mix back, pumpkin/cinnamon/panela specials | Pre-buy fall syrups early (they sell out) |
| **Oct–Nov** | Halloween + **Día de los Muertos** | 3 wk | Themed drinks/visuals, pan de muerto | Strong bilingual moment |
| **Nov** | Thanksgiving + **Black Friday/Cyber** | 2 wk | Gift cards, holiday-blend launch, bundle promo | Holiday bean blend in stock |
| **Dec** | **Navidad** (peppermint/spiced) + gift season | 4 wk | Full holiday menu, gifting, festive cover, extended hours | Highest spend — pre-buy deep |
| **Weekly/Monthly** | Standing specials | — | e.g., 2x1 Tuesdays, weekend feature, "drink of the month" | Rotate to use surplus stock |

---

## 4. The four seasons (the backbone under the moments)

Everything above hangs on four predictable shifts:

- **Winter** — hot-forward, spiced/peppermint/panela, cozy visuals, holiday gifting, longer dwell.
- **Spring** — transition hot↔iced, floral/citrus/berry, lighter, Lent-friendly non-dairy.
- **Summer** — **iced-forward**, cold brew, refreshers, extended hours, grab-and-go.
- **Fall** — back to warm, pumpkin/cinnamon, back-to-school routines, loyalty re-engagement.

**Rule of thumb:** the hot↔iced flip (late May / early Sept) is the single highest-impact
change of the year. Never miss it.

---

## 5. Purchasing-cycle alignment (don't promote what you can't buy)

A promo is only good if the café can actually source it profitably. Before we push a
seasonal special, check the **purchasing reality**:

1. **Is the ingredient in season / in stock / affordable right now?** (berries in summer,
   pumpkin in fall, peppermint in winter.) Promote *with* supply, not against it.
2. **Pre-buy lead time** — fall syrups and holiday blends sell out at suppliers; the
   calendar's "Lead" column is set so we propose in time to order.
3. **Use surplus** — weekly specials are a tool to move what the café over-bought.
4. **Margin check** — seasonal/imported ingredients cost more; price the special so it
   still makes money. (This is where the AI Request Desk price changes plug in.)

> The "purchasing cycle" and the "menu cycle" are the same cycle. We schedule menu/promo
> changes to ride the café's buying rhythm, not fight it.

---

## 6. The operating cadence (how Fina Calle runs each moment)

| When | Action | Owner involvement |
|---|---|---|
| **T-4 weeks** | Pick the moment; draft per-client proposal (items, prices, promo, visual, hours) | none |
| **T-2 weeks** | Send the one-tap proposal (Request Desk nudge / email) | **Approve / Edit / Decline** |
| **T-3 days** | Schedule the publish; prep visuals; confirm stock | none |
| **T-0** | Go live (menu + promo + cover) | none |
| **End of window** | Auto-revert / rotate out the special | none |
| **Weekly** | 15-min standing review: what's live, what's next, what to revert | none |

---

## 7. How this becomes product (the "Seasonal Autopilot")

This playbook is the manual version of a feature. Build it in stages:

1. **Now — manual (this doc).** We run the calendar by hand on Colattao; prove the cadence and the one-tap approval flow.
2. **Semi-auto — suggestions.** A `seasonal_calendar` table feeds the **AI Request Desk** "Coming up" suggestions: pre-drafted `change_requests` the owner approves. Reuses the existing rail — no new write path.
3. **Auto — scheduled.** Approved changes get a **publish date + auto-revert date** (scheduled `applyOwnerChange`). The owner approves a season once; we handle the timing.

Nothing here needs a new permission model — it's the same audited rail, just **time-aware and Fina-Calle-initiated.**

---

## 8. What this means for the owner dashboard (the UX pivot)

The dashboard is **not** a full menu editor. It's a calm, quick-action surface:

- **Ask bar (hero)** — the Request Desk: *"86 this · change a price · add an item."* Free text.
- **A few quick slots (~5)** — the highest-churn items surfaced for one-tap *86 / un-86 / price*. Not the whole menu.
- **"Coming up"** — the next seasonal proposal with **Approve / Edit / Not now**. This is the proactive engine made visible.
- **Attach for big changes** — new full menu, new design, a photo → upload → goes to review (`change_requests`), not inline editing.
- **Campaigns** — promos/seasonal campaigns live here as their own approve-able cards.
- **Full menu** — available but tucked away ("See full menu"), not the default surface.

> Differentiating every item inline only matters if we render the whole menu — and we
> shouldn't. Quick actions + attachments + proactive proposals is the right surface.

---

## 9. Start here — the Colattao pilot

1. Run the **next one moment manually** end-to-end on Colattao (whatever's nearest on the calendar) to prove the cadence + one-tap approval.
2. Capture: how long prep took, did the owner approve in one tap, did it publish/revert cleanly.
3. If it works, template it and add the second client. *Stabilize → simplify → prove → scale.*
