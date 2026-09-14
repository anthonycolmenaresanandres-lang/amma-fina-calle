import Image from "next/image";
import Link from "next/link";
import styles from "./guide.module.css";

export const metadata = {
  title: "Owner guide | Fina Calle",
  description: "A practical guide to your Fina Calle owner portal: menu changes, payments and help.",
  robots: { index: false, follow: false },
};

const chapters = [
  ["sign-in", "Sign in"],
  ["menu", "Menu changes"],
  ["payments", "Payments"],
  ["help", "Get help"],
] as const;

export default function OwnerGuidePage() {
  return (
    <main className={styles.guide}>
      <a className={styles.skip} href="#guide-content">Skip to owner guide</a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Fina Calle home">
          <span className={styles.wordmark} aria-hidden="true"><Image src="/assets/fina-calle/emblem-colattao.webp" alt="" width={72} height={77} /></span>
          <span>Fina Calle<small>For the people behind the hospitality.</small></span>
        </Link>
        <Link href="/contact" className={styles.contact}>Contact Fina Calle</Link>
      </header>

      <div className={styles.layout}>
        <section className={styles.hero} aria-labelledby="guide-title">
          <p className={styles.eyebrow}>The owner handbook</p>
          <h1 id="guide-title">A little less admin.<br /><em>More time for your guests.</em></h1>
          <p className={styles.lead}>Your menu, payments and a direct line to our team. Here is how to use the tools in your owner portal, one small task at a time.</p>
          <p className={styles.scope}>Your account determines which tools are ready. A sign-in page, a QR code or this guide does not activate access, menu publishing or automatic payments.</p>
          <nav className={styles.chapterNav} aria-label="Guide chapters">
            {chapters.map(([id, name]) => <a key={id} href={`#${id}`}>{name}<span aria-hidden="true">↗</span></a>)}
          </nav>
        </section>

        <div id="guide-content" className={styles.content}>
          <section id="sign-in" className={styles.chapter} aria-labelledby="sign-in-title">
            <div className={styles.chapterTitle}><p className={styles.eyebrow}>Your private workspace</p><h2 id="sign-in-title">Start with the right door.</h2></div>
            <div className={styles.body}>
              <ol>
                <li>Scan the owner QR supplied by Fina Calle, or open your exact owner link. Check the business name and the <strong>finacalleos.com</strong> address.</li>
                <li>Use the email assigned to your business and your private password. If prompted, choose a new private password before continuing.</li>
                <li>Check your business and account information. If anything is wrong or access is unavailable, contact Fina Calle before making changes.</li>
              </ol>
              <p>Keep the owner QR in a staff-only area. It is different from the guest menu QR. Do not share your password; sign out on shared devices.</p>
              <p id="sign-in-help">Cannot sign in? Check your assigned email and exact owner link. <a href="mailto:Ammaventuresvb@gmail.com?subject=Owner%20portal%20help">Email Fina Calle</a> with the business name and error you see, never your password.</p>
              <details className={styles.details}>
                <summary>Save the portal to your home screen</summary>
                <p>On iPhone or iPad, open your owner link in Safari, tap Share, then Add to Home Screen. On Android, open it in Chrome and look for Install app or Add to Home screen. Browser wording varies.</p>
                <p>The shortcut still requires authorized sign-in and an internet connection. It does not make menu changes or payments available offline.</p>
              </details>
            </div>
          </section>

          <section id="menu" className={styles.chapter} aria-labelledby="menu-title">
            <div className={styles.chapterTitle}><p className={styles.eyebrow}>Keep it manageable</p><h2 id="menu-title">One item. Review. Save.</h2></div>
            <div className={styles.body}>
              <p>When your guest menu is connected, you can update an existing item&apos;s price, name, description or availability. Existing size prices are separate edits.</p>
              <ol>
                <li>In <strong>Edit menu</strong>, choose the item and the single field you want to change.</li>
                <li>Enter the new value, then select <strong>Review change</strong>. Compare the current and proposed values.</li>
                <li>Select <strong>Save menu change</strong>. Open the connected guest menu and refresh to verify the result.</li>
              </ol>
              <p>Need two items changed? Finish and verify the first, then repeat for the second. This is not a bulk editor. Your permanent guest QR remains the same.</p>
              <aside className={styles.notice}><strong>Colattao&apos;s menu is separate.</strong> Use <strong>Contact Fina Calle</strong> to request changes to the Colattao guest site. Direct owner edits are not connected to that site. A request is not confirmation that a change is live.</aside>
              <p>If your portal shows a connection or setup notice, follow it. New items, categories, photos, large revisions and account corrections go through <strong>Contact Fina Calle</strong>.</p>
              <details className={styles.details}><summary>Prices, sold-out items and change history</summary>
                <p>Enter prices with up to two decimal places. A zero price means “Ask staff,” not a free item. Change Availability to mark an item sold out, and restore Available when it returns. Check the guest view after each save.</p>
                <p><strong>History</strong> shows recent recorded changes. It is not a complete activity report, payment receipt or one-click undo. If another person changed the same field, reload and review the current value before trying again.</p>
              </details>
            </div>
          </section>

          <section id="payments" className={styles.chapter} aria-labelledby="payments-title">
            <div className={styles.chapterTitle}><p className={styles.eyebrow}>Your choice, clearly stated</p><h2 id="payments-title">Payments, without the guesswork.</h2></div>
            <div className={styles.body}>
              <h3>View invoices and manage payment details</h3>
              <p>Open <strong>Payments</strong>, then <strong>Invoices &amp; payment methods</strong> when billing is connected. In Stripe, view available invoices, pay an outstanding invoice or update a payment method. Check the business, amount and payment details before confirming. Download the invoice or receipt from Stripe when available.</p>
              <h3>Choose automatic payments</h3>
              <p>Automatic payments are optional. <strong>Set up automatic payments</strong> is offered after your agreed billing amount and schedule are confirmed and ready. Review the amount, currency, billing frequency and first-charge date in your portal and in Stripe before choosing to enroll.</p>
              <p>Saving a card is not the same as starting a subscription. Returning from Stripe is not, by itself, proof that enrollment or payment succeeded. Check the confirmed status and invoices; contact us if they do not agree.</p>
              <aside className={styles.notice}><strong>Already enrolled or have a payment issue?</strong> Use <strong>Manage automatic payments</strong> or the invoice-management control for the existing billing account. Do not start a second enrollment. An active subscription does not necessarily mean every invoice is paid.</aside>
              <details className={styles.details}><summary>If Zelle is available on your account</summary><p>Use only the verified recipient shown in your signed-in portal. After paying in your bank app, select <strong>Report payment sent</strong>. A reported payment remains unverified until Fina Calle reconciles it. Do not put bank credentials or full payment-card details in a request.</p></details>
            </div>
          </section>

          <section id="help" className={styles.chapter} aria-labelledby="help-title">
            <div className={styles.chapterTitle}><p className={styles.eyebrow}>A direct line to the team</p><h2 id="help-title">Tell us what you need.</h2></div>
            <div className={styles.body}>
              <p>Open <strong>Contact Fina Calle</strong> in your portal. Include the item or page, what should change, the exact new wording and your requested deadline. Select <strong>Review request</strong>, check the summary, then <strong>Send request</strong> when offered. Keep the reference number.</p>
              <p>You can add up to five JPG, PNG, WebP or PDF files, at most 4 MB each, with a message of up to 4,000 characters. If a file fails, follow the retry message; do not assume the team received every attachment.</p>
              <p>For a proposed direct change, read the review before selecting <strong>Confirm change</strong>. Requests that need our team are reviewed separately. This channel does not promise an immediate response.</p>
              <p>Cannot sign in? <a href="mailto:Ammaventuresvb@gmail.com?subject=Owner%20portal%20help">Email Fina Calle</a> with your business name and the problem. Never send a password. Owner requests reach Fina Calle; guest feedback is a separate channel, not a live guest inbox in this portal.</p>
              <div className={styles.helpLine}><span>Something not working?</span><Link href="/contact">Contact Fina Calle <span aria-hidden="true">↗</span></Link></div>
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <p>Fina Calle · Owner guide v1 · September 14, 2026</p>
          <p>This guide contains no private account information. Account setup and provider settings determine availability.</p>
          <p>Payment reference: <a href="https://docs.stripe.com/customer-management" target="_blank" rel="noopener noreferrer">Stripe customer portal documentation (opens a new tab)</a>.</p>
        </footer>
      </div>
    </main>
  );
}
