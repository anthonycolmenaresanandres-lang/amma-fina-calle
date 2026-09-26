"use client";
import { useEffect, useState } from "react";
import type { MuffinReceipt } from "@/lib/bodega-rewards/contracts";
import { displayClaimCode } from "@/lib/bodega-rewards/contracts";
import styles from "./page.module.css";

export default function MuffinClaim({ receipt }: { receipt: MuffinReceipt }) {
  const [copyMessage, setCopyMessage] = useState("");
  const [expiredAt, setExpiredAt] = useState<string | null>(null);
  useEffect(() => {
    const timeout = window.setTimeout(() => setExpiredAt(receipt.expiresAt), Math.max(0, Date.parse(receipt.expiresAt) - Date.now()));
    return () => clearTimeout(timeout);
  }, [receipt.expiresAt]);
  const valid = receipt.status === "valid" && expiredAt !== receipt.expiresAt;
  return <section className={styles.muffinTicket} aria-label="Your muffin claim">
    <p className={styles.ticketEyebrow}>{valid ? "You earned it" : receipt.status === "redeemed" ? "Already redeemed" : "Claim expired"}</p>
    <h3>One free muffin.</h3>
    {valid ? <>
      <p>Show this claim to Bodega staff in-store today, during cafe hours. One muffin per person for this promotion.</p>
      <code>{displayClaimCode(receipt.code)}</code>
      <button type="button" className={styles.ticketButton} onClick={async () => {
        try { await navigator.clipboard.writeText(displayClaimCode(receipt.code)); setCopyMessage("Claim copied."); }
        catch { setCopyMessage("Select the code to copy it, or show this screen to staff."); }
      }}>Copy claim code</button>
      <p>Expires at midnight tonight, Virginia Beach time, or after one use.</p>
      <span role="status">{copyMessage}</span>
    </> : <p>{receipt.status === "redeemed" ? "This claim has been used. It cannot be redeemed again." : "This same-day claim is no longer valid."} You can still play for fun.</p>}
  </section>;
}
