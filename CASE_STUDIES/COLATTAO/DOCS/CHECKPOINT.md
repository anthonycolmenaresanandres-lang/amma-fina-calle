# CHECKPOINT

## Project Path
`C:\Users\antho\OneDrive\Desktop\Colattao Rush`

## Current Working Loop
1. User opens app and sees Phaser start screen.
2. User taps `Start` to begin 20-second coffee-catching round.
3. User catches Colattao collectible items for +10 each.
4. User avoids chain coffee bad items (tapping bad item ends round immediately with loss message).
5. At score >= 100, scene shows `You earned your Colattao pass!` and emits `GAME_WON`.
6. React shows `VisualFlashPass`.
7. User claims base 5% discount.
8. 12-hour cooldown blocks repeat base claims.
9. User can tap `Share My Win` for bonus reward path (barista-verifiable social step).
10. User taps `Play Again` to emit `RESTART_GAME` and restart Phaser.

## Asset Status
- Custom Colattao gameplay background integrated.
- Transparent Colattao logo integrated (start screen + in-game corner branding).
- Icon-sized collectible assets integrated (coffee cup, croissant, matcha iced).
- Seafarer crossed-out bad item integrated.

## Files Implemented
- `src/components/GameCanvas.tsx`
- `src/components/VisualFlashPass.tsx`
- `src/config/rewardConfig.ts`
- `src/utils/rewardCooldown.ts`
- `src/game/events/EventBus.ts`
- `src/game/scenes/BootScene.ts`
- `src/game/scenes/DemoScene.ts`
- `src/app/page.tsx`
- `src/types/game.ts`
- `src/app/globals.css`

## React/Phaser Bridge Rules
- React and Phaser are isolated.
- Phaser mounts in `GameCanvas` via `useRef` and `useEffect`.
- Phaser and scenes are dynamically imported inside `useEffect` to avoid server `window` evaluation.
- Phaser instance mounts once and is destroyed only on unmount.
- React does not drive Phaser update loop.
- Cross-boundary communication is through EventBus only.

## EventBus Events
- `GAME_WON`: payload `{ score, rewardPercent: 5, wonAt: Date.now() }`
- `RESTART_GAME`: no payload (`undefined`), used by React `Play Again` to restart Phaser scene

## VisualFlashPass Behavior
- Appears after `GAME_WON`.
- Shows branded reward panel, moving gradient, live clock/date, score, wonAt, and verification text.
- `Claim Discount` attempts cooldown claim.
- `Share My Win` enables bonus reward path messaging.
- `Play Again` closes pass in React and emits `RESTART_GAME`.

## Social Bonus Behavior
- Uses Web Share API when available.
- Falls back to clipboard copy when Web Share is unavailable.
- No Instagram API integration.
- No backend, login, or database dependency.
- Barista verifies bonus path manually by viewing the shared post/repost screen.

## Cooldown Behavior
- Local storage key: `discount_claimed_timestamp`.
- Cooldown duration: 12 hours.
- Claim during cooldown is blocked with remaining time message.
- Cooldown logic stays independent from Phaser gameplay.

## Build Verification Result
- `npm run build`: PASS (Next.js + TypeScript clean, including latest autonomous marketing/share flow).
- `window is not defined` build-time issue is resolved by dynamic Phaser/scene imports in `GameCanvas`.

## Manual Verification Result
- Date: 2026-05-23
- Manual browser verification: PASS
- Verified at `http://localhost:3000`:
  - [x] game loads without error
  - [x] Phaser start screen appears
  - [x] falling item game works
  - [x] reaching 100 score emits `GAME_WON` and opens VisualFlashPass
  - [x] Claim Discount stores cooldown
  - [x] cooldown blocks second reward
  - [x] Play Again restarts Phaser from normal pass
  - [x] Play Again restarts Phaser from cooldown-blocked pass
  - [x] page refresh does not crash

## Next Phase
- Demo QR deployment test.
