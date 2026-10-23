# El Mariachi voice activation - 2026-10-23

## Authorization and scope

Anthony explicitly chose Switch please after being offered replacement of Maracaibo on +1 757 300 1118 versus a caller-selection menu. This authorizes moving that exact voice-only override to el-mariachi-demo. The earlier routing-decision hold is superseded. Maracaibo's entire saved personality remains available, with only its assignment removed. No change to +1 757 666 0078/VBFH, shared 300/Fina Calle SMS, unknown-number fallback, other personas, carrier webhooks, numbers, credentials, service plans or spending.

## Prepared change

- Append the prepared bilingual el-mariachi-demo tenant after all existing tenants, with phoneNumbers=[] and voicePhoneNumbers=[+1 757 300 1118].
- Set maracaibo-demo.voicePhoneNumbers=[]; retain its full Spanish personality, knowledge, privacy flags and configuration.
- El Mariachi has tools=[], blank staffWebhookUrl, retainCallerId=false and missedCallFollowup=false. No ordering, booking, payment, message, transfer or outbound communication tools.
- Public knowledge includes all six verified locations and 20 exact Jacksonville sample dishes; no other-location price cloning or live availability claim.
- Update existing mandatory routing/privacy assertions for the newly selected demo while preserving original VBFH/SMS/fallback hashes and saved Maracaibo checks. No runtime engine or CI-workflow changes.

Before editing, the live read-only /tenants registry agreed with main: 300 voice=maracaibo-demo; 300 shared/SMS=fina-calle; 666 voice/shared=vbfh-info. Render's existing live deployment was dep-db5cac6k1f9s73e9721g at 0fa62d3379ecd38e1c50e89cd40a539a98bdf5d5. Original Maracaibo JSON.stringify SHA256 was b35cd28852a23723612fae0aacde2cb0987edfbdd2cf5bd1ecfd607f68d57517; only its voice assignment is allowed to differ.

## Verification and release boundary

The existing voice runbook requires valid tenant JSON, local TypeScript checks and unchanged mandatory voice CI. All established safeguards must pass before merge; none are disabled. Read aggregate active-call status before the release, then use the existing main-to-Render deployment. Confirm the exact merge commit is live through Render and /runtime metadata; read /tenants afterward to confirm El Mariachi voice300, unassigned Maracaibo, preserved VBFH666 and Fina Calle shared/SMS300.

No test phone calls, live TwiML requests, model-generation probes, live SMS, browser QA or manual smoke checks are authorized or performed. Deterministic repository CI is mandatory; actual greeting, language switching, transcription, abstention, pronunciation, audio quality and carrier-to-gateway delivery remain unverified. No claim that a real caller has heard the new persona.

## Reversibility

The saved maracaibo-demo is retained. A future explicitly authorized reversal can remove only El Mariachi's 300 voice override and restore it to Maracaibo through the same checked workflow. Do not change Fina Calle's shared number or VBFH's 666 assignment. Do not perform a rollback or new carrier operation without its own applicable authorization.

## Local release checkpoint
Locked dependency installation succeeded (62 packages); no dependency-script approvals were changed. Mandatory tenant JSON parsing and npm run typecheck passed. Source review confirmed preserved tenant order, unchanged VBFH/Fina Calle/other personas, saved Maracaibo content and explicit empty tools/privacy controls for El Mariachi. Initial aggregate activeCalls readback was 0; reread immediately before merge. Existing remote voice CI remains required; no local simulator, test call or live generation probe was run.
