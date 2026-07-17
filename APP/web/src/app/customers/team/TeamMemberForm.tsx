"use client";

import { useActionState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button, Field } from "@/components/ui";
import {
  addTeamMember,
  type TeamActionState,
} from "@/lib/admin/team-actions";

const initialState: TeamActionState = { ok: false, message: "" };

export default function TeamMemberForm() {
  const [state, formAction, pending] = useActionState(addTeamMember, initialState);

  return (
    <form action={formAction} className="mt-5 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]">
          Employee name
          <Field name="displayName" required maxLength={120} autoComplete="name" />
        </label>
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]">
          Job title
          <Field name="jobTitle" required maxLength={120} placeholder="Sales, Operations..." />
        </label>
      </div>
      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]">
        Exact sign-in email
        <Field name="email" type="email" required maxLength={300} autoComplete="email" />
      </label>
      <Button type="submit" variant="accent" disabled={pending} className="w-full sm:w-fit">
        {pending ? (
          <Loader2 size={14} className="animate-spin" aria-hidden />
        ) : (
          <UserPlus size={14} aria-hidden />
        )}
        {pending ? "Authorizing" : "Authorize employee"}
      </Button>
      {state.message ? (
        <p
          className={`rounded-xl border px-3 py-2.5 text-sm ${
            state.ok
              ? "border-[#7fd1a2]/30 bg-[#7fd1a2]/10 text-[#9fe5bd]"
              : "border-[#ff7a66]/30 bg-[#8f3e2e]/16 text-[#ffad9f]"
          }`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
