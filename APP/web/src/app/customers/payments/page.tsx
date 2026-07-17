import Link from "next/link";
import { BadgeDollarSign, Building2, Check, ShieldCheck, X } from "lucide-react";
import { getAdminContext } from "@/lib/admin/auth";
import { reviewPaymentNotice } from "@/lib/admin/payment-actions";
import { getAdminPaymentNotices } from "@/lib/admin/payments";
import {
  Button,
  Eyebrow,
  Lede,
  PageShell,
  PageTitle,
  Panel,
  SectionHeading,
  SignOutButton,
  StatusPill,
  TopBar,
  type PillTone,
} from "@/components/ui";
import AdminGate from "../AdminGate";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Payment Review | Fina Calle OS",
  description: "Private AMMA Zelle payment reconciliation inbox.",
};

function money(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

function timestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

const tones: Record<string, PillTone> = {
  reported: "accent",
  verified: "success",
  rejected: "danger",
};

export default async function PaymentReviewPage() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") return <AdminGate ctx={admin} />;
  const notices = await getAdminPaymentNotices();
  const pendingCount = notices.filter((notice) => notice.status === "reported").length;

  return (
    <PageShell>
      <TopBar backHref="/customers" backLabel="Client Ledger">
        <SignOutButton />
      </TopBar>
      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-14">
        <div className="lg:sticky lg:top-10">
          <Eyebrow>AMMA Billing</Eyebrow>
          <PageTitle>Payment Review</PageTitle>
          <Lede>Match each owner-reported Zelle payment to the Bank of America deposit before changing its status.</Lede>
          <p className="mt-6 text-[0.7rem] uppercase tracking-[0.24em] text-[#cfd6da]/56">
            {pendingCount} awaiting review
          </p>
        </div>

        <Panel>
          <SectionHeading tone="accent" icon={<BadgeDollarSign size={13} aria-hidden />} hint={`${notices.length} reports`}>
            Reconciliation inbox
          </SectionHeading>
          {!admin.canManageBilling ? (
            <p className="mt-4 rounded-xl border border-[#d8b36d]/25 bg-[#d8b36d]/8 p-3 text-sm leading-6 text-[#f4d99c]">
              You can view the queue. Only the AMMA billing manager can verify or reject reports.
            </p>
          ) : null}
          {notices.length === 0 ? (
            <p className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm leading-6 text-[#8f9aa1]">
              Payment reports appear after migration 0012 is reviewed and applied.
            </p>
          ) : (
            <div className="mt-5 grid gap-3">
              {notices.map((notice) => (
                <article key={notice.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-[#eef2f4]">{notice.businessName}</h2>
                        <StatusPill tone={tones[notice.status] ?? "neutral"} dot>{notice.status}</StatusPill>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#7f8a91]">
                        <Building2 size={11} aria-hidden />
                        <Link href={`/customers/${notice.restaurantId}`} className="hover:text-white">#{notice.restaurantId}</Link>
                      </p>
                    </div>
                    <p className="text-xl font-semibold text-[#f4f6f7]">{money(notice.amountCents, notice.currency)}</p>
                  </div>
                  <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div><dt className="text-xs uppercase tracking-[0.12em] text-[#7f8a91]">Reference</dt><dd className="mt-1 break-all text-[#bfdcff]">{notice.referenceId}</dd></div>
                    <div><dt className="text-xs uppercase tracking-[0.12em] text-[#7f8a91]">Reported</dt><dd className="mt-1 text-[#aeb7bd]">{timestamp(notice.reportedAt)}</dd></div>
                    <div><dt className="text-xs uppercase tracking-[0.12em] text-[#7f8a91]">Owner</dt><dd className="mt-1 break-all text-[#aeb7bd]">{notice.ownerEmail}</dd></div>
                    <div><dt className="text-xs uppercase tracking-[0.12em] text-[#7f8a91]">Owner note</dt><dd className="mt-1 break-words text-[#aeb7bd]">{notice.ownerNote || "None"}</dd></div>
                  </dl>
                  {notice.status === "reported" && admin.canManageBilling ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">
                      <form action={reviewPaymentNotice.bind(null, notice.id, "verified")}>
                        <Button type="submit" variant="success"><Check size={13} aria-hidden /> Verify deposit</Button>
                      </form>
                      <form action={reviewPaymentNotice.bind(null, notice.id, "rejected")}>
                        <Button type="submit" variant="danger"><X size={13} aria-hidden /> Reject report</Button>
                      </form>
                    </div>
                  ) : notice.reviewedAt ? (
                    <p className="mt-4 flex items-center gap-1.5 border-t border-white/[0.07] pt-4 text-xs text-[#7f8a91]">
                      <ShieldCheck size={12} aria-hidden /> Reviewed {timestamp(notice.reviewedAt)}{notice.reviewedBy ? ` by ${notice.reviewedBy}` : ""}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </Panel>
      </section>
    </PageShell>
  );
}
