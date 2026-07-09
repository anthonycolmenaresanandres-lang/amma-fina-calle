# Colattao Colattanini Collectible Campaign

## Status

Planning/docs/assets-spec only. Do not implement app code until a separate implementation prompt is approved.

## Source Evidence

- Verified menu source reviewed: `C:\Users\antho\OneDrive\Desktop\Colattao Rush\src\data\colattaoMenu.ts`.
- Sales/demo evidence reviewed: `SALES_DEMO_PACKAGE/DEMO_URLS_AND_TALK_TRACK.md`, `SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md`.
- Game evidence reviewed: `GAME_LIBRARY/PENALTY_SHOOTOUT.md`, `GAME_LIBRARY/PENALTY_SHOOTOUT_V2_PLAN.md`, `PRODUCT_MODULES/GAME_CUSTOMIZATION_PROTOCOL.md`.
- QR/asset guardrails reviewed: `ASSET_REGISTRY/COLATTAO/QR_DESTINATIONS.md`, `ASSET_REGISTRY/ASSET_QA_CHECKLIST.md`.

Menu note: the menu source says prices and items are best-effort drafts and items marked `needsConfirmation: true` should be verified with staff. This launch roster avoids `needsConfirmation: true` items. Do not print prices on campaign assets unless the owner approves the current menu version.

## Campaign Concept

**Colattaninis** are three tiny Colattao-themed penalty players tied to real menu heroes. Customers scan the Penalty Shootout QR, play a quick five-shot round, and earn a physical sticker based on the keeper level they beat.

The launch goal is simple: make the game visible at the counter, give customers a reason to play while waiting, and turn three real menu items into collectible characters without adding backend, loyalty accounts, customer data capture, POS integration, or custom game logic in the first pass.

## Recommended Menu Heroes

1. **Churro Latte**  
   Best first hero because it is a named Favorite, has strong visual flavor cues, and sounds immediately collectible.

2. **Coco Beach**  
   Best seasonal hero because it has a clear tropical description: toasted coconut, tropical nuts, cold foam.

3. **California Sandwich**  
   Best savory hero because it gives the campaign a kitchen item, has a clear ingredient story, and keeps the roster from being only drinks.

## Final 3-Character Roster

| Unlock | Character | Tied menu item | Personality | Visual direction | Sticker direction | Game role |
|---|---|---|---|---|---|---|
| Street Keeper | **Churro Chispa** | Churro Latte | Fast, funny, cinnamon-spark confidence. | Mini striker with latte-cup body language, cinnamon scarf, warm caramel/gold accents. | Round or die-cut sticker with a tiny latte striker mid-kick and a cinnamon swirl trail. | Beginner reward character; introduces the collection. |
| Club Keeper | **Coco Beach Blitzer** | Coco Beach | Sunny, relaxed, flashy finisher. | Tropical mini player with coconut foam crest, beach-gold highlights, blue/cream Colattao accents. | Die-cut sticker with a foam-topped drink player doing a side volley; no printed price. | Mid-tier reward; makes the seasonal drink feel special. |
| Pro Keeper | **Cali Croissant Captain** | California Sandwich | Clever, composed, clutch team captain. | Croissant-shaped captain with avocado-green sash and Monterey Jack/queso fresco color cues. | Die-cut sticker with a croissant captain shielding the ball like a defender. | Hardest reward; completes the set. |

## Customer Flow

1. Customer sees the counter sign or laminated collector sheet.
2. Customer scans the Penalty Shootout QR.
3. Customer chooses a keeper level: Street, Club, or Pro.
4. Customer takes five shots.
5. If the customer wins or meets the staff-approved threshold, they show the result screen to staff.
6. Staff gives the sticker mapped to that keeper level while supplies last.
7. Customer sees all three Colattaninis on the collector sheet and is invited to come back for the missing characters.
8. When the customer has all three stickers, staff applies the owner-approved full-collection reward.

## In-Store Flow

- Place the laminated collector sheet near the register where customers order.
- Place a small sticker stack behind the counter, separated by character.
- Keep the QR on the counter sheet large enough for a phone scan.
- Staff points customers to the game while drinks or food are being prepared.
- Staff verifies the win from the phone screen only; do not collect names, phone numbers, emails, screenshots, or customer data for the MVP.
- If the game route or QR destination changes, replace the QR asset only after scan-testing.

## Reward Loop

The campaign loop is:

**Play -> Win -> Sticker -> Try/notice the tied menu hero -> Return for the next Colattanini -> Complete all three -> Owner-approved reward.**

Fastest reward recommendation:

- Individual win: one free sticker.
- Full collection: owner-approved small reward, such as a small treat, bonus sticker, or menu-item perk. Do not print a specific discount, free item, or dollar value until Anthony/Colattao approves it.

## Staff Workflow

1. Invite: "Want to play for a Colattanini sticker while you wait?"
2. Point to QR and explain the three keeper levels.
3. Watch for or ask to see the final result screen.
4. Hand out the sticker tied to the level the customer beat.
5. If the customer already has that sticker, let them try a different keeper level for a different character.
6. If a customer shows all three stickers, use the owner-approved full-collection reward rule.
7. Restock stickers at the start of each shift and note when a character is running low.

## Sticker Rules

- One sticker per verified qualifying game result.
- A customer may earn more than one character, but each character requires the matching keeper-level win.
- If staff is busy, staff may use the honor rule for kids/families at the owner's discretion, but the default rule is result-screen verification.
- No purchase requirement in the fastest MVP unless the owner explicitly approves one.
- Do not promise a discount, free item, or full-collection prize until the owner-approved reward is printed.
- Do not use customer personal data to track collection.
- If a sticker is out of stock, staff may offer a different available Colattanini or invite the customer back.

## Simplest Game Unlock Logic

Recommended launch mapping:

- **Street Keeper win -> Churro Chispa / Churro Latte sticker**
- **Club Keeper win -> Coco Beach Blitzer / Coco Beach sticker**
- **Pro Keeper win -> Cali Croissant Captain / California Sandwich sticker**

Why this is best for launch:

- It uses the existing three keeper levels.
- It requires no backend.
- It is easy for staff to understand.
- It creates a natural difficulty ladder.
- It gives the Pro Keeper a premium "complete the set" role.

Even faster no-code MVP:

- Do not change the game yet.
- Print the mapping on the laminated collector sheet.
- Staff manually verifies the keeper level and result screen.
- Save digital unlock UI, badge art, and character selection for a second implementation prompt.

## What Not To Do In MVP

- Do not add customer accounts, phone/email capture, POS integration, payments, loyalty database, or automated reward tracking.
- Do not change scoring, keeper logic, swipe/input logic, or the Penalty Shootout engine.
- Do not invent menu items.
- Do not print menu prices on stickers.
- Do not generate QR codes inside AI image tools.
- Do not promise the full-collection reward until Anthony/Colattao approves the exact prize.

## Fastest MVP Recommendation

Launch as a **manual counter campaign**:

1. Three stickers.
2. One laminated collector sheet/sign.
3. Existing Penalty Shootout QR.
4. Staff verifies result screen.
5. Stickers handed out from behind the counter.
6. Full-collection reward remains "ask staff" until approved.

This can launch before any app-code changes. The next implementation pass can add a small result-screen copy layer or character-unlock display if Anthony approves.
