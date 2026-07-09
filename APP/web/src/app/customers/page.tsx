import Link from "next/link";
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
        <Link href="/customers/requests" className="transition hover:text-white">
          Request Inbox
        </Link>
        <SignOutButton />
      </TopBar>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-14">
        <div className="lg:sticky lg:top-10">
          <Eyebrow>Fina Calle OS</Eyebrow>
          <PageTitle>Customer Accounts</PageTitle>
          <Lede>Manual operations view — not a secure admin portal yet.</Lede>
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
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {customer.plan ? (
                        <StatusPill tone="gold">{customer.plan}</StatusPill>
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
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                  <a
                    href={customer.siteUrl}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#cfd6da]/28 bg-[#080a0c]/76 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#eef2f4] transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88"
                  >
                    Live Site
                  </a>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8b36d]/38 bg-[#d8b36d]/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4d99c] transition hover:border-[#f4d99c]/70 hover:bg-[#d8b36d]/16"
                  >
                    Account Page
                  </Link>
                  <Link
                    href={customer.requestUpdateUrl}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#cfd6da]/22 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#cfd6da] transition hover:border-[#f0f3f4]/60 hover:text-white"
                  >
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
