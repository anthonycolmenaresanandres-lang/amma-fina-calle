import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import CustomerRequestForm from "@/components/CustomerRequestForm";
import styles from "@/components/ConsultationPages.module.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fc-display",
});

export const metadata = {
  title: "Discuss your project | Fina Calle",
  description:
    "Tell Fina Calle about your business, the problem you want to solve, and the outcome you need. Consulting and custom delivery are scoped separately.",
  alternates: { canonical: "/request-update" },
};

export default function RequestUpdatePage() {
  return (
    <div className={`${styles.page} ${display.variable}`}>
      <a href="#consultation-form" className={styles.skipLink}>Skip to consultation form</a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Fina Calle</Link>
        <Link href="/contact#support" className={styles.textLink}>Customer support</Link>
      </header>

      <main className={`${styles.content} ${styles.intakeLayout}`}>
        <section aria-labelledby="consultation-heading">
          <p className={styles.eyebrow}>Consultation inquiry</p>
          <h1 id="consultation-heading" className={styles.intakeTitle}>Start with<br />the problem.</h1>
          <p className={styles.lede}>
            What’s getting in the way of your business? Tell us what happens
            today and what you’d like to work better.
          </p>
          <p className={styles.bodyCopy}>
            We’ll review your inquiry to see where consulting or hands-on digital
            delivery could help. You don’t need to choose a package or know the
            technical solution first.
          </p>

          <ol className={styles.steps}>
            <li><strong>Share the context.</strong><span>Your business, your challenge, and the result you need.</span></li>
            <li><strong>Define the work together.</strong><span>Consulting and custom work require a separate written scope, fees, and timing.</span></li>
            <li><strong>Approve before work begins.</strong><span>This inquiry is not a purchase or a commitment to a project.</span></li>
          </ol>

          <p className={styles.supportNote}>
            Already a customer? <Link href="/contact#support">Get help with your existing service</Link>.
          </p>
        </section>

        <section id="consultation-form" aria-label="Consultation inquiry form" className={styles.formSection} tabIndex={-1}>
          <CustomerRequestForm mode="consultation" />
        </section>
      </main>

      <footer className={styles.footer}>
        <span>AMMA Ventures LLC DBA Fina Calle</span>
        <Link href="/contact">Contact options</Link>
      </footer>
    </div>
  );
}
