import type { Metadata } from "next";
import Link from "next/link";
import OwnerLogin from "../../[id]/OwnerLogin";
import RequiredPasswordReset from "../../[id]/RequiredPasswordReset";
import { getOwnerContext } from "@/lib/owner/auth";
import { getBodegaSquareInsight } from "@/lib/square/catalog";
import { getBodegaSquareConfig } from "@/lib/square/config";
import styles from "./square-insights.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bodega — Square menu insights", robots: { index: false, follow: false }, referrer: "no-referrer" };

function when(value?: string) {
  if (!value) return "No completed sync yet";
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function BodegaSquareInsightsPage() {
  const context = await getOwnerContext("bodega");
  if (context.state !== "authorized") return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link href="/owner/bodega">← Owner desk</Link><Link href="/demo/bodega">Guest menu</Link></nav>
    <header className={styles.hero}><p>Bodega Cafe · Private</p><h1>Square<br />menu watch.</h1></header>
    {context.state === "anonymous" ? <OwnerLogin restaurantId="bodega" businessName="Bodega Cafe" notice="Sign in with an authorized Bodega owner account to view private Square menu information." />
      : context.state === "password_reset_required" ? <RequiredPasswordReset restaurantId="bodega" businessName="Bodega Cafe" email={context.email} />
      : <section className={styles.message}><h2>Owner access is not ready.</h2><p>{context.state === "unauthorized" ? "This account is not authorized for Bodega." : "The Bodega owner connection has not been configured."}</p></section>}
  </div></main>;

  const insight = await getBodegaSquareInsight();
  const connected = Boolean(getBodegaSquareConfig() && insight.connected);
  return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link href="/owner/bodega">← Owner desk</Link><Link href="/demo/bodega">Guest menu</Link></nav>
    <header className={styles.hero}>
      <p>Bodega Cafe · Private owner view</p>
      <h1>Square<br />menu watch.</h1>
      <strong data-connected={connected}>{connected ? `${insight.environment} connected` : "Not connected"}</strong>
    </header>

    {!connected ? <section className={styles.setup}>
      <p>Square is deliberately disconnected.</p>
      <h2>Your live menu stays untouched until Bodega supplies read-only access.</h2>
      <ol><li>Store the token and webhook key in encrypted Vercel environment variables.</li><li>Apply the prepared Square read-model migration.</li><li>Test in Square Sandbox before enabling production webhooks.</li></ol>
      <p className={styles.quiet}>Never paste the access token into this page, a guest note, or source control.</p>
    </section> : <>
      <section className={styles.metrics} aria-label="Square connection summary">
        <div><span>Active items</span><strong>{insight.activeItems}</strong></div>
        <div><span>Last catalog sync</span><strong>{when(insight.lastSyncedAt)}</strong></div>
      </section>
      {insight.lastError ? <p role="alert" className={styles.error}>Last sync needs attention: {insight.lastError}</p> : null}
      <section className={styles.changes} aria-labelledby="changes-heading"><header><p>Square catalog</p><h2 id="changes-heading">Recent menu changes.</h2></header>
        {insight.recent.length ? <ul>{insight.recent.map((item) => <li key={item.id}>
          <div><strong>{item.name}</strong><span>{item.type}{item.deleted ? " · Removed in Square" : ""}</span></div><time>{when(item.updatedAt)}</time>
        </li>)}</ul> : <p>No Square catalog objects have been synced yet.</p>}
      </section>
    </>}

    <section className={styles.guardrail}><h2>Review before publishing.</h2><p>Square changes appear here first. They do not automatically overwrite the artwork, sections, names, or descriptions on the public Bodega menu.</p></section>
  </div></main>;
}
