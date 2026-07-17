import { CalendarDays, CreditCard, RefreshCw, ReceiptText } from "lucide-react";
import {
  Button,
  Panel,
  SectionHeading,
  StatusPill,
  type PillTone,
} from "@/components/ui";
import {
  openBillingPortal,
  startRecurringBilling,
} from "@/lib/billing/actions";
import type { BillingStatus, BillingSummary } from "@/lib/billing/types";

const STATUS_COPY: Record<
  BillingStatus,
  { label: string; detail: string; tone: PillTone }
> = {
  not_started: {
    label: "Not started",
    detail: "Recurring billing has not been activated.",
    tone: "neutral",
  },
  incomplete: {
    label: "Needs setup",
    detail: "Stripe is waiting for the first payment to finish.",
    tone: "gold",
  },
  incomplete_expired: {
    label: "Setup expired",
    detail: "Start again to activate recurring billing.",
    tone: "danger",
  },
  trialing: {
    label: "Trial active",
    detail: "Recurring billing is scheduled after the trial.",
    tone: "accent",
  },
  active: {
    label: "Paid and active",
    detail: "Your AMMA service is current.",
    tone: "success",
  },
  past_due: {
    label: "Payment due",
    detail: "Update the payment method or pay the open invoice.",
    tone: "danger",
  },
  canceled: {
    label: "Canceled",
    detail: "Recurring billing is off.",
    tone: "neutral",
  },
  unpaid: {
    label: "Payment failed",
    detail: "Billing needs attention before service can renew.",
    tone: "danger",
  },
  paused: {
    label: "Paused",
    detail: "Billing is paused until payment setup is completed.",
    tone: "gold",
  },
  processing: {
    label: "Processing",
    detail: "Stripe is confirming the payment.",
    tone: "accent",
  },
};

function formatDate(value: string | null): string {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function invoiceLabel(value: string | null): string {
  if (!value) return "No invoice yet";
  return value.replaceAll("_", " ");
}

export default function BillingCard({
  restaurantId,
  billing,
  notice,
  readOnly = false,
}: {
  restaurantId: string;
  billing: BillingSummary;
  notice?: string | null;
  readOnly?: boolean;
}) {
  const presentation = STATUS_COPY[billing.status];
  const needsCheckout = [
    "not_started",
    "canceled",
    "incomplete_expired",
  ].includes(billing.status);
  const action = needsCheckout
    ? startRecurringBilling.bind(null, restaurantId)
    : openBillingPortal.bind(null, restaurantId);
  const actionLabel =
    billing.status === "past_due" || billing.status === "unpaid"
      ? "Resolve payment"
      : needsCheckout
        ? "Start recurring billing"
        : "Manage billing";
  const controlsEnabled = billing.actionsEnabled && !readOnly;

  return (
    <Panel className="min-w-0 overflow-hidden border-[#7fd1a2]/20">
      <SectionHeading
        tone="accent"
        icon={<CreditCard size={13} strokeWidth={1.75} aria-hidden />}
        hint={billing.recurringEnabled ? "recurring on" : "recurring off"}
      >
        Billing
      </SectionHeading>

      <div className="mt-4 flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-lg font-semibold text-[#f4f6f7]">{billing.plan}</p>
          <p className="mt-1 text-sm leading-6 text-[#aeb7bd]">{presentation.detail}</p>
        </div>
        <StatusPill tone={presentation.tone} dot>
          {presentation.label}
        </StatusPill>
      </div>

      <dl className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <dt className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
            <RefreshCw size={11} strokeWidth={1.75} aria-hidden />
            Recurring
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-[#eef2f4]">
            {billing.recurringEnabled ? "On" : "Off"}
          </dd>
        </div>
        <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <dt className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
            <CalendarDays size={11} strokeWidth={1.75} aria-hidden />
            Next payment
          </dt>
          <dd className="mt-1.5 break-words text-sm font-medium text-[#eef2f4]">
            {formatDate(billing.nextPaymentAt || billing.currentPeriodEnd)}
          </dd>
        </div>
        <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:col-span-2">
          <dt className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
            <ReceiptText size={11} strokeWidth={1.75} aria-hidden />
            Latest invoice
          </dt>
          <dd className="mt-1.5 break-words text-sm font-medium capitalize text-[#eef2f4]">
            {invoiceLabel(billing.latestInvoiceStatus)}
          </dd>
        </div>
      </dl>

      {notice ? (
        <p
          className="mt-4 rounded-xl border border-[#4f9dff]/30 bg-[#4f9dff]/10 px-3 py-2 text-sm leading-6 text-[#bfdcff]"
          aria-live="polite"
        >
          {notice}
        </p>
      ) : null}

      <form action={action} className="mt-4 min-w-0">
        <Button
          type="submit"
          variant={needsCheckout ? "accent" : "success"}
          className="min-w-0 w-full whitespace-normal text-center leading-5 sm:w-auto"
          disabled={!controlsEnabled}
        >
          <CreditCard size={14} strokeWidth={1.75} aria-hidden />
          {controlsEnabled ? actionLabel : "Billing setup pending"}
        </Button>
      </form>

      {!billing.actionsEnabled ? (
        <p className="mt-3 text-xs leading-5 text-[#7f8a91]">
          Payment controls activate after AMMA completes the secure Stripe setup.
        </p>
      ) : null}
    </Panel>
  );
}
