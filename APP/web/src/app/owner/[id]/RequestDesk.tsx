"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  confirmOwnerRequest,
  sendOwnerReview,
  triageOwnerRequest,
  type DeskResultState,
  type DeskTriageState,
} from "@/lib/owner/request-desk/actions";

const triageInit: DeskTriageState = { phase: "idle" };
const resultInit: DeskResultState = { phase: "idle" };

const cardClass =
  "rounded-2xl border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] backdrop-blur sm:p-6";
const fieldClass =
  "w-full rounded-lg border border-[#cfd6da]/18 bg-[#11161a] px-3 py-2 text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none transition focus:border-[#d8b36d]/70 focus:ring-2 focus:ring-[#d8b36d]/18";
const primaryBtn =
  "rounded-full bg-[#eef2f4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#07090b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45";
const ghostBtn =
  "rounded-full border border-[#cfd6da]/28 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#eef2f4] transition hover:border-[#d8b36d]/70";
const noticeBase = "mt-4 rounded-xl border px-3 py-3 text-sm leading-6";

export default function RequestDesk({ restaurantId }: { restaurantId: string }) {
  const [nonce, setNonce] = useState(0);
  return (
    <RequestDeskInner
      key={nonce}
      restaurantId={restaurantId}
      onReset={() => setNonce((n) => n + 1)}
    />
  );
}

function RequestDeskInner({
  restaurantId,
  onReset,
}: {
  restaurantId: string;
  onReset: () => void;
}) {
  const router = useRouter();
  const [text, setText] = useState("");

  const [triage, triageAction, triagePending] = useActionState(
    triageOwnerRequest.bind(null, restaurantId),
    triageInit,
  );
  const [confirmRes, confirmAction, confirmPending] = useActionState(
    confirmOwnerRequest.bind(null, restaurantId),
    resultInit,
  );
  const [sendRes, sendAction, sendPending] = useActionState(
    sendOwnerReview.bind(null, restaurantId),
    resultInit,
  );

  const applied = confirmRes.phase === "applied";
  const sent = sendRes.phase === "sent";
  const done = applied || sent;

  // Refresh server data (menu + change history) once a change lands.
  useEffect(() => {
    if (done) router.refresh();
  }, [done, router]);

  return (
    <section className={cardClass}>
      <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">Request Desk</p>
      <h2 className="mt-2 text-lg font-semibold text-[#f4f6f7]">Ask in plain language</h2>
      <p className="mt-2 text-sm leading-6 text-[#aeb7bd]">
        Type a change like “change the Mocha to $8”, “86 the Flan Latte”, or “rename
        the Mocha to Mocha Clásico”. You’ll see a preview and confirm before anything
        changes. Anything else goes to the AMMA team.
      </p>

      {done ? (
        <div className={`${noticeBase} border-[#7fd1a2]/35 bg-[#173a2b]/45 text-[#bdf0d4]`}>
          <p>
            {confirmRes.phase === "applied"
              ? confirmRes.message
              : sendRes.phase === "sent"
                ? sendRes.message
                : ""}
          </p>
          {sendRes.phase === "sent" ? (
            <p className="mt-1 text-xs text-[#9fe5bd]">Reference {sendRes.referenceId}</p>
          ) : null}
          <button type="button" onClick={onReset} className={`${ghostBtn} mt-3`}>
            Make another change
          </button>
        </div>
      ) : (
        <>
          <form action={triageAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              name="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={400}
              placeholder="What would you like to change?"
              aria-label="Describe the change"
              className={fieldClass}
            />
            <button type="submit" disabled={triagePending} className={`${primaryBtn} shrink-0`}>
              {triagePending ? "Checking…" : "Check"}
            </button>
          </form>

          {triage.phase === "error" ? (
            <p className={`${noticeBase} border-[#ff7a66]/30 bg-[#8f3e2e]/16 text-[#ffad9f]`}>
              {triage.message}
            </p>
          ) : null}

          {triage.phase === "apply" ? (
            <div className={`${noticeBase} border-[#d8b36d]/30 bg-[#d8b36d]/8 text-[#f4d99c]`}>
              <p className="text-[#eef2f4]">
                <span className="font-semibold">{triage.proposal.entityLabel}</span>{" "}
                {triage.proposal.fieldLabel}:{" "}
                <span className="text-[#aeb7bd]">{triage.proposal.currentDisplay}</span>{" "}
                <span aria-hidden>→</span>{" "}
                <span className="font-semibold text-[#bdf0d4]">{triage.proposal.newDisplay}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={confirmAction}>
                  <input type="hidden" name="text" value={triage.text} />
                  <button type="submit" disabled={confirmPending} className={primaryBtn}>
                    {confirmPending ? "Applying…" : "Confirm change"}
                  </button>
                </form>
                <button type="button" onClick={onReset} className={ghostBtn}>
                  Cancel
                </button>
              </div>
              {confirmRes.phase === "error" ? (
                <p className="mt-3 text-sm text-[#ffad9f]">{confirmRes.message}</p>
              ) : null}
            </div>
          ) : null}

          {triage.phase === "review" ? (
            <div className={`${noticeBase} border-[#cfd6da]/22 bg-[#151b20]/72 text-[#c8d0d4]`}>
              <p>{triage.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={sendAction}>
                  <input type="hidden" name="text" value={triage.text} />
                  <button type="submit" disabled={sendPending} className={primaryBtn}>
                    {sendPending ? "Sending…" : "Send to AMMA team"}
                  </button>
                </form>
                <button type="button" onClick={onReset} className={ghostBtn}>
                  Cancel
                </button>
              </div>
              {sendRes.phase === "error" ? (
                <p className="mt-3 text-sm text-[#ffad9f]">{sendRes.message}</p>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
