# How to customize the short package

The goal: every restaurant gets the **same honest story**, personalized with just their details.
You are only ever changing the `{{MERGE_FIELDS}}` — never the surrounding copy.

---

## Step by step

1. **Duplicate the folder.** Copy the whole `BUYER_PACKAGE/` folder to a new folder named for the
   restaurant, e.g. `BUYER_PACKAGE_LasPalmas/`. Work in the copy, never the master.

2. **Fill the profile.** Open `CUSTOMIZE/RESTAURANT_PROFILE.md` and complete only verified fields.
   The starting price is fixed at **$199/month per location**. One existing verified game and initial owner-account delivery are included; setup, physical printing, additional account work, and custom work still require a written scope.

3. **Find-and-replace the fields.** Across the copied files, replace each
   `{{FIELD}}` with the value from the profile. Full list in `MERGE_FIELDS.md`. In most editors:
   *Edit → Find & Replace → replace in folder.*
   - Leave `{{DEMO_URL}}` blank/omit until that restaurant's pilot page actually loads.
   - Drop optional fields (`{{CITY}}`, `{{IG_HANDLE}}`) if you don't have them — don't guess.

4. **Add and test QR images.** Use the exact destinations in `06_SEE_IT_LIVE.md`. Decode every QR
   from the final PDF or image before printing. Never change a physical QR destination casually.

5. **Export the short handoff.** Use `01`, `05`, and `06`. Add `08` only if the owner wants the FAQ.
   After written approval, use `10` for launch delivery. Keep `CUSTOMIZE/` and `SALES_DEMO_PACKAGE/` internal.

6. **Sanity check before handing it over:**
   - [ ] No stray `{{ }}` left anywhere.
   - [ ] Every claim still matches `SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md` (you didn't add
         payments, POS, ordering, AI, loyalty, or guaranteed results).
   - [ ] Pricing reads "starting at $199/month per location."
   - [ ] One existing game and initial owner-account delivery are included.
   - [ ] Setup outside the written base, physical printing, additional users/training, table service, promotions, analytics reports, and custom work remain separate.
   - [ ] Any live link you included actually loads on your phone.

---

## What NOT to change (keep consistent for everyone)

- The promise, **$199/month per location starting price**, scope boundaries, proof, and CTA.
- The three demo URLs (`finacalleos.com`, `/m/colattao`, `/penalty-shootout`).
- The honest boundaries. Do not add ordering, payments, POS, personal-data collection, AI, loyalty,
  custom-game promises, or guaranteed results.

## What DOES change (per restaurant)

- The `{{MERGE_FIELDS}}` only: restaurant name, owner name, type, and their demo link (once real).

---

> Consistency is the point: if two owners compared notes, they'd see the same product, the same
> honest limits, and the same fair pricing — only their own name and numbers differ.
