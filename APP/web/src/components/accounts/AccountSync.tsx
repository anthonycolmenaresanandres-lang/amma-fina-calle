"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptAccountCandidate, approveAccountMenu, prepareAccountMenu, stageAccountMenu } from "@/lib/accounts/actions";
import { parseSnapshot, planImport, type MenuSnapshot } from "@/lib/accounts/import";
import ImportPreview from "./ImportPreview";
import styles from "./AccountWorkspace.module.css";
export type Candidate = { id: string; tenant: string; business_name: string; location: string; owner_email: string; owner_accepted_at: string | null; source: "manual-json-v1" | "bodega-static-v1"; revision: number; snapshot: MenuSnapshot | null; sync_status: string; last_attempt_at: string | null; last_staged_at: string | null; last_success_at: null; plans: { id: string; expected_revision: number; snapshot: MenuSnapshot; digest: string; owner_approved_at: string | null; staged_at: string | null; expires_at: string }[] };
const date = (s: string | null) => s ? new Date(s).toLocaleString("en-US", { timeZone: "UTC" }) + " UTC" : "Never";
export default function AccountSync({ account, owner = false }: { account: Candidate; owner?: boolean }) {
  const template: MenuSnapshot = { tenant: account.tenant, source: account.source, version: "draft-1", currency: "USD", categories: [{ sourceId: "category-001", name: "Menu" }], items: [{ sourceId: "item-001", categoryId: "category-001", name: "Example item", description: "", priceCents: null, available: true, order: 0 }] };
  const [json, setJson] = useState(JSON.stringify(account.snapshot ?? template, null, 2));
  const [message, setMessage] = useState(""); const [pending, startTransition] = useTransition();
  const key = useRef<string | null>(null); const router = useRouter();
  const saved = account.plans[0];
  let preview; let previewError = "";
  try { preview = saved && !saved.staged_at ? planImport(saved.snapshot, { revision: saved.expected_revision, snapshot: account.snapshot }) : undefined; } catch { previewError = "This preview cannot be reconstructed. Ask the account manager to refresh it."; }
  const run = (action: () => Promise<{ ok: boolean; message: string }>) => startTransition(async () => { const result = await action(); setMessage(result.message); if (result.ok) { key.current = null; router.refresh(); } });
  return <>
    <p className={styles.receipt}>Account draft {account.id}</p>
    <p>{account.business_name}<br />{account.location}</p>
    <dl className={styles.summary}><div><dt>Owner association</dt><dd>{account.owner_accepted_at ? "Accepted for staging" : "Awaiting owner acceptance"}</dd></div><div><dt>Menu status</dt><dd>{account.sync_status.replaceAll("_", " ")}</dd></div><div><dt>Last successful live sync</dt><dd>{date(account.last_success_at)}</dd></div><div><dt>Last prepared preview</dt><dd>{date(account.last_attempt_at)}</dd></div><div><dt>Last private staging</dt><dd>{date(account.last_staged_at)}</dd></div><div><dt>Account revision</dt><dd>{account.revision}</dd></div></dl>
    <p className={styles.notice}>Source: {account.source}. Live publication and automatic changes are not connected. Staging does not add the account to the public menu registry or grant portal access.</p>
    {owner && !account.owner_accepted_at ? <form className={styles.section} onSubmit={e => { e.preventDefault(); run(() => acceptAccountCandidate(account.id, true)); }}><h2>Accept this business association</h2><p>Verified owner account: {account.owner_email}</p><label className={styles.check}><input name="accept" type="checkbox" required />I represent this business and accept reviewing its menu in this private staging area.</label><button type="submit" className={styles.button} disabled={pending}>Accept owner association</button></form> : null}
    {!owner ? <section className={styles.section}><h2>Prepare a menu import</h2><p>Keep each item and variant’s source ID stable across imports. Missing items stay in place. Prices and descriptions require the owner’s review.</p><label className={styles.field}><span>Menu snapshot JSON</span><textarea name="snapshot" spellCheck={false} autoComplete="off" value={json} onChange={e => { setJson(e.target.value); key.current = null; }} /></label><button className={styles.button} disabled={pending} onClick={() => {
      try { planImport(parseSnapshot(json, account.tenant), { revision: account.revision, snapshot: account.snapshot }); } catch (error) { setMessage(error instanceof Error ? error.message : "Check the menu template."); return; }
      key.current ??= crypto.randomUUID(); run(() => prepareAccountMenu(account.id, key.current!, account.revision, json));
    }}>Save preview for owner review</button><p><a href={`/owner/enrollment/${account.id}`}>Owner review page</a> · The owner signs in with their own existing account.</p></section> : null}
    {previewError ? <p className={styles.error}>{previewError}</p> : null}
    {preview ? <ImportPreview plan={preview} /> : null}
    {saved ? <section className={styles.section}><h2>{saved.staged_at ? "Menu staged privately" : "Exact menu approval"}</h2><p className={styles.receipt}>Preview {saved.id}<br />SHA-256 {saved.digest}</p><p>Expires: {date(saved.expires_at)}<br />Owner approval: {date(saved.owner_approved_at)}</p>
      {owner && !saved.staged_at && preview ? <form key={saved.id} onSubmit={e => { e.preventDefault(); run(() => approveAccountMenu(saved.id, saved.digest, true)); }}><label className={styles.check}><input name="approve" type="checkbox" required />I reviewed every item, category, price and description in this exact preview.</label><button className={styles.button} disabled={pending || !account.owner_accepted_at}>Approve this menu for staging</button></form> : null}
      {!owner && !saved.staged_at && preview ? <button className={styles.button} disabled={pending || !saved.owner_approved_at} onClick={() => run(() => stageAccountMenu(saved.id, saved.digest))}>Stage approved menu privately</button> : null}
    </section> : null}
    <p role="status" aria-live="polite" className={message ? styles.notice : undefined}>{pending ? "Checking…" : message}</p>
  </>;
}
