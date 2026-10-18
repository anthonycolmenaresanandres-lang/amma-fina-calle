import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminContext } from "@/lib/admin/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { QUEUE_UUID } from "@/lib/owner/queue/client";
import AccountSync, { type Candidate } from "@/components/accounts/AccountSync";
import styles from "@/components/accounts/AccountWorkspace.module.css";
import AdminGate from "../../AdminGate";
export const dynamic = "force-dynamic";
export const metadata = { title: "Account staging | Fina Calle OS", robots: { index: false, follow: false } };
export default async function AccountStagingPage({ params }: { params: Promise<{ candidateId: string }> }) {
  const admin = await getAdminContext(); if (admin.state !== "authorized") return <AdminGate ctx={admin} />;
  if (!admin.canManageTeam || process.env.ACCOUNT_STAGING_ENABLED !== "true") notFound();
  const { candidateId } = await params; if (!QUEUE_UUID.test(candidateId)) notFound();
  const client = await createServerSupabase();
  const result = await client?.rpc("get_account_candidate_v1", { p_id: candidateId });
  if (!result || result.error || !result.data) notFound();
  return <main className={styles.workspace}><nav className={styles.nav}><Link href="/customers">← Customer accounts</Link><span>Private staging</span></nav><p className={styles.eyebrow}>New business</p><h1>Connect the menu.</h1><AccountSync account={result.data as Candidate} /></main>;
}
