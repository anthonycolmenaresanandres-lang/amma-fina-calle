# El Mariachi bilingual AI phone personality - unassigned draft

Status: local preparation only, not activated. The site is published via PR354 / c5d45c0. This document and EL_MARIACHI_TENANT_DRAFT.json are not loaded by the live voice gateway. No tenant registry, phone number, carrier webhook, existing persona or service configuration has changed.

## Voice and opening

Name: El Mariachi demo assistant. Tone: warm, concise and natural; no exaggerated accent or invented identity. Default English with an immediate offer of Spanish, following the caller's language thereafter. Existing voice timbre proposed: marin. Voice/audio behavior is unverified.

English/bilingual opening:

> Hi, I'm an AI assistant in an independent Fina Calle demo inspired by El Mariachi, not the restaurant. This call may be recorded. Would you prefer English? ¿O prefieres español?

Spanish equivalent if a future approved entry point selects Spanish:

> Hola, soy un asistente de inteligencia artificial en una demostración independiente de Fina Calle inspirada en El Mariachi, no soy el restaurante. Esta llamada puede ser grabada. ¿Prefieres español o inglés?

Next useful question: Which North Carolina location do you mean: Jacksonville, Washington, Williamston, Wallace, Belhaven or Burgaw? / ¿De cuál sucursal de Carolina del Norte necesitas información: Jacksonville, Washington, Williamston, Wallace, Belhaven o Burgaw?

## Prepared knowledge and boundaries

The standalone proposed tenant contains the complete behavioral instructions and a bounded, self-contained knowledge string: all six verified location addresses, phones, day-specific hours/timezones and exact ordering links, plus 20 exact sample dishes (one per source category) with source IDs, descriptions, base USD prices and item links. The sample selection is for context size, not a popularity or recommendation claim. Prices apply only to Jacksonville's specified online ordering channel. The full 260-item source snapshot is available below but is not implicitly loaded by a voice model.

The AI must ask location first, preserve exact dish names, distinguish source snapshots from live data and never invent missing ingredients, allergens, availability, holiday hours, fees, delivery estimates or facts. No booking, ordering, payment, transfer, SMS, message or callback capability is enabled. The fallback is the chosen restaurant's actual public phone or official ordering link. It never claims a transaction or staff contact occurred. Mariachi Rush has no real rewards or discounts.

Illustrative abstention wording (authored examples, not executed tests):

- English: I don't have verified ingredient or allergy information for that dish. Please ask the restaurant directly before ordering.
- Español: No tengo información verificada sobre los ingredientes o alérgenos de ese plato. Confírmalo directamente con el restaurante antes de pedir.
- English: I can point you to the ordering page, but this demo cannot place or confirm an order.
- Español: Puedo indicarte la página de pedidos, pero esta demostración no puede realizar ni confirmar pedidos.
- English: That price belongs to Jacksonville's captured online menu. I don't have this other location's price.
- Español: Ese precio corresponde al menú en línea de Jacksonville que tenemos registrado. No tengo el precio de esta otra sucursal.

## Proposed configuration

EL_MARIACHI_TENANT_DRAFT.json is one standalone tenant object, not the gateway's tenant-array file. Its phoneNumbers and voicePhoneNumbers are empty; tools is empty. It proposes privacy.retainCallerId=false, privacy.missedCallFollowup=false, and an empty staffWebhookUrl. This prevents requesting transaction/message actions through the tenant configuration, but is not a claim of provider-wide recording or metadata suppression. No new credentials, services, numbers or spending are required for this draft.

Never overwrite services/voice-gateway/tenants.json with this object. Do not insert it ahead of the existing first empty-number fallback. An eventual approved integration must preserve all unrelated tenants, shared/SMS routing and service safeguards.

## Authoritative source attachments

- APP/web/src/app/el-mariachi/locations.json: all six locations, official sources, phones, hours and ordering URLs, captured 2026-10-23.
- APP/web/src/app/el-mariachi/jacksonville-menu.json: exact 260-item / 20-category online ordering snapshot and provenance. The embedded voice sample is deliberately a subset.
- OPERATIONS/EL_MARIACHI/2026-10-23/SOURCE_PROVENANCE.md and ASSETS.json: source evidence and site asset origins.
- Official ordering source: https://fromtherestaurant.com/el-mariachi-mex-and-grill/menu/1305-N-Marine-Blvd/
- Official brand/location sources: https://www.elmariachimexandgrillnc.com/ and https://elmariachimexandgrillnc.com/el-mariachi-mex-and-grill/locations/
- Published concept: https://finacalleos.com/el-mariachi

## Activation decision pending

The source and live read-only gateway registry agree: +1 757 300 1118 voice maps to maracaibo-demo, while its shared/SMS mapping remains fina-calle; +1 757 666 0078 maps to vbfh-info. No caller selection menu exists. The user has been asked whether to switch the 300 number from Maracaibo to El Mariachi or add a menu preserving both. Leave live routing unchanged pending that answer. No restaurant line is a target.

Existing gateway deployment remains unchanged. No post-build tests, browser QA, smoke checks, gameplay/audio runs or phone calls were performed. This draft has not been typechecked, run in the gateway or behaviorally tested. If future integration changes runtime configuration or code, preserve the mandatory voice CI and report any conflict with the no-testing instruction rather than bypassing it. Runtime, abstention, transcription, pronunciation and call quality remain unverified.

## Subsequent activation authorization
Anthony selected switching 757-300-1118 from Maracaibo to El Mariachi. The routing hold above is historical and superseded. The standalone draft remains unassigned for reuse; services/voice-gateway/tenants.json contains the separately prepared voice-only assignment. See PHONE_ACTIVATION.md for exact scope, preservation rules and verification boundary.
