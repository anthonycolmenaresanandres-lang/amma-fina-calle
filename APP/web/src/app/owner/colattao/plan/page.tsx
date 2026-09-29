import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PlanContents from "../../PlanContents";
import RequiredPasswordReset from "../../[id]/RequiredPasswordReset";
import { getOwnerContext } from "@/lib/owner/auth";
import { startRecurringBilling, openBillingPortal } from "@/lib/billing/actions";
import { getBillingNotice, getOwnerBillingSummary } from "@/lib/billing/data";
import { COLATTAO_BASIC_TERMS } from "@/lib/billing/colattao-terms";
import type { BillingSummary } from "@/lib/billing/types";
import ColattaoPlanLogin from "./ColattaoPlanLogin";
import styles from "./plan.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Colattao plan & payments | Fina Calle", robots: { index: false, follow: false }, referrer: "no-referrer" };

type PageProps = { searchParams?: Promise<{ billing?: string | string[]; auth?: string | string[] }> };

function dateLabel(value: string | null): string {
  if (!value) return "Confirm in Stripe";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  if (!Number.isFinite(date.getTime())) return "Confirm in Stripe";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(date);
}

export default async function ColattaoPlanPage({ searchParams }: PageProps) {
  const params: { billing?: string | string[]; auth?: string | string[] } = await (searchParams ?? Promise.resolve({}));
  const context = await getOwnerContext("colattao");
  const notice = getBillingNotice(typeof params.billing === "string" ? params.billing : null);
  return <main className={styles.page}><div className={styles.shell}>
    <a href="#main-content" className={styles.skip}>Skip to your plan</a>
    <nav className={styles.nav} aria-label="Colattao plan navigation"><Link href="/owner/colattao">← Owner portal</Link><span className={styles.navTools}><a href="/owner/colattao/qr" download="colattao-menu-qr.svg">Menu QR ↓</a><Link href="/m/colattao">Live menu ↗</Link></span></nav>
    <header className={styles.hero}><div><p className={styles.kicker}>Colattao / Fina Calle</p><h1>Your plan.<br /><em>More time for coffee.</em></h1><a href="#payments" className={styles.jump}>Go to payments ↓</a></div><Image src="/assets/colattao/colattao-menu-hero-4x5-v1.webp" width={400} height={500} alt="Colattao coffee and pastry" priority /></header>
    <div id="main-content" tabIndex={-1}>
      <PlanContents restaurant="colattao" part="included" />
      <section id="payments" className={styles.payments} aria-labelledby="payments-title"><p className={styles.kicker}>Private account</p><h2 id="payments-title">Plan &amp; payments.</h2>
        {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
        {context.state === "anonymous" ? <><ColattaoPlanLogin />{params.auth ? <p className={styles.notice}>That sign-in link expired. Sign in again above.</p> : null}</> :
          context.state === "password_reset_required" ? <RequiredPasswordReset restaurantId="colattao" businessName="Colattao" email={context.email} /> :
            context.state !== "authorized" ? <p className={styles.notice}>This account does not have Colattao owner access. <Link href="/contact">Contact Fina Calle</Link> for help.</p> :
              <ColattaoPayments billing={await getOwnerBillingSummary("colattao", "Basic", "manual")} />}
      </section>
      <PlanContents restaurant="colattao" part="extras" />
      <PlanContents restaurant="colattao" part="help" />
    </div>
    <footer className={styles.footer}><span>Fina Calle × Colattao</span><Link href="/contact">Get help ↗</Link></footer>
  </div></main>;
}

export function ColattaoPayments({ billing }: { billing: BillingSummary }) {
  const needsEnrollment = ["not_started", "canceled", "incomplete_expired"].includes(billing.status);
  const canEnroll = billing.enrollmentEnabled === true;
  const canManage = billing.managementEnabled === true;
  const firstDate = billing.statusAvailable ? billing.scheduledFirstChargeOn : null;
  return <>
    <div className={styles.priceLine}><strong>$149</strong><span>per month<br />Basic service</span></div>
    <dl className={styles.facts}><div><dt>Automatic payments</dt><dd>{billing.statusAvailable ? billing.recurringEnabled ? "Active" : "Not yet active" : "Status unavailable"}</dd></div><div><dt>{billing.recurringEnabled ? "Next charge" : "Agreed first charge"}</dt><dd>{dateLabel(billing.recurringEnabled ? billing.nextPaymentAt : firstDate)}</dd></div><div><dt>Latest invoice</dt><dd>{billing.latestInvoiceStatus?.replaceAll("_", " ") ?? "No invoice yet"}</dd></div></dl>
    {needsEnrollment ? <div className={styles.enrollment}><h3>Set up automatic payments</h3><p>Your $149 monthly plan begins October 20, 2026. The September 20–October 19 payment is handled separately. You can cancel before a future renewal.</p><form action={startRecurringBilling.bind(null, "colattao")}><label className={styles.consent}><input type="checkbox" name="accept_terms" value={COLATTAO_BASIC_TERMS.version} required disabled={!canEnroll} /><span>I agree to $149 each month beginning October 20, 2026, until I cancel, and authorize Fina Calle to charge my payment method.</span></label><button type="submit" disabled={!canEnroll}>Agree &amp; continue to Stripe ↗</button></form>{!canEnroll ? <p className={styles.setup}>Secure enrollment is being prepared. <Link href="/contact">Contact Fina Calle</Link> for help.</p> : null}</div> : <p className={styles.enrollment}>Manage your active subscription in Stripe, including payment details and cancellation before the next renewal.</p>}
    <div className={styles.paymentTools}><h3>Invoices, receipts &amp; payment methods</h3><p>Open Stripe to view available invoices, pay an open invoice or change your payment method. This is available separately from enrolling in automatic payments.</p><form action={openBillingPortal.bind(null, "colattao")}><button type="submit" disabled={!canManage}>Open invoices &amp; payment methods ↗</button></form>{!canManage ? <p className={styles.setup}>Invoice access appears after the billing account is connected. <Link href="/contact">Contact Fina Calle</Link> for an invoice now.</p> : null}<p><Link href="/owner/colattao#owner-billing">View Zelle instructions and payment reporting ↗</Link></p></div>
  </>;
}
