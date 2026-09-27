"use client";

import { useActionState } from "react";
import { requestBodegaOwnerLink, type ActionState } from "@/lib/owner/actions";
import styles from "./square-insights.module.css";

const initialState: ActionState = { ok: false, message: "" };

export default function BodegaSquareLogin({ destination = "insights" }: { destination?: "insights" | "billing" }) {
  const [state, formAction, pending] = useActionState(requestBodegaOwnerLink.bind(null, destination), initialState);
  const billing = destination === "billing";
  return <section className={styles.setup} aria-labelledby="square-sign-in-title">
    <p>One link to get started</p>
    <h2 id="square-sign-in-title">{billing ? "Your plan, one place." : "Let’s connect your menu."}</h2>
    <p>{billing ? "Enter your Bodega email. We’ll send one link to review your plan and set up payments." : "Enter your Bodega email. Open the link we send, then approve the connection in Square."}</p>
    <form action={formAction} className={styles.emailForm}>
      <label htmlFor="bodega-square-email">Bodega owner email</label>
      <input id="bodega-square-email" name="email" type="email" required autoComplete="email" spellCheck={false} placeholder="you@example.com…" />
      <button className={styles.primaryAction} type="submit" disabled={pending}>{pending ? "Sending link…" : "Email me a sign-in link"}</button>
    </form>
    {state.message ? <p role={state.ok ? "status" : "alert"} aria-live="polite" className={state.ok ? styles.formSuccess : styles.formError}>{state.message}</p> : null}
    <p className={styles.quiet}>{billing ? "Only Bodega’s approved owner can see billing details. Card details stay with Stripe." : "Only Bodega’s approved owner can open this view. Fina Calle never asks for your Square password."}</p>
  </section>;
}
