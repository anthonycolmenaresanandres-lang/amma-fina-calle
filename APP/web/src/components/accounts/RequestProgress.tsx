"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acknowledgeQueuedOwnerRequest } from "@/lib/owner/queue/actions";
import { REQUEST_STATUS, canConfirmRequest, canRequestRollback, requestValue, requestEventLabel, type RequestProgress as Progress } from "@/lib/owner/queue/progress";
import styles from "./AccountWorkspace.module.css";
const date = (s: string) => new Date(s).toLocaleString("en-US", { timeZone: "UTC" }) + " UTC";
export default function RequestProgress({ request, demo = false }: { request: Progress; demo?: boolean }) {
  const [message, setMessage] = useState(""); const [pending, startTransition] = useTransition(); const router = useRouter();
  const [demoAction, setDemoAction] = useState<"confirm" | "rollback" | null>(null);
  const run = (action: "confirm" | "rollback") => startTransition(async () => {
    if (demo) { setDemoAction(action); setMessage(action === "confirm" ? "Test request acknowledged in this browser only." : "Test rollback requested. No live menu changed."); return; }
    const result = await acknowledgeQueuedOwnerRequest(request.restaurant_id, request.id, action); setMessage(result.message); if (result.ok) router.refresh();
  });
  return <>
    <p className={styles.receipt}>{request.reference_id}<br />{request.id}</p>
    <h2>{demoAction === "confirm" ? "Test completion acknowledged" : demoAction === "rollback" ? "Test rollback requested" : REQUEST_STATUS[request.status]}</h2>
    <h3>{request.item_name ? `Requested item: ${request.item_name}` : request.item_id ? "Menu item" : "General review request"}</h3>{request.item_id ? <p className={styles.receipt}>Item {request.item_id}</p> : null}
    <p className={styles.muted}>{request.change_type.replaceAll("_", " ")} · Received {date(request.created_at)}</p>
    <div className={styles.pair}><div><small>Before</small><p>{requestValue(request.change_type, request.before)}</p></div><div><small>Requested</small><p>{requestValue(request.change_type, request.after)}</p></div></div>
    <section className={styles.section}><h3>Request history</h3><ol className={styles.timeline}>{request.events.map((event, i) => <li key={`${event.at}-${i}`}>{requestEventLabel(event.type)}<time dateTime={event.at}>{date(event.at)}</time></li>)}</ol>
      <p className={styles.muted}>History shows the saved state. A completed change needs guest-menu verification and your confirmation.</p>
    </section>
    <section className={styles.section}><h3>Notification delivery</h3>{request.delivery.length ? <ul>{request.delivery.map((d, i) => <li key={i}>{d.status === "sent" ? "Accepted by the email provider" : d.status === "dead_letter" ? "Delivery stopped · staff review needed" : d.status === "retry_wait" ? `Retry pending · ${date(d.next_attempt_at)}` : d.status === "leased" ? "Delivery attempt in progress" : "Waiting for an enabled notification worker"} · Attempt {d.attempt} of 6</li>)}</ul> : <p>No notification delivery is recorded.</p>}<p className={styles.muted}>Email acceptance does not mean a person or assistant has read the request.</p></section>
    {!demoAction && canConfirmRequest(request) ? <form key={`${request.id}:${request.status}`} onSubmit={e => { e.preventDefault(); run("confirm"); }}><label className={styles.check}><input type="checkbox" required name="confirm" />I checked the guest menu and confirm this result.</label><button className={styles.button} disabled={pending} type="submit">{demo ? "Confirm test result" : "Confirm the result"}</button></form> : null}
    {!demoAction && canRequestRollback(request) ? <details className={styles.section}><summary>Request the previous value</summary><form onSubmit={e => { e.preventDefault(); run("rollback"); }}><p>The previous value can only be restored if the item has not changed again. The restored menu must be verified.</p><label className={styles.check}><input type="checkbox" required name="rollback" />I want the previous value restored for this request.</label><button className={styles.secondary} type="submit" disabled={pending}>{demo ? "Request test rollback" : "Request rollback review"}</button></form></details> : null}
    <p role="status" aria-live="polite" className={message ? styles.notice : undefined}>{pending ? "Confirming…" : message}</p>
  </>;
}
