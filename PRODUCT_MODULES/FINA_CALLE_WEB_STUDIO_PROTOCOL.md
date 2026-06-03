# Fina Calle Web Studio — Company Operating Protocol
_AMMA Ventures LLC DBA Fina Calle_
_Created: 2026-06-03 | Version: 1.1_

---

## Purpose

Define a repeatable, quality-controlled workflow for delivering client websites through the Fina Calle Web Studio service. Every engagement follows this protocol so quality, legal compliance, and brand consistency are guaranteed regardless of who executes the build.

---

## Core Idea

We generate the full visual website as a set of designed image sections (desktop + mobile), overlay an interaction layer (links, buttons, CTA anchors), add an SEO/copy layer (text, meta, structured data), and ship a production Next.js or static site. The client approves the visual design before a single line of production code is written.

**Design first. Code second. Approval always.**

---

## Legal Rule

> **We may not publish prices, hours, offers, legal claims, health claims, or any factual representation about the client's business until the client has reviewed and approved that specific content in writing.**

This rule is absolute. Placeholder copy ("Hours: TBD", "Prices vary — contact us") is always acceptable. Publishing unverified facts is never acceptable.

---

## Website Strategy Intake — Required Before Design

> **Do not begin image generation or Codex website build until every question below is answered or intentionally marked "unknown / skipped for now."**

This phase happens before any visual design, canvas work, or code prompt. Its purpose is to align the website strategy with real business facts — so design decisions, copy, and feature choices are grounded in how the business actually works today.

### Required Questions

| # | Question | Answer / Status |
|---|----------|----------------|
| S1 | **What is the business about?** | |
| S2 | **What is the main website goal?** (drive foot traffic, capture leads, enable online orders, build credibility, etc.) | |
| S3 | **How should customers take action?** Walk in / Call / Book / Order online / Request a quote / Contact form | |
| S4 | **What features exist right now?** (online ordering, reservations, delivery, gift cards, loyalty program, etc.) | |
| S5 | **What features are future-only and must NOT be claimed yet?** | |
| S6 | **Why do customers choose this business over competitors?** | |
| S7 | **Who are the ideal customers?** (demographics, occasions, needs) | |
| S8 | **How do people currently discover the business?** (Google Maps, Instagram, word of mouth, Yelp, walk-by, etc.) | |
| S9 | **Which website features support those discovery channels?** (Google profile link, reviews section, map embed, social feed, etc.) | |

### Completion Rule

Every answer must be one of:
- A real answer from the client
- `"unknown — ask client"`
- `"skipped for now — not needed for this build"`

A blank is not acceptable. An intentional skip is acceptable.

### Future Features Rule

> **Future features may be documented internally as "planned" but must not be advertised publicly unless (a) the client approves the claim in writing and (b) the feature already exists and works.**

Examples of violations to avoid:
- "Order online coming soon!" — do not include unless client confirms a launch date and has approved the copy
- "Loyalty rewards available" — do not include if the program is not live
- "Book a table" CTA — do not include if no booking system exists

If a feature is planned but not live, either omit it entirely or use internal placeholder markup: `<!-- FUTURE: online ordering — not live yet -->`.

---

## What We Need from the Client

Collected via the `/request-update` intake form or direct conversation:

| Item | Required? | Notes |
|------|-----------|-------|
| Business name (legal) | ✅ | |
| Trade name / DBA | ✅ | |
| Location / service area | ✅ | |
| Phone number | ✅ | |
| Contact email | ✅ | |
| Primary customer action | ✅ | "Call us", "Order online", "Book a table", etc. |
| Website goal | ✅ | New site, redesign, add page, etc. |
| Logo file | ✅ | SVG, PNG, or AI preferred |
| Brand colors | ✅ | Hex codes or "match logo" |
| Photos or video | Recommended | Product, space, team |
| Menu / services / pricing | If applicable | Must be client-approved before publishing |
| Social media links | Recommended | |
| Google Business Profile URL | Recommended | |
| Existing website URL | If applicable | |
| Competitor/reference sites | Optional | Style direction |
| Domain / deploy target | ✅ | Vercel, Netlify, custom, etc. |
| Primary approval contact | ✅ | Name + email for sign-off |

---

## What We Can Collect Ourselves (Public Sources)

Without client involvement we may gather:

- Google Maps address, neighborhood, and hours from Google Business Profile
- Public social media bios, handles, and profile photos
- Public review excerpts (only with attribution, no fabrication)
- Publicly listed menu or service information from the client's existing website
- Competitor site URLs for design reference (never content copying)

**All self-collected data is marked "PENDING CLIENT APPROVAL" until confirmed.**

---

## What Must Be Approved by the Client

Before publishing:

- All prices and pricing structures
- All business hours
- All promotional offers or claims
- Any health, nutrition, or safety claim
- Legal business name and license references
- Any quote or testimonial attributed to a real person
- Final copy on hero, CTA, and footer

Approval is recorded as a written message, email, or voice note transcription stored in the client's case study folder.

---

## Image-Generation Website Method

### Overview

