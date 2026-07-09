import Link from "next/link";
import { notFound } from "next/navigation";
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
            <StatTile label="Plan">{customer.plan || "—"}</StatTile>
            <StatTile label="Account Status" className="capitalize">
              {formatStatus(customer.status) || "—"}
            </StatTile>
            <StatTile label="Billing Status" className="capitalize">
              {formatStatus(customer.billingStatus) || "—"}
            </StatTile>
          </dl>
        </div>

        <div className="space-y-5">
          <Panel>
            <SectionHeading tone="accent">Account Actions</SectionHeading>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href={customer.siteUrl}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd6da]/28 bg-[#080a0c]/76 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#eef2f4] transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88"
              >
                Live Site
              </a>
              <Link
                href={customer.requestUpdateUrl}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#4f9dff]/38 bg-[#4f9dff]/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#bfdcff] transition hover:border-[#bfdcff]/70 hover:bg-[#4f9dff]/16"
              >
                Request Update
              </Link>
            </div>
          </Panel>

          <Panel>
            <SectionHeading tone="accent">Contact Information</SectionHeading>
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
            <SectionHeading tone="accent">Notes</SectionHeading>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#c8d0d4]">
              {customer.notes || "No notes recorded."}
            </p>
          </Panel>
        </div>
      </section>
    </PageShell>
  );
}
