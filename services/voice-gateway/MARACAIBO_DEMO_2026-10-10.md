# Maracaibo Spanish voice demonstration

Anthony authorized publishing a Spanish Maracaibo personality on **+1 (757) 300-1118** on October 10, 2026. Before edits, public live registry and TwiML confirmed that 300 voice selected VBFH, 300 SMS selected Fina Calle, and 666 selected VBFH.

The `maracaibo-demo` tenant claims only the 300 voice override. Its greeting identifies an automated Fina Calle demonstration inspired by Maracaibo Bistro, with a recording notice. Maracaibo is a prospect, not a confirmed client. No official ownership, authorization or integration is asserted. The demo uses Spanish by default and the existing `marin` voice.

No tools, transactional integration or staff destination are enabled. An explicit empty tool list now advertises no tools, and dispatch enforces explicit tenant allow-lists. Undefined tool lists retain existing default behavior. The demo provides information and directs callers to the official restaurant website or telephone for orders, reservations, catering and events. It never captures messages, takes payments, books or promises follow-up.

## Verified public knowledge

Checked October 10, 2026 against official sources provided by the research task:

- [Official website](https://maracaibobistrovab.com/)
- [Official location](https://maracaibobistrovab.com/virginia-beach-maracaibo-bistro-locations)
- [Official food menu](https://maracaibobistrovab.com/virginia-beach-maracaibo-bistro-food-menu)

Address: 2876 Virginia Beach Boulevard, Virginia Beach, VA 23452. Official restaurant phone: 757-917-5187. Published hours: Sunday–Thursday 10 AM–9 PM; Friday–Saturday 10 AM–10 PM, America/New_York. No live clock or availability is supplied. Published menu, selected prices and restaurant services are embedded with source URLs in `tenants.json`. Prices are spoken only when asked, with a confirmation caveat. Unverified ingredients, allergens, stock, delivery conditions, promotions and holiday changes are deferred to the restaurant.

## Verification and release

Run typecheck and existing voice, SMS, reliability, VBFH and check-in simulators, plus `simulate:maracaibo`. Tests exercise actual local HTTP voice/SMS handlers without credentials or paid model requests. The new test verifies Spanish greeting/payload, capability denial and routing isolation. Live `/tenants` diagnostics now expose language, voice and tool names; `/runtime` exposes `RENDER_GIT_COMMIT` for exact revision verification without secrets.

Before merging, check CI and zero active calls. After publication verify the Render deploy is live at the merge revision, health is 200, 300 TwiML selects `maracaibo-demo`, 666 selects `vbfh-info`, and shared 300/SMS mapping is Fina Calle. Actual inbound phone audio requires a human acceptance call; no outbound calls, model-generation probes, SMS sends or notification tests are authorized here.

No carrier settings, credentials, security permissions, purchased numbers, service plans, web application or unrelated deployment are changed.
