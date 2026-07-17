import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  CalendarDays,
  Contact,
  CreditCard,
  ExternalLink,
  KeyRound,
  Package,
  PencilLine,
  RefreshCw,
  StickyNote,
  WalletCards,
  Zap,
} from "lucide-react";
import { getCustomerById } from "@/data/customers";
import { getAdminContext } from "@/lib/admin/auth";
import {
  Eyebrow,
  Monogram,
  PageShell,
  PageTitle,
  Panel,
  SectionHeading,
  SignOutButton,
  StatTile,
  TopBar,
} from "@/components/ui";
import AdminGate from "../AdminGate";

type CustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

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
  if (!interval) return "Interval pending";
  const intervalCount = count ?? 1;
  return intervalCount === 1 ? `per ${interval}` : `every ${intervalCount} ${interval}s`;
}

export async function generateMetadata({ params }: CustomerPageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  return {
    title: customer
      ? `${customer.businessName} Account | Fina Calle OS`
      : "Customer Account | Fina Calle OS",
  };
}

export default async function CustomerAccountPage({ params }: CustomerPageProps) {
  const { id } = await params;

  const admin = await getAdminContext();
  if (admin.state !== "authorized") {
    return <AdminGate ctx={admin} />;
  }

  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <PageShell>
      <TopBar backHref="/customers" backLabel="Accounts">
        <SignOutButton />
      </TopBar>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-start lg:py-14">
        <div className="lg:sticky lg:top-10">
          <Eyebrow>Customer Account</Eyebrow>
          <div className="mt-5 flex items-center gap-4">
            <Monogram name={customer.businessName} className="h-14 w-14 rounded-2xl text-base" />
            <PageTitle className="mt-0 text-3xl sm:text-4xl">
              {customer.businessName}
            </PageTitle>
          </div>
          <dl className="mt-7 grid gap-3 text-sm text-[#aeb7bd] sm:grid-cols-3 lg:grid-cols-1">
            <StatTile label="Plan" icon={<Package size={12} strokeWidth={1.75} aria-hidden />}>
              {customer.plan || "—"}
            </StatTile>
            <StatTile
              label="Account Status"
              icon={<Activity size={12} strokeWidth={1.75} aria-hidden />}
              className="capitalize"
            >
              {formatStatus(customer.status) || "—"}
            </StatTile>
            <StatTile
              label="Billing Status"
              icon={<CreditCard size={12} strokeWidth={1.75} aria-hidden />}
              className="capitalize"
            >
              {formatStatus(customer.billingStatus) || "—"}
            </StatTile>
          </dl>
        </div>

        <div className="space-y-5">
          <Panel>
            <SectionHeading tone="accent" icon={<Zap size={13} strokeWidth={2} aria-hidden />}>
              Account Actions
            </SectionHeading>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {customer.siteUrl ? (
                <a
                  href={customer.siteUrl}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#cfd6da]/28 bg-[#080a0c]/76 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#eef2f4] transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88"
                >
                  <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
                  Live Site
                </a>
              ) : null}
              <Link
                href={customer.ownerPortalUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#7fd1a2]/38 bg-[#7fd1a2]/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9fe5bd] transition hover:border-[#9fe5bd]/70 hover:bg-[#7fd1a2]/16"
              >
                <KeyRound size={14} strokeWidth={1.75} aria-hidden />
                Owner Portal
              </Link>
              <Link
                href={customer.requestUpdateUrl}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#4f9dff]/38 bg-[#4f9dff]/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#bfdcff] transition hover:border-[#bfdcff]/70 hover:bg-[#4f9dff]/16"
              >
                <PencilLine size={14} strokeWidth={1.75} aria-hidden />
                Request Update
              </Link>
            </div>
          </Panel>

          <Panel>
            <SectionHeading tone="accent" icon={<WalletCards size={13} strokeWidth={1.75} aria-hidden />}>
              Recurring Billing
            </SectionHeading>
            <dl className="mt-5 grid gap-4 text-sm text-[#aeb7bd] sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  <CreditCard size={12} aria-hidden /> Amount
                </dt>
                <dd className="mt-1 font-semibold text-[#eef2f4]">
                  {formatMoney(customer.amountCents, customer.currency)}
                </dd>
                <dd className="mt-0.5 text-xs text-[#7f8a91]">
                  {intervalLabel(customer.billingInterval, customer.billingIntervalCount)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  <RefreshCw size={12} aria-hidden /> Recurring
                </dt>
                <dd className="mt-1 font-semibold text-[#eef2f4]">
                  {customer.recurringEnabled ? "On" : "Off"}
                </dd>
              </div>
              <div>
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Latest Invoice
                </dt>
                <dd className="mt-1 capitalize text-[#eef2f4]">
                  {formatStatus(customer.latestInvoiceStatus || "") || "No invoice yet"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  <CalendarDays size={12} aria-hidden /> Next Payment
                </dt>
                <dd className="mt-1 text-[#eef2f4]">{formatDate(customer.nextPaymentAt)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel>
            <SectionHeading tone="accent" icon={<Contact size={13} strokeWidth={1.75} aria-hidden />}>
              Contact Information
            </SectionHeading>
            <dl className="mt-5 grid gap-4 text-sm text-[#aeb7bd] sm:grid-cols-3">
              <div>
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Contact
                </dt>
                <dd className="mt-1 text-[#eef2f4]">{customer.contactName || "Not recorded"}</dd>
              </div>
              <div>
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Email
                </dt>
                <dd className="mt-1 break-words text-[#eef2f4]">
                  {customer.contactEmail ? (
                    <a
                      href={`mailto:${customer.contactEmail}`}
                      className="text-[#bfdcff] transition hover:text-[#dbeaff]"
                    >
                      {customer.contactEmail}
                    </a>
                  ) : (
                    "Not recorded"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Phone
                </dt>
                <dd className="mt-1 text-[#eef2f4]">
                  {customer.businessPhone || "Not recorded"}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel>
            <SectionHeading tone="accent" icon={<KeyRound size={13} strokeWidth={1.75} aria-hidden />}>
              Owner Sign-in
            </SectionHeading>
            <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
              Restaurant owners use their own portal. AMMA employees use the client ledger.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {customer.ownerAccessEmails.length ? (
                customer.ownerAccessEmails.map((email) => (
                  <span
                    key={email}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#cfd6da]"
                  >
                    {email}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#7f8a91]">No owner email recorded.</span>
              )}
            </div>
          </Panel>

          <Panel>
            <SectionHeading tone="accent" icon={<StickyNote size={13} strokeWidth={1.75} aria-hidden />}>
              Notes
            </SectionHeading>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#c8d0d4]">
              {customer.notes || "No notes recorded."}
            </p>
          </Panel>
        </div>
      </section>
    </PageShell>
  );
}
