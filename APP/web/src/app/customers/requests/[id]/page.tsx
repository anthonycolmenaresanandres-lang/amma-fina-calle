import { notFound } from "next/navigation";
import { getChangeRequestById } from "@/data/requests";
import { getAdminContext } from "@/lib/admin/auth";
import {
  Eyebrow,
  PageShell,
  PageTitle,
  Panel,
  SectionHeading,
  SignOutButton,
  StatTile,
  TopBar,
} from "@/components/ui";
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
    <PageShell>
      <TopBar backHref="/customers/requests" backLabel="Inbox">
        <SignOutButton />
      </TopBar>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-start lg:py-14">
        <div className="lg:sticky lg:top-10">
          <Eyebrow>{request.requestType || "Change request"}</Eyebrow>
          <PageTitle>{request.businessName || "Unnamed business"}</PageTitle>
          <dl className="mt-7 grid gap-3 text-sm text-[#aeb7bd] sm:grid-cols-3 lg:grid-cols-1">
            <StatTile label="Priority" className="capitalize">
              {request.priority || "Normal"}
            </StatTile>
            <StatTile label="Status" className="capitalize">
              {formatStatus(request.status) || "new"}
            </StatTile>
            <StatTile label="Submitted">{formatDate(request.createdAt)}</StatTile>
          </dl>
        </div>

        <div className="space-y-5">
          <Panel>
            <SectionHeading tone="accent">Request</SectionHeading>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#c8d0d4]">
              {request.message || "No message provided."}
            </p>
          </Panel>

          <Panel>
            <SectionHeading tone="accent">Contact</SectionHeading>
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
                      className="text-[#bfdcff] transition hover:text-[#dbeaff]"
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
          </Panel>

          <Panel>
            <SectionHeading tone="accent" hint={`${request.attachments.length} total`}>
              Attachments
            </SectionHeading>
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
                        className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#090c0f]/72 p-3 transition hover:border-[#4f9dff]/45 hover:bg-[#0d1115]/80"
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
                            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#4f9dff]">
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
          </Panel>

          {request.sourcePage ? (
            <p className="px-1 text-[0.7rem] uppercase tracking-[0.18em] text-[#cfd6da]/40">
              Source:{" "}
              <span className="normal-case tracking-normal">{request.sourcePage}</span>
            </p>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
