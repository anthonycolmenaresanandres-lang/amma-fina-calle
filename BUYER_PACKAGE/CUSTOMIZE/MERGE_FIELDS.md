# Merge fields — the master list

Every `{{FIELD}}` used across the CORE files. Fill these once per restaurant (in
`RESTAURANT_PROFILE.md`), then find-and-replace across the copied folder. **These are the ONLY
things that change per restaurant** — everything else stays identical for everyone.

| Field | What it is | Example |
|---|---|---|
| `{{RESTAURANT_NAME}}` | The business name | Las Palmas |
| `{{OWNER_NAME}}` | Owner / decision-maker's name | Maria |
| `{{RESTAURANT_TYPE}}` | café / restaurant / food truck / bakery… | restaurant |
| `{{CITY}}` | City or neighborhood (optional in copy) | Virginia Beach |
| `{{IG_HANDLE}}` | Their business Instagram (optional) | @laspalmasvb |
| `{{DEMO_URL}}` | Their live/pilot menu link, once built | finacalleos.com/m/laspalmas |
| `{{REP_NAME}}` | The rep handing it over | Anthony |
| `{{REP_PHONE}}` | Rep phone / WhatsApp | (757) 555-0134 |
| `{{REP_EMAIL}}` | Rep email | anthony@finacalleos.com |
| `{{QUOTED_PACKAGE}}` | Recommended package | Starter |
| `{{QUOTED_SETUP}}` | Setup quoted (within published ranges) | $400 (or free pilot) |
| `{{QUOTED_MONTHLY}}` | Monthly quoted (within published ranges) | $50 |
| `{{QUOTED_PILOT}}` | Pilot terms if offered | Free setup, $50/mo, no lock-in |
| `{{DATE}}` | Date handed over (optional) | 2026-08-11 |

---

## Rules for filling them in
- **Stay inside the published pricing ranges** in `05_PRICING_AND_PACKAGES.md`. Don't improvise
  higher numbers. Pilot pricing (low/free setup, ~$50/mo) is the friendly default.
- **`{{DEMO_URL}}` stays blank** until that restaurant's pilot page actually exists. Don't put a
  link that doesn't load.
- **Leave optional fields** (`{{CITY}}`, `{{IG_HANDLE}}`) out of the copy if you don't have them —
  don't guess.
