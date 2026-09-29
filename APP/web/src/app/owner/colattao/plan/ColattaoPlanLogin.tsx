"use client";

import { useActionState } from "react";
import { signInOwnerForPlan, type ActionState } from "@/lib/owner/actions";
import styles from "./plan.module.css";

const initialState: ActionState = { ok: false, message: "" };

export default function ColattaoPlanLogin() {
  const [state, action, pending] = useActionState(signInOwnerForPlan.bind(null, "colattao"), initialState);
  return <div className={styles.login}>
    <p>Your private payment details need an owner sign-in.</p>
    <form action={action}>
      <label htmlFor="colattao-plan-email">Owner email</label>
      <input id="colattao-plan-email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="colattao-plan-password">Password</label>
      <input id="colattao-plan-password" name="password" type="password" autoComplete="current-password" minLength={4} maxLength={200} required />
      <button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in to payments ↗"}</button>
    </form>
    {state.message ? <p role={state.ok ? "status" : "alert"}>{state.message}</p> : null}
  </div>;
}
