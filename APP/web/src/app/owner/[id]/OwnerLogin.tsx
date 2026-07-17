"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Eyebrow } from "@/components/ui";
import { signInOwnerWithPassword, type ActionState } from "@/lib/owner/actions";

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

  return (
    <div className="fc-panel mx-auto min-w-0 w-full max-w-md overflow-hidden p-5 sm:p-8">
      <Eyebrow>Owner sign-in</Eyebrow>
      <h1 className="mt-4 break-words text-3xl font-semibold tracking-[-0.02em] text-[#f4f6f7]">
        {businessName}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
        Use the email and password assigned to this restaurant. Your session stays
        signed in on this device until you sign out.
      </p>

      {notice ? (
        <p className="mt-4 rounded-xl border border-[#4f9dff]/30 bg-[#4f9dff]/10 px-3 py-2 text-sm font-medium leading-6 text-[#bfdcff]">
          {notice}
        </p>
      ) : null}

      <form action={formAction} className="mt-6 min-w-0 space-y-3">
        <label
          htmlFor="owner-email"
          className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]"
        >
          Email
        </label>
        <input
          id="owner-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="min-w-0 max-w-full w-full rounded-xl border border-white/12 bg-[#0e1316] px-3.5 py-3 text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none transition focus:border-[#4f9dff]/70 focus:ring-2 focus:ring-[#4f9dff]/20"
        />

        <label
          htmlFor="owner-password"
          className="block pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="owner-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            maxLength={200}
            autoComplete="current-password"
            placeholder="Your password"
            className="min-w-0 w-full rounded-xl border border-white/12 bg-[#0e1316] px-3.5 py-3 pr-12 text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none transition focus:border-[#4f9dff]/70 focus:ring-2 focus:ring-[#4f9dff]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#7f8a91] transition hover:text-[#bfdcff]"
          >
            {showPassword ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-w-0 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#5aa6ff] to-[#3f86ee] px-4 py-3 text-center text-sm font-semibold uppercase leading-5 tracking-[0.08em] text-[#04121f] shadow-[0_14px_36px_-14px_rgba(79,157,255,0.65)] transition hover:from-[#7ab8ff] hover:to-[#4f9dff] disabled:cursor-not-allowed disabled:opacity-45 sm:px-5 sm:tracking-[0.14em]"
        >
          {pending ? (
            <>
              <Loader2 size={15} strokeWidth={2.25} aria-hidden className="animate-spin" />
              Signing in...
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
          className={`mt-4 rounded-xl border px-3 py-2 text-center text-sm font-medium ${
            state.ok
              ? "border-[#4f9dff]/30 bg-[#4f9dff]/10 text-[#bfdcff]"
              : "border-[#ff7a66]/30 bg-[#8f3e2e]/16 text-[#ffad9f]"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[0.68rem] leading-5 text-[#7f8a91]">
        <ShieldCheck size={13} strokeWidth={1.75} aria-hidden className="text-[#4f9dff]/70" />
        Passwords are verified securely and never stored by Fina Calle.
      </p>
    </div>
  );
}
