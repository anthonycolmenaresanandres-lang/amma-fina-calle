"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { queueStructuredOwnerRequest } from "@/lib/owner/queue/actions";
import styles from "./AccountWorkspace.module.css";
export type RequestItem = { id: string; name: string; available: boolean; order: number; version: number };
export default function ItemRequestForm({ tenant, items }: { tenant: string; items: RequestItem[] }) {
  const [itemId, setItemId] = useState(items[0]?.id ?? ""); const [type, setType] = useState<"availability" | "display_order" | "name_typo">("availability");
  const [value, setValue] = useState("false"); const [brief, setBrief] = useState(""); const [preview, setPreview] = useState(false); const [error, setError] = useState("");
  const [pending, startTransition] = useTransition(); const key = useRef<string | null>(null); const router = useRouter();
  const item = items.find(i => i.id === itemId);
  function invalidate() { setPreview(false); key.current = null; setError(""); }
  if (!item) return <p>No requestable database items are available. Ask Fina Calle to review the menu source.</p>;
  const proposed = type === "availability" ? value === "true" : type === "display_order" ? Number(value) : value;
  const before = type === "availability" ? item.available ? "Available" : "Sold out" : type === "display_order" ? `Position ${item.order}` : item.name;
  const after = type === "availability" ? proposed ? "Available" : "Sold out" : type === "display_order" ? `Position ${proposed}` : value;
  return <form onSubmit={e => { e.preventDefault(); if (!preview) { setPreview(true); return; } startTransition(async () => {
    key.current ??= crypto.randomUUID(); const result = await queueStructuredOwnerRequest({ restaurantId: tenant, clientKey: key.current, changeType: type, itemId: item.id, expectedVersion: item.version, afterValue: proposed, brief, confirmed: true });
    if (!result.ok) setError(result.message); else router.push(`/owner/${tenant}/requests/${result.receipt.id}`);
  }); }}>
    <label className={styles.field}><span>Menu item</span><select name="item" value={itemId} onChange={e => { setItemId(e.target.value); invalidate(); }}>{items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
    <label className={styles.field}><span>Change</span><select name="change" value={type} onChange={e => { const t = e.target.value as typeof type; setType(t); setValue(t === "availability" ? "false" : t === "display_order" ? "0" : item.name); invalidate(); }}><option value="availability">Availability</option><option value="display_order">Display position</option>{tenant !== "bodega" ? <option value="name_typo">Name typo · separate review</option> : null}</select></label>
    <label className={styles.field}><span>Requested value</span>{type === "availability" ? <select name="value" value={value} onChange={e => { setValue(e.target.value); invalidate(); }}><option value="false">Sold out</option><option value="true">Available</option></select> : <input name="value" autoComplete="off" type={type === "display_order" ? "number" : "text"} min={type === "display_order" ? 0 : undefined} max={type === "display_order" ? 10000 : undefined} maxLength={120} required value={value} onChange={e => { setValue(e.target.value); invalidate(); }} />}</label>
    <label className={styles.field}><span>Reason or context</span><textarea name="brief" autoComplete="off" required maxLength={4000} value={brief} onChange={e => { setBrief(e.target.value); invalidate(); }} /></label>
    {preview ? <section className={styles.section}><h3>Confirm one item request</h3><p>{item.name} · Revision {item.version}</p><div className={styles.pair}><div><small>Before</small><p>{before}</p></div><div><small>Requested</small><p>{after}</p></div></div><p>Saving creates a request for review. Execution needs the business’s approved policy and a certified menu source.</p><label className={styles.check}><input type="checkbox" name="confirmed" required />I confirm this item and requested value.</label></section> : null}
    <p role="status" aria-live="polite" className={error ? styles.error : undefined}>{error}</p><button className={styles.button} disabled={pending} type="submit">{pending ? "Saving request…" : preview ? "Send confirmed request" : "Preview item request"}</button>
  </form>;
}
