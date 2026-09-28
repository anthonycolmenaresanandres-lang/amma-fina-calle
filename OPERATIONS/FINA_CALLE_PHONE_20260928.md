# Fina Calle phone line record — 2026-09-28

This is the durable company and Claude handoff for the Fina Calle phone line. It contains
no password, API key, auth token, EIN, personal mobile number, or other secret.

## Executive state

- Purchased Twilio number: **+1 757 300 1118**.
- Intended identity: the public Fina Calle company line, separate from the existing
  Trulia/current line and separate from client tenants.
- Twilio confirmed Voice, SMS, and MMS capability in US1. The number purchase is complete.
- Voice and SMS are **not yet live on the number**. Do not configure the live webhooks until
  the code on branch `codex/fina-calle-voice-1118` is reviewed and deployed.
- US A2P 10DLC registration is **not submitted**. SMS must remain unconfigured until the
  campaign is approved.
- The existing Render gateway is healthy at
  `https://fina-calle-voice-gateway.onrender.com`. On 2026-09-28, `/runtime` reported an
  OpenAI key configured and five tenants; `/runtime/realtime-probe` returned `ok: true`
  with model `gpt-realtime-2`.
- No new OpenAI key was created. The secure connector repeatedly required reauthentication.
  A new key is not needed for this release because the existing deployed gateway already
  has a working key. No key value was read, printed, copied, or committed.

## What this branch prepares

- Assigns `+1 757 300 1118` to the `fina-calle` tenant.
- Replaces the unsafe empty/demo tenant with a truth-bounded Fina Calle knowledge pack.
- Defines the assistant as Fina Calle's company assistant only, not Anthony's personal
  assistant yet.
- Voice can answer public service, project, and support questions and can take a short
  non-sensitive callback message. It cannot quote custom work, bind a scope, promise a
  timeline, accept payment, or access private project/account information.
- Adds `POST /sms` for inbound, user-initiated AI text replies with tenant routing, short
  output, hourly caller limits, XML escaping, deterministic HELP/failure responses, and
  no proactive messaging capability.
- Adds opt-in Twilio signature validation. It remains off until `TWILIO_AUTH_TOKEN` is
  installed in Render, then must be turned on and verified.
- Adds `scripts/configure-twilio-number.mjs`, which is dry-run-first and uses a scoped
  Twilio API key when `--apply` is deliberately supplied. SMS configuration additionally
  requires `--include-sms` so it cannot be enabled accidentally before A2P approval.

## Architecture

```text
Caller / texter
      |
Twilio +1 757 300 1118
      |
      +-- Voice POST /twiml --> Media Stream /media --> OpenAI Realtime
      |
      +-- SMS POST /sms -----> OpenAI Responses -----> TwiML text reply
                                      |
                              Fina Calle tenant knowledge
```

The service is shared, but routing is isolated by the dialed `To` number. Fina Calle's
tenant permits only the `take_message` voice tool. SMS has no tool execution and no
outbound campaign path.

## Twilio A2P registration plan

The Twilio Console is at **US A2P 10DLC Registration → New registration → Customer
Profile**. It currently asks whether the registered entity is in the United States or
Canada. Nothing has been submitted.

Recommended classification: **Low-Volume Standard** if AMMA Ventures LLC has an EIN.
Do not choose Sole Proprietor if the entity has an EIN. The Console displayed these fees
on 2026-09-28:

- Brand registration: $4.50 for Sole Proprietor or Low-Volume Standard; $46 Standard.
- Campaign vetting: $15 one time.
- Campaign fee: $2/month for Sole Proprietor or approximately $1.50 to $10/month for
  Low-Volume Standard or Standard, depending on campaign type.

Twilio's current guide says campaign review commonly takes 10 to 15 days. SMS is not a
same-day dependency and must not be represented as active before approval.

### Human-entered facts still required

Anthony should enter these directly in Twilio rather than putting them in git or chat:

1. Exact legal business name as shown on the IRS CP 575 or 147C letter.
2. EIN / tax ID.
3. Exact registered business street address.
4. Authorized representative's legal name and title.
5. Authorized business email and mobile number for OTP.
6. Confirmation that `https://finacalleos.com` is the business website.

Before any form submission, review the transmitted data and destination. Before the final
registration step, separately approve the stated one-time and monthly fees.

