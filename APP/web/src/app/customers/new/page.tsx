import Link from "next/link";
import { getAdminContext } from "@/lib/admin/auth";
import AdminGate from "../AdminGate";
import AccountForm from "@/components/accounts/AccountForm";
import { createServerSupabase } from "@/lib/supabase/server";
import { QUEUE_UUID } from "@/lib/owner/queue/client";
import styles from "@/components/accounts/AccountWorkspace.module.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Add account | Fina Calle OS", robots: { index: false, follow: false } };
export default async function NewAccountPage() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") return <AdminGate ctx={admin} />;
  if (!admin.canManageTeam) return <main className={styles.workspace}><Link href="/customers">Customer accounts</Link><h1>Account manager required</h1><p>Ask the authorized account manager to add a business.</p></main>;
  const enabled = process.env.ACCOUNT_STAGING_ENABLED === "true";
  const client = enabled ? await createServerSupabase() : null;
  const recent = await client?.rpc("list_account_candidates_v1");
  const drafts: { id: string; business_name: string; sync_status: string }[] | null = recent && !recent.error && Array.isArray(recent.data) && recent.data.length <= 25 && recent.data.every((a: { id: string; business_name: string; sync_status: string }) => a && QUEUE_UUID.test(a.id) && typeof a.business_name === "string" && typeof a.sync_status === "string") ? recent.data : null;
  return <main className={styles.workspace}><a href="#account-form" className={styles.skip}>Skip to account form</a><nav className={styles.nav}><Link href="/customers">← Customer accounts</Link><span>Fina Calle OS · Staff</span></nav><p className={styles.eyebrow}>New business</p><h1>Add an account.</h1><p className={styles.lede}>Start with the business identity, verified owner and menu source. Review everything before saving a private account draft.</p><div id="account-form"><AccountForm enabled={enabled} /></div>{enabled ? <section className={styles.section}><h2>Recent account drafts</h2>{drafts ? drafts.length ? <ul className={styles.list}>{drafts.map(a => <li key={a.id}><Link href={`/customers/onboarding/${a.id}`}>{a.business_name}</Link><p>{a.sync_status.replaceAll("_", " ")}</p></li>)}</ul> : <p>No private account drafts yet.</p> : <p>The draft list could not be confirmed. Keep your account receipt and refresh.</p>}<small>Latest 25 drafts. Private drafts appear here before any approved promotion to the customer registry.</small></section> : null}</main>;
}
