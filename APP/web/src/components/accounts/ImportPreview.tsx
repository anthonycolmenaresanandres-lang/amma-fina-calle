import type { ImportPlan, MenuItem } from "@/lib/accounts/import";
import styles from "./AccountWorkspace.module.css";
const money = (cents: number | null) => cents === null ? "Price unlisted" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
function Item({ item }: { item: MenuItem | null }) {
  if (!item) return <p>New item</p>;
  return <><p>{item.name}</p><p>{money(item.priceCents)} · {item.available ? "Available" : "Sold out"} · Position {item.order}</p><p>{item.description || "No description"}</p><small>Category: {item.categoryId}</small></>;
}
export default function ImportPreview({ plan }: { plan: ImportPlan }) {
  return <section className={styles.section} aria-labelledby="import-preview-heading">
    <h2 id="import-preview-heading">Review the menu changes</h2>
    <p className={styles.muted}>Source version {plan.sourceVersion} · Account revision {plan.expectedRevision}. Every change needs owner review. Missing items stay in place.</p>
    <dl className={styles.summary}><div><dt>New items</dt><dd>{plan.changes.filter(c => c.kind === "add").length}</dd></div><div><dt>Updated items</dt><dd>{plan.changes.filter(c => c.kind === "update").length}</dd></div><div><dt>Retained items</dt><dd>{plan.changes.filter(c => c.kind === "retain").length}</dd></div></dl>
    {plan.categoryChanges.map(c => <p key={c.sourceId}>Category {c.sourceId}: {c.before ?? "New"} → {c.after} <small>Owner review</small></p>)}
    {plan.changes.length === 0 && plan.categoryChanges.length === 0 ? <p>No menu changes in this snapshot.</p> : null}
    {plan.changes.map(change => <article className={styles.delta} key={change.sourceId}>
      <header><h3>{change.after.name}</h3><span className={styles.tag}>{change.kind === "retain" ? "Retained · absent from import" : change.review.replaceAll("_", " ")}</span></header>
      <p className={styles.receipt}>{change.sourceId}</p>
      <div className={styles.pair}><div><small>Before</small><Item item={change.before} /></div><div><small>After</small><Item item={change.after} /></div></div>
    </article>)}
    <p className={styles.notice}>Staging keeps a private copy. Guest menus, prices, owner access and automatic changes need a separate approved release.</p>
  </section>;
}
