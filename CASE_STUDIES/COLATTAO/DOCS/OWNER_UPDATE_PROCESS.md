# Colattao – Owner Update Process

A lightweight workflow for keeping the Colattao Café Rush site (game + digital
menu) accurate, without running any backend, database, login, or admin
dashboard.

---

## 1. Owner sends a request

The Colattao owner sends a natural-language request by **email or text** —
no special format required. The fastest path:

- **Email:** `anthonycolmenares92@gmail.com`
- **Preferred subject line:** `Colattao Update Request`
- **Or text Anthony directly.**

The `/menu` page now has a subtle footer link **"Need a menu update?"** that
opens a pre-filled email draft with the right subject and a request template.

### Example requests

> "Change Churro Latte to $8.50."

> "Remove White Mint Matcha for now."

> "Add a seasonal drink: Guava Latte, $7.50."

> "Update Pastries & Sweets — Babka is back at $4.00, drop the Cruffin."

> "Change the game phrase to something funnier when you lose."

> "Swap the homepage hero photo for the new one I texted."

Plain English is fine. Bullet lists are fine. Photos as attachments are fine.

---

## 2. Anthony reviews the request

When a request arrives, Anthony:

1. Reads the request and decides scope (menu data only? copy? game tuning?
   visuals? new asset?).
2. Confirms anything ambiguous with the owner (price, exact name, which
   section).
3. Drafts a short Codex prompt that describes **what to change, where, and
   the constraints to preserve**.

The standard prompt shape used in this project:

```
Codex effort: LOW | MEDIUM
Scope: <one-line description>
Project path: C:\Users\antho\OneDrive\Desktop\Colattao Rush
Token-saving rule: <files NOT to touch>

Task:
<numbered steps>

Run:
npm.cmd run build

After completion report:
- files changed
- what changed
- build result
```

---

## 3. Codex executes the change

Codex (running here) will:

- Edit the relevant files (menu data, scene config, copy, components).
- Run `npm run build` to verify TypeScript & Tailwind still compile.
- Stage, commit, and push only the intended files.
- Report commit hash, files touched, and build result.

---

## 4. Vercel auto-deploys

Pushing to `main` triggers Vercel automatically. A typical deploy takes
**1–3 minutes**. No manual deploy step.

---

## 5. Confirm live

Once deploy turns green, Anthony confirms:

- Game route: <https://colattao-cafe-rush.vercel.app/>
- Menu route: <https://colattao-cafe-rush.vercel.app/menu>

Anthony then replies to the owner with the live URL and a short note like
"The change is live — refresh the page on your phone to see it."

---

## What this workflow deliberately avoids (for now)

- ❌ No backend / database / API.
- ❌ No admin login.
- ❌ No CMS.
- ❌ No AI-driven auto-edit of menu data.
- ❌ No public submission form.

This keeps cost at $0, eliminates security surface area, and keeps Anthony
as the trusted reviewer of every change. If volume of requests grows, the
next step is a small admin route gated behind a simple password — but only
when the workflow demands it.

---

## Quick request template (what the mailto link fills in)

Used by the **"Need a menu update?"** link in the `/menu` footer:

```
Hello Anthony,

Request type:
Menu / Price / Product / Photo / Game / Promo

What needs to change:

Current item or section:

New text, price, or detail:

Priority:
Low / Normal / Urgent

Notes:
```
