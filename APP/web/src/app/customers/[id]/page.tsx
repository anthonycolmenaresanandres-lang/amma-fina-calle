import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerById } from "@/data/customers";

type CustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

function hasUrl(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export async function generateMetadata({ params }: CustomerPageProps) {
  await params;

  return {
    title: "Customer Account | Fina Calle OS",
  };
}

export default async function CustomerAccountPage({ params }: CustomerPageProps) {
  const { id } = await params;
  const customer = getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_18%,rgba(205,214,219,0.14),transparent_28%),radial-gradient(circle_at_18%_80%,rgba(216,179,109,0.08),transparent_26%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.024)_1px,transparent_1px)] bg-[size:68px_68px]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-[#dfe5e8]/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black to-transparent" />

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/customers" className="transition hover:text-white">
            Back to Accounts
          </Link>
          <span className="hidden sm:inline">Manual Customer View</span>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-start lg:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
              Customer Account
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[#f4f6f7] sm:text-5xl">
              {customer.businessName}
            </h1>
            <dl className="mt-6 grid gap-3 text-sm text-[#aeb7bd] sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-[#cfd6da]/14 bg-[#090c0f]/72 p-4">
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Plan
                </dt>
                <dd className="mt-1 text-lg font-semibold text-[#eef2f4]">
                  {customer.plan}
                </dd>
              </div>
              <div className="rounded-2xl border border-[#cfd6da]/14 bg-[#090c0f]/72 p-4">
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Account Status
                </dt>
                <dd className="mt-1 text-lg font-semibold capitalize text-[#eef2f4]">
                  {formatStatus(customer.status)}
                </dd>
              </div>
              <div className="rounded-2xl border border-[#cfd6da]/14 bg-[#090c0f]/72 p-4">
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Billing Status
                </dt>
                <dd className="mt-1 text-lg font-semibold capitalize text-[#eef2f4]">
                  {formatStatus(customer.billingStatus)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-5">
            <section className="rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
                Account Actions
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href={customer.siteUrl}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd6da]/28 bg-[#080a0c]/76 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#eef2f4] transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88"
                >
                  Live Site
                </a>
                <Link
                  href={customer.requestUpdateUrl}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b36d]/38 bg-[#d8b36d]/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4d99c] transition hover:border-[#f4d99c]/70 hover:bg-[#d8b36d]/16"
                >
                  Request Update
                </Link>
                {hasUrl(customer.stripeInvoiceUrl) ? (
                  <a
                    href={customer.stripeInvoiceUrl}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd6da]/22 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#cfd6da] transition hover:border-[#f0f3f4]/60 hover:text-white"
                  >
                    Pay Invoice
                  </a>
                ) : null}
                {hasUrl(customer.stripePortalUrl) ? (
                  <a
                    href={customer.stripePortalUrl}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd6da]/22 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#cfd6da] transition hover:border-[#f0f3f4]/60 hover:text-white"
                  >
                    Manage Billing
                  </a>
                ) : null}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
                Contact Information
              </h2>
              <dl className="mt-5 grid gap-4 text-sm text-[#aeb7bd] sm:grid-cols-3">
                <div>
                  <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                    Contact
                  </dt>
                  <dd className="mt-1 text-[#eef2f4]">{customer.contactName}</dd>
                </div>
                <div>
                  <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                    Email
                  </dt>
                  <dd className="mt-1 text-[#eef2f4]">
                    {customer.contactEmail || "Not recorded"}
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
            </section>

            <section className="rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
                Notes
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#c8d0d4]">
                {customer.notes}
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
