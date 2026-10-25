"use client";

import { useEffect, useReducer, useRef } from "react";
import { ArrowUpRight, Minus, Plus, ReceiptText, RotateCcw, UserRound, X } from "lucide-react";
import { allocateEqualShares, exampleRemainingCents, initialSplitDemo, MAX_GUESTS, SAMPLE_BILL, splitDemoReducer, usd } from "./split-bill-demo";
import { resolveTablePayment } from "../table-payment";
import { tableLabel, type TableOsVenue } from "../venue-config";
import { MaracaiboWordmark } from "./MaracaiboWordmark";
import styles from "./split-bill.module.css";

export function MaracaiboSplitBill({ venue, tableId, onClose }: { venue: TableOsVenue; tableId: string; onClose: () => void }): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, dispatch] = useReducer(splitDemoReducer, initialSplitDemo);
  const liveUrl = resolveTablePayment(venue, tableId);
  const shares = allocateEqualShares(SAMPLE_BILL.totalCents, state.guests);
  const remainder = SAMPLE_BILL.totalCents % state.guests;
  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = previousOverflow; };
  }, []);

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="split-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className={styles.shell}>
      <header className={styles.header}><MaracaiboWordmark /><button type="button" className={styles.close} aria-label="Close split bill" onClick={onClose}><X aria-hidden="true" /></button></header>
      <div className={styles.heading}><span className={styles.eyebrow}>{tableLabel(tableId)} <span className={styles.badge}>{liveUrl ? "Toast handoff" : "DEMO"}</span></span><h1 id="split-title">Pay / Split bill</h1><p>{liveUrl ? "View your check, split & tip in Toast." : "Sample bill. No real payments."}</p></div>
      {liveUrl ? <section className={styles.live}><ReceiptText size={48} aria-hidden="true" /><h2>Your check lives in Toast</h2><p>Toast shows the actual tax, tips, balance & available split options. Returning here does not confirm payment.</p><a className={styles.primary} href={liveUrl} target="_blank" rel="noopener noreferrer">Open this table in Toast <ArrowUpRight aria-hidden="true" /><span className={styles.srOnly}> (new tab)</span></a></section> : <>
        <div className={styles.layout}>
          <section className={styles.receipt} aria-label="Fictional sample bill"><ReceiptText aria-hidden="true" /><span className={styles.label}>Sample table total</span><strong className={styles.total}>{usd(SAMPLE_BILL.totalCents)}</strong><dl>{SAMPLE_BILL.items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{usd(item.cents)}</dd></div>)}<div><dt>Example tax</dt><dd>{usd(SAMPLE_BILL.taxCents)}</dd></div></dl><p className={styles.caption}>Fictional items & prices · No tip included</p></section>
          <section className={styles.split} aria-labelledby="equal-title">
            <div className={styles.guestControl}><div><h2 id="equal-title">Split equally</h2><label htmlFor="split-guests">Guests</label></div><div className={styles.stepper}><button type="button" aria-label="Fewer guests" disabled={state.guests === 1} onClick={() => dispatch({ type: "guests", guests: state.guests - 1 })}><Minus aria-hidden="true" /></button><select id="split-guests" name="demo-guests" value={state.guests} onChange={(event) => dispatch({ type: "guests", guests: Number(event.target.value) })}>{Array.from({ length: MAX_GUESTS }, (_, i) => <option value={i + 1} key={i}>{i + 1}</option>)}</select><button type="button" aria-label="More guests" disabled={state.guests === MAX_GUESTS} onClick={() => dispatch({ type: "guests", guests: state.guests + 1 })}><Plus aria-hidden="true" /></button></div></div>
            <div className={styles.shares} role="group" aria-label="Choose an example guest share">{shares.map((cents, index) => <button type="button" key={index} aria-pressed={state.selected === index} onClick={() => dispatch({ type: "select", selected: index })}><UserRound aria-hidden="true" /><span>Guest {index + 1}</span><strong>{usd(cents)}</strong></button>)}</div>
            <p className={styles.rounding}>{remainder ? `First ${remainder === 1 ? "guest gets" : `${remainder} guests get`} the extra 1¢. All shares add up exactly.` : "Every share is equal. All shares add up exactly."}</p>
            <div className={styles.summary} aria-live="polite"><span>Guest {state.selected + 1} · Sample share</span><strong>{usd(shares[state.selected])}</strong></div>
            <button type="button" className={styles.primary} disabled={state.previewed} onClick={() => dispatch({ type: "preview" })}>Preview my share <ArrowUpRight aria-hidden="true" /></button>
            <div className={styles.result} role="status"><strong>{state.previewed ? "Share preview only. Nothing charged." : "Try the checkout preview"}</strong><span>Sample bill remaining{state.previewed ? " after this example share" : ""}: <b>{usd(exampleRemainingCents(state))}</b></span></div>
            <button type="button" className={styles.reset} onClick={() => dispatch({ type: "reset" })}><RotateCcw size={16} aria-hidden="true" />Reset demo</button>
          </section>
        </div>
        <details className={styles.owner}><summary>Owner setup <span>Toast connection required</span></summary><p>Provide verified per-table Toast links & confirm the enabled payment and equal-split features. Toast handles the real check, tax, tips, balance & payments. Item-based splitting requires a separate Mobile Order & Pay setup. This demo does not confirm Maracaibo eligibility.</p></details>
      </>}
      <button type="button" className={styles.back} onClick={onClose}>Back to table</button>
    </div>
  </dialog>;
}
