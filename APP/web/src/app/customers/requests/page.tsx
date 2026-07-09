import Link from "next/link";
import { getChangeRequests } from "@/data/requests";
import { getAdminContext } from "@/lib/admin/auth";
import {
  Eyebrow,
  Lede,
  PageShell,
  PageTitle,
  SignOutButton,
  StatusPill,
  TopBar,
  type PillTone,
} from "@/components/ui";
import AdminGate from "../AdminGate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Request Inbox | Fina Calle OS",
  description:
    "Admin inbox of customer change requests submitted through Fina Calle OS intake.",
};

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function priorityTone(priority: string): PillTone {
  return priority.toLowerCase() === "urgent" ? "accent" : "neutral";
}

export default async function RequestInboxPage() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") {
    return <AdminGate ctx={admin} />;
  }

  const requests = await getChangeRequests();

  return (
    <PageShell>
      <TopBar backHref="/customers" backLabel="Accounts">
        <SignOutButton />
      </TopBar>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-14">
        <div className="lg:sticky lg:top-10">
          <Eyebrow>Fina Calle OS</Eyebrow>
          <PageTitle>Request Inbox</PageTitle>
          <Lede>
            Every change request submitted through{" "}
            <span className="text-[#eef2f4]">/request-update</span>, newest first.
            Open one to read the full message and any uploaded files.
          </Lede>
          <p className="mt-6 text-[0.7rem] uppercase tracking-[0.24em] text-[#cfd6da]/56">
            {requests.length} {requests.length === 1 ? "request" : "requests"}
          </p>
        </div>

        <div className="grid gap-4">
          {requests.length === 0 ? (
            <article className="fc-panel flex flex-col items-center gap-2 px-6 py-14 text-center">
              <p className="text-sm font-medium text-[#eef2f4]">Inbox is clear</p>
              <p className="max-w-sm text-sm leading-6 text-[#8f9aa1]">
                Submissions from the public intake form appear here once Supabase is
                connected and the migration has been applied.
              </p>
            </article>
          ) : null}

          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/customers/requests/${request.id}`}
              className="fc-panel fc-panel-link group block p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-[#f4f6f7]">
                    {request.businessName || "Unnamed business"}
                  </h2>
                  <p className="mt-1 text-sm text-[#aeb7bd]">
                    {request.requestType || "Request"}
                    {request.contactName ? ` · ${request.contactName}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone={priorityTone(request.priority)} dot={request.priority.toLowerCase() === "urgent"}>
                    {request.priority || "Normal"}
                  </StatusPill>
                  <span
                    aria-hidden
                    className="text-[#cfd6da]/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#4f9dff]"
                  >
                    &rarr;
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.7rem] uppercase tracking-[0.18em] text-[#cfd6da]/56">
                <span>{formatDate(request.createdAt)}</span>
                <span className="capitalize text-[#9aa3a9]">
                  {formatStatus(request.status) || "new"}
                </span>
                {request.attachmentCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-[#bfdcff]">
                    <span aria-hidden>◈</span>
                    {request.attachmentCount}{" "}
                    {request.attachmentCount === 1 ? "file" : "files"}
                  </span>
                ) : null}
                {request.referenceId ? (
                  <span className="font-mono normal-case tracking-normal text-[#7f8a91]">
                    {request.referenceId}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
