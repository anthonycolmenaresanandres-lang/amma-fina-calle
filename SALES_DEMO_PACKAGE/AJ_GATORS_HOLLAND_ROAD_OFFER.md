# A.J. Gator's Holland Road - QR Landing Offer

Status: prospect concept; pending client approval.

## Why this fits the current workflow

A.J. Gator's already maintains a live online menu. The opportunity is not to replace it: one QR can send guests to that menu, three playable games, and an owner-controlled promotion board without requiring an app download or a POS change. This is a working proposal to validate with the owner, not a claim about their priorities or results.

Verified proof: the unlisted Holland Road portal is live for review, its official-menu link works, and all three points-only games have passed phone and desktop interaction checks.

Evidence posture:

- Known: an official online menu exists; the review portal and three games work.
- Inferred: a single menu/game/promotion landing page may be useful; confirm this with the owner.
- Missing: owner approval, preferred promotion cadence, content approver, and final commercial terms.

## Base - $150 per month, per location

- One stable QR destination and branded mobile landing page.
- A prominent link to A.J. Gator's owner-maintained live menu.
- Three playable, points-only games: sports trivia, fictional picks, and reflex challenge.
- A promotions area with the initial owner-approved weekly board.
- Hosting, uptime checks, QR destination support, and one small monthly copy correction.

Not included: ordering, payments, POS integration, prizes, customer accounts, table service, social posting, photography, or ad spend.

## Managed weekly promotions - add $75 per month

- Up to one owner-approved promotion change per week, maximum four per month.
- Headline, offer details, dates, and one supplied image when available.
- Scheduled removal or replacement of expired offers.
- The printed QR stays unchanged.

The restaurant supplies the final offer, dates, restrictions, price, and approval. AMMA does not publish an unapproved promotion or promise traffic, sales, or redemption results.

## First-30-day review

Review QR availability, menu-link availability, game-function checks, approved promotion changes completed, and update turnaround. These operating checks do not imply a sales or customer-behavior result.

## Clear owner decision

- Core portal: $150 per month.
- Core portal plus managed weekly promotions: $225 per month.
- Table-specific service remains a separately scoped second wave with its own setup fee.

Owner next step: choose `core`, `core + weekly promotions`, `questions`, or `not now`. Nothing is activated and no promotion is published until the owner approves the written scope and content.

## One-variable field test

- `hook_id`: `aj_existing_menu_one_qr_v1`
- `proof_id`: `aj_live_hub_three_games_v1`
- `cta_id`: `aj_choose_package_v1`
- `offer_id`: `aj_150_weekly75_v1`
- Variable: show the managed weekly promotion option versus the $150 core package alone.
- Primary metric: owner selects a package or a dated next review.
- Guardrail metric: owner can accurately state what is and is not included.
- Stop rule: stop using the offer if the owner believes ordering, payments, POS, prizes, or unapproved promotions are included.
