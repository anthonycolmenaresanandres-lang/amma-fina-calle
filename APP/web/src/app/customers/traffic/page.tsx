import Link from "next/link";
import { Activity, ExternalLink, Globe2, MousePointerClick, Users } from "lucide-react";
import { getAdminContext } from "@/lib/admin/auth";
import { getAllSiteTrafficReports } from "@/lib/traffic/site-traffic";
import {
  Eyebrow, Lede, PageShell, PageTitle, Panel, SectionHeading,
  SignOutButton, StatTile, TopBar,
} from "@/components/ui";
import AdminGate from "../AdminGate";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Production traffic | Fina Calle OS",
  description: "Private, site-separated production traffic report.",
  robots: { index: false, follow: false },
};

function displayDay(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC", month: "short", day: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function TrafficPage() {
  const admin = await getAdminContext();
  if (admin.state !== "authorized") return <AdminGate ctx={admin} />;
  const reports = await getAllSiteTrafficReports(30);

  return (
    <PageShell>
      <TopBar backHref="/customers" backLabel="Customer Accounts">
        <a href="https://vercel.com/anthonycolmenaresanandres-8844s-projects/amma-fina-calle/analytics"
          target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-white">
          <ExternalLink size={13} aria-hidden /> Vercel Analytics
        </a>
        <SignOutButton />
      </TopBar>
      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-14">
        <div className="lg:sticky lg:top-10">
          <Eyebrow>Private analytics · production only</Eyebrow>
          <PageTitle>Traffic by site</PageTitle>
          <Lede>One report per website. Visitors and pageviews are never added across clients.</Lede>
          <p className="mt-6 text-xs leading-6 text-[#7f8a91]">
            Last 30 days of verified pageviews forwarded by Vercel Web Analytics. Collection begins when the production drain is connected; earlier Vercel history remains in the native Analytics dashboard. This is website traffic, not a count of physical QR scans.
          </p>
        </div>
        <div className="space-y-5">
          {reports.map((report) => (
            <Panel key={report.siteId}>
              <SectionHeading tone={report.state === "ready" ? "accent" : "gold"} icon={<Globe2 size={13} aria-hidden />}>
                {report.siteName}
              </SectionHeading>
              {report.state !== "ready" ? (
                <div className="mt-4" role="status">
                  <p className="text-sm font-semibold text-[#f4f6f7]">Traffic unavailable — not zero</p>
                  <p className="mt-2 text-sm leading-6 text-[#aeb7bd]">{report.reason}</p>
                  <p className="mt-3 text-xs leading-5 text-[#7f8a91]">Vercel may still have historical data. In its Hostnames panel, filter to {report.domains.join(" or ")}. Do not use the unfiltered project total.</p>
                  <a href={report.analyticsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#bfdcff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bfdcff]">
                    <ExternalLink size={13} aria-hidden /> Open {report.siteName} in Vercel
                  </a>
                </div>
              ) : (
                <>
                  <p className="mt-2 break-all text-xs text-[#7f8a91]">{report.domains.join(" · ")}</p>
                  <p className="mt-1 text-xs text-[#7f8a91]">Latest verified event: {new Date(report.lastUpdated).toLocaleString("en-US", { timeZone: "America/New_York" })} ET</p>
                  <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                    <StatTile label="Unique visitors" icon={<Users size={12} aria-hidden />}>
                      {report.visitors.toLocaleString()}
                    </StatTile>
                    <StatTile label="Pageviews" icon={<MousePointerClick size={12} aria-hidden />}>
                      {report.pageviews.toLocaleString()}
                    </StatTile>
                  </dl>
                  <div className="mt-6 grid gap-5 xl:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9aa8b1]">Top public pages</h3>
                      <div className="mt-2 divide-y divide-white/[0.07]">
                        {report.topPaths.slice(0, 5).map((row) => (
                          <div key={row.path} className="flex justify-between gap-4 py-2 text-sm">
                            <span className="min-w-0 break-all text-[#c8d0d4]">{row.path}</span>
                            <span className="shrink-0 tabular-nums text-[#eef2f4]">{row.pageviews}</span>
                          </div>
                        ))}
                        {!report.topPaths.length && <p className="py-2 text-sm text-[#8f9aa1]">No page data returned.</p>}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9aa8b1]">Recent days</h3>
                      <div className="mt-2 divide-y divide-white/[0.07]">
                        {report.daily.slice(-5).reverse().map((row) => (
                          <div key={row.date} className="flex justify-between gap-4 py-2 text-sm">
                            <time dateTime={row.date} className="text-[#c8d0d4]">{displayDay(row.date)}</time>
                            <span className="tabular-nums text-[#eef2f4]">{row.pageviews} views</span>
                          </div>
                        ))}
                        {!report.daily.length && <p className="py-2 text-sm text-[#8f9aa1]">No daily data returned.</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Panel>
          ))}
          <Panel>
            <SectionHeading tone="gold" icon={<Activity size={13} aria-hidden />}>How to read this</SectionHeading>
            <p className="mt-4 text-sm leading-6 text-[#aeb7bd]">
              Each number is deduplicated within one site&apos;s hostname and public-page scope. A person who visits two sites may count once on each; there is deliberately no cross-client total. Private portals, API routes, preview URLs, internal tools and unapproved demos are excluded.
            </p>
            <Link href="/customers/bodega-traffic" className="mt-4 inline-block text-sm font-semibold text-[#bfdcff] hover:text-white">
              Bodega detail →
            </Link>
          </Panel>
        </div>
      </section>
    </PageShell>
  );
}
