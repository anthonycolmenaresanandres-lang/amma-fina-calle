"use client";

import { useActionState } from "react";
import { requestMagicLink, type ActionState } from "@/lib/owner/actions";

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
  const action = requestMagicLink.bind(null, restaurantId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[#cfd6da]/16 bg-[#07090b]/82 p-6 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] backdrop-blur sm:p-8">
      <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">Owner sign-in</p>
      <h1 className="mt-4 text-3xl font-semibold text-[#f4f6f7]">{businessName}</h1>
      <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
        Enter the email on file for this restaurant. We&apos;ll send a one-time sign-in
        link — no password to remember.
      </p>

      {notice ? (
        <p className="mt-4 rounded-xl border border-[#d8b36d]/30 bg-[#d8b36d]/10 px-3 py-2 text-sm font-medium leading-6 text-[#f4d99c]">
          {notice}
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-3">
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
          className="w-full rounded-xl border border-[#cfd6da]/18 bg-[#11161a] px-3 py-2.5 text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none transition focus:border-[#d8b36d]/70 focus:ring-2 focus:ring-[#d8b36d]/18"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-[#eef2f4] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#07090b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {pending ? "Sending link..." : "Email me a sign-in link"}
        </button>
      </form>

      {state.message ? (
        <p
          className={`mt-4 rounded-xl border px-3 py-2 text-center text-sm font-medium ${
            state.ok
              ? "border-[#d8b36d]/30 bg-[#d8b36d]/10 text-[#f4d99c]"
              : "border-[#ff7a66]/30 bg-[#8f3e2e]/16 text-[#ffad9f]"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
