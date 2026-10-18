"use client";
import { useRef, useState } from "react";
import AccountForm from "@/components/accounts/AccountForm";
import ImportPreview from "@/components/accounts/ImportPreview";
import RequestProgress from "@/components/accounts/RequestProgress";
import { DEMO_ACCOUNT, DEMO_MENU } from "@/lib/accounts/fixtures";
import { parseSnapshot, planImport, snapshotDigest, stageReviewedPlan, type ImportPlan, type StagedMenu } from "@/lib/accounts/import";
import type { RequestProgress as Progress } from "@/lib/owner/queue/progress";
import styles from "@/components/accounts/AccountWorkspace.module.css";
const DEMO_REQUEST: Progress = { id: "00000000-0000-4000-8000-000000000101", restaurant_id: DEMO_ACCOUNT.tenant, item_id: "00000000-0000-4000-8000-000000000102", item_name: "House coffee · 12 oz", reference_id: "AMMA-DEMO-A1B2C3D4", status: "awaiting_owner_ack", change_type: "availability", created_at: "2026-10-17T12:00:00Z", before: true, after: false, owner_acknowledged_at: null, events: [{ type: "received", at: "2026-10-17T12:00:00Z" }, { type: "approved", at: "2026-10-17T12:05:00Z" }, { type: "awaiting_verification", at: "2026-10-17T12:06:00Z" }, { type: "awaiting_owner_ack", at: "2026-10-17T12:07:00Z" }], delivery: [{ status: "retry_wait", attempt: 1, next_attempt_at: "2026-10-17T12:10:00Z" }] };
export default function AccountPreviewWorkspace() {
  const [created, setCreated] = useState(false); const [owner, setOwner] = useState(false);
  const [current, setCurrent] = useState<StagedMenu>({ revision: 0, snapshot: null }); const currentRef = useRef(current);
  const [json, setJson] = useState(JSON.stringify(DEMO_MENU, null, 2)); const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [digest, setDigest] = useState(""); const [approved, setApproved] = useState(""); const [error, setError] = useState(""); const [status, setStatus] = useState(""); const [lastStaged, setLastStaged] = useState(""); const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<"account" | "request">("account");
  function updateCurrent(next: StagedMenu) { currentRef.current = next; setCurrent(next); }
  async function previewMenu() { setPending(true); setApproved(""); setError(""); try { const next = planImport(parseSnapshot(json, DEMO_ACCOUNT.tenant), currentRef.current); const hash = await snapshotDigest(next.snapshot); setPlan(next); setDigest(hash); setStatus("Test preview ready for owner review."); } catch (e) { setPlan(null); setError(e instanceof Error ? e.message : "Check the menu snapshot."); } finally { setPending(false); } }
  return <main className={styles.workspace}>
    <a href="#preview-main" className={styles.skip}>Skip to preview</a>
    <nav className={styles.nav}><span>Fina Calle OS</span><span>Local preview · Fictional data</span></nav>
    <p className={styles.eyebrow}>Account setup / Owner requests</p><h1>A clear start.<br />A traceable change.</h1><p className={styles.lede}>Try adding a business, reviewing its menu and confirming a request. Everything stays in this browser’s memory. Refresh to reset.</p>
    <div className={styles.actions} role="group" aria-label="Preview workspace"><button className={tab === "account" ? styles.button : styles.secondary} onClick={() => setTab("account")} aria-pressed={tab === "account"}>Add account &amp; sync</button><button className={tab === "request" ? styles.button : styles.secondary} onClick={() => setTab("request")} aria-pressed={tab === "request"}>Owner request progress</button></div>
    <div id="preview-main" className={styles.section}>
      {tab === "request" ? <><p className={styles.notice}>Synthetic request history. Buttons simulate confirmation or rollback locally. No live queue, provider or assistant receives anything.</p><RequestProgress request={DEMO_REQUEST} demo /></> : !created ? <><h2>Add an account</h2><AccountForm enabled demo onDemoCreated={(draft) => { setCreated(true); setJson(JSON.stringify({ ...DEMO_MENU, source: draft.source }, null, 2)); }} /></> : <>
        <p className={styles.receipt}>TEST-ACCOUNT-001 · {DEMO_ACCOUNT.tenant}</p><h2>{DEMO_ACCOUNT.businessName}</h2><p>{DEMO_ACCOUNT.location}<br />{DEMO_ACCOUNT.ownerEmail}</p>
        <dl className={styles.summary}><div><dt>Owner association</dt><dd>{owner ? "Test owner accepted" : "Awaiting test owner"}</dd></div><div><dt>Last successful live sync</dt><dd>Never · No live connection</dd></div><div><dt>Private revision</dt><dd>{current.revision}</dd></div><div><dt>Last test staging</dt><dd>{lastStaged || "Never"}</dd></div></dl>
        {!owner ? <button className={styles.secondary} onClick={() => setOwner(true)}>Simulate owner acceptance</button> : null}
        <section className={styles.section}><h2>Preview a menu import</h2><label className={styles.field}><span>Menu snapshot JSON</span><textarea name="testSnapshot" autoComplete="off" spellCheck={false} value={json} onChange={e => { setJson(e.target.value); setPlan(null); setApproved(""); setError(""); }} /></label><p className={styles.muted}>Keep source IDs when renaming an item. Try removing an item: it will be retained. A missing or duplicate ID stops the preview.</p><button className={styles.button} disabled={pending} onClick={previewMenu}>{pending ? "Checking…" : "Preview test menu"}</button></section>
        {plan ? <><ImportPreview plan={plan} /><p className={styles.receipt}>Preview SHA-256 {digest}</p><form key={`${digest}:${plan.expectedRevision}`} onSubmit={e => { e.preventDefault(); setApproved(digest); setStatus("Exact test menu approved. Staging remains private."); }}><label className={styles.check}><input name="testApproval" type="checkbox" required disabled={!owner} />Simulate the owner reviewing every item, category, price and description.</label><button type="submit" className={styles.secondary} disabled={!owner}>Simulate exact menu approval</button></form><div className={styles.actions}><button className={styles.button} disabled={!owner || !approved || pending} onClick={async () => { setPending(true); try { const next = await stageReviewedPlan(plan, currentRef.current, approved); updateCurrent(next); setLastStaged(new Date().toLocaleTimeString("en-US", { timeZone: "UTC" }) + " UTC"); setStatus("Test menu staged privately. Live publication still pending."); setPlan(null); setApproved(""); } catch(e) { setError(e instanceof Error ? e.message : "Preview again."); } finally { setPending(false); } }}>Stage test menu privately</button><button className={styles.secondary} disabled={pending} onClick={() => { updateCurrent({ ...currentRef.current, revision: currentRef.current.revision + 1 }); setStatus("Simulated another edit. This preview is now stale."); }}>Simulate a competing edit</button></div></> : null}
        <p role="alert" className={error ? styles.error : undefined}>{error}</p><p role="status" aria-live="polite" className={status ? styles.notice : undefined}>{status}</p>
      </>}
    </div>
  </main>;
}
