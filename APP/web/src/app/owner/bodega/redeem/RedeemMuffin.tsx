"use client";
import { useRef, useState } from "react";
import { normalizeClaimCode } from "@/lib/bodega-rewards/contracts";
import styles from "../page.module.css";

const labels: Record<string, string> = {
  valid: "Valid for one free muffin. Confirm the guest is in-store and has not received this promotion before.",
  redeemed: "Redeemed successfully. Hand over exactly one muffin.",
  already_redeemed: "Already redeemed. Do not give another muffin for this code.",
  expired: "Expired. Do not redeem this claim.",
  invalid: "Claim not found. Check the code with the guest.",
};

export default function RedeemMuffin() {
  const [code, setCode] = useState("");
  const [checkedCode, setCheckedCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function check(confirm: boolean) {
    const normalized = normalizeClaimCode(code);
    if (lock.current || !normalized || (confirm && (!confirmed || checkedCode !== normalized || status !== "valid"))) return;
    lock.current = true; setBusy(true);
    try {
      const response = await fetch("/api/bodega/rewards/redeem", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized, confirm, inStoreAndFirstReward: confirmed }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setStatus(data.status); setMessage(labels[data.status] || "Unexpected response. Do not fulfill; ask the manager.");
      setCheckedCode(normalized);
      if (data.status !== "valid") setConfirmed(false);
    } catch (error) {
      setStatus("error"); setCheckedCode(""); setConfirmed(false);
      setMessage(error instanceof Error ? error.message : "Unable to confirm redemption. Check again before handing over a muffin.");
    } finally { lock.current = false; setBusy(false); }
  }
  return <form className={styles.staffForm} onSubmit={(event) => { event.preventDefault(); void check(false); }}>
    <label htmlFor="muffin-code">Guest claim code
      <input id="muffin-code" name="claimCode" type="text" value={code} maxLength={80} autoComplete="off" spellCheck={false} disabled={busy}
        onChange={(event) => { setCode(event.target.value); setStatus(""); setMessage(""); setCheckedCode(""); setConfirmed(false); }} />
    </label>
    <button className={styles.primary} disabled={busy || !normalizeClaimCode(code)}>{busy ? "Checking…" : "Check claim"}</button>
    {message && <div className={styles.status} data-error={!["valid", "redeemed"].includes(status)} role="status">{message}</div>}
    {status === "valid" && <>
      <label className={styles.check}><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} />The guest is here in-store and has not received a muffin from this promotion before.</label>
      <button type="button" className={styles.primary} disabled={busy || !confirmed} onClick={() => { void check(true); }}>Redeem one muffin</button>
    </>}
    <p className={styles.small}>Any muffin qualifies. Claims expire after one use or at the end of the day earned, Virginia Beach time. Verify before fulfillment; never override an expired or used code from this page.</p>
  </form>;
}
