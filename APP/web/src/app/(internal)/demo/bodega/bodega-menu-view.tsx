import Image from "next/image";
import { BodegaMenuNav } from "./bodega-menu-nav";
import { BodegaVibraLink } from "./bodega-vibra-link";
import { BodegaGuestNoteForm } from "./bodega-guest-note-form";
import { publishedBusinessDetails } from "./menu-draft";
import { BodegaSignalLogo } from "./bodega-signal-logo";
import { FinaCalleSignature } from "./fina-calle-signature";
import { FallSessions } from "./fall-sessions";
import { VenueMenuLayout } from "@/venue-menu/VenueMenuLayout";
import { BodegaMenuItems } from "./bodega-menu-items";
import type { BodegaMenuProjection } from "@/lib/bodega-controls/overlay";
import { BODEGA_MANIFEST } from "@/lib/bodega-controls/catalog";
import styles from "@/venue-menu/venue-menu.module.css";

const shortDays: Record<string, string> = { "Monday - Friday": "Mon–Fri", Saturday: "Sat", Sunday: "Sun" };

export function BodegaMenuView({ menu, localFixture = false, deploymentCommit }: { menu: BodegaMenuProjection; localFixture?: boolean; deploymentCommit?: string }) {
  return (
    <VenueMenuLayout
      brandName="Bodega Cafe"
      brand={<BodegaSignalLogo />}
      nav={<BodegaMenuNav />}
      featured={<>{localFixture ? <p className={styles.sectionNote} role="status">Local test only · Availability and order below are fixtures. No live changes.</p> : null}<FallSessions drinks={menu.seasonal} />{menu.state.mode === "fallback" ? <p className={styles.sectionNote} role="status">Live availability could not be confirmed. Ask the café team about current availability.</p> : null}</>}
      readback={menu.state.mode === "off" ? undefined : { source: "bodega-controls-v1", mode: menu.state.mode, manifest: BODEGA_MANIFEST.hash, version: menu.state.snapshot?.snapshot_version, deploymentCommit }}
      skipHref="#bodega-classics"
      skipLabel="Skip to menu prices"
      menu={<BodegaMenuItems menu={menu} />}
      game={<section className={styles.sessionsTeaser} aria-labelledby="fall-rush-title">
          <Image src="/assets/bodega/fall/cereal-bites.webp" alt="" width={120} height={120} sizes="(max-width: 700px) 72px, 100px" />
          <div><h2 id="fall-rush-title">Bodega Vibra</h2><p>Es que no entienden la vibra. Five fast rounds. Catch café finds and avoid Bad Vibes.</p></div>
          <BodegaVibraLink />
        </section>}
      visit={<section className={styles.hours} id="hours" aria-labelledby="visit-title">
          <div>
            <h2 id="visit-title">Visit</h2>
            <p className={styles.address}>{publishedBusinessDetails.address}</p>
            <div className={styles.visitLinks}>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(publishedBusinessDetails.address)}`} target="_blank" rel="noreferrer">Directions</a>
              <a href={publishedBusinessDetails.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
          <ul className={styles.hoursList}>
            {publishedBusinessDetails.hours.map((entry) => (
              <li key={entry.days}><span>{shortDays[entry.days] ?? entry.days}</span><span>{entry.time}</span></li>
            ))}
          </ul>
        </section>}
      engagement={<BodegaGuestNoteForm />}
      footer={<>
          <a className={styles.poweredBy} href="https://finacalleos.com" aria-label="Powered by Fina Calle — visit finacalleos.com">
            <span>Powered by</span>
            <FinaCalleSignature />
          </a>
          <details id="review-notes">
            <summary>Menu details</summary>
            <p>Preview menu transcribed from Bodega’s photographed boards and bakery labels. Listed prices come from the Classics board; ask the café for unlisted prices and current availability. Hours await confirmation. Artwork is illustrative.</p>
          </details>
      </>}
    />
  );
}
