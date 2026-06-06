import Link from "next/link";
import { notFound } from "next/navigation";
import { getChangeRequestById } from "@/data/requests";
import { getAdminContext } from "@/lib/admin/auth";
import AdminGate from "../../AdminGate";

type RequestPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

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

function formatBytes(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function generateMetadata({ params }: RequestPageProps) {
  const { id } = await params;
  const request = await getChangeRequestById(id);
  return {
    title: request
      ? `${request.businessName || "Request"} | Request Inbox`
      : "Request | Fina Calle OS",
  };
}

export default async function RequestDetailPage({ params }: RequestPageProps) {
  const { id } = await params;

  const admin = await getAdminContext();
  if (admin.state !== "authorized") {
    return <AdminGate ctx={admin} />;
  }

  const request = await getChangeRequestById(id);
  if (!request) {
    notFound();
  }

  const contactIsEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.contactInfo);

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_18%,rgba(205,214,219,0.14),transparent_28%),radial-gradient(circle_at_18%_80%,rgba(216,179,109,0.08),transparent_26%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.024)_1px,transparent_1px)] bg-[size:68px_68px]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-[#dfe5e8]/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black to-transparent" />

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/customers/requests" className="transition hover:text-white">
            Back to Inbox
          </Link>
          <form action="/customers/signout" method="post">
            <button type="submit" className="uppercase tracking-[0.28em] transition hover:text-white">
              Sign out
            </button>
          </form>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-start lg:py-14">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
              {request.requestType || "Change request"}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[#f4f6f7] sm:text-5xl">
              {request.businessName || "Unnamed business"}
            </h1>
            <dl className="mt-6 grid gap-3 text-sm text-[#aeb7bd] sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-[#cfd6da]/14 bg-[#090c0f]/72 p-4">
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Priority
                </dt>
                <dd className="mt-1 text-lg font-semibold capitalize text-[#eef2f4]">
                  {request.priority || "Normal"}
                </dd>
              </div>
              <div className="rounded-2xl border border-[#cfd6da]/14 bg-[#090c0f]/72 p-4">
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Status
                </dt>
                <dd className="mt-1 text-lg font-semibold capitalize text-[#eef2f4]">
                  {formatStatus(request.status) || "new"}
                </dd>
              </div>
              <div className="rounded-2xl border border-[#cfd6da]/14 bg-[#090c0f]/72 p-4">
                <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                  Submitted
                </dt>
                <dd className="mt-1 text-lg font-semibold text-[#eef2f4]">
                  {formatDate(request.createdAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-5">
            <section className="rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
                Request
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#c8d0d4]">
                {request.message || "No message provided."}
              </p>
            </section>

            <section className="rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
                Contact
              </h2>
              <dl className="mt-5 grid gap-4 text-sm text-[#aeb7bd] sm:grid-cols-3">
                <div>
                  <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                    Name
                  </dt>
                  <dd className="mt-1 text-[#eef2f4]">
                    {request.contactName || "Not recorded"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                    Email or phone
                  </dt>
                  <dd className="mt-1 break-words text-[#eef2f4]">
                    {contactIsEmail ? (
                      <a
                        href={`mailto:${request.contactInfo}`}
                        className="text-[#f4d99c] transition hover:text-[#f8e7bc]"
                      >
                        {request.contactInfo}
                      </a>
                    ) : (
                      request.contactInfo || "Not recorded"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                    Reference
                  </dt>
                  <dd className="mt-1 font-mono text-[#eef2f4]">
                    {request.referenceId || "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[1.5rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
                Attachments ({request.attachments.length})
              </h2>
              {request.attachments.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-[#aeb7bd]">
                  No files were uploaded with this request.
                </p>
              ) : (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {request.attachments.map((file) => {
                    const isImage = file.contentType.startsWith("image/");
                    return (
                      <li key={file.id}>
                        <a
                          href={file.url || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 rounded-2xl border border-[#cfd6da]/14 bg-[#090c0f]/72 p-3 transition hover:border-[#d8b36d]/45 hover:bg-[#0d1115]/80"
                        >
                          <span className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-xl border border-[#cfd6da]/12 bg-[#040506]">
                            {isImage && file.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={file.url}
                                alt={file.fileName}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#d8b36d]">
                                {file.contentType.includes("pdf") ? "PDF" : "File"}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-[#eef2f4]">
                              {file.fileName}
                            </span>
                            <span className="mt-0.5 block text-xs text-[#8f9aa1]">
                              {formatBytes(file.byteSize)}
                            </span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {request.sourcePage ? (
              <p className="px-1 text-[0.7rem] uppercase tracking-[0.18em] text-[#cfd6da]/40">
                Source: <span className="normal-case tracking-normal">{request.sourcePage}</span>
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
