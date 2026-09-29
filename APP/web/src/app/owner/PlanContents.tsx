import Link from "next/link";
import styles from "./plan-contents.module.css";

type Restaurant = "bodega" | "colattao";

function requestLink(restaurant: Restaurant, subject: string): string {
  const name = restaurant === "bodega" ? "Bodega Cafe" : "Colattao";
  return `mailto:Ammaventuresvb@gmail.com?subject=${encodeURIComponent(`${name} — ${subject}`)}`;
}

export default function PlanContents({ restaurant, part }: { restaurant: Restaurant; part: "included" | "extras" | "help" }) {
  const bodega = restaurant === "bodega";
  if (part === "included") return <section className={styles.section} aria-labelledby="included-title">
      <p className={styles.kicker}>Your Basic service</p>
      <h2 id="included-title">The essentials, handled.</h2>
      <p className={styles.intro}>Your menu stays easy to find and easy to use. We keep the everyday digital work moving.</p>
      <ul className={styles.included}>
        <li>Branded mobile menu and a stable guest link</li>
        <li>Menu QR artwork ready to download and print</li>
        <li>{bodega ? "Bodega Vibra" : "Your current café game"}</li>
        <li>Private owner tools, hosting and link support</li>
        <li>Two grouped menu-update requests each month, up to five straightforward edits to existing items or copy per request</li>
      </ul>
      <p className={styles.small}>Send related edits together. Price, wording and availability updates count; a correction to our work does not. Direct owner editing is available only where connected. An existing agreement with a broader allowance still applies.</p>
    </section>;
  if (part === "extras") return <section className={styles.section} aria-labelledby="extras-title">
      <p className={styles.kicker}>When you want more</p>
      <h2 id="extras-title">Useful extras, clearly priced.</h2>
      <div className={styles.extra}><div><h3>Guest notes delivered to your team</h3><p>A standard footer note form with email delivery and secure recordkeeping. We confirm the recipient and volume before activation.</p></div><div className={styles.extraAction}><strong>+$20 / month</strong><a href={requestLink(restaurant, "guest-note delivery")}>Request this extra ↗</a></div></div>
      <div className={styles.extra}><div><h3>One more café game</h3><p>Choose another ready-made game. New artwork or custom rules are quoted separately.</p></div><div className={styles.extraAction}><strong>+$10 / month</strong><a href={requestLink(restaurant, "another café game")}>Ask about games ↗</a></div></div>
      <div className={styles.extra}><div><h3>Extra updates or custom work</h3><p>We quote the full job before starting. AI phone service and SMS are separate services.</p></div><div className={styles.extraAction}><strong>Fixed quote</strong><a href={requestLink(restaurant, "extra changes or custom work")}>Request a quote ↗</a></div></div>
      <p className={styles.small}>Requesting an extra does not change your subscription. We confirm the scope, total and start date with you first. Existing agreed features stay in your current service.</p>
    </section>;
  return <section className={styles.section} aria-labelledby="help-title">
      <p className={styles.kicker}>A direct line</p>
      <h2 id="help-title">Need a hand?</h2>
      <div className={styles.links}><Link href="/contact">Contact Fina Calle ↗</Link><a href={requestLink(restaurant, "monthly billing day request")}>Request a monthly billing day ↗</a></div>
      <p className={styles.small}>A billing-day change applies only after your agreed first charge. We confirm the new date before changing it.</p>
    </section>;
}
