# El Mariachi complete phone menu — 2026-10-23

Anthony authorized the existing El Mariachi demo on +1 757 300 1118 to use every current site menu item and a simple warm greeting. This is a phone-only release. The later food-photo/page-texture revision remains separate and unpublished.

## Implementation

- Exact English opening: “Hi! Thanks for calling El Mariachi. How can I help you today?” Spanish equivalent: “¡Hola! Gracias por llamar a El Mariachi. ¿En qué puedo ayudarte hoy?” Follow the caller's language without a long upfront language/demo preamble. AI, independent demo and possible recording disclosure remain explicit when relevant or asked; never represent the demo as the official restaurant or owner-approved service.
- Replace the 20-item prompt sample with a byte-identical Docker-contained copy of the site's Jacksonville ordering snapshot: 260 unique item IDs in 20 categories. All source fields, descriptions, base prices, links and embedded choices are retained. There is no separate modifier/options catalog; blank descriptions are unknown. Published title/description inconsistencies and duplicate names remain unchanged.
- Tenant-only read-only lookup_menu supports category index, exact IDs, short search, category filtering and explicit pagination of at most eight complete records. Source/capture/price context accompanies results. No network request, booking, order, message, storage or staff notification is performed by lookup.
- Full menu is stored server-side, not pasted into every call's prompt. Initial prompt retains location/honesty context. Retrieval is gated by the exact El Mariachi tenant, explicit tool allowlist and catalog ID, including dispatch checks. Other tenants/default capabilities remain unchanged.
- Existing /tenants configuration output adds catalog coverage/hash and requested greeting only for the opted-in El Mariachi tenant, enabling read-only release verification without a call.
- npm run check:menu verifies source-copy identity; npm run sync:menu deliberately refreshes it for future authorized menu changes. Existing voice CI retains all safeguards and adds the static parity check. Existing demo assertions now cover the approved greeting, all 260 item records, page bounds and tenant isolation.

## Preserved boundaries

Voice300 remains El Mariachi; shared/SMS300 remains Fina Calle; voice/shared/SMS666 remains VBFH. All other tenant content, saved Maracaibo, privacy controls, carrier configuration, service settings, credentials, models, package dependencies and menu prices are unchanged. No new number, paid service or persistent access.

## Verification and remaining uncertainty

Local source/JSON/parity/type checks and unchanged required remote CI precede merge. Existing Render main auto-deploy is used; confirm exact merge SHA, live deployment and /runtime plus /tenants metadata. Do not call runtime generation probes or TwiML. No post-change phone calls, browser/gameplay/smoke checks: actual speech, model retrieval choices, bilingual turns, pronunciation, caller experience and carrier delivery remain unverified.

Local checkpoint: tenant JSON parse, source-copy parity (260/20), TypeScript and diff whitespace checks passed. Source comparison confirmed all five unrelated tenant records and El Mariachi routing/privacy/settings unchanged. Independent source review required the parity workflow to trigger on website snapshot changes too; both PR/main path filters now include that exact JSON file. No local simulators or call/model probes run; existing remote CI is still required.
