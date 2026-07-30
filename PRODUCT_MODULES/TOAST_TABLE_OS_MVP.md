# Toast Table OS MVP

## Product promise

One permanent QR at each table opens a restaurant-branded page with three paths:

1. inspect the current menu;
2. continue into Toast for ordering and payment;
3. join a short shared table-football match.

Toast remains the order and payment system of record. Fina Calle never collects card data in this module.

## Reusable architecture

| Layer | Stable across restaurants | Per-restaurant configuration |
| --- | --- | --- |
| QR | `/table/[venueId]/[tableId]` contract | printed venue/table destination |
| Toast | HTTPS resolver and fallback behavior | public order URL plus optional table-specific Order & Pay URLs |
| Menu | typed section/item renderer | owner-confirmed items, prices, modifiers, and availability |
| Game | deterministic physics, input, room protocol | colors, country choices, labels, and approved art |
| Realtime | Supabase Broadcast/Presence with browser-local fallback | venue and table room key only |
| Setup | printable high-correction QR sheet | draft/confirmed table count |

Adding a restaurant should not change `table-os/game/`, `realtime.ts`, `toast.ts`, or the route contract. Add its menu dataset, venue configuration, approved skin, and Toast destinations.

## Production route and QR contract

- Permanent guest URL: `https://finacalleos.com/table/[venueId]/[tableId]`.
- Owner setup URL: `https://finacalleos.com/table-os/[venueId]`.
- The owner setup page creates high-correction PNG downloads and a printable sheet locally in the browser.
- Each physical table receives its own numbered QR. The QR destination does not change when menu art, Toast URLs, or the approved game skin changes.
- Restaurant customization is limited to menu data, venue configuration, approved brand art, approved game direction, and verified Toast destinations. The shared route, QR, realtime, and game engine remain stable.

## Maracaibo preview state

- Verified: Maracaibo has public Toast ordering at `https://www.toasttab.com/local/order/maracaibo-bistro`.
- Verified: 12 menu sections were transcribed from the restaurant's public website on 2026-07-23.
- Unknown: whether Toast Mobile Order & Pay is enabled for dine-in tables.
- Unknown: the correct current item/price set because the public website and Toast materially disagree.
- Unknown: final table count, table labels, approved brand assets, and approved country matchup.

The preview therefore routes ordering to the current public Toast page and states that pay-at-table is pending. It must not be presented as a live customer menu until the owner confirms the data.

## Routes

- Guest/owner-review example: `/table/maracaibo/1`
- QR setup and print sheet: `/table-os/maracaibo`

Both routes are unlinked and `noindex`. The QR is generated locally in the browser; no third-party QR service receives the destination.

## Mechanics contract

- 90-second, asset-free 2v2 table football.
- Four fixed rods: home goalkeeper, home forward, away forward, away goalkeeper.
- Touch, mouse, and keyboard input.
- One elected browser hosts deterministic simulation; state is broadcast at 10 Hz.
- No account, prize, PII, camera, external game asset, club mark, league mark, or event mark.
- If Supabase Realtime is unavailable, a browser-local practice/session fallback remains usable.

## Deferred beyond MVP

- Camera/AR tabletop mode.
- Toast menu API ingestion or menu webhooks.
- Loyalty, prizes, persistent leaderboards, analytics, server-call workflow, and POS write-back.
- Production activation, client branding, and final QR printing.
