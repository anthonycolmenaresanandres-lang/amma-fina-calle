"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { cn } from "@/components/ui";
import { getBrandAssets } from "@/lib/brand";
import { signInOwnerWithPassword, type ActionState } from "@/lib/owner/actions";
import styles from "./owner-portal.module.css";

const initialState: ActionState = { ok: false, message: "" };

export default function OwnerLogin({
  restaurantId,
  businessName,
  notice = null,
}: {
  restaurantId: string;
  businessName: string;
  notice?: string | null;
}) {
  const action = signInOwnerWithPassword.bind(null, restaurantId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const logo = getBrandAssets(restaurantId).logo;

  return (
    <div className={cn("fc-panel mx-auto min-w-0 w-full", styles.authFrame)}>
      <div className={styles.authBrand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo ? <img src={logo} alt={businessName} width={160} height={56} className={styles.authLogo} /> : <p className={styles.brandName}>Fina Calle</p>}
        <span>Your business,<br />beautifully connected.</span>
      </div>
      <p className={styles.kicker}>Your private owner portal</p>
      <h1>Welcome back.</h1>
      <p className={styles.authIntro}>Sign in to {businessName} for menu requests, account details and payment options.</p>

      {notice ? (
        <p className="mt-4 rounded-xl border border-[#4f9dff]/30 bg-[#4f9dff]/10 px-3 py-2 text-sm font-medium leading-6 text-[#bfdcff]">
          {notice}
        </p>
      ) : null}

      <form action={formAction} className={styles.authForm}>
        <label
          htmlFor="owner-email"
          className={styles.authLabel}
        >
          Email
        </label>
        <input
          id="owner-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          spellCheck={false}
          placeholder="you@example.com…"
          className={styles.authInput}
        />

        <label
          htmlFor="owner-password"
          className={styles.authLabel}
        >
          Password
        </label>
        <div className="relative">
          <input
            id="owner-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={4}
            maxLength={200}
            autoComplete="current-password"
            placeholder="Your password…"
            className={cn(styles.authInput, styles.passwordInput)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className={styles.passwordToggle}
          >
            {showPassword ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        </div>

        <button
          type="submit"
          disabled={pending}
          className={styles.primaryAction}
        >
          {pending ? (
            <>
              <Loader2 size={15} strokeWidth={2.25} aria-hidden className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <LockKeyhole size={15} strokeWidth={2} aria-hidden />
              Sign in
            </>
          )}
        </button>
      </form>

      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          aria-live="polite"
          className={`mt-4 rounded-xl border px-3 py-2 text-center text-sm font-medium ${
            state.ok
              ? "border-[#4f9dff]/30 bg-[#4f9dff]/10 text-[#bfdcff]"
              : "border-[#ff7a66]/30 bg-[#8f3e2e]/16 text-[#ffad9f]"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <p className={styles.authSecurity}>
        <ShieldCheck size={14} strokeWidth={1.75} aria-hidden />
        Use your assigned email and password. Sign out when using a shared device.
      </p>
      <div className={styles.authHelp}><Link href="/owner/guide">Owner guide</Link><Link href="/owner/guide#sign-in-help">Need help signing in?</Link></div>
    </div>
  );
}
