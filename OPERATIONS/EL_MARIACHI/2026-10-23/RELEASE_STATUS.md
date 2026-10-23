# El Mariachi release and phone handoff - 2026-10-23

## Published site

- URL: https://finacalleos.com/el-mariachi ; game: https://finacalleos.com/el-mariachi/play . URL assignment is established from the built route table and Vercel production aliases, not an HTTP/browser check.
- PR: https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/pull/354 ; merged at 2026-10-23T01:04:59Z.
- Feature branch: codex/el-mariachi-prospect-20261023 ; commit eb845f6dbc4797d6849f98d3e1541b57d7213d87.
- Production merge: c5d45c06fa89df3bf390b73e0acd7b1d602f9f79 on main.
- Vercel project: amma-fina-calle, prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4. Production deployment dpl_DCBERksDj3eUf6K2mU3o9faoVxpw is READY at that merge SHA; finacalleos.com and www.finacalleos.com are assigned aliases. Deployment URL: https://amma-fina-calle-5f3zg91u3.vercel.app .
- PR CI: https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/actions/runs/39881760279 ; completed successfully before merge.
- Main CI: https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/actions/runs/39881948043 ; completed successfully for the merge SHA.
- Local required scoped ESLint and production Webpack build passed. Existing CI ran full lint, established safety suites and its production build without any safeguard changes. Vercel preview and production builds passed.

## Scope and provenance

The release adds 14 source/data/style files under APP/web/src/app/el-mariachi, five files under APP/web/public/assets/el-mariachi (official logo, three food photographs and attribution), five source/implementation records under this operations folder, plus queue/handoff entries: 26 files total. No dependency, shared configuration, phone runtime, traffic-report or other-venue source changed.

Jacksonville's 260 items across 20 categories came from the current direct ordering-channel snapshot at https://fromtherestaurant.com/el-mariachi-mex-and-grill/menu/1305-N-Marine-Blvd/ . Six locations came from the official brand/location pages. The actual logo and three food photographs were copied unchanged from official-site CloudFront assets; exact original URLs are in ASSETS.json and SOURCE_PROVENANCE.md. Jacksonville prices were not propagated to other stores. This is visibly an independent Fina Calle prospect concept, with external checkout, no rewards promised and no owner endorsement claimed.

## Verification boundary

Post-build tests, browser QA, manual smoke checks, gameplay/audio runs, ordering checks and phone test calls were skipped at Anthony's request. No visual or functional verification is claimed. Release confirmation used GitHub/Vercel status metadata. The phone configuration read below was a read-only registry inspection, not a call, TwiML request or functional smoke check. No new credentials, spending, services or restaurant systems were introduced.

## Demo-phone findings and exact blocker

Read-only source inspection and the live public registry at https://fina-calle-voice-gateway.onrender.com/tenants agree:

| Existing number | Voice personality | Shared/SMS personality |
| --- | --- | --- |
| +1 757 300 1118 | maracaibo-demo (voice-only override) | fina-calle |
| +1 757 666 0078 | vbfh-info | vbfh-info |

The gateway selects personalities by exact dialled number, with an optional voice-only override. There is no existing caller selection menu. Colattao and French volleyball are unassigned; the first empty-number tenant is the fallback, so an inactive draft must never be inserted ahead of it. The registry is application routing evidence only; Twilio carrier settings and actual inbound audio were not verified.

Render service srv-d8qq4tegvqtc73e42s20 remains on its prior live deployment dep-db5cac6k1f9s73e9721g, commit 0fa62d3379ecd38e1c50e89cd40a539a98bdf5d5 (Maracaibo privacy change, October 10). No voice configuration or deployment was changed.

Activation status: PENDING ROUTING DECISION, not attempted or denied. Both known demo numbers already serve unrelated active personalities. The current authorization prohibits displacing them. The precise decision needed is either explicit permission to switch one named number/personality to El Mariachi, or approval to build a caller selection flow that preserves the existing personalities. No number purchase or restaurant-line change is needed or proposed.

The bilingual personality and standalone unassigned tenant draft are local preparation artifacts only. They are not imported into services/voice-gateway/tenants.json, not deployed, and not callable. Future activation must preserve the approved target, shared/SMS routing, privacy controls and existing required voice CI. No voice behavior or call quality is claimed verified.
