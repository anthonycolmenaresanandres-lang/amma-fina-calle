import { CalendarDays, CreditCard, RefreshCw, ReceiptText } from "lucide-react";
import { Panel, StatusPill, type PillTone } from "@/components/ui";
import { openBillingPortal, startRecurringBilling } from "@/lib/billing/actions";
import type { BillingStatus, BillingSummary } from "@/lib/billing/types";
import styles from "./owner-portal.module.css";

const STATUS_COPY: Record<BillingStatus, { label: string; detail: string; tone: PillTone }> = {
  not_started: { label: "Not enrolled", detail: "Automatic payments have not been activated.", tone: "neutral" },
  incomplete: { label: "Needs setup", detail: "Stripe is waiting for the first payment to finish.", tone: "gold" },
  incomplete_expired: { label: "Setup expired", detail: "Contact Fina Calle to confirm your terms before enrolling again.", tone: "danger" },
  trialing: { label: "Trial active", detail: "Review your trial and subscription details in secure billing management.", tone: "accent" },
  active: { label: "Subscription active", detail: "Check the latest invoice below for its payment status.", tone: "success" },
  past_due: { label: "Payment due", detail: "Open your invoices to pay the outstanding amount or update your payment method.", tone: "danger" },
  canceled: { label: "Canceled", detail: "Recurring billing is off.", tone: "neutral" },
  unpaid: { label: "Payment failed", detail: "Open your invoices to review the payment that needs attention.", tone: "danger" },
  paused: { label: "Paused", detail: "Review your subscription and payment setup with Fina Calle.", tone: "gold" },
  processing: { label: "Processing", detail: "Stripe is confirming your billing information.", tone: "accent" },
};

function formatDate(value: string | null): string {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", ...(/^\d{4}-\d{2}-\d{2}$/.test(value) ? { timeZone: "UTC" } : {}) }).format(date);
}

function formatRecurringAmount(billing: BillingSummary): string {
  if (billing.amountCents === null || !billing.currency) return "Amount pending";
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: billing.currency.toUpperCase() }).format(billing.amountCents / 100);
  if (!billing.billingInterval) return amount;
  const count = billing.billingIntervalCount ?? 1;
  return `${amount} / ${count === 1 ? billing.billingInterval : `${count} ${billing.billingInterval}s`}`;
}

export default function BillingCard({ restaurantId, billing, notice, readOnly = false }: {
  restaurantId: string;
  billing: BillingSummary;
  notice?: string | null;
  readOnly?: boolean;
}) {
  const presentation = billing.statusAvailable === false
    ? { label: "Status unavailable", detail: "Open Stripe or contact Fina Calle to confirm your current account status.", tone: "neutral" as const }
    : STATUS_COPY[billing.status];
  const needsCheckout = ["not_started", "canceled", "incomplete_expired"].includes(billing.status);
  const scheduledPlan = needsCheckout && billing.enrollmentEnabled === true && billing.amountCents !== null && Boolean(billing.currency) && Boolean(billing.scheduledFirstChargeOn);
  const canManage = billing.managementEnabled === true && !readOnly;
  const canEnroll = billing.enrollmentEnabled === true && !readOnly;
  const manageAction = openBillingPortal.bind(null, restaurantId);
  const enrollmentAction = startRecurringBilling.bind(null, restaurantId);

  return (
    <Panel className={styles.billingSurface}>
      <h3 className={styles.billingTitle}><CreditCard size={17} strokeWidth={1.5} aria-hidden />Payments &amp; automatic billing</h3>
      <div className={styles.billingSummary}>
        <div className="min-w-0">
          <p className={styles.billingPlan}>{billing.plan}</p>
          <p className={styles.billingDetail}>{presentation.detail}</p>
        </div>
        <StatusPill tone={presentation.tone} dot>{presentation.label}</StatusPill>
      </div>
      <dl className={styles.billingFacts}>
        <div><dt><RefreshCw size={13} aria-hidden />Automatic payments</dt><dd>{billing.statusAvailable === false ? "Unavailable" : billing.recurringEnabled ? formatRecurringAmount(billing) : "Off"}</dd></div>
        <div><dt><CalendarDays size={13} aria-hidden />{scheduledPlan ? "Proposed first charge" : "Next automatic charge"}</dt><dd>{formatDate(scheduledPlan ? billing.scheduledFirstChargeOn : billing.recurringEnabled ? billing.nextPaymentAt : null)}</dd></div>
        <div><dt><ReceiptText size={13} aria-hidden />Latest invoice</dt><dd>{billing.latestInvoiceStatus ? billing.latestInvoiceStatus.replaceAll("_", " ") : "No invoice available"}</dd></div>
      </dl>
      {scheduledPlan ? <p className={styles.billingHelp}>Proposed recurring amount: {formatRecurringAmount(billing)}. Review the final amount and schedule in Stripe before agreeing.</p> : null}
      {notice ? <p className={styles.billingNotice} aria-live="polite">{notice}</p> : null}
      <div className={styles.billingActions}>
        {readOnly ? <button type="button" className={styles.primaryAction} disabled>Invoices &amp; payment methods</button> : <form action={manageAction}>
          <button type="submit" className={styles.primaryAction} disabled={!canManage}><ReceiptText size={16} aria-hidden />Invoices &amp; payment methods</button>
        </form>}
        {needsCheckout ? readOnly ? <button type="button" className={styles.secondaryAction} disabled>Set up automatic payments</button> : <form action={enrollmentAction}>
          <button type="submit" className={styles.secondaryAction} disabled={!canEnroll}><RefreshCw size={15} aria-hidden />Set up automatic payments</button>
        </form> : readOnly ? <button type="button" className={styles.secondaryAction} disabled>Manage automatic payments</button> : <form action={manageAction}>
          <button type="submit" className={styles.secondaryAction} disabled={!canManage}><RefreshCw size={15} aria-hidden />Manage automatic payments</button>
        </form>}
      </div>
      <p className={styles.billingHelp}>In Stripe, review invoices, pay an open invoice and manage the payment methods available for your account. Automatic payments are a separate choice: saving a card or opening the portal does not enroll you.</p>
      {needsCheckout ? <p className={styles.billingHelp}>Choose automatic payments only after reviewing the amount and schedule in Stripe. Enrollment requires your confirmation there.</p> : null}
      {readOnly ? <p className={styles.billingNotice}>Preview only. Payment actions are disabled; no payment method or subscription will be created.</p> : billing.setupMessage ? <p className={styles.billingNotice}>{billing.setupMessage}</p> : (!canManage || (needsCheckout && !canEnroll)) ? <p className={styles.billingHelp}>Some payment tools are not connected yet. Contact Fina Calle below to complete your account setup.</p> : null}
    </Panel>
  );
}