### Campaign content draft

Use case: customer care / conversational messaging initiated by the customer. No purchased
lists, cold outreach, bulk promotions, or third-party lead lists.

Campaign description:

> Customers text Fina Calle's published business number to ask about services, a new
> project, or existing-client support. The automated company assistant replies to that
> inquiry using public Fina Calle information and directs unknown or account-specific
> questions to the support page. Fina Calle does not initiate marketing texts.

Opt-in workflow:

> The customer initiates the conversation by texting the Fina Calle number displayed on
> finacalleos.com or printed Fina Calle material. Beside the number, disclose: “By texting
> Fina Calle, you agree to receive replies about your inquiry. Message and data rates may
> apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase.”

Sample messages:

1. `Fina Calle: Thanks for reaching out. Tell us your business name and what you would like to improve. Reply STOP to opt out.`
2. `Fina Calle: We received your support question. Please use finacalleos.com/contact#support for account-specific help. Reply STOP to opt out.`
3. `Fina Calle: Reply with a general service, project, or support question. For human support, visit finacalleos.com/contact#support. Reply STOP to opt out.`

The public site does not yet expose dedicated SMS Privacy and Terms pages. Those URLs and
the opt-in disclosure must be published before campaign submission.

## Safe activation order

1. Review and merge this branch through the normal PR gate.
2. Confirm Render deploy is healthy; read `/tenants` and confirm `fina-calle` owns
   `17573001118`; read `/runtime/realtime-probe` and confirm `ok: true`.
3. Install `TWILIO_AUTH_TOKEN` in Render without displaying or committing it. Set
   `TWILIO_VALIDATE_WEBHOOKS=true`, redeploy, and verify a signed Twilio webhook.
4. Create a restricted Twilio API key in Twilio. Keep its secret in the approved secret
   manager or ephemeral process environment only.
5. Run `npm run configure:twilio` and review the dry-run output.
6. With explicit production approval, run `npm run configure:twilio -- --apply` to attach
   voice and fallback webhooks. Call the number and verify disclosure, Fina Calle facts,
   unknown-question behavior, callback confirmation, rate limit, and clean hangup.
7. Publish SMS Privacy, Terms, and opt-in disclosure. Enter legal identity details directly
   in Twilio, review the fees, and submit A2P registration with action-time approval.
8. After Twilio approves the campaign, run
   `npm run configure:twilio -- --apply --include-sms`, then text HELP, a known question,
   an unknown question, and STOP from a controlled phone.
9. Observe cost/error metrics for the first 24 hours. Pause with `LINE_PAUSED=true` if the
   assistant misroutes, guesses, or generates unexpected cost.

## File locations

- Company/Claude record: `OPERATIONS/FINA_CALLE_PHONE_20260928.md`
- Claude startup pointer: `OPERATIONS/CLAUDE_COORDINATION.md`
- Cross-agent activity: `OPERATIONS/HANDOFF_LOG.md`
- Tenant and number routing: `services/voice-gateway/tenants.json`
- SMS implementation: `services/voice-gateway/src/sms.ts`
- HTTP/Twilio routes: `services/voice-gateway/src/server.ts`
- Runtime controls: `services/voice-gateway/src/config.ts`
- Deterministic SMS checks: `services/voice-gateway/src/simulateSms.ts`
- Twilio API helper: `services/voice-gateway/scripts/configure-twilio-number.mjs`
- Operator instructions: `services/voice-gateway/README.md`
- Render environment declaration: `render.yaml`
- Isolated checkout: `C:\\dev\\amma\\worktrees\\fina-calle-voice-1118`
- Branch: `codex/fina-calle-voice-1118`

## Official references

- Twilio IncomingPhoneNumber API: https://www.twilio.com/docs/phone-numbers/api/incomingphonenumber-resource
- Twilio CLI webhook guide: https://www.twilio.com/docs/twilio-cli/general-usage/work-with-webhooks
- Twilio incoming SMS webhooks: https://www.twilio.com/docs/messaging/guides/webhook-request
- Twilio US A2P 10DLC: https://www.twilio.com/docs/messaging/compliance/a2p-10dlc
- Twilio required business information: https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/collect-business-info
- OpenAI API quickstart: https://platform.openai.com/docs/quickstart/make-your-first-api-request
