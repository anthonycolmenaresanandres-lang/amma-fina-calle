"use client";

import { useActionState } from "react";
import { requestBodegaSquareLink, type ActionState } from "@/lib/owner/actions";
import styles from "./square-insights.module.css";

const initialState: ActionState = { ok: false, message: "" };

export default function BodegaSquareLogin() {
  const [state, formAction, pending] = useActionState(requestBodegaSquareLink, initialState);
  return <section className={styles.setup} aria-labelledby="square-sign-in-title">
    <p>One link to get started</p>
    <h2 id="square-sign-in-title">Let’s connect your menu.</h2>
    <p>Enter the email you use for Bodega. We’ll send you a sign-in link. Then sign in to Square and approve the connection. No new password to remember.</p>
    <form action={formAction} className={styles.emailForm}>
      <label htmlFor="bodega-square-email">Bodega owner email</label>
      <input id="bodega-square-email" name="email" type="email" required autoComplete="email" spellCheck={false} placeholder="you@example.com…" />
      <button className={styles.primaryAction} type="submit" disabled={pending}>{pending ? "Sending link…" : "Email me a sign-in link"}</button>
    </form>
    {state.message ? <p role={state.ok ? "status" : "alert"} aria-live="polite" className={state.ok ? styles.formSuccess : styles.formError}>{state.message}</p> : null}
    <p className={styles.quiet}>Only the Bodega owner email approved for this account can open the private view. Fina Calle never asks for your Square password.</p>
  </section>;
}
