"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  confirmOwnerRequest,
  sendOwnerReview,
  triageOwnerRequest,
} from "@/lib/owner/request-desk/actions";
import { Card, Chip, buttonClass, cn } from "@/components/ui";

/**
 * The AI Request Desk — the owner's primary surface. Type a change in plain
 * words → instant preview → confirm → "live on your menu."
 *
 * Live (`demo=false`, signed-in dashboard): calls the server triage/confirm
 * actions, which apply through the audited `apply_owner_change` rail or file a
 * `change_request`. Demo (`demo=true`, login-free preview): a deterministic
 * client matcher so the experience is fully playable without auth.
 */

type Item = { name: string; price: number | string; is_available: boolean };

type Result =
  | { kind: "apply"; title: string; detail: string }
  | { kind: "review"; reason: string }
  | null;

function money(v: number | string) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? `$${n.toFixed(2)}` : "Ask";
}

// Demo-only deterministic matcher (mirrors the server triage's headline cases).
function parse(text: string, items: Item[]): Result {
  const t = ` ${text.toLowerCase().trim()} `;
  if (!t.trim()) return null;
  const found = items.find((it) => t.includes(it.name.toLowerCase()));
  if (found && /\b(86|sold out|out of|hide|unavailable|we.?re out|ran out)\b/.test(t)) {
    return { kind: "apply", title: `86 “${found.name}”`, detail: "It disappears from your live menu until you bring it back." };
  }
  if (found && /\b(bring back|back on|available again|show|un.?86)\b/.test(t)) {
    return { kind: "apply", title: `Bring back “${found.name}”`, detail: "It returns to your live menu right away." };
  }
  const priceMatch = t.match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (found && priceMatch && /(\$|\bto\b|\bprice\b|\bnow\b|\bmake\b|dollar)/.test(t)) {
    return { kind: "apply", title: `Change “${found.name}” price`, detail: `${money(found.price)} → $${Number(priceMatch[1]).toFixed(2)} — live on your menu.` };
  }
  return { kind: "review", reason: "I’ll pass this to the Fina Calle team — they’ll handle it and follow up." };
}

const CHIPS = ["86 the Flan Latte", "change Mocha to $8", "bring back Cortado"];

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
          title: `${s.proposal.entityLabel} · ${s.proposal.fieldLabel}`,
          detail: `${s.proposal.currentDisplay} → ${s.proposal.newDisplay} — live on your menu.`,
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
      setDone(kind === "apply" ? "✓ Done — it’s live on your menu. Customers see it now." : "✓ Sent to the Fina Calle team. You’ll hear back.");
      setResult(null);
      setText("");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("text", submitted);
      if (kind === "apply") {
        const r = await confirmOwnerRequest(restaurantId ?? "", { phase: "idle" }, fd);
        setDone(r.phase === "applied" ? `✓ ${r.message} Customers see it now.` : r.phase === "error" ? r.message : "Done.");
        if (r.phase === "applied") router.refresh();
      } else {
        const r = await sendOwnerReview(restaurantId ?? "", { phase: "idle" }, fd);
        setDone(r.phase === "sent" ? "✓ Sent to the Fina Calle team. You’ll hear back." : r.phase === "error" ? r.message : "Sent.");
      }
      setResult(null);
      setText("");
    });
  }

  return (
    <Card className="relative overflow-hidden border-[#d8b36d]/18">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_-20%,rgba(216,179,109,0.16),transparent_44%)]" />
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#d8b36d]">
        ✦ AI Request Desk
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#f4f6f7]">Ask for any change</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#aeb7bd]">
        Just say it — “86 the Flan Latte”, “change the Mocha to $8”. You preview and confirm
        before anything goes live.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (interactive) analyze(text);
        }}
        className="mt-4 flex items-center gap-2 rounded-full border border-white/14 bg-[#0e1316] py-2 pl-4 pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus-within:border-[#d8b36d]/55 focus-within:ring-2 focus-within:ring-[#d8b36d]/20"
      >
        <span aria-hidden className="text-sm text-[#d8b36d]/80">✦</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!interactive || pending}
          placeholder="What would you like to change today?"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none disabled:opacity-70"
          aria-label="Ask for a change"
        />
        <button
          type="submit"
          disabled={!interactive || !text.trim() || pending}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8b36d] text-base font-semibold text-[#080a0c] shadow-[0_8px_20px_-8px_rgba(216,179,109,0.75)] transition hover:bg-[#e6c585] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "…" : "→"}
        </button>
      </form>

      {!result && !done ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((c) =>
            interactive ? (
              <button
                key={c}
                type="button"
                disabled={pending}
                onClick={() => {
                  setText(c);
                  analyze(c);
                }}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#c8d0d4] transition hover:border-[#d8b36d]/50 hover:text-white disabled:opacity-50"
              >
                {c}
              </button>
            ) : (
              <Chip key={c}>{c}</Chip>
            ),
          )}
        </div>
      ) : null}

      {result?.kind === "apply" ? (
        <div className="mt-3 rounded-2xl border border-[#d8b36d]/30 bg-[#d8b36d]/8 px-4 py-3">
          <p className="text-sm font-semibold text-[#f4d99c]">{result.title}</p>
          <p className="mt-1 text-sm text-[#e7d6b4]/90">{result.detail}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={confirm} disabled={pending} className={buttonClass("primary")}>
              {pending ? "Applying…" : "Confirm change"}
            </button>
            <button type="button" onClick={reset} disabled={pending} className={buttonClass("ghost")}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {result?.kind === "review" ? (
        <div className="mt-3 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3">
          <p className="text-sm text-[#c8d0d4]">{result.reason}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={confirm} disabled={pending} className={buttonClass("primary")}>
              {pending ? "Sending…" : "Send to the team"}
            </button>
            <button type="button" onClick={reset} disabled={pending} className={buttonClass("ghost")}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {done ? (
        <div className={cn("mt-3 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3", "border-[#7fd1a2]/35 bg-[#173a2b]/45 text-[#bdf0d4]")}>
          <p className="text-sm font-medium">{done}</p>
          <button type="button" onClick={reset} className={buttonClass("ghost", "shrink-0")}>
            Done
          </button>
        </div>
      ) : null}
    </Card>
  );
}
