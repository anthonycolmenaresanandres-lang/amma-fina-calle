import type { Metadata } from "next";
import { Bodoni_Moda } from "next/font/google";
import LeadForm from "./LeadForm";
import styles from "./landing.module.css";

// Ad destination for the local restaurant campaign (GROWTH/ONLINE_AD_CAMPAIGN.md).
// Every claim here is limited to what SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md
// marks live: a hosted digital menu, playable game demos, and a build-request
// intake. Nothing on this page claims ordering, payments, POS, loyalty or any
// revenue result — those are not live and must never be advertised.

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fc-display",
});

export const metadata: Metadata = {
  title: "QR menus for Virginia Beach restaurants | Fina Calle OS",
  description:
    "A digital menu your guests open by scanning the table. Built and hosted for you, $199 a month, month-to-month. See a live one before you decide.",
};

const included = [
  {
    title: "A menu that is never out of date",
    body: "You send a change, it is live the same day. No reprints, no stickers over old prices.",
  },
  {
    title: "Built and hosted for you",
    body: "We build the whole thing. You never log into a builder or manage a website.",
  },
  {
    title: "A table QR that keeps working",
    body: "Print it once. The link behind it stays the same, so a menu change never costs you new signage.",
  },
  {
    title: "A game your guests can play",
    body: "An optional table game skinned to your colors — for the wait between ordering and food.",
  },
];

const proof = [
  { label: "A live client menu", href: "/m/colattao", note: "Real menu, real prices, in use today" },
  { label: "A playable game demo", href: "/penalty-shootout", note: "No signup, no download" },
];

export default function ForRestaurantsPage(): React.JSX.Element {
  return (
    <main className={`${display.variable} ${styles.page}`}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Virginia Beach restaurants</p>
        <h1 className={styles.headline}>
          Your menu,<br />
          <em>one scan away.</em>
        </h1>
        <p className={styles.lede}>
          Change a price at 9am and every table sees it at 9:01. We build the menu, host it, and
          keep it current — you send the changes.
        </p>
        <p className={styles.price}>
          <strong>$199 a month.</strong> Month-to-month, no setup fee, cancel any month.
        </p>
        <a className={styles.cta} href="#start">Start with a free mock of your menu</a>
        <p className={styles.ctaNote}>No card. No call required to see it.</p>
      </section>

      <section className={styles.section} aria-labelledby="proof-title">
        <h2 id="proof-title" className={styles.sectionTitle}>See it before you believe it</h2>
        <ul className={styles.proofList}>
          {proof.map((item) => (
            <li key={item.href} className={styles.proofRow}>
              <a className={styles.proofLink} href={item.href}>{item.label}</a>
              <span className={styles.proofNote}>{item.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="included-title">
        <h2 id="included-title" className={styles.sectionTitle}>What you get</h2>
        <div className={styles.grid}>
          {included.map((item) => (
            <article key={item.title} className={styles.item}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemBody}>{item.body}</p>
            </article>
          ))}
        </div>
        <p className={styles.honesty}>
          What this is not: we do not take orders, process payments, or connect to your POS. If you
          want those later, they are a separate conversation — not part of this price.
        </p>
      </section>

      <section id="start" className={styles.section} aria-labelledby="start-title">
        <h2 id="start-title" className={styles.sectionTitle}>Start with your own menu</h2>
        <p className={styles.lede}>
          Send your restaurant name and we will build a free mock of your real menu, then show you
          the link. If you do not like it, that is the end of it.
        </p>
        <LeadForm />
      </section>

      <footer className={styles.footer}>
        <span>Fina Calle OS · Virginia Beach</span>
        <span>No orders · No payments · No POS</span>
      </footer>
    </main>
  );
}
