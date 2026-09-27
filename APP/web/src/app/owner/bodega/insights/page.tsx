import type { Metadata } from "next";
import Link from "next/link";
import BodegaSquareLogin from "./BodegaSquareLogin";
import RequiredPasswordReset from "../../[id]/RequiredPasswordReset";
import { getOwnerContext } from "@/lib/owner/auth";
import { getSquareInsight } from "@/lib/square/catalog";
import { getSquareLocationsForOwner } from "@/lib/square/connection";
import type { SquareLocation } from "@/lib/square/oauth";
import styles from "./square-insights.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bodega — Square menu insights", robots: { index: false, follow: false }, referrer: "no-referrer" };

type PageProps = { searchParams?: Promise<{ square?: string | string[]; auth?: string | string[] }> };

function when(value?: string) {
  if (!value) return "No completed sync yet";
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function notice(status?: string) {
  switch (status) {
    case "connected_choose_location": return "Square is connected. Choose Bodega’s store below to finish setup.";
    case "synced": return "You’re connected. Bodega’s Square menu is now visible here for private review.";
    case "sync_busy": return "A Square sync is already running.";
    case "disconnected": return "The Square disconnect request completed. Its cached catalog is removed with the connection.";
    case "denied": return "Square authorization was cancelled.";
    case "config_missing": return "The connection is still being prepared by Fina Calle. Please try again later.";
    case "connect_error": return "Square did not connect. Please try again or contact Fina Calle.";
    case "sync_error": return "We could not refresh your Square menu. Please try Sync now again.";
    case "disconnect_error": return "The disconnect could not be confirmed. Check the connection before retrying.";
    case "state_error": return "Square authorization expired or failed its security check. Start the connection again.";
    case "auth_required": return "Check your Bodega email for the sign-in link before connecting Square.";
    case "environment_error": return "The stored connection belongs to a different Square environment. Contact Fina Calle.";
    case "not_connected": return "No configured Square connection was found for this environment.";
    case "location_saved": return "Square location saved for Bodega. The guest menu is unchanged.";
    case "location_saved_sync_pending": return "Square location saved. A private catalog sync is already running.";
    case "location_saved_sync_error": return "Your store is connected, but its menu did not load yet. Use Sync now to retry.";
    case "location_error": return "The Square location could not be saved. Choose an active location and try again.";
    case "choose_location": return "Choose Bodega’s Square location before syncing the private catalog.";
    default: return null;
  }
}

export default async function BodegaSquareInsightsPage({ searchParams }: PageProps) {
  const context = await getOwnerContext("bodega");
  const rawParams: { square?: string | string[]; auth?: string | string[] } = await (searchParams ?? Promise.resolve({}));
  if (context.state !== "authorized") return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link href="/owner/bodega">← Owner desk</Link><Link href="/demo/bodega">Guest menu</Link></nav>
    <header className={styles.hero}><p>Bodega Cafe · Owner only</p><h1>Connect<br />your Square.</h1></header>
    {context.state === "anonymous" ? <>{rawParams.auth ? <p className={styles.notice} role="status">That sign-in link has expired. Enter your email for a new one.</p> : null}<BodegaSquareLogin /></>
      : context.state === "password_reset_required" ? <RequiredPasswordReset restaurantId="bodega" businessName="Bodega Cafe" email={context.email} />
      : <section className={styles.message}><h2>Owner access is not ready.</h2><p>{context.state === "unauthorized" ? "This email does not have Bodega owner access. Please contact Fina Calle." : "Fina Calle is preparing your owner access. Please contact us if you expected to connect today."}</p></section>}
  </div></main>;

  const insight = await getSquareInsight("bodega");
  const squareStatus = typeof rawParams.square === "string" ? rawParams.square : undefined;
  const statusNotice = notice(squareStatus);
  let locations: SquareLocation[] = [];
  let locationsUnavailable = false;
  if (insight.connected) {
    try { locations = await getSquareLocationsForOwner("bodega"); }
    catch { locationsUnavailable = true; }
  }
  const selectedLocation = locations.find((location) => location.id === insight.locationId);
  return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link href="/owner/bodega">← Owner desk</Link><Link href="/demo/bodega">Guest menu</Link></nav>
    <header className={styles.hero}>
      <p>Bodega Cafe · Owner only</p>
      <h1>{insight.connected ? <>Your menu,<br />connected.</> : <>Connect<br />your Square.</>}</h1>
      <strong data-connected={insight.connected}>{insight.connected ? "Square connected" : "Ready to connect"}</strong>
    </header>
    {statusNotice ? <p className={styles.notice} role="status">{statusNotice}</p> : null}
    {insight.connected && insight.lastError ? <p role="alert" className={styles.error}>The Square menu needs attention. Try Sync now or contact Fina Calle.</p> : null}

    {!insight.connected ? <section className={styles.setup}>
      <p>One more step</p>
      <h2>Open Square and say yes.</h2>
      <p>Tap the button, sign in to Bodega’s Square account, and approve the requested access. We’ll show your menu here for private review. Your customer menu will not change.</p>
      {insight.appConfigured ? <div className={styles.actions}>
        <a className={styles.primaryAction} href="/api/integrations/square/connect?restaurant_id=bodega">Connect Bodega’s Square</a>
      </div> : <p className={styles.setupPending}>Fina Calle is finishing setup. There is nothing else you need to do yet.</p>}
      <p className={styles.quiet}>Fina Calle can read your Square items and store name. It cannot edit your Square menu, see payments, or access customer records through this connection.</p>
    </section> : <>
      <section className={styles.metrics} aria-label="Square connection summary">
        <div><span>Active catalog items</span><strong>{insight.activeItems}</strong></div>
        <div><span>Last catalog sync</span><strong>{when(insight.lastSyncedAt)}</strong></div>
        {insight.merchantName ? <div><span>Square merchant</span><strong>{insight.merchantName}</strong></div> : null}
      </section>
      {!insight.locationId || locations.length > 1 ? <section className={styles.location} aria-labelledby="square-location-heading">
        <p className={styles.eyebrow}>Bodega counter</p>
        <h2 id="square-location-heading">Which store is Bodega?</h2>
        <p>Choose the store Bodega uses. This only changes the private view.</p>
        {locationsUnavailable ? <p className={styles.error} role="alert">Square locations are unavailable right now. Refresh this page to retry.</p>
          : locations.length ? <form action="/api/integrations/square/location" method="post" className={styles.locationForm}>
            <input type="hidden" name="restaurant_id" value="bodega" />
            <label htmlFor="square-location">Bodega store</label>
            <select id="square-location" name="location_id" required defaultValue={insight.locationId ?? ""}>
              <option value="" disabled>Select Bodega’s location</option>
              {locations.map((location) => <option key={location.id} value={location.id}>{location.name}{location.addressLabel ? ` · ${location.addressLabel}` : ""}</option>)}
            </select>
            <button className={styles.primaryAction} type="submit">Use this store</button>
          </form> : <p>No active Square locations were returned. Check the merchant account in Square.</p>}
        {insight.locationId ? <p className={styles.quiet}>Selected: {selectedLocation?.name ?? "Bodega store"}</p> : <p className={styles.unselected}>No store selected yet.</p>}
      </section> : <p className={styles.selectedStore}>Store: <strong>{selectedLocation?.name ?? "Selected"}</strong></p>}
      <div className={styles.actions}>
        {insight.locationId ? <form action="/api/integrations/square/sync" method="post"><input type="hidden" name="restaurant_id" value="bodega" /><button className={styles.primaryAction} type="submit">Sync now</button></form> : null}
        <a className={styles.secondaryAction} href="/api/integrations/square/connect?restaurant_id=bodega">Reconnect Square</a>
        <details className={styles.disconnect}>
          <summary className={styles.secondaryAction}>Disconnect Square</summary>
          <p>This removes Bodega’s private Square copy. Your customer menu stays as it is.</p>
          <form action="/api/integrations/square/disconnect" method="post"><input type="hidden" name="restaurant_id" value="bodega" /><button className={styles.secondaryAction} type="submit">Yes, disconnect Square</button></form>
        </details>
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
