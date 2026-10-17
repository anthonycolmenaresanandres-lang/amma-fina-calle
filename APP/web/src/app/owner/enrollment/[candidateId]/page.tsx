import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { QUEUE_UUID } from "@/lib/owner/queue/client";
import AccountSync, { type Candidate } from "@/components/accounts/AccountSync";
import EnrollmentLogin from "./EnrollmentLogin";
import styles from "@/components/accounts/AccountWorkspace.module.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Owner association | Fina Calle", robots: { index: false, follow: false } };
export default async function EnrollmentPage({ params }: { params: Promise<{ candidateId: string }> }) {
  if (process.env.ACCOUNT_STAGING_ENABLED !== "true") notFound();
  const { candidateId } = await params; if (!QUEUE_UUID.test(candidateId)) notFound();
  const client = await createServerSupabase(); if (!client) notFound();
  const { data: { user } } = await client.auth.getUser();
  return <main className={styles.workspace}><nav className={styles.nav}><Link href="/">Fina Calle</Link><span>Owner review</span></nav><p className={styles.eyebrow}>Private account setup</p><h1>Review your business.</h1>{!user ? <EnrollmentLogin /> : await (async () => {
    const result = await client.rpc("get_account_candidate_v1", { p_id: candidateId });
    // An existing staff session must not masquerade as this tenant's owner.
    if (result.error || !result.data || result.data.owner_email !== user.email?.toLowerCase()) return <p>This business association is unavailable for this signed-in account. Use the verified owner account.</p>;
    return <AccountSync account={result.data as Candidate} owner />;
  })()}</main>;
}
