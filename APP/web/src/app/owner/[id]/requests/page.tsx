import Link from "next/link";
import { notFound } from "next/navigation";
import { getOwnerContext } from "@/lib/owner/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { ownerQueueEnabled, QUEUE_UUID } from "@/lib/owner/queue/client";
import { REQUEST_STATUS, readRequestSummary, type RequestSummary } from "@/lib/owner/queue/progress";
import { ownerQueueSourceAssessment } from "@/lib/owner/queue/sources";
import ItemRequestForm, { type RequestItem } from "@/components/accounts/ItemRequestForm";
import styles from "@/components/accounts/AccountWorkspace.module.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your requests | Fina Calle", robots: { index: false, follow: false } };
export default async function OwnerRequestsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ before?: string }> }) {
  const { id } = await params; if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 80) notFound();
  const owner = await getOwnerContext(id);
  const shell = (children: React.ReactNode) => <main className={styles.workspace}><nav className={styles.nav}><Link href={`/owner/${id}`}>← Owner desk</Link><span>Fina Calle · Requests</span></nav><p className={styles.eyebrow}>Your business</p><h1>Your requests.</h1>{children}</main>;
  if (owner.state !== "authorized") return shell(<p>Sign in through your <Link href={id === "bodega" ? "/owner/bodega/billing" : `/owner/${id}`}>owner desk</Link> with the authorized account, then return here.</p>);
  if (!ownerQueueEnabled()) return shell(<p className={styles.notice}>Request tracking has not been released yet. Use the existing request desk for reviewed assistance.</p>);
  const { before } = await searchParams; if (before && !QUEUE_UUID.test(before)) notFound();
  const client = await createServerSupabase();
  const [list, menu] = await Promise.all([client?.rpc("list_owner_requests_v1", { p_restaurant_id: id, p_before: before ?? null }), client?.rpc("get_owner_request_items_v1", { p_restaurant_id: id })]);
  const entries: (RequestSummary | null)[] | null = Array.isArray(list?.data?.requests) ? list.data.requests.map((r: unknown) => readRequestSummary(r, id)) : null;
  const listValid = !!list && !list.error && entries && entries.length <= 25 && entries.every(Boolean);
  const source = ownerQueueSourceAssessment(id);
  const items: RequestItem[] | null = menu && !menu.error && Array.isArray(menu.data) && menu.data.length <= 200 && menu.data.every((i: RequestItem) => i && QUEUE_UUID.test(i.id) && typeof i.name === "string" && i.name.length <= 120 && typeof i.available === "boolean" && Number.isSafeInteger(i.version) && i.version >= 0 && Number.isInteger(i.order)) ? menu.data : null;
  return shell(<>
    <p className={styles.lede}>Track requests submitted by your signed-in owner account. Request text is reviewed data; it does not grant permission to change your business.</p>
    <p className={styles.notice}>{source.reason} Automatic changes require a certified source and your business’s explicit enrollment.</p>
    <details className={styles.section}><summary>Request an item change</summary><div className={styles.section}>{items ? <ItemRequestForm tenant={id} items={items} /> : <p>The item list could not be confirmed. Refresh or ask Fina Calle to review the menu source.</p>}</div></details>
    <section className={styles.section} aria-labelledby="saved-requests"><h2 id="saved-requests">Saved requests</h2>
      {!listValid ? <p className={styles.error}>The queue could not confirm your request history. Refresh before assuming a request is missing.</p> : entries.length === 0 ? <p>No requests from this owner account are saved in this queue.</p> : <ul className={styles.list}>{entries.map(r => r && <li key={r.id}><p className={styles.receipt}>{r.reference_id}</p><h2><Link href={`/owner/${id}/requests/${r.id}`}>{REQUEST_STATUS[r.status]}</Link></h2><p>{r.change_type.replaceAll("_", " ")} · {new Date(r.created_at).toLocaleString("en-US", { timeZone: "UTC" })} UTC</p></li>)}</ul>}
      {listValid && typeof list.data.next_cursor === "string" && QUEUE_UUID.test(list.data.next_cursor) ? <Link href={`/owner/${id}/requests?before=${list.data.next_cursor}`}>Older requests →</Link> : null}
    </section>
  </>);
}
