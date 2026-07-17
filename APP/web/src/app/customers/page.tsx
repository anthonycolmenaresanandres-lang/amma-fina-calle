import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  IdCard,
  Inbox,
  PencilLine,
  ReceiptText,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { getCustomers } from "@/data/customers";
import { getAdminContext } from "@/lib/admin/auth";
import {
  Eyebrow,
  Lede,
  Monogram,
  PageShell,
  PageTitle,
  SignOutButton,
  StatusPill,
  TopBar,
  type PillTone,
} from "@/components/ui";
import AdminGate from "./AdminGate";

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

function formatMoney(amountCents: number | null, currency: string | null) {
  if (amountCents === null || !currency) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function intervalLabel(interval: string | null, count: number | null) {
  if (!interval) return "Billing interval pending";
  const intervalCount = count ?? 1;
  return intervalCount === 1 ? `per ${interval}` : `every ${intervalCount} ${interval}s`;
}

// Quiet semantic tone for account/billing states — green healthy, coral trouble.
function accountTone(status: string): PillTone {
  const s = status.toLowerCase();
  if (/(active|live|current|paid|good)/.test(s)) return "success";
  if (/(paused|suspended|past|overdue|cancel|delinquent|fail)/.test(s)) return "danger";
  return "neutral";
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer Accounts | Fina Calle OS",
  description:
    "Manual customer account registry for Fina Calle OS storefront operations.",
};

export default async function CustomersPage() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") {
    return <AdminGate ctx={admin} />;
  }

  const customers = await getCustomers();
  return (
    <PageShell>
      <TopBar backHref="/" backLabel="Fina Calle OS">
        <Link
          href="/customers/payments"
          className="inline-flex items-center gap-1.5 transition hover:text-white"
        >
          <ReceiptText size={13} strokeWidth={1.75} aria-hidden />
          Payments
        </Link>
        <Link
          href="/customers/team"
          className="inline-flex items-center gap-1.5 transition hover:text-white"
        >
          <Users size={13} strokeWidth={1.75} aria-hidden />
          Team Access
        </Link>
        <Link
          href="/customers/requests"
          className="inline-flex items-center gap-1.5 transition hover:text-white"
        >
          <Inbox size={13} strokeWidth={1.75} aria-hidden />
          Request Inbox
        </Link>
        <SignOutButton />
      </TopBar>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-14">
        <div className="lg:sticky lg:top-10">
          <Eyebrow>Fina Calle OS</Eyebrow>
          <PageTitle>Customer Accounts</PageTitle>
          <Lede>Private client ledger for accounts, recurring revenue, and owner access.</Lede>
          <p className="mt-6 text-[0.7rem] uppercase tracking-[0.24em] text-[#cfd6da]/56">
            {customers.length} {customers.length === 1 ? "account" : "accounts"} on file
          </p>
        </div>

        <div className="grid gap-4">
          {customers.length === 0 ? (
            <article className="fc-panel flex flex-col items-center gap-3 px-6 py-14 text-center">
              <Monogram name="Fina Calle" className="h-14 w-14 rounded-2xl text-base" />
              <p className="mt-1 text-sm font-medium text-[#eef2f4]">No customer accounts yet</p>
              <p className="max-w-xs text-sm leading-6 text-[#8f9aa1]">
                New accounts appear here once they&apos;re added to the registry.
              </p>
            </article>
          ) : null}

          {customers.map((customer) => (
            <article
              key={customer.id}
              className="fc-panel fc-panel-link p-5 sm:p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <Monogram name={customer.businessName} />
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-semibold text-[#f4f6f7]">
                      {customer.businessName}
                    </h2>
                    <p className="mt-1 break-words text-sm text-[#8f9aa1]">
                      {customer.contactName || "Contact not recorded"}
                      {customer.contactEmail ? ` · ${customer.contactEmail}` : ""}
                      <span className="ml-2 text-[#667178]">#{customer.id}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {customer.plan ? (
                        <StatusPill tone="accent">
                          <Sparkles size={11} strokeWidth={2} aria-hidden />
                          {customer.plan}
                        </StatusPill>
                      ) : null}
                      {customer.status ? (
                        <StatusPill tone={accountTone(customer.status)} dot>
                          {formatStatus(customer.status)}
                        </StatusPill>
                      ) : null}
                      {customer.billingStatus ? (
                        <StatusPill tone={accountTone(customer.billingStatus)} dot>
                          {formatStatus(customer.billingStatus)}
                        </StatusPill>
                      ) : null}
                    </div>
                    <dl className="mt-4 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <dt className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[#7f8a91]">
                          <WalletCards size={11} aria-hidden /> Recurring amount
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-[#eef2f4]">
                          {formatMoney(customer.amountCents, customer.currency)}
                        </dd>
                        <dd className="mt-0.5 text-xs text-[#7f8a91]">
                          {intervalLabel(customer.billingInterval, customer.billingIntervalCount)}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-[#7f8a91]">
                          Payment
                        </dt>
                        <dd className="mt-1 text-sm font-semibold capitalize text-[#eef2f4]">
                          {formatStatus(customer.latestInvoiceStatus || customer.billingStatus) || "Not started"}
                        </dd>
                        <dd className="mt-0.5 text-xs text-[#7f8a91]">
                          Recurring {customer.recurringEnabled ? "on" : "off"}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <dt className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[#7f8a91]">
                          <CalendarDays size={11} aria-hidden /> Next payment
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-[#eef2f4]">
                          {formatDate(customer.nextPaymentAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                  {customer.siteUrl ? (
                    <a
                      href={customer.siteUrl}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#cfd6da]/28 bg-[#080a0c]/76 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#eef2f4] transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88"
                    >
                      <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
                      Live Site
                    </a>
                  ) : null}
                  <Link
                    href={`/customers/${customer.id}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#4f9dff]/38 bg-[#4f9dff]/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#bfdcff] transition hover:border-[#bfdcff]/70 hover:bg-[#4f9dff]/16"
                  >
                    <IdCard size={14} strokeWidth={1.75} aria-hidden />
                    Account Page
                  </Link>
                  <Link
                    href={customer.requestUpdateUrl}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#cfd6da]/22 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#cfd6da] transition hover:border-[#f0f3f4]/60 hover:text-white"
                  >
                    <PencilLine size={14} strokeWidth={1.75} aria-hidden />
                    Request Update
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
