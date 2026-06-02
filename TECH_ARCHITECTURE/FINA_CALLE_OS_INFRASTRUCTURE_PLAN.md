# Fina Calle OS Infrastructure Plan

## 1. Market Model

Fina Calle OS is a premium local digital brand system for businesses that need more than a basic website but are not ready for custom enterprise software.

The market model is a local specialized GoDaddy: simple entry, fast deployment, repeatable modules, and founder-led support, but with a stronger visual identity and interactive storefront layer.

The model is inspired by GoDaddy, Wix, BentoBox, and Popmenu, but Fina Calle should not copy their generic templates. The focus is premium local digital brand systems: mobile-first menus, QR experiences, lightweight games, owner request flows, visual campaign assets, and simple operational tools that help local businesses look bigger without taking over their POS or financial infrastructure.

## 2. Core Modules

### Client Intake

A structured intake flow captures the business identity, menu or offer structure, brand tone, required assets, operational constraints, and launch priorities.

### Digital Menu

A mobile-first digital menu module for restaurants, cafes, bars, food trucks, and similar local businesses. It should support categories, items, optional visual assets, seasonal updates, and QR access.

### Website Concept

A premium website concept module that shows the client's brand direction, core offer, contact path, storefront visuals, and proof points without overbuilding a full custom CMS at the start.

### Game Module

A lightweight interactive game or mini-experience module that can be skinned per client. This creates a memorable QR/storefront experience and gives Fina Calle a clear difference from generic site builders.

### QR / Signage

QR signage, sticker campaigns, table cards, window decals, and printed entry points that connect physical storefront traffic to the digital experience.

### Owner Command Center

A future owner-facing command center for viewing active modules, launch status, request links, update history, campaign assets, and basic operational notes.

### Request / Update Portal

A simple request portal for menu changes, campaign updates, new images, copy changes, seasonal items, and client support requests.

### Future Billing Links

Hosted billing links for AMMA/Fina Calle client payments. Billing should start simple and remain separate from client POS systems.

## 3. Infrastructure

### GitHub

GitHub is the source-of-truth for code, documentation, version history, and reusable module templates. Each client project should have clean repo boundaries and no copied secrets.

### Vercel

Vercel is the default deployment platform for landing pages, digital menus, mini-games, and static storefront modules. Projects should be easy to deploy, preview, and roll back.

### Resend

Resend can support future transactional email for intake confirmations, request updates, and owner notifications. Do not add email automation until the operational flow is clearly defined.

### Vercel Blob Optional

Vercel Blob can be considered for future uploaded assets, client media, or owner-submitted files. It should remain optional until the intake/request workflow needs file storage.

### Stripe Hosted Links Later

Stripe-hosted payment links may be used later for AMMA/Fina Calle invoices, setup fees, subscriptions, or add-ons. Do not store payment data in the app.

### No Client POS Integration By Default

Fina Calle should not own, replace, or directly integrate with client POS systems by default. Client Square, Toast, Clover, Stripe Terminal, or other POS systems stay separate unless a future paid integration is explicitly scoped.

## 4. Client Lifecycle

### Lead

A prospective client enters through conversation, referral, landing page CTA, QR demo, or case study interest.

### Intake

Fina Calle collects business details, brand direction, menu/offer data, current pain points, and desired modules.

### Concept

A first concept is prepared: storefront direction, module recommendation, rough information architecture, and campaign angle.

### Build

The selected modules are built using reusable templates and client-specific styling, assets, and copy.

### Review

The client reviews the digital experience on mobile first. Changes are captured through a controlled request/update process.

### Deploy

The approved project is deployed through Vercel with clean public URLs and QR-ready links.

### Monthly Updates

Ongoing support covers menu updates, seasonal campaigns, small copy adjustments, asset swaps, and future module expansion.

## 5. Deployment Phases

### Phase 1: Foundation Docs

Define the operating system, module standards, intake structure, client lifecycle, guardrails, and proof-of-concept case studies.

### Phase 2: AMMA Public Site

Expand the AMMA/Fina Calle public site to explain Fina Calle OS, show Colattao as proof, and collect project inquiries without claiming unsupported features.

### Phase 3: Intake System

Create a simple intake system for collecting client identity, offers, assets, goals, and update needs.

### Phase 4: Module Templates

Build reusable templates for digital menus, website concepts, QR pages, mini-games, signage campaigns, and owner-facing request forms.

### Phase 5: Billing Links

Add hosted billing links for AMMA/Fina Calle services only after offers and support boundaries are clear.

### Phase 6: Retention / Reporting

Add lightweight retention/reporting tools such as update history, active module list, request status, and simple monthly summaries. Avoid fake analytics or inflated dashboards.

## 6. Guardrails

- No fake features.
- No payment data stored.
- No secrets in repos.
- No Square, Toast, Clover, Stripe Terminal, or POS ownership by default.
- No overbuilding before revenue.
- No backend, database, auth, or account system unless the business workflow proves it is needed.
- No client financial liability inside Fina Calle modules.
- No claims that integrations are live unless they are built, tested, and documented.
- Keep Colattao as the flagship proof, but keep reusable standards in the AMMA/Fina Calle parent layer.
