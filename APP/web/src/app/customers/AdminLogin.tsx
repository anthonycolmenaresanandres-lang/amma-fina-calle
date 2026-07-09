"use client";

import { useActionState } from "react";
import { Eyebrow } from "@/components/ui";
import { requestAdminMagicLink, type AdminActionState } from "@/lib/admin/actions";

const initialState: AdminActionState = { ok: false, message: "" };

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(requestAdminMagicLink, initialState);

  return (
    <div className="fc-panel w-full max-w-md p-6 sm:p-8">
      <Eyebrow>Admin sign-in</Eyebrow>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-[#f4f6f7]">
        <span className="rb-shiny-text">Customer Accounts</span>
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
        Internal operations view. Enter an authorized admin email to receive a
        one-time sign-in link.
      </p>

      <form action={formAction} className="mt-7 space-y-3">
        <label
          htmlFor="admin-email"
          className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]"
        >
          Admin email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="w-full rounded-xl border border-white/12 bg-[#0e1316] px-3.5 py-3 text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none transition focus:border-[#4f9dff]/70 focus:ring-2 focus:ring-[#4f9dff]/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#5aa6ff] to-[#3f86ee] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#0a0c0e] shadow-[0_14px_36px_-14px_rgba(79,157,255,0.65)] transition hover:from-[#7ab8ff] hover:to-[#4f9dff] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {pending ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0a0c0e]/30 border-t-[#0a0c0e]" />
              Sending link…
            </>
          ) : (
            "Email me a sign-in link"
          )}
        </button>
      </form>

      {state.message ? (
        <p
          className={`mt-4 rounded-xl border px-3 py-2.5 text-center text-sm font-medium ${
            state.ok
              ? "border-[#4f9dff]/30 bg-[#4f9dff]/10 text-[#bfdcff]"
              : "border-[#ff7a66]/30 bg-[#8f3e2e]/16 text-[#ffad9f]"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <p className="mt-6 text-center text-[0.68rem] leading-5 text-[#7f8a91]">
        Sign-in links expire after a short window and can only be used once.
      </p>
    </div>
  );
}
