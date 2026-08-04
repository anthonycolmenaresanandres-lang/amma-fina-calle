"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Eyebrow, cn } from "@/components/ui";
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
        className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]"
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
          className="min-w-0 w-full rounded-xl border border-white/12 bg-[#0e1316] px-3.5 py-3 pr-12 text-sm text-[#f4f6f7] outline-none transition focus:border-[#4f9dff]/70 focus:ring-2 focus:ring-[#4f9dff]/20"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#7f8a91] transition hover:text-[#bfdcff]"
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
      <Eyebrow>First sign-in</Eyebrow>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-[#f4f6f7]">
        Set your password.
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
        Secure {businessName} for {email}. Tools unlock after this step.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#5aa6ff] to-[#3f86ee] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#04121f] transition hover:from-[#7ab8ff] hover:to-[#4f9dff] disabled:cursor-not-allowed disabled:opacity-45"
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

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[0.68rem] leading-5 text-[#7f8a91]">
        <ShieldCheck size={13} aria-hidden className="text-[#4f9dff]/70" />
        AMMA never sees or stores your private password.
      </p>
    </div>
  );
}
