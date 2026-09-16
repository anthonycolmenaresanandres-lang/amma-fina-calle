import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import styles from "@/components/ConsultationPages.module.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fc-display",
});

export const metadata = {
  title: "Contact | Fina Calle",
  description:
    "Discuss a consulting or digital delivery project with Fina Calle, or find support for your existing service.",
  alternates: { canonical: "/contact" },
};

const CONTACT_EMAIL = "Ammaventuresvb@gmail.com";
const consultationEmail = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("Fina Calle — consultation inquiry");
const supportEmail = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("Fina Calle — existing customer support");

export default function ContactPage() {
  return (
    <div className={`${styles.page} ${display.variable}`}>
      <a href="#contact-content" className={styles.skipLink}>Skip to contact options</a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Fina Calle</Link>
        <Link href="/#work" className={styles.textLink}>Explore our work</Link>
      </header>

      <main id="contact-content" className={styles.content} tabIndex={-1}>
        <p className={styles.eyebrow}>Contact</p>
        <h1 className={styles.title}>Let’s talk about<br />your business.</h1>
        <p className={styles.lede}>
          A new project starts with a conversation about what needs to improve.
          If you already work with us, use the support path below.
        </p>

        <div className={styles.contactOptions}>
          <section aria-labelledby="consultation-heading" className={styles.option}>
            <p className={styles.eyebrow}>New projects</p>
            <h2 id="consultation-heading">Consultation inquiries</h2>
            <p>
              Tell us about your business, the problem you want to solve, and
              what a useful result would look like. You don’t need a technical brief.
            </p>
            <Link href="/request-update" className={styles.primaryLink}>Discuss your project <span aria-hidden>↗</span></Link>
            <p className={styles.note}>
              Consulting and custom delivery require a separate written scope,
              including fees and timing, before work begins.
            </p>
            <a href={consultationEmail} className={styles.textLink}>Prefer email? Send a consultation inquiry</a>
          </section>

          <section id="support" aria-labelledby="support-heading" className={styles.option}>
            <p className={styles.eyebrow}>Existing customers</p>
            <h2 id="support-heading">Help with your service</h2>
            <p>
              Use the private owner portal link provided for your business to
              manage supported updates or send a request. For help accessing it
              or another service issue, email the team.
            </p>
            <a href={supportEmail} className={styles.secondaryLink}>Email customer support <span aria-hidden>↗</span></a>
            <p className={styles.note}>
              Include your business name, the page or service affected, and what
              happened. Never send passwords or payment details.
            </p>
            <a href={"mailto:" + CONTACT_EMAIL} className={styles.textLink}>{CONTACT_EMAIL}</a>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>AMMA Ventures LLC DBA Fina Calle</span>
        <Link href="/">Back to Fina Calle</Link>
      </footer>
    </div>
  );
}
