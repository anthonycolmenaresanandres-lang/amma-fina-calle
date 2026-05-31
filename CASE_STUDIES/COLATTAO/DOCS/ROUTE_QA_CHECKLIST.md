# Route QA Checklist

## 1. Deploy Check
- [ ] Confirm Vercel deploy is green.
- [ ] Open production URL.
- [ ] Test on phone.

## 2. Game Route `/`
- [ ] Page loads.
- [ ] Game starts.
- [ ] Levels work.
- [ ] Bad item loss works.
- [ ] Win screen works.
- [ ] Buttons work:
  - [ ] Ver menú
  - [ ] Ver presentación
  - [ ] Ver website
- [ ] Feedback box opens email.

## 3. Menu Route `/menu`
- [ ] Logo loads.
- [ ] Categories render.
- [ ] Prices visible.
- [ ] Play Café Rush link works.
- [ ] Need a menu update mailto works.
- [ ] Feedback box opens email.

## 4. Owner Presentation `/owner-presentation`
- [ ] Spanish copy loads.
- [ ] All 9 sticker/signage assets render.
- [ ] Privacy section says no personal customer data is collected.
- [ ] Buttons to game/menu/website concept work.
- [ ] Feedback box opens email.

## 5. Website Concept `/website-concept`
- [ ] Page loads.
- [ ] Hero renders.
- [ ] Concept cards render.
- [ ] Buttons to presentation/menu/game work.
- [ ] Mobile layout looks premium.

## 6. QR Check
- [ ] Menu QR opens `/menu`.
- [ ] Game QR opens `/`.
- [ ] Presentation QR opens `/owner-presentation`.
- [ ] Future website QR opens `/website-concept` if created.

## 7. Privacy Check
- [ ] No personal data claims remain accurate.
- [ ] Vercel Analytics wording is honest.
- [ ] Feedback says email only, no database.

## 8. Final Go/No-Go
- [ ] Pass
- [ ] Fix needed
- [ ] Notes:
