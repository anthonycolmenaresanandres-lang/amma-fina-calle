import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BodegaSquareLogin from "../insights/BodegaSquareLogin";
import RequiredPasswordReset from "../../[id]/RequiredPasswordReset";
import { getOwnerContext } from "@/lib/owner/auth";
import { startRecurringBilling, openBillingPortal } from "@/lib/billing/actions";
import { getOwnerBillingSummary, getBillingNotice } from "@/lib/billing/data";
import { BODEGA_BASIC_TERMS } from "@/lib/billing/bodega-terms";
import type { BillingSummary } from "@/lib/billing/types";
import styles from "./billing.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bodega Basic plan | Fina Calle", robots: { index: false, follow: false }, referrer: "no-referrer" };

type PageProps = { searchParams?: Promise<{ billing?: string | string[]; auth?: string | string[] }> };

function dateLabel(value: string | null): string {
  if (!value) return "See Stripe for the next date";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  if (!Number.isFinite(date.getTime())) return "See Stripe for the next date";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(date);
}

const statusCopy: Record<string, string> = {
  not_started: "Ready when you are",
  incomplete: "Finish payment setup",
  incomplete_expired: "Setup expired",
  trialing: "Trial active",
  active: "Automatic payments active",
  past_due: "Payment needs attention",
  canceled: "Plan canceled",
  unpaid: "Payment needs attention",
  paused: "Payments paused",
  processing: "Stripe is confirming setup",
};

export default async function BodegaBillingPage({ searchParams }: PageProps) {
  const params: { billing?: string | string[]; auth?: string | string[] } = await (searchParams ?? Promise.resolve({}));
  const context = await getOwnerContext("bodega");
  const billingNotice = getBillingNotice(typeof params.billing === "string" ? params.billing : null);

  return <main className={styles.page}><div className={styles.shell}>
    <a className={styles.skip} href="#billing-main">Skip to billing</a>
    <nav className={styles.nav} aria-label="Bodega billing navigation">
      <Link href="/owner/bodega">← Owner desk</Link>
      <Link href="/demo/bodega">Bodega menu ↗</Link>
    </nav>
    <header className={styles.hero}>
      <div><p className={styles.eyebrow}>Bodega Cafe / Fina Calle</p><h1>Your plan.<br /><em>Your pace.</em></h1></div>
      <Image src="/assets/bodega/review/bodega-round-seal-review.webp" width={108} height={108} alt="" aria-hidden priority />
    </header>

    <div id="billing-main" tabIndex={-1}>
      {context.state === "anonymous" ? <>
        {params.auth ? <p className={styles.notice} role="status">That sign-in link has expired. Enter your email for a fresh one.</p> : null}
        <BodegaSquareLogin destination="billing" />
      </> : context.state === "password_reset_required" ?
        <RequiredPasswordReset restaurantId="bodega" businessName="Bodega Cafe" email={context.email} />
        : context.state !== "authorized" ?
          <section className={styles.pending}><h2>Owner access is being prepared.</h2><p>{context.state === "unauthorized" ? "This email does not have Bodega owner access." : "Fina Calle is finishing your private owner account."} Contact Fina Calle if you expected to sign in today.</p></section>
          : <AuthorizedBilling notice={billingNotice} />}
    </div>
    <footer className={styles.footer}><span>Fina Calle</span><span>Made for Bodega Cafe</span></footer>
  </div></main>;
}

async function AuthorizedBilling({ notice }: { notice: string | null }) {
  const billing = await getOwnerBillingSummary("bodega", "Basic", "manual");
  return <BodegaBillingContent billing={billing} notice={notice} />;
}

export function BodegaBillingContent({ billing, notice }: { billing: BillingSummary; notice: string | null }) {
  const needsEnrollment = ["not_started", "canceled", "incomplete_expired"].includes(billing.status);
  const canEnroll = billing.enrollmentEnabled === true;
  const canManage = billing.managementEnabled === true;
  const status = billing.statusAvailable === false ? "Status unavailable" : statusCopy[billing.status];
  const nextDate = billing.recurringEnabled
    ? dateLabel(billing.nextPaymentAt ?? (billing.status === "trialing" ? BODEGA_BASIC_TERMS.firstChargeOn : null))
    : dateLabel(BODEGA_BASIC_TERMS.firstChargeOn);
  return <>
    <section className={styles.plan} aria-labelledby="plan-title">
      <div className={styles.planTop}><p className={styles.eyebrow}>Fina Calle / Basic</p><p className={styles.state}>{status}</p></div>
      <div className={styles.price}><h2 id="plan-title"><span>$</span>199</h2><p>per month<br /><strong>after your free trial</strong></p></div>
      <dl className={styles.facts}>
        <div><dt>Trial began</dt><dd>{dateLabel(BODEGA_BASIC_TERMS.trialStartedOn)}</dd></div>
        <div><dt>{billing.recurringEnabled ? "Next charge" : "First planned charge"}</dt><dd>{nextDate}</dd></div>
        <div><dt>Setup fee</dt><dd>None</dd></div>
      </dl>
    </section>

    {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
    {needsEnrollment ? <section className={styles.agreement} aria-labelledby="agreement-title">
      <p className={styles.eyebrow}>Review &amp; authorize</p>
      <h2 id="agreement-title">One yes. Then it runs monthly.</h2>
      <p>Bodega’s current Fina Calle Basic service is free through October 25, 2026. The first $199 charge is planned for October 26, 2026, followed by $199 each month. There is no setup fee.</p>
      <p>{BODEGA_BASIC_TERMS.cancellation} Your payment details and invoices are handled securely by Stripe.</p>
      <form action={startRecurringBilling.bind(null, "bodega")}>
        <label className={styles.consent}><input type="checkbox" name="accept_terms" value={BODEGA_BASIC_TERMS.version} required disabled={!canEnroll} /><span>I accept these Basic plan terms and authorize Fina Calle to charge my payment method $199 monthly after the free trial until I cancel.</span></label>
        <button className={styles.primary} type="submit" disabled={!canEnroll}>Agree &amp; continue to secure checkout <span aria-hidden>↗</span></button>
      </form>
      {!canEnroll ? <p className={styles.setupNote} role="status">Fina Calle is finishing secure payment setup. Enrollment will appear here when the account is ready.</p> : null}
    </section> : <section className={styles.agreement} aria-labelledby="manage-title">
      <p className={styles.eyebrow}>Your account</p>
      <h2 id="manage-title">Payments in one place.</h2>
      <p>{billing.status === "trialing" ? "Your trial is active. Your first automatic payment is scheduled after it ends." : "Review invoices and update your payment method in Stripe. To cancel before the next charge, use Stripe’s cancellation option or contact Fina Calle."}</p>
      {billing.latestInvoiceStatus ? <p className={styles.invoice}>Latest invoice: <strong>{billing.latestInvoiceStatus.replaceAll("_", " ")}</strong></p> : null}
      <form action={openBillingPortal.bind(null, "bodega")}><button className={styles.primary} type="submit" disabled={!canManage}>Manage payments &amp; invoices <span aria-hidden>↗</span></button></form>
      {!canManage ? <p className={styles.setupNote}>Payment management is temporarily unavailable. Contact Fina Calle for help.</p> : null}
    </section>}
  </>;
}
