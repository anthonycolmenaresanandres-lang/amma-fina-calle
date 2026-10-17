import Link from "next/link";
import { notFound } from "next/navigation";
import { getOwnerContext } from "@/lib/owner/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { ownerQueueEnabled, QUEUE_UUID } from "@/lib/owner/queue/client";
import { readRequestProgress } from "@/lib/owner/queue/progress";
import RequestProgress from "@/components/accounts/RequestProgress";
import styles from "@/components/accounts/AccountWorkspace.module.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Request progress | Fina Calle", robots: { index: false, follow: false } };
export default async function OwnerRequestPage({ params }: { params: Promise<{ id: string; requestId: string }> }) {
  const { id, requestId } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 80 || !QUEUE_UUID.test(requestId)) notFound();
  const shell = (children: React.ReactNode) => <main className={styles.workspace}><nav className={styles.nav}><Link href={`/owner/${id}/requests`}>← Your requests</Link><span>Fina Calle · Owner</span></nav><p className={styles.eyebrow}>Request progress</p><h1>Every step, recorded.</h1>{children}</main>;
  if ((await getOwnerContext(id)).state !== "authorized") return shell(<p><Link href={id === "bodega" ? "/owner/bodega/billing" : `/owner/${id}`}>Sign in with the authorized owner account</Link>, then return to this request.</p>);
  if (!ownerQueueEnabled()) return shell(<p className={styles.notice}>Request tracking has not been released yet.</p>);
  const client = await createServerSupabase(); const result = await client?.rpc("get_owner_request_v1", { p_id: requestId });
  if (!result || result.error) return shell(<p className={styles.error}>Request progress could not be confirmed. Refresh before retrying an action.</p>);
  const request = readRequestProgress(result.data, id); if (!request) notFound();
  return shell(<RequestProgress request={request} />);
}
