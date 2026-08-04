"use client";

import { useActionState } from "react";
import { Building2, Loader2, QrCode, Send, ShieldCheck } from "lucide-react";
import { Button, Field, Panel, SectionHeading, StatusPill } from "@/components/ui";
import { submitZellePaymentNotice, type ZelleActionState } from "@/lib/zelle/actions";
import type { PaymentNotice, PaymentNoticeStatus, ZelleInstructions } from "@/lib/zelle/types";

const initialState: ZelleActionState = { ok: false, message: "" };
const statusTone: Record<PaymentNoticeStatus, "accent" | "success" | "danger"> = {
  reported: "accent",
  verified: "success",
  rejected: "danger",
};

function money(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

function shortDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function ZellePaymentCard({
  restaurantId,
  instructions,
  notices,
  readOnly = false,
}: {
  restaurantId: string;
  instructions: ZelleInstructions;
  notices: PaymentNotice[];
  readOnly?: boolean;
}) {
  const action = submitZellePaymentNotice.bind(null, restaurantId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const enabled = instructions.configured && !readOnly;

  return (
    <Panel className="min-w-0 overflow-hidden border-[#4f9dff]/20">
      <SectionHeading
        tone="accent"
        icon={<Building2 size={13} strokeWidth={1.75} aria-hidden />}
        hint="manual payment"
      >
        Pay with Zelle
      </SectionHeading>
      <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
        Use the Bank of America recipient below. Report only — AMMA verifies before marking paid.
      </p>

      {instructions.configured ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <dl className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">Send to</dt>
            <dd className="mt-1 break-words font-semibold text-[#eef2f4]">{instructions.recipientName}</dd>
            <dt className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">Enrolled email or phone</dt>
            <dd className="mt-1 break-all text-sm text-[#bfdcff]">{instructions.recipientHandle}</dd>
            <dt className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">Memo</dt>
            <dd className="mt-1 break-all text-sm text-[#eef2f4]">AMMA {restaurantId}</dd>
          </dl>
          {instructions.qrImageUrl ? (
            <div className="rounded-2xl border border-white/[0.08] bg-white p-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={instructions.qrImageUrl} alt="AMMA Bank of America Zelle QR code" className="mx-auto h-32 w-32 object-contain" />
              <span className="mt-1 inline-flex items-center gap-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#26323a]">
                <QrCode size={11} aria-hidden /> Scan in bank app
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-[#d8b36d]/25 bg-[#d8b36d]/8 px-3 py-2.5 text-sm leading-6 text-[#f4d99c]">
          Zelle instructions activate after AMMA verifies the Bank of America recipient and adds the server-only display settings.
        </p>
      )}

      <form action={formAction} className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]">
            Amount sent (USD)
            <Field name="amount" inputMode="decimal" placeholder="189.00" required disabled={!enabled || pending} />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]">
            Optional bank note
            <Field name="note" maxLength={500} placeholder="Confirmation or timing note" disabled={!enabled || pending} />
          </label>
        </div>
        <Button type="submit" variant="accent" disabled={!enabled || pending} className="w-full sm:w-fit">
          {pending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Send size={14} aria-hidden />}
          {pending ? "Reporting" : enabled ? "Report payment sent" : "Zelle setup pending"}
        </Button>
        {state.message ? (
          <p className={`rounded-xl border px-3 py-2.5 text-sm leading-6 ${state.ok ? "border-[#7fd1a2]/30 bg-[#7fd1a2]/10 text-[#9fe5bd]" : "border-[#ff7a66]/30 bg-[#8f3e2e]/16 text-[#ffad9f]"}`} aria-live="polite">
            {state.message}
          </p>
        ) : null}
      </form>

      <div className="mt-6 border-t border-white/[0.07] pt-5">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#aeb7bd]">
          <ShieldCheck size={13} aria-hidden /> Recent reports
        </h3>
        {notices.length === 0 ? (
          <p className="mt-3 text-sm text-[#7f8a91]">No Zelle payments have been reported for this account.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {notices.map((notice) => (
              <article key={notice.id} className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-[#eef2f4]">{money(notice.amountCents, notice.currency)}</p>
                  <p className="mt-0.5 break-all text-xs text-[#7f8a91]">{notice.referenceId} · {shortDate(notice.reportedAt)}</p>
                </div>
                <StatusPill tone={statusTone[notice.status]} dot>{notice.status}</StatusPill>
              </article>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
