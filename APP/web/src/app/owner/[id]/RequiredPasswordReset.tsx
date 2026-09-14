"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui";
import {
  completeRequiredPasswordReset,
  type ActionState,
} from "@/lib/owner/actions";
import styles from "./owner-portal.module.css";

const initialState: ActionState = { ok: false, message: "" };

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: "new-password";
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className={styles.authLabel}
      >
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={4}
          maxLength={128}
          autoComplete={autoComplete}
          className={cn(styles.authInput, styles.passwordInput)}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className={styles.passwordToggle}
        >
          {visible ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
        </button>
      </div>
    </div>
  );
}

export default function RequiredPasswordReset({
  restaurantId,
  businessName,
  email,
}: {
  restaurantId: string;
  businessName: string;
  email: string;
}) {
  const action = completeRequiredPasswordReset.bind(null, restaurantId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className={cn("fc-panel mx-auto min-w-0 w-full", styles.authFrame)}>
      <p className={styles.kicker}>Your first visit</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-[#f4f6f7]">
        Set your password.
      </h1>
      <p className={styles.authIntro}>
        Create your private password for {businessName}. You are signed in as {email}.
      </p>

      <form action={formAction} className={styles.authForm}>
        <PasswordField
          id="new-owner-password"
          name="password"
          label="New password"
          autoComplete="new-password"
        />
        <PasswordField
          id="confirm-owner-password"
          name="confirmation"
          label="Confirm password"
          autoComplete="new-password"
        />
        <p className="text-xs leading-5 text-[#7f8a91]">
          Use at least 4 characters. Avoid names, repeated characters, and common passwords.
        </p>
        <button
          type="submit"
          disabled={pending}
          className={styles.primaryAction}
        >
          {pending ? (
            <>
              <Loader2 size={15} aria-hidden className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <KeyRound size={15} aria-hidden /> Save and open portal
            </>
          )}
        </button>
      </form>

      {state.message ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-4 rounded-xl border border-[#ff7a66]/30 bg-[#8f3e2e]/16 px-3 py-2 text-center text-sm font-medium text-[#ffad9f]"
        >
          {state.message}
        </p>
      ) : null}

      <p className={styles.authSecurity}>
        <ShieldCheck size={14} aria-hidden />
        Keep your password private. Fina Calle will never ask you to send it in a request.
      </p>
      <div className={styles.authHelp}><Link href="/owner/guide">Owner guide</Link><Link href="/owner/guide#sign-in-help">Sign-in help</Link></div>
    </div>
  );
}
