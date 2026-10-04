import Link from "next/link";
import { getAdminContext } from "@/lib/admin/auth";
import AdminGate from "../AdminGate";
import { TableVisitsDesk } from "./TableVisitsDesk";

export const dynamic = "force-dynamic";
export const metadata = { title: "Maracaibo table visits", robots: { index: false, follow: false } };
export default async function TableVisitsPage() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") return <AdminGate ctx={admin} />;
  return <main className="mx-auto min-h-dvh max-w-3xl px-5 py-10 text-[#f5f5f1]">
    <Link href="/customers" className="inline-flex min-h-11 items-center text-sm text-[#b6b6b0]">← Customer accounts</Link>
    <h1 className="mt-6 text-4xl font-semibold tracking-tight">Maracaibo tables</h1>
    <p className="mt-4 leading-7 text-[#b6b6b0]">Reset a table when its guests leave. Their game sessions end, and the next party starts a fresh visit.</p>
    <p className="mt-2 text-sm leading-6 text-[#b6b6b0]">Visits expire after 30 minutes without activity, with a four-hour maximum. Table payment is not connected.</p>
    <TableVisitsDesk />
  </main>;
}
