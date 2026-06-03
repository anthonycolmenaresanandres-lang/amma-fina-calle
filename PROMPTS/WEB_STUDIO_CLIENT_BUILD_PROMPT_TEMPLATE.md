# Web Studio Client Build — Codex Prompt Template
_Fina Calle Web Studio — AMMA Ventures LLC_
_Version: 1.1 | 2026-06-03_

Copy this template and fill in every `[PLACEHOLDER]` before pasting into Codex. Remove any sections that are not applicable to the engagement.

---

```txt
Codex effort: MEDIUM
Scope: Build the [CLIENT_NAME] client website from approved design assets. Do not modify app UI routes payment logic prices deployment settings or any protected files outside this client's folder.
Token-saving rule: Read only the files listed below. Do not explore unrelated routes or modules.

Project path:
C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle

Why:
The [CLIENT_NAME] website has been designed, image sections are approved, and the build packet is complete. We are converting the approved design into production Next.js code.

---

## Strategy Intake — Must Be Complete Before This Prompt Is Submitted

> If any answer below is blank (not intentionally skipped), stop and complete the strategy intake before pasting this prompt into Codex.

| # | Question | Answer |
|---|----------|--------|
| S1 | What is the business about? | [ANSWER or "skipped"] |
| S2 | What is the main website goal? | [ANSWER or "skipped"] |
| S3 | How should customers take action? | [walk in / call / book / order / quote / contact] |
| S4 | What features exist right now? | [ANSWER or "skipped"] |
| S5 | What features are future-only — must NOT be claimed? | [ANSWER or "none"] |
| S6 | Why do customers choose this business? | [ANSWER or "skipped"] |
| S7 | Who are the ideal customers? | [ANSWER or "skipped"] |
| S8 | How do people currently discover the business? | [ANSWER or "skipped"] |
| S9 | Which website features support those channels? | [ANSWER or "skipped"] |

---

## Build Packet

### Desktop screenshots / sections
[List paths or describe sections, e.g.:]
- CASE_STUDIES/[CLIENT_SLUG]/ASSETS/desktop-01-hero.webp
- CASE_STUDIES/[CLIENT_SLUG]/ASSETS/desktop-02-brand.webp
- CASE_STUDIES/[CLIENT_SLUG]/ASSETS/desktop-03-services.webp
- CASE_STUDIES/[CLIENT_SLUG]/ASSETS/desktop-04-gallery.webp
- CASE_STUDIES/[CLIENT_SLUG]/ASSETS/desktop-05-process.webp
- CASE_STUDIES/[CLIENT_SLUG]/ASSETS/desktop-06-reviews.webp
- CASE_STUDIES/[CLIENT_SLUG]/ASSETS/desktop-07-footer.webp

### Mobile screenshots / sections
[List paths, e.g.:]
- CASE_STUDIES/[CLIENT_SLUG]/ASSETS/mobile-01-hero.webp
- CASE_STUDIES/[CLIENT_SLUG]/ASSETS/mobile-02-brand.webp
- [continue...]

### Brand brief
- Business name: [CLIENT_NAME]
- Primary color: [HEX]
- Secondary color: [HEX]
- Font (heading): [FONT_NAME] or "match design"
- Font (body): [FONT_NAME] or "match design"
- Brand tone: [e.g., warm / premium / bold / minimal]

### Overlay link map
[Paste the link map table or JSON here, e.g.:]
| Section | Element | Action | Destination |
|---------|---------|--------|-------------|
| Hero | CTA button | tel: | [PHONE] |
| Nav | Menu anchor | scroll | #services |
| Footer | Instagram icon | external | [INSTAGRAM_URL] |
| Footer | Address | external | [GOOGLE_MAPS_URL] |

### SEO / copy layer
- Page title: [PAGE_TITLE]
- Meta description: [META_DESCRIPTION]
- H1: [H1_TEXT]
- Primary keyword: [PRIMARY_KEYWORD]
- LocalBusiness schema: name=[CLIENT_NAME], phone=[PHONE], address=[ADDRESS]
- Business hours: [HOURS — MUST BE CLIENT-APPROVED]

### Domain and deploy instructions
- Domain: [DOMAIN]
- Deploy target: [Vercel / Netlify / other]
- Environment variables needed: [LIST or "none"]
- Custom domain DNS: [CNAME/A record instructions or "handled by client"]

---

## Task

1. **Verify strategy intake is complete.**
   - Check the Strategy Intake table above.
   - If any field is blank (not intentionally skipped), STOP and report: "Strategy intake incomplete — cannot begin build. Missing: [list]."
   - If S5 (future features) lists anything, confirm those items do NOT appear in any section copy, CTA, or public-facing UI.

2. Run:
   python handoff.py start
   python handoff.py show

5. Confirm git status is clean or expected.

6. Create the client site under:
   APP/web/src/app/[CLIENT_SLUG]/

   Following the section map:
   Section 1: Hero + CTA
   Section 2: Brand Story / Trust
   Section 3: Services / Menu Highlights
   Section 4: Gallery / Proof
   Section 5: Process / Experience
   Section 6: Reviews / Social Proof
   Section 7: Contact / Hours / Map / Footer

7. Implement each section as a full-width stacked component that visually matches the approved desktop image at 1440px width and the approved mobile image at 390px width.

8. Apply the overlay link map: every button, nav link, phone number, address, and social icon must be a working anchor or link. Do not wire any feature listed in S5 (future features) — omit those CTAs entirely or leave a code comment.

9. Insert the SEO/copy layer:
   - Set <title> and <meta description> via Next.js metadata export
   - Use exactly one <h1> per page
   - Add alt text to every image
   - Add LocalBusiness schema JSON-LD in the page <head>
   - Mark any unconfirmed prices, hours, or claims as: <!-- PENDING CLIENT APPROVAL -->
   - Mark any future features not yet live as: <!-- FUTURE: [description] — do not publish -->

10. Do not publish or hardcode any price, hour, offer, future feature, or factual claim that is not in the approved SEO/copy document above.

11. Run:
    npm run build

12. Confirm build passes with TypeScript clean and no warnings.

13. Do not commit or push.

14. Report:
    - strategy intake verified (yes / which items skipped)
    - future features identified and excluded (list from S5 or "none")
    - files created
    - sections implemented
    - links wired
    - any PENDING CLIENT APPROVAL placeholders left in the code
    - any FUTURE placeholders left in the code
    - build result
    - recommended next step

---

## Protected Files (DO NOT TOUCH)

- APP/web/src/app/conquest/ — Conquest game routes
- APP/web/src/conquest/ — Conquest engine
- APP/web/src/app/page.tsx — root landing page
- APP/web/src/app/request-update/ — intake form
- APP/web/src/app/api/ — all API routes
- APP/web/src/app/customers/ — customer registry
- All .env files and secrets
- HANDOFF.md, handoff.py

---

## Parked Work Reminder

- Stripe implementation is parked — do not add payment logic
- Customer portal is parked — do not add auth or billing
- Backend billing, webhooks, and database are parked

```

---

## How to Use This Template

1. Duplicate this file to `CASE_STUDIES/[CLIENT_SLUG]/BUILD_PROMPT.md`
2. Fill every `[PLACEHOLDER]` with real values
3. Attach or reference all image section files
4. Paste the completed prompt into a Codex session
5. After build: save the session summary back to `CASE_STUDIES/[CLIENT_SLUG]/BUILD_LOG.md`

---

## Checklist Before Pasting

- [ ] **Strategy intake complete** — all 9 questions (S1–S9) answered or intentionally skipped
- [ ] **Future features identified** — S5 filled; those features are NOT in any section copy or CTA
- [ ] All `[PLACEHOLDER]` values filled
- [ ] Desktop section images uploaded and paths confirmed
- [ ] Mobile section images uploaded and paths confirmed
- [ ] Overlay link map complete
- [ ] SEO/copy document complete
- [ ] Client has approved prices, hours, and hero copy in writing
- [ ] Domain and deploy target confirmed
