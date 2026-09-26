import type { Metadata } from "next";
import Link from "next/link";
import { campaignDetails } from "@/lib/bodega-rewards/server";
import styles from "./rules.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Bodega Vibra muffin offer terms",
  description: "Terms for the Bodega Vibra free muffin challenge at Bodega Cafe in Virginia Beach.",
  robots: { index: false, follow: false },
};

function displayDate(value?: string) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function BodegaVibraRulesPage() {
  const campaign = await campaignDetails();
  const starts = displayDate(campaign.startsAt);
  const ends = displayDate(campaign.endsAt);

  return <main className={styles.page}>
    <div className={styles.shell}>
      <nav className={styles.nav}><Link href="/demo/bodega">← Bodega menu</Link><Link href="/bodega-sessions-review">Play Bodega Vibra</Link></nav>
      <header className={styles.hero}>
        <p>Bodega Cafe · Virginia Beach</p>
        <h1>Muffin offer<br />terms.</h1>
        <strong data-active={campaign.enabled}>{campaign.enabled ? "Challenge open" : "Prize claims not active"}</strong>
      </header>

      <section className={styles.offer} aria-labelledby="offer-heading">
        <p>Five rounds. Five finds.</p>
        <h2 id="offer-heading">Finish Bodega Vibra and earn one free muffin.</h2>
        <p>The game remains available for practice when prize claims are closed. A practice result is not a coupon.</p>
      </section>

      <div className={styles.terms}>
        <section><h2>Promotion window</h2><p>{starts && ends ? <>Starts {starts} and ends {ends}, using Virginia Beach time.</> : <>The seven-day launch window will appear here when the café activates the offer.</>}</p></section>
        <section><h2>Daily supply</h2><p>Up to {campaign.dailyLimit} verified muffin claims are available each New York calendar day. Active prize-round reservations count toward that limit.</p></section>
        <section><h2>Who may claim</h2><p>No purchase is required. One muffin per person for the entire promotion. Changing browsers or devices does not create another valid claim.</p></section>
        <section><h2>How to earn it</h2><p>Start an available prize round and complete all five verified rounds. Touching Bad Vibes, missing a goal, leaving the game, or closing the page resets the run.</p></section>
        <section><h2>Redeem the same day</h2><p>Bring the live claim code to Bodega Cafe at 3574 Holland Rd, Virginia Beach, VA 23452 during posted café hours. Staff must verify and redeem the code before handing over one available muffin.</p></section>
        <section><h2>Limits and availability</h2><p>Claims expire after redemption or at the end of the local day earned, whichever comes first. Screenshots, score screens, expired codes, duplicate claims, and unverified runs are not valid.</p></section>
        <section><h2>Platform notice</h2><p>This offer is provided by Bodega Cafe with launch support from Fina Calle. It is not sponsored, endorsed, administered by, or associated with Instagram.</p></section>
      </div>

      <footer><p>Questions about an in-store order should go to café staff. Technical questions about the game can be shared through the guest-note form on the Bodega menu.</p></footer>
    </div>
  </main>;
}
