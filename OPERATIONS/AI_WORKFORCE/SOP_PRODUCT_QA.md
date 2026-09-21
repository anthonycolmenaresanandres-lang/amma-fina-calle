# SOP — Product QA and Engineering Watch

## Objective
Keep sellable products demonstrable and prevent silent failures.

## Repositories in initial watch
- amma-fina-calle
- vbfh-media-engine
- fina-calle-voice-gateway
- colattao-cafe-rush
- fina-calle-landing

## Procedure
1. Check recent CI/workflow failures and open high-impact PRs.
2. Determine whether the issue affects demo, customer data, customer-facing facts, payments, or revenue workflows.
3. Classify GREEN / YELLOW / RED.
4. For RED, notify Anthony with exact failing component and safest next step.
5. Do not run paid external tests without authorization.
6. Prefer fixture/keyless/local verification before live paid validation.

## Production language
Working = code exists.
Tested = verification passed.
Deployed = production environment confirmed.
Operational = production plus recent successful evidence.
Never collapse these states into one claim.