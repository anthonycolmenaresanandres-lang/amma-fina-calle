"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAccountCandidate } from "@/lib/accounts/actions";
import { DEMO_ACCOUNT } from "@/lib/accounts/fixtures";
import { SOURCE_OPTIONS, TENANT_ID } from "@/lib/accounts/import";
import styles from "./AccountWorkspace.module.css";
export default function AccountForm({ enabled, demo = false, onDemoCreated }: { enabled: boolean; demo?: boolean; onDemoCreated?: (draft: { source: string }) => void }) {
  const [review, setReview] = useState(false);
  const [draft, setDraft] = useState(demo ? { ...DEMO_ACCOUNT, source: "manual-json-v1" } : { tenant: "", businessName: "", location: "", ownerEmail: "", source: "manual-json-v1" });
  const [error, setError] = useState(""); const [pending, startTransition] = useTransition();
  const key = useRef<string | null>(null); const errorRef = useRef<HTMLParagraphElement>(null); const router = useRouter();
  const selected = SOURCE_OPTIONS.find(s => s.id === draft.source)!;
  function fail(message: string) { setError(message); requestAnimationFrame(() => errorRef.current?.focus()); }
  function update(field: keyof typeof draft, value: string) { setDraft({ ...draft, [field]: value }); setReview(false); key.current = null; setError(""); }
  return <form onSubmit={event => { event.preventDefault();
    if (!enabled) return fail("Account staging is not released yet.");
    if (!TENANT_ID.test(draft.tenant) || !draft.businessName.trim() || !draft.location.trim() || !selected.supported) return fail("Check the account ID and choose a supported source.");
    if (demo && (draft.ownerEmail !== DEMO_ACCOUNT.ownerEmail || draft.tenant !== DEMO_ACCOUNT.tenant)) return fail("Use the supplied fictional owner and account ID in this preview.");
    if (!review) { setReview(true); return; }
    startTransition(async () => {
      if (demo) { onDemoCreated?.(draft); return; }
      key.current ??= crypto.randomUUID();
      const result = await createAccountCandidate({ key: key.current, ...draft });
      if (!result.ok || !result.id) return fail(result.message);
      router.push(`/customers/onboarding/${result.id}`);
    });
  }}>
    <ol className={styles.steps} aria-label="Account setup"><li aria-current={!review ? "step" : undefined}>1 · Business &amp; owner</li><li>2 · Menu source</li><li aria-current={review ? "step" : undefined}>3 · Review account</li></ol>
    <section className={styles.section}><h2>Business &amp; owner</h2>
      <div className={styles.grid}>
        <label className={styles.field}><span>Business name</span><input name="businessName" autoComplete="organization" value={draft.businessName} required maxLength={120} onChange={e => update("businessName", e.target.value)} /></label>
        <label className={styles.field}><span>Account ID</span><input name="tenant" autoComplete="off" spellCheck={false} value={draft.tenant} required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={e => update("tenant", e.target.value)} /><small>Lowercase words with hyphens. This identity stays with the account.</small></label>
        <label className={styles.field}><span>Business location</span><input name="location" autoComplete="street-address" value={draft.location} required maxLength={240} onChange={e => update("location", e.target.value)} /></label>
        <label className={styles.field}><span>Verified owner email</span><input name="ownerEmail" type="email" autoComplete="email" spellCheck={false} value={draft.ownerEmail} required maxLength={254} onChange={e => update("ownerEmail", e.target.value)} /><small>An existing verified account is required. The owner must then accept this business association.</small></label>
      </div>
    </section>
    <section className={styles.section}><h2>Menu source</h2>
      <label className={styles.field}><span>Source</span><select name="source" value={draft.source} onChange={e => update("source", e.target.value)}>{SOURCE_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}{s.supported ? "" : " · not supported"}</option>)}</select><small>{selected.detail}</small></label>
    </section>
    {review ? <section className={styles.section}><h2>Confirm the account draft</h2><p>{draft.businessName}<br />{draft.location}<br /><span className={styles.receipt}>{draft.tenant}</span></p><p>Owner: {draft.ownerEmail}<br />Source: {selected.label}</p><p className={styles.notice}>{demo ? "This fictional owner is a test fixture. No identity check or live account creation happens." : "Saving checks the existing verified owner account. It creates a private draft and does not grant portal access, publish a menu or send an invitation."}</p><label className={styles.check}><input name="confirmed" type="checkbox" required />I checked the business, location and proposed owner.</label></section> : null}
    <p ref={errorRef} tabIndex={-1} role={error ? "alert" : undefined} className={error ? styles.error : undefined}>{error}</p>
    {!enabled ? <p className={styles.notice}>Account staging is prepared locally and has not been released.</p> : null}
    <div className={styles.actions}><button className={styles.button} disabled={pending || !enabled} type="submit">{pending ? "Saving…" : review ? demo ? "Create test account draft" : "Save private account draft" : "Review account draft"}</button>{review ? <button className={styles.secondary} type="button" onClick={() => setReview(false)}>Edit account details</button> : null}</div>
  </form>;
}
