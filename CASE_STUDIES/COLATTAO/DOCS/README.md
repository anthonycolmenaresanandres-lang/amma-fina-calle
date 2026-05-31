# Colattao Cafe Rush

Mobile-first promo game for Colattao Coffee House.  
Players catch Colattao items, avoid chain coffee, win a pass, claim a base discount, and optionally share for a bonus surprise path.

## Purpose
- Provide a fast in-store demo game that leads to a barista-verifiable reward flow.
- Keep the full experience client-side (no backend, no social API integration required).

## Local Run
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Build
```bash
npm run build
```

## Scripts
- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint project

## Demo Flow
1. Start game from the Phaser start screen.
2. Catch Colattao collectibles to reach score `100` within `20` seconds.
3. Avoid chain coffee bad item (instant loss if tapped).
4. On win, `GAME_WON` triggers `VisualFlashPass`.
5. Claim base 5% discount.
6. Cooldown blocks repeat claims for 12 hours.
7. Optional: tap `Share My Win` for bonus reward path (share or clipboard fallback).
8. Tap `Play Again` to restart Phaser round.

## Deployment (Vercel)
1. Push project to a Git repository (GitHub/GitLab/Bitbucket).
2. In Vercel, create a new project and import the repo.
3. Framework preset: `Next.js` (auto-detected).
4. Build command: `npm run build`.
5. Output: use Vercel default Next.js output.
6. Deploy and copy the production URL.

## Deployment (Other Next.js Hosts)
Any host that supports standard Next.js App Router deployments can run this app using:
- Install: `npm install`
- Build: `npm run build`
- Start: `npm run start`

## QR Demo Test Steps
1. Generate a QR code pointing to the deployed URL.
2. Scan QR from a phone on mobile data and Wi-Fi.
3. Run through the full game and reward path.
4. Confirm text readability and touch targets on phone.
5. Use `DEMO_TEST_CHECKLIST.md` to validate barista-facing demo readiness.
