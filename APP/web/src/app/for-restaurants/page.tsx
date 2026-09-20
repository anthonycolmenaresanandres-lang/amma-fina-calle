import type { Metadata } from "next";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import LeadForm from "./LeadForm";
import styles from "./landing.module.css";

// Restaurant package details follow SALES_DEMO_PACKAGE/CORE_OFFER_199.md.
// Keep verified client proof separate from demos and future setup deliverables.

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
    "Restaurant packages starting at $199/month per location: a branded menu, stable QR, existing game module and private owner portal. Written scope before approval.",
};

const included = [
  {
    title: "A menu with your identity",
    body: "A branded mobile menu built from content you approve. We handle hosting, link support and routine menu/copy support within the written scope.",
  },
  {
    title: "Owner control after verified setup",
    body: "One private owner portal and initial authorized account delivery. Once your menu connection and access are verified, edit existing names, descriptions, prices and availability. Guests see saved changes when they open or refresh the connected menu.",
  },
  {
    title: "One stable guest destination",
    body: "Print-ready guest and back-office owner QR files are included. Routine connected-menu updates keep the same guest URL and QR. Physical printing is separate; prices already printed on paper do not change.",
  },
  {
    title: "One existing playable game",
    body: "We select and verify an existing game module before launch. Custom game artwork or mechanics require a separate written scope.",
  },
];

const proof = [
  { label: "Colattao — live client menu", href: "https://colattao-cafe-rush.vercel.app/menu", note: "Public menu with categories, descriptions and prices" },
  { label: "Penalty Shootout — playable demo", href: "/penalty-shootout", note: "Game-engine demo; your launch is separately verified" },
];

export default function ForRestaurantsPage(): React.JSX.Element {
  return (
    <main className={`${display.variable} ${styles.page}`}>
      <section className={styles.hero}>
        <Link className={styles.proofLink} href="/">Fina Calle consulting <span aria-hidden="true">↗</span></Link>
        <p className={styles.kicker}>Restaurant packages · Virginia Beach</p>
        <h1 className={styles.headline}>
          Your menu,<br />
          <em>one scan away.</em>
        </h1>
        <p className={styles.lede}>
          A branded menu, one stable guest QR and an existing playable game.
          We handle the technical setup and confirm what your location needs before you approve.
        </p>
        <p className={styles.price}>
          <strong>Starting at $199/month per location.</strong> Your written proposal defines
          setup, launch timing, update limits and recurring terms before approval.
        </p>
        <a className={styles.cta} href="#start">Request the plan in writing</a>
        <p className={styles.ctaNote}>An inquiry does not start a subscription or authorize a charge.</p>
      </section>

      <section className={styles.section} aria-labelledby="proof-title">
        <h2 id="proof-title" className={styles.sectionTitle}>See the work and the demo</h2>
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
        <h2 id="included-title" className={styles.sectionTitle}>The base package</h2>
        <div className={styles.grid}>
          {included.map((item) => (
            <article key={item.title} className={styles.item}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemBody}>{item.body}</p>
            </article>
          ))}
        </div>
        <p className={styles.honesty}>
          Ordering, payments, checkout and POS integration are excluded. Physical printing,
          table-specific service, additional users or training, promotion management,
          analytics reports and other custom work are scoped and priced separately.
          Consulting and custom digital work require their own written scope.
        </p>
      </section>

      <section id="start" className={styles.section} aria-labelledby="start-title">
        <h2 id="start-title" className={styles.sectionTitle}>Request your restaurant plan</h2>
        <p className={styles.lede}>
          Share your restaurant name, a reply address or phone number, and what you need.
          We can discuss the fit and prepare a written scope for your review.
        </p>
        <LeadForm />
        <p className={styles.lede}>
          Looking for broader business consulting? <Link className={styles.proofLink} href="/request-update">Start a consultation inquiry</Link>.
          {" "}Already a customer? <Link className={styles.proofLink} href="/contact#support">Get customer support</Link>.
        </p>
      </section>

      <footer className={styles.footer}>
        <span>Fina Calle OS · Virginia Beach</span>
        <span>No orders · No payments · No POS</span>
      </footer>
    </main>
  );
}
