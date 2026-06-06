import Link from "next/link";
import { getCustomers } from "@/data/customers";
import { getAdminContext } from "@/lib/admin/auth";
import AdminGate from "./AdminGate";

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
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
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_18%,rgba(205,214,219,0.14),transparent_28%),radial-gradient(circle_at_18%_80%,rgba(216,179,109,0.08),transparent_26%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.024)_1px,transparent_1px)] bg-[size:68px_68px]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-[#dfe5e8]/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black to-transparent" />

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/" className="transition hover:text-white">
            Back to Fina Calle OS
          </Link>
          <form action="/customers/signout" method="post">
            <button type="submit" className="uppercase tracking-[0.28em] transition hover:text-white">
              Sign out
            </button>
          </form>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
              Fina Calle OS
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[#f4f6f7] sm:text-5xl">
              Customer Accounts
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg">
              Manual operations view — not a secure admin portal yet.
            </p>
          </div>

          <div className="grid gap-4">
            {customers.length === 0 ? (
              <article className="rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-6 text-sm text-[#aeb7bd]">
                No customer accounts yet. New accounts appear here once added to the
                registry.
              </article>
            ) : null}
            {customers.map((customer) => (
              <article
                key={customer.id}
                className="rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#f4f6f7]">
                      {customer.businessName}
                    </h2>
                    <dl className="mt-4 grid gap-3 text-sm text-[#aeb7bd] sm:grid-cols-3">
                      <div>
                        <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                          Plan
                        </dt>
                        <dd className="mt-1 text-[#eef2f4]">{customer.plan}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                          Account
                        </dt>
                        <dd className="mt-1 capitalize text-[#eef2f4]">
                          {formatStatus(customer.status)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                          Billing
                        </dt>
                        <dd className="mt-1 capitalize text-[#eef2f4]">
                          {formatStatus(customer.billingStatus)}
                        </dd>
                      </div>
                    </dl>
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
      </div>
    </main>
  );
}
