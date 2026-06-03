# Web Studio Client Build — Codex Prompt Template
_Fina Calle Web Studio — AMMA Ventures LLC_
_Version: 1.0 | 2026-06-03_

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

1. Run:
   python handoff.py start
   python handoff.py show

2. Confirm git status is clean or expected.

3. Create the client site under:
   APP/web/src/app/[CLIENT_SLUG]/

   Following the section map:
   Section 1: Hero + CTA
   Section 2: Brand Story / Trust
   Section 3: Services / Menu Highlights
   Section 4: Gallery / Proof
   Section 5: Process / Experience
   Section 6: Reviews / Social Proof
   Section 7: Contact / Hours / Map / Footer

4. Implement each section as a full-width stacked component that visually matches the approved desktop image at 1440px width and the approved mobile image at 390px width.

5. Apply the overlay link map: every button, nav link, phone number, address, and social icon must be a working anchor or link.

6. Insert the SEO/copy layer:
   - Set <title> and <meta description> via Next.js metadata export
   - Use exactly one <h1> per page
   - Add alt text to every image
   - Add LocalBusiness schema JSON-LD in the page <head>
   - Mark any unconfirmed prices, hours, or claims as: <!-- PENDING CLIENT APPROVAL -->

7. Do not publish or hardcode any price, hour, offer, or factual claim that is not in the approved SEO/copy document above.

8. Run:
   npm run build

9. Confirm build passes with TypeScript clean and no warnings.

10. Do not commit or push.

11. Report:
    - files created
    - sections implemented
    - links wired
    - any PENDING CLIENT APPROVAL placeholders left in the code
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

- [ ] All `[PLACEHOLDER]` values filled
- [ ] Desktop section images uploaded and paths confirmed
- [ ] Mobile section images uploaded and paths confirmed
- [ ] Overlay link map complete
- [ ] SEO/copy document complete
- [ ] Client has approved prices, hours, and hero copy in writing
- [ ] Domain and deploy target confirmed
