import Link from "next/link";
import {
  Activity,
  ExternalLink,
  Gamepad2,
  Globe2,
  MousePointerClick,
  Users,
} from "lucide-react";
import { getAdminContext } from "@/lib/admin/auth";
import { getBodegaTrafficReport } from "@/lib/traffic/site-traffic";
import {
  Eyebrow,
  Lede,
  PageShell,
  PageTitle,
  Panel,
  SectionHeading,
  SignOutButton,
  StatTile,
  TopBar,
} from "@/components/ui";
import AdminGate from "../AdminGate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bodega Traffic | Fina Calle OS",
  description: "Private 30-day Web Analytics report for Bodega Cafe.",
  robots: { index: false, follow: false },
};

function date(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function BodegaTrafficPage() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") return <AdminGate ctx={admin} />;

  const report = await getBodegaTrafficReport(30);

  return (
    <PageShell>
      <TopBar backHref="/customers" backLabel="Customer Accounts">
        <a
          href="https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle/analytics"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 transition hover:text-white"
        >
          <ExternalLink size={13} strokeWidth={1.75} aria-hidden />
          Vercel Analytics
        </a>
        <SignOutButton />
      </TopBar>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-14">
        <div className="lg:sticky lg:top-10">
          <Eyebrow>Bodega Cafe · Private analytics</Eyebrow>
          <PageTitle>Traffic pulse</PageTitle>
          <Lede>
            Last 30 days across the Bodega production hostname, sourced directly
            from a site-verified Vercel Web Analytics drain.
          </Lede>
          <p className="mt-6 text-xs leading-6 text-[#7f8a91]">
            Bot-filtered Web Analytics. No customer IP addresses or personal data
            are stored by this dashboard.
          </p>
        </div>

        <div className="space-y-5">
          {report.state !== "ready" ? (
            <Panel>
              <SectionHeading tone="gold" icon={<Activity size={13} aria-hidden />}>
                Analytics connection
              </SectionHeading>
              <h2 className="mt-5 text-2xl font-semibold text-[#f4f6f7]">
                {report.state === "waiting" ? "Waiting for the first verified pageview." :
                  report.state === "empty" ? "No pageviews received in this period." :
                  "Traffic collection needs attention."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aeb7bd]">
                {report.reason}
              </p>
              <p className="mt-4 text-xs leading-5 text-[#7f8a91]">
                This page is admin-only and fails closed. Historical data may still
                be visible in Vercel Analytics after filtering by the Bodega hostname.
              </p>
              {report.state === "empty" && <p className="mt-2 text-xs text-[#7f8a91]">Last verified pageview: {date(report.lastObservedAt)}</p>}
            </Panel>
          ) : (
            <>
              <Panel>
                <SectionHeading tone="accent" icon={<Globe2 size={13} aria-hidden />}>
                  {date(report.since)} – {date(report.until)}
                </SectionHeading>
                <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatTile label="Distinct devices" icon={<Users size={12} aria-hidden />}>
                    {report.visitors.toLocaleString()}
                  </StatTile>
                  <StatTile label="Pageviews" icon={<MousePointerClick size={12} aria-hidden />}>
                    {report.pageviews.toLocaleString()}
                  </StatTile>
                  <StatTile label="Game opens" icon={<Gamepad2 size={12} aria-hidden />}>
                    {report.gamePageviews.toLocaleString()}
                  </StatTile>
                  <StatTile label="Game devices" icon={<Users size={12} aria-hidden />}>
                    {report.gameVisitors.toLocaleString()}
                  </StatTile>
                </dl>
                <p className="mt-4 text-xs text-[#667178]">
                  Source: {report.source} · production hostname bodegacafe757.com
                </p>
                <p className="mt-1 text-xs text-[#7f8a91]">
                  First verified pageview: {date(report.firstObservedAt)} · latest: {date(report.lastUpdated)}
                  {Date.parse(report.firstObservedAt) > Date.parse(report.since) ? " · Earlier traffic is not backfilled" : ""}
                </p>
              </Panel>

              <Panel>
                <SectionHeading tone="accent" icon={<Activity size={13} aria-hidden />}>
                  Daily traffic
                </SectionHeading>
                {report.daily.length ? (
                  <div className="mt-5 space-y-2">
                    {(() => {
                      const max = Math.max(...report.daily.map((row) => row.pageviews), 1);
                      return report.daily.map((row) => (
                        <div key={row.date} className="grid grid-cols-[70px_1fr_60px] items-center gap-3 text-xs">
                          <span className="text-[#7f8a91]">{row.date.slice(5)}</span>
                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-[#4f9dff]"
                              style={{ width: `${Math.max(3, (row.pageviews / max) * 100)}%` }}
                            />
                          </div>
                          <span className="text-right font-semibold text-[#eef2f4]">
                            {row.pageviews}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#8f9aa1]">No Bodega pageviews were returned for this range.</p>
                )}
              </Panel>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel>
                  <SectionHeading tone="accent">Top pages</SectionHeading>
                  <div className="mt-4 divide-y divide-white/[0.07]">
                    {report.topPaths.length ? report.topPaths.slice(0, 8).map((row) => (
                      <div key={row.path} className="flex items-start justify-between gap-4 py-3 text-sm">
                        <span className="min-w-0 break-all text-[#c8d0d4]">{row.path}</span>
                        <span className="shrink-0 font-semibold text-[#eef2f4]">{row.pageviews}</span>
                      </div>
                    )) : <p className="py-3 text-sm text-[#8f9aa1]">No page data yet.</p>}
                  </div>
                </Panel>

                <Panel>
                  <SectionHeading tone="accent">Top referrers</SectionHeading>
                  <div className="mt-4 divide-y divide-white/[0.07]">
                    {report.topReferrers.length ? report.topReferrers.slice(0, 8).map((row) => (
                      <div key={row.referrer} className="flex items-start justify-between gap-4 py-3 text-sm">
                        <span className="min-w-0 break-all text-[#c8d0d4]">{row.referrer}</span>
                        <span className="shrink-0 font-semibold text-[#eef2f4]">{row.pageviews}</span>
                      </div>
                    )) : <p className="py-3 text-sm text-[#8f9aa1]">No referrer data yet.</p>}
                  </div>
                </Panel>
              </div>

              <Panel>
                <SectionHeading tone="gold">What this measures</SectionHeading>
                <p className="mt-4 text-sm leading-6 text-[#aeb7bd]">
                  The headline device number counts distinct anonymized device IDs
                  among forwarded Bodega production pageviews in this period. Game opens are
                  pageviews for <code>/bodega-sessions-review</code>. This is website
                  traffic, not a guaranteed count of physical QR scans.
                </p>
                <div className="mt-4">
                  <Link href="/customers" className="text-sm font-semibold text-[#bfdcff] hover:text-white">
                    ← Back to customer accounts
                  </Link>
                </div>
              </Panel>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
