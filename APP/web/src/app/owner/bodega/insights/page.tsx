import type { Metadata } from "next";
import Link from "next/link";
import OwnerLogin from "../../[id]/OwnerLogin";
import RequiredPasswordReset from "../../[id]/RequiredPasswordReset";
import { getOwnerContext } from "@/lib/owner/auth";
import { getSquareInsight } from "@/lib/square/catalog";
import styles from "./square-insights.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bodega — Square menu insights", robots: { index: false, follow: false }, referrer: "no-referrer" };

type PageProps = { searchParams?: Promise<{ square?: string | string[] }> };

function when(value?: string) {
  if (!value) return "No completed sync yet";
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function notice(status?: string) {
  switch (status) {
    case "connected": return "Square connected. The first read-only catalog sync completed.";
    case "connected_sync_pending": return "Square connected. Another catalog sync is finishing; webhook delivery will catch up.";
    case "connected_sync_error": return "Square connected, but the first catalog sync needs attention.";
    case "synced": return "Square catalog synced.";
    case "sync_busy": return "A Square sync is already running.";
    case "disconnected": return "Square disconnected and its authorization was revoked.";
    case "denied": return "Square authorization was cancelled.";
    case "config_missing": return "The Fina Calle Square application still needs its server-side credentials.";
    case "connect_error": return "Square could not be connected. No menu changes were published.";
    case "sync_error": return "Square sync failed. The existing guest menu was left unchanged.";
    case "disconnect_error": return "Square could not be safely disconnected. The existing connection was kept.";
    case "state_error": return "Square authorization expired or failed its security check. Start the connection again.";
    default: return null;
  }
}

export default async function BodegaSquareInsightsPage({ searchParams }: PageProps) {
  const context = await getOwnerContext("bodega");
  if (context.state !== "authorized") return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link href="/owner/bodega">← Owner desk</Link><Link href="/demo/bodega">Guest menu</Link></nav>
    <header className={styles.hero}><p>Bodega Cafe · Private</p><h1>Square<br />menu watch.</h1></header>
    {context.state === "anonymous" ? <OwnerLogin restaurantId="bodega" businessName="Bodega Cafe" notice="Sign in with an authorized Bodega owner account to view private Square menu information." />
      : context.state === "password_reset_required" ? <RequiredPasswordReset restaurantId="bodega" businessName="Bodega Cafe" email={context.email} />
      : <section className={styles.message}><h2>Owner access is not ready.</h2><p>{context.state === "unauthorized" ? "This account is not authorized for Bodega." : "The Bodega owner connection has not been configured."}</p></section>}
  </div></main>;

  const [insight, params] = await Promise.all([getSquareInsight("bodega"), searchParams ?? Promise.resolve({})]);
  const squareStatus = typeof params.square === "string" ? params.square : undefined;
  const statusNotice = notice(squareStatus);
  return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link href="/owner/bodega">← Owner desk</Link><Link href="/demo/bodega">Guest menu</Link></nav>
    <header className={styles.hero}>
      <p>Bodega Cafe · Private owner view</p>
      <h1>Square<br />menu watch.</h1>
      <strong data-connected={insight.connected}>{insight.connected ? `${insight.environment} connected` : "Not connected"}</strong>
    </header>

    {statusNotice ? <p className={styles.notice} role="status">{statusNotice}</p> : null}

    {!insight.connected ? <section className={styles.setup}>
      <p>Read-only Square connection</p>
      <h2>Connect Bodega without sharing passwords or access tokens.</h2>
      <p>Square stays the source of truth for matched prices and removals. New names, categories, descriptions and artwork remain review-only so the Fina Calle layout stays intact.</p>
      {insight.appConfigured ? <div className={styles.actions}>
        <a className={styles.primaryAction} href="/api/integrations/square/connect?restaurant_id=bodega">Connect Square</a>
      </div> : <ol><li>Create the Fina Calle Square application.</li><li>Add its server-only OAuth, webhook and encryption values in Vercel.</li><li>Return here and connect Bodega through Square’s authorization screen.</li></ol>}
      <p className={styles.quiet}>Fina Calle requests ITEMS_READ and MERCHANT_PROFILE_READ only. It does not receive permission to edit Bodega’s Square catalog.</p>
    </section> : <>
      <section className={styles.metrics} aria-label="Square connection summary">
        <div><span>Active items</span><strong>{insight.activeItems}</strong></div>
        <div><span>Last catalog sync</span><strong>{when(insight.lastSyncedAt)}</strong></div>
        {insight.merchantName ? <div><span>Square merchant</span><strong>{insight.merchantName}</strong></div> : null}
      </section>
      {insight.lastError ? <p role="alert" className={styles.error}>Last sync needs attention: {insight.lastError}</p> : null}
      <div className={styles.actions}>
        <form action="/api/integrations/square/sync" method="post"><input type="hidden" name="restaurant_id" value="bodega" /><button className={styles.primaryAction} type="submit">Sync now</button></form>
        <form action="/api/integrations/square/disconnect" method="post"><input type="hidden" name="restaurant_id" value="bodega" /><button className={styles.secondaryAction} type="submit">Disconnect Square</button></form>
      </div>
      <section className={styles.changes} aria-labelledby="changes-heading"><header><p>Square catalog</p><h2 id="changes-heading">Recent menu changes.</h2></header>
        {insight.recent.length ? <ul>{insight.recent.map((item) => <li key={item.id}>
          <div><strong>{item.name}</strong><span>{item.type}{item.deleted ? " · Removed in Square" : ""}</span></div><time>{when(item.updatedAt)}</time>
        </li>)}</ul> : <p>No Square catalog objects have been synced yet.</p>}
      </section>
    </>}

    <section className={styles.guardrail}><h2>Automatic where safe. Review where creative.</h2><p>Exact matched prices and Square removals can flow into the QR menu automatically. New items, renamed products, categories, descriptions and visual presentation stay in review so Square never flattens Bodega’s designed menu.</p></section>
  </div></main>;
}
