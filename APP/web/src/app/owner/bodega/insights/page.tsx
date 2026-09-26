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
    case "connected_sync_pending": return "Square connected. A catalog sync is already running; check its status before retrying.";
    case "connected_sync_error": return "Square connected, but the first catalog sync needs attention.";
    case "synced": return "Square catalog synced to this private view. The guest menu is unchanged.";
    case "sync_busy": return "A Square sync is already running.";
    case "disconnected": return "The Square disconnect request completed. Its cached catalog is removed with the connection.";
    case "denied": return "Square authorization was cancelled.";
    case "config_missing": return "The Fina Calle Square application still needs its server-side credentials.";
    case "connect_error": return "Square could not be connected. No menu changes were published.";
    case "sync_error": return "Square sync failed. The guest menu is unchanged.";
    case "disconnect_error": return "The disconnect could not be confirmed. Check the connection before retrying.";
    case "state_error": return "Square authorization expired or failed its security check. Start the connection again.";
    case "auth_required": return "Sign in with an authorized Bodega owner account before connecting Square.";
    case "environment_error": return "The stored connection belongs to a different Square environment. Contact Fina Calle.";
    case "not_connected": return "No configured Square connection was found for this environment.";
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

  const [insight, rawParams] = await Promise.all([getSquareInsight("bodega"), searchParams ?? Promise.resolve({})]);
  const params: { square?: string | string[] } = rawParams;
  const squareStatus = typeof params.square === "string" ? params.square : undefined;
  const statusNotice = notice(squareStatus);
  return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link href="/owner/bodega">← Owner desk</Link><Link href="/demo/bodega">Guest menu</Link></nav>
    <header className={styles.hero}>
      <p>Bodega Cafe · Private owner view</p>
      <h1>Square<br />menu watch.</h1>
      <strong data-connected={insight.connected}>{insight.connected ? `${insight.environment} linked` : "Not connected"}</strong>
    </header>
    {statusNotice ? <p className={styles.notice} role="status">{statusNotice}</p> : null}
    {insight.lastError ? <p role="alert" className={styles.error}>Square needs attention: {insight.lastError}</p> : null}

    {!insight.connected ? <section className={styles.setup}>
      <p>Read-only Square connection</p>
      <h2>Connect Bodega without sharing passwords or access tokens.</h2>
      <p>Catalog changes appear in this private view. Connecting or syncing does not publish prices, remove items or replace the guest menu.</p>
      {insight.appConfigured ? <div className={styles.actions}>
        <a className={styles.primaryAction} href="/api/integrations/square/connect?restaurant_id=bodega">Connect Square</a>
      </div> : <ol><li>Create the Fina Calle Square application.</li><li>Add its server-only OAuth, webhook and encryption values in Vercel.</li><li>Apply the prepared migrations, then connect through Square’s authorization screen.</li></ol>}
      <p className={styles.quiet}>Fina Calle requests ITEMS_READ and MERCHANT_PROFILE_READ only. It does not receive permission to edit Bodega’s Square catalog.</p>
    </section> : <>
      <section className={styles.metrics} aria-label="Square connection summary">
        <div><span>Active catalog items</span><strong>{insight.activeItems}</strong></div>
        <div><span>Last catalog sync</span><strong>{when(insight.lastSyncedAt)}</strong></div>
        {insight.merchantName ? <div><span>Square merchant</span><strong>{insight.merchantName}</strong></div> : null}
      </section>
      <div className={styles.actions}>
        <form action="/api/integrations/square/sync" method="post"><input type="hidden" name="restaurant_id" value="bodega" /><button className={styles.primaryAction} type="submit">Sync now</button></form>
        <form action="/api/integrations/square/disconnect" method="post"><input type="hidden" name="restaurant_id" value="bodega" /><button className={styles.secondaryAction} type="submit">Disconnect Square</button></form>
      </div>
      <section className={styles.changes} aria-labelledby="changes-heading"><header><p>Private Square catalog</p><h2 id="changes-heading">Recent menu changes.</h2></header>
        {insight.recent.length ? <ul>{insight.recent.map((item) => <li key={item.id}>
          <div><strong>{item.name}</strong><span>{item.type}{item.deleted ? " · Removed in Square only" : ""}</span></div><time>{when(item.updatedAt)}</time>
        </li>)}</ul> : <p>No Square catalog objects have been synced yet.</p>}
      </section>
    </>}
    <section className={styles.guardrail}><h2>Review before publishing.</h2><p>The QR menu keeps its approved content and design. Automatic price updates require a separate, reviewed publishing workflow with confirmed product, size and location mappings. Removals, names, descriptions and artwork are not published from this screen.</p></section>
  </div></main>;
}
