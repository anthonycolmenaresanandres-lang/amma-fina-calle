# Maracaibo demonstration: caller privacy

Anthony approved publishing a demo-only privacy fix after [PR 320's review](https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/pull/320#discussion_r4239343227). Source inspection confirmed caller-ID persistence, caller-ID stream parameters and raw-key caller rate counters. Missed-call notification records contain metadata; the notification text is assembled separately. The demo's blank webhook establishes no delivery.

Only `maracaibo-demo` opts out using `privacy.retainCallerId: false` and `privacy.missedCallFollowup: false`. Tenant configuration merges preserve explicit false values and retain existing defaults for other tenants. Demo caller IDs are omitted from stream parameters and suppressed before new call objects enter the store or snapshot. Even injected stream `from` parameters pass through the storage policy. Early hangups retain anonymous necessary call outcomes and timing, but create no missed-call follow-up record or delivery attempt.

The demo keeps caller abuse limits with keyed HMAC pseudonyms scoped to the tenant. A random process-local key is never configured or persisted. Counters expire over a one-hour sliding window, idle keys are swept each minute, and capacity is bounded at 4,096 keys. Capacity exhaustion rejects new keys rather than evicting active counters. No raw caller ID or pseudonym is persisted for this limiter. Existing global concurrency, call duration and pause controls remain; other tenants and SMS retain their current behavior.

This changes new application records only. It neither reads nor deletes historical production caller records. Twilio and other infrastructure may receive caller IDs or keep their own logs; this fix does not claim control over provider logging. It does not remove audio handling, anonymous call IDs, timestamps, outcomes or aggregate telemetry.

`simulate:privacy` uses newly created synthetic snapshots, a local notification trap, loopback HTTP/WebSocket ingress and no provider credentials. It checks answered/early-hangup persistence, policy-based no-notification behavior despite a configured trap, snapshot reload, privacy merging, bounded counter expiry, rate limits, stream suppression and preserved 300 SMS/666 routing. Existing regression suites and CI remain required. Actual telephone audio remains a separate owner acceptance check.

No Toast connection, orders, bookings, payment, new credentials, permissions, spending, carrier change or outbound calls are part of this fix.
