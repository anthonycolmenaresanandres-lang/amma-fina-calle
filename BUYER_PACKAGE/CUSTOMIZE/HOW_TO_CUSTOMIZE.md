# How to customize a package (≈5 minutes)

The goal: every restaurant gets the **same honest story**, personalized with just their details.
You are only ever changing the `{{MERGE_FIELDS}}` — never the surrounding copy.

---

## Step by step

1. **Duplicate the folder.** Copy the whole `BUYER_PACKAGE/` folder to a new folder named for the
   restaurant, e.g. `BUYER_PACKAGE_LasPalmas/`. Work in the copy, never the master.

2. **Fill the profile.** Open `CUSTOMIZE/RESTAURANT_PROFILE.md` and complete the fields. Pricing
   (from $199/month) and contact are already fixed — nothing to quote.

3. **Find-and-replace the fields.** Across the copied CORE files (`01`–`09`), replace each
   `{{FIELD}}` with the value from the profile. Full list in `MERGE_FIELDS.md`. In most editors:
   *Edit → Find & Replace → replace in folder.*
   - Leave `{{DEMO_URL}}` blank/omit until that restaurant's pilot page actually loads.
   - Drop optional fields (`{{CITY}}`, `{{IG_HANDLE}}`) if you don't have them — don't guess.

4. **Add the QR images.** In `06_SEE_IT_LIVE.md`, drop a QR into each box (see the instructions at
   the top of that file). The three demo URLs are the same for everyone.

5. **Export the buyer-facing files.** Turn `01`–`09` into PDFs (or print them). Those nine files are
   the leave-behind. **Do not** include the `CUSTOMIZE/` folder, the internal honesty notes, or the
   `SALES_DEMO_PACKAGE/` rep tools — those stay with you.

6. **Sanity check before handing it over:**
   - [ ] No stray `{{ }}` left anywhere.
   - [ ] Every claim still matches `SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md` (you didn't add
         payments, POS, ordering, AI, loyalty, or guaranteed results).
   - [ ] Pricing still reads "from $199/month" (you didn't reintroduce old numbers).
   - [ ] Any live link you included actually loads on your phone.

---

## What NOT to change (keep consistent for everyone)

- The benefits, how-it-works, what's-included, **pricing (from $199/month)**, proof, and FAQ **wording**.
- The three demo URLs (`finacalleos.com`, `/m/colattao`, `/penalty-shootout`).
- The honest boundaries — the "what this is not" and "we don't collect data" lines are the trust
  anchors. They stay in.

## What DOES change (per restaurant)

- The `{{MERGE_FIELDS}}` only: restaurant name, owner name, type, and their demo link (once real).

---

> Consistency is the point: if two owners compared notes, they'd see the same product, the same
> honest limits, and the same fair pricing — only their own name and numbers differ.
