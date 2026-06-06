import Link from "next/link";
import { getChangeRequests } from "@/data/requests";
import { getAdminContext } from "@/lib/admin/auth";
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

// Champagne-gold for urgent, neutral otherwise — quiet, on-brand priority cue.
function priorityClass(priority: string) {
  const p = priority.toLowerCase();
  if (p === "urgent")
    return "border-[#d8b36d]/55 bg-[#d8b36d]/14 text-[#f4d99c]";
  if (p === "low") return "border-[#cfd6da]/16 text-[#9aa3a9]";
  return "border-[#cfd6da]/22 text-[#cfd6da]";
}

export default async function RequestInboxPage() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") {
    return <AdminGate ctx={admin} />;
  }

  const requests = await getChangeRequests();

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
              Request Inbox
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg">
              Every change request submitted through{" "}
              <span className="text-[#eef2f4]">/request-update</span>, newest
              first. Open one to read the full message and any uploaded files.
            </p>
            <p className="mt-6 text-[0.7rem] uppercase tracking-[0.24em] text-[#cfd6da]/56">
              {requests.length} {requests.length === 1 ? "request" : "requests"}
            </p>
          </div>

          <div className="grid gap-4">
            {requests.length === 0 ? (
              <article className="rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-6 text-sm leading-6 text-[#aeb7bd]">
                No requests yet. Submissions from the public intake form appear
                here once Supabase is connected and the migration has been
                applied.
              </article>
            ) : null}

            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/customers/requests/${request.id}`}
                className="group rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur transition hover:border-[#d8b36d]/45 hover:bg-[#0b0e11]/90 sm:p-6"
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
                  <span
                    className={`rounded-full border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${priorityClass(
                      request.priority,
                    )}`}
                  >
                    {request.priority || "Normal"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.7rem] uppercase tracking-[0.18em] text-[#cfd6da]/56">
                  <span>{formatDate(request.createdAt)}</span>
                  <span className="capitalize text-[#9aa3a9]">
                    {formatStatus(request.status) || "new"}
                  </span>
                  {request.attachmentCount > 0 ? (
                    <span className="text-[#f4d99c]">
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
      </div>
    </main>
  );
}
