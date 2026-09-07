# Online Ad Campaign — local restaurants

The paid/organic counterpart to `AMMA_CLIENT_ACQUISITION_LOOP.md`. That loop is
outreach: Anthony messages prospects one at a time. This one runs the other
direction — restaurant owners in Virginia Beach see an ad, land on a page, and
ask for a free mock of their own menu without anyone messaging them first.

**Status: built, not running.** Every asset below exists and is verified. The
campaign does not start until Anthony connects the ad accounts and sets a
budget, because launching means spending money and speaking publicly as the
business. Those two things stay owner-gated, permanently.

---

## 1. What is automatic vs. what only Anthony can do

| Step | Who | Runs how |
| --- | --- | --- |
| Write the ad copy | Claude | `tools/ad-factory/campaign.mjs` |
| Render the ad images | automatic | `node tools/ad-factory/render.mjs` |
| Keep the landing page live | automatic | ships with the site (`/for-restaurants`) |
| Catch the leads | automatic | existing `/api/customer-requests` intake |
| Weekly refresh + report | caretaker | §6 |
| **Connect Meta / Google accounts** | **Anthony** | one-time, in each platform |
| **Set the budget, press publish** | **Anthony** | money + public speech |
| **Reply to a lead** | **Anthony** | it is his business |

Nothing in this repo can spend money or post publicly on its own, and nothing
should be changed to let it.

## 2. Who the ad talks to

Restaurant and café owners and managers within about 15 miles of Virginia
Beach — independents, not chains. On Meta this is a location radius plus the
"restaurant owners / small business owners" interest set; on Google it is intent
search (`qr menu for restaurant`, `digital menu virginia beach`), which is lower
volume but much warmer.

Not targeted: anyone under 21, national brands, franchise HQs.

## 3. The offer, stated exactly as it is

**$199 a month, month-to-month, no setup fee, cancel any month.** The hook is a
**free mock of the prospect's own real menu** before any money or call — the
tailored-demo idea from the acquisition loop, turned into the ad's call to
action.

### Honesty boundary (non-negotiable)

Ads may only claim what `SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md` marks live:
a hosted digital menu for a real client, playable game demos, and the build
request intake.

Never in an ad, on the landing page, or in any variant:

- online ordering, payments, checkout, POS integration, delivery
- loyalty programs, customer databases, marketing automation
- any revenue claim — "increase sales 30%", "more covers", "guaranteed"
- fake urgency, fake scarcity, countdowns, invented testimonials
- a client's name, logo, photo or menu without that client's written permission

The landing page states plainly what the product does **not** do. That is
deliberate: a restaurant owner who has been burned by a "digital menu" upsell
recognises the boundary and trusts the rest of the page more.

## 4. The creative

`tools/ad-factory/` renders every variant at every placement size:

```bash
cd tools/ad-factory && npm install
node render.mjs                              # 12 images + a copy sheet
node render.mjs --variant b-flat-price       # just one angle
```

Output lands in `output/ads/`. It is deterministic HTML painted by the installed
Chromium — no AI-generated art, no stock licensing, no client photography, and
no network call. Re-running gives the same files.

Three variants, deliberately different **angles** rather than reworded twins, so
a test result means something:

| Variant | Angle |
| --- | --- |
| `a-one-scan` | The pain — printed menus go stale the moment a price changes |
| `b-flat-price` | The price — flat $199, no setup fee, cancel anytime |
| `c-table-game` | The differentiator — the menu guests actually play with |

Four sizes each: square (1080×1080), portrait (1080×1350), story (1080×1920),
landscape (1200×628).

The signature element is the QR block: every ad carries a real, scannable code
to the landing page, so the ad performs the product's own gesture. Someone can
scan the ad off a screen and be looking at a working menu seconds later.

## 5. Landing page

`/for-restaurants` — headline, price, two live proof links (a real client menu,
a playable game), what you get, what it is not, then one form.

The form posts to the existing public intake endpoint, so a lead arrives in the
same pipeline as every other request. No new backend, no database, no customer
data stored in the web app.

## 6. Weekly loop (the caretaker's job)

Once a week, unattended:

1. Re-render the creative from `campaign.mjs` (catches any copy edit).
2. Count new `for-restaurants` leads in the intake pipeline.
3. Append one line to `output/ads/CAMPAIGN_LOG.md`: date, spend to date (pasted
   by Anthony), leads, cost per lead.
4. Put the number in the Monday digest.

The caretaker never touches spend, targeting or publishing — it only regenerates
assets and counts what already happened.

## 7. Budget and the kill rule

Start at **$10/day for 14 days (~$140)** split across the three variants. This is
a learning budget, not a growth budget; the question it answers is "does any
angle produce a lead at a sane cost", not "how many clients can we buy".

- **Primary metric:** cost per qualified lead (a real local restaurant asking for
  a mock).
- **Guardrail metric:** landing page → form submit rate. If clicks are cheap but
  nobody submits, the page is wrong, not the ad.
- **Kill rule:** if 14 days and ~$140 produce zero qualified leads, stop, do not
  raise the budget, and go back to outreach. Ads are the experiment; the
  outreach loop is the business.
- **Scale rule:** if cost per qualified lead is under roughly one month of the
  subscription ($199), the campaign pays for itself in month one — raise the
  budget one step and rerun the same test.

Report sample size and exposure count with any result. Three leads is an
anecdote, not a winning variant.

## 8. Launch checklist (Anthony only)

1. **Meta:** Business Suite → Ads → new campaign, objective *Leads* (or *Traffic*
   to the landing page). Upload `output/ads/*-square.png`, `*-portrait.png`,
   `*-story.png`. Paste copy from `output/ads/AD_COPY_SHEET.txt`.
2. **Google (optional, later):** Search campaign on the intent keywords in §2,
   using the landing-size image for Display.
3. Set location radius, the $10/day budget, and an end date 14 days out.
4. Press publish.
5. Paste the spend figure into the weekly log line when the caretaker asks.

Steps 1–4 are the only things that cannot be automated, and should not be.
