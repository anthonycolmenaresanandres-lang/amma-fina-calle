"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  confirmOwnerRequest,
  sendOwnerReview,
  triageOwnerRequest,
} from "@/lib/owner/request-desk/actions";
import { Card, Chip, buttonClass, cn } from "@/components/ui";

type Item = { name: string; price: number | string; is_available: boolean };

type Result =
  | { kind: "apply"; title: string; detail: string }
  | { kind: "review"; reason: string }
  | null;

function money(v: number | string) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? `$${n.toFixed(2)}` : "Ask";
}

function parse(text: string, items: Item[]): Result {
  const t = ` ${text.toLowerCase().trim()} `;
  if (!t.trim()) return null;
  const found = items.find((it) => t.includes(it.name.toLowerCase()));
  if (found && /\b(sold out|out of|hide|unavailable|we.?re out|ran out)\b/.test(t)) {
    return {
      kind: "apply",
      title: `Mark ${found.name} unavailable`,
      detail: "It will be hidden from the live menu until you bring it back.",
    };
  }
  if (found && /\b(bring back|back on|available again|show)\b/.test(t)) {
    return {
      kind: "apply",
      title: `Bring back ${found.name}`,
      detail: "It returns to your live menu right away.",
    };
  }
  const priceMatch = t.match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (found && priceMatch && /(\$|\bto\b|\bprice\b|\bnow\b|\bmake\b|dollar)/.test(t)) {
    return {
      kind: "apply",
      title: `Change ${found.name} price`,
      detail: `From ${money(found.price)} to $${Number(priceMatch[1]).toFixed(2)}. It goes live after you confirm.`,
    };
  }
  return {
    kind: "review",
    reason: "I will pass this to the Fina Calle team. They will handle it and follow up.",
  };
}

export default function AskBar({
  items,
  demo = false,
  restaurantId,
}: {
  items: Item[];
  demo?: boolean;
  restaurantId?: string;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const interactive = demo || Boolean(restaurantId);
  const primaryItem = items.find((item) => item.is_available) ?? items[0];
  const returnItem = items.find((item) => !item.is_available) ?? items[2] ?? primaryItem;
  const exampleName = primaryItem?.name ?? "an item";
  const chips = [
    primaryItem ? `mark ${primaryItem.name} unavailable` : null,
    primaryItem ? `change ${primaryItem.name} to $8` : null,
    returnItem ? `bring back ${returnItem.name}` : null,
  ].filter((chip): chip is string => Boolean(chip));

  function analyze(value: string) {
    if (!value.trim()) return;
    setDone(null);
    setSubmitted(value);
    if (demo) {
      setResult(parse(value, items));
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("text", value);
      const s = await triageOwnerRequest(restaurantId ?? "", { phase: "idle" }, fd);
      if (s.phase === "apply") {
        setResult({
          kind: "apply",
          title: `${s.proposal.entityLabel} ${s.proposal.fieldLabel}`,
          detail: `From ${s.proposal.currentDisplay} to ${s.proposal.newDisplay}. It goes live after you confirm.`,
        });
      } else if (s.phase === "review") {
        setResult({ kind: "review", reason: s.reason });
      } else if (s.phase === "error") {
        setResult({ kind: "review", reason: s.message });
      } else {
        setResult(null);
      }
    });
  }

  function reset() {
    setText("");
    setSubmitted("");
    setResult(null);
    setDone(null);
  }

  function confirm() {
    const kind = result?.kind;
    if (demo) {
      setDone(
        kind === "apply"
          ? "Done. It is live on your menu. Customers see it now."
          : "Sent to the Fina Calle team. You will hear back.",
      );
      setResult(null);
      setText("");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("text", submitted);
      if (kind === "apply") {
        const r = await confirmOwnerRequest(restaurantId ?? "", { phase: "idle" }, fd);
        setDone(
          r.phase === "applied"
            ? `${r.message} Customers see it now.`
            : r.phase === "error"
              ? r.message
              : "Done.",
        );
        if (r.phase === "applied") router.refresh();
      } else {
        const r = await sendOwnerReview(restaurantId ?? "", { phase: "idle" }, fd);
        setDone(
          r.phase === "sent"
            ? "Sent to the Fina Calle team. You will hear back."
            : r.phase === "error"
              ? r.message
              : "Sent.",
        );
      }
      setResult(null);
      setText("");
    });
  }

  return (
    <Card className="relative overflow-hidden border-[#d8b36d]/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8b36d]/70 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#d8b36d]">
            Request Desk
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f4f6f7]">
            Ask for any change
          </h2>
        </div>
        <span className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]">
          Review first
        </span>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aeb7bd]">
        Type a menu, price, photo, campaign, or billing request. Direct menu edits show a preview
        before they go live.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (interactive) analyze(text);
        }}
        className="mt-5 grid gap-3 rounded-lg border border-white/12 bg-[#0e1316]/92 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus-within:border-[#d8b36d]/55 focus-within:ring-2 focus-within:ring-[#d8b36d]/20 sm:grid-cols-[1fr_auto]"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!interactive || pending}
          placeholder={`Example: change ${exampleName} to $8`}
          className="min-h-11 min-w-0 rounded-md bg-transparent px-3 text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none disabled:opacity-70"
          aria-label="Ask for a change"
        />
        <button
          type="submit"
          disabled={!interactive || !text.trim() || pending}
          aria-label="Send request"
          className="min-h-11 rounded-md bg-[#eef2f4] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#080a0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Checking" : "Review"}
        </button>
      </form>

      {!result && !done ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((c) =>
            interactive ? (
              <button
                key={c}
                type="button"
                disabled={pending}
                onClick={() => {
                  setText(c);
                  analyze(c);
                }}
                className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#c8d0d4] transition hover:border-[#d8b36d]/50 hover:text-white disabled:opacity-50"
              >
                {c}
              </button>
            ) : (
              <Chip key={c} className="rounded-md">
                {c}
              </Chip>
            ),
          )}
        </div>
      ) : null}

      {result?.kind === "apply" ? (
        <div className="mt-4 rounded-lg border border-[#d8b36d]/30 bg-[#d8b36d]/8 px-4 py-3">
          <p className="text-sm font-semibold text-[#f4d99c]">{result.title}</p>
          <p className="mt-1 text-sm leading-6 text-[#e7d6b4]/90">{result.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={confirm} disabled={pending} className={buttonClass("primary")}>
              {pending ? "Applying" : "Confirm change"}
            </button>
            <button type="button" onClick={reset} disabled={pending} className={buttonClass("ghost")}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {result?.kind === "review" ? (
        <div className="mt-4 rounded-lg border border-white/12 bg-white/[0.03] px-4 py-3">
          <p className="text-sm leading-6 text-[#c8d0d4]">{result.reason}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={confirm} disabled={pending} className={buttonClass("primary")}>
              {pending ? "Sending" : "Send to team"}
            </button>
            <button type="button" onClick={reset} disabled={pending} className={buttonClass("ghost")}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {done ? (
        <div
          className={cn(
            "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3",
            "border-[#7fd1a2]/35 bg-[#173a2b]/45 text-[#bdf0d4]",
          )}
        >
          <p className="text-sm font-medium">{done}</p>
          <button type="button" onClick={reset} className={buttonClass("ghost", "shrink-0")}>
            Done
          </button>
        </div>
      ) : null}
    </Card>
  );
}