1. **Strategy intake** — answer all 9 required strategy questions (S1–S9) or mark each "unknown / skipped for now" — **no design starts until this is complete**
2. **Intake** — collect brief, assets, references (see checklist)
3. **Design** — generate desktop and mobile full-page composites as image sections using an AI canvas tool or design software
4. **Client review** — share image mockups for visual approval before coding
5. **Build** — convert approved images into production code (Next.js preferred)
6. **Overlay** — add interaction layer: links, buttons, forms, anchor nav
7. **SEO/copy layer** — add semantic HTML, meta tags, structured data, and approved copy
8. **Deploy** — push to approved target (Vercel default)
9. **Handoff** — deliver login, repo access, and maintenance instructions

---

### Desktop Canvas Recommendation

| Property | Value |
|----------|-------|
| Width | **1440 px** |
| Typical total height | **5,000 – 7,000 px** |
| Format | PNG or WebP |
| Resolution | 144 ppi (2× for retina-ready export) |
| Background | Full brand color or white |

---

### Mobile Canvas Recommendation

| Property | Value |
|----------|-------|
| Width | **390 px** (iPhone 14 standard) |
| Typical total height | **6,000 – 8,000 px** |
| Format | PNG or WebP |
| Resolution | 144 ppi |
| Background | Match desktop or dark variant |

---

### Recommended Section Stack: 5–7 Stacked WebP/PNG Sections

Break the full-height canvas into individual sections saved as separate files. This allows:
- Lazy loading in production
- Easier client review of individual sections
- Rapid section-level revision without full redesign

---

## Default Section Map

| # | Section Name | Purpose |
|---|-------------|---------|
| 1 | **Hero + CTA** | Brand identity, headline, primary action button |
| 2 | **Brand Story / Trust** | "Why us" narrative, year founded, origin story |
| 3 | **Services / Menu Highlights** | Key offerings with names, brief descriptions, optional prices (client-approved) |
| 4 | **Gallery / Proof** | Product photos, space photos, team, work samples |
| 5 | **Process / Experience** | How it works, what to expect, 3-step flow |
| 6 | **Reviews / Social Proof** | Curated testimonials, star ratings, press mentions |
| 7 | **Contact / Hours / Map / Footer** | Address, phone, hours (client-approved), map embed, social icons |

Sections 1–4 are required on every build. Sections 5–7 are included by default and removed only if the client explicitly opts out.

---

## Overlay Link Map Concept

After sections are designed and approved, define an **overlay link map** — a JSON or spreadsheet that lists every clickable region:

```
Section → Element → Action → Destination
Hero     → CTA button     → external link   → tel:+1XXXXXXXXXX
Nav      → "Menu" anchor  → scroll to       → #menu
Footer   → Instagram icon → external link   → instagram.com/handle
```

This map is built before coding begins and is reviewed alongside the design mockup.

---

## SEO / Copy Layer Concept

The copy layer is a separate document (or the prompt template output) that defines:

- `<title>` and `<meta description>` for each page
- H1 per page (exactly one)
- H2 per major section
- Alt text for all images
- Structured data type (LocalBusiness, Restaurant, Service, etc.)
- Primary keyword target per page
- Schema.org fields: name, address, phone, hours (client-approved), priceRange

The SEO/copy layer is written after design approval and before coding, so it can be dropped directly into the component files.

---

## Build Packet Requirements

A complete build packet handed to the coder (or Codex agent) contains:

1. Desktop section images (WebP, named `desktop-01-hero.webp`, `desktop-02-brand.webp`, etc.)
2. Mobile section images (WebP, named `mobile-01-hero.webp`, etc.)
3. Brand brief (colors, fonts, tone)
4. Overlay link map (JSON or table)
5. SEO/copy document
6. Domain and deploy instructions
7. Client approval record (message/email screenshot)
8. Any logo, icon, or brand asset files

---

## "Clone-of-Anthony" Execution Rules

When this protocol is executed by an AI agent acting as Anthony:

1. **Complete strategy intake before designing.** All 9 strategy questions (S1–S9) must be answered or marked "unknown / skipped for now" before any image generation or build prompt is started.
2. **Never advertise future features.** Features that are planned but not live must be marked `<!-- FUTURE: ... -->` internally and must not appear in any public-facing copy or UI unless the client approves in writing and the feature exists.
3. **Never publish without approval.** If prices, hours, or claims are missing, use placeholder text.
4. **Follow the section map.** Do not invent sections not in the map.
5. **Match the visual.** The approved image is the spec. Code must reproduce it — do not redesign in code.
6. **Do not modify protected files.** App UI, routes, payment logic, deployment config, and secrets are off-limits unless the current task explicitly authorizes a change.
7. **Log every decision.** Use `handoff.py` to record DONE/NEXT/NOTE at each decision point.
8. **Ask before assuming.** If a required intake item is missing, note it as PENDING rather than inventing a value.
9. **One concern per commit.** Never bundle unrelated changes.
10. **Build passes before committing.** Run `npm run build` and confirm clean before any `git add`.
