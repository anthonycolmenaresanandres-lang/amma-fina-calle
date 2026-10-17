"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInForEnrollment } from "./login";
import styles from "@/components/accounts/AccountWorkspace.module.css";
export default function EnrollmentLogin() {
  const [message, setMessage] = useState(""); const [pending, startTransition] = useTransition(); const router = useRouter();
  return <form onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); startTransition(async () => { const result = await signInForEnrollment(String(form.get("email") ?? ""), String(form.get("password") ?? "")); if (result.ok) router.refresh(); else setMessage("Sign-in was not confirmed. Check your existing owner account credentials."); }); }}>
    <p>Sign in with your existing verified owner account. Account creation and invitations are handled separately.</p>
    <label className={styles.field}><span>Owner email</span><input type="email" name="email" autoComplete="username" spellCheck={false} required maxLength={254} /></label>
    <label className={styles.field}><span>Password</span><input type="password" name="password" autoComplete="current-password" required maxLength={1024} /></label>
    <button className={styles.button} disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in to review"}</button><p role="status" aria-live="polite">{message}</p>
  </form>;
}
