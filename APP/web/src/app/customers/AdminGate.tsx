import Link from "next/link";
import { ShieldX, Wrench } from "lucide-react";
import type { AdminContext } from "@/lib/admin/auth";
import { Eyebrow, Monogram, PageShell, Panel } from "@/components/ui";
import AdminLogin from "./AdminLogin";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <PageShell width="4xl">
      <div className="flex flex-1 flex-col items-center justify-center py-10">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-3 transition hover:opacity-90"
        >
          <Monogram name="Fina Calle" />
          <span className="text-sm font-semibold uppercase tracking-[0.32em] text-[#cfd6da]">
            Fina Calle OS
          </span>
        </Link>
        {children}
      </div>
    </PageShell>
  );
}

/**
 * Renders the non-authorized states for the admin-gated customer registry.
 * Only callers that have already confirmed ctx.state !== "authorized" use this.
 */
export default function AdminGate({ ctx }: { ctx: AdminContext }) {
  if (ctx.state === "unconfigured") {
    return (
      <Shell>
        <Panel className="w-full max-w-md text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#4f9dff]/35 bg-[#4f9dff]/10 text-[#bfdcff]">
            <Wrench size={18} strokeWidth={1.75} aria-hidden />
          </span>
          <div className="mt-4 flex justify-center">
            <Eyebrow>Customer accounts</Eyebrow>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[#f4f6f7]">Setup needed</h1>
          <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
            Supabase isn&apos;t connected yet, so the admin registry is unavailable.
          </p>
        </Panel>
      </Shell>
    );
  }

  if (ctx.state === "unauthorized") {
    return (
      <Shell>
        <Panel className="w-full max-w-md text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#ff7a66]/40 bg-[#8f3e2e]/16 text-[#ffad9f]">
            <ShieldX size={18} strokeWidth={1.75} aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-[#f4f6f7]">Not authorized</h1>
          <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
            <span className="text-[#eef2f4]">{ctx.email}</span> isn&apos;t an admin for
            Fina Calle OS.
          </p>
          <form action="/customers/signout" method="post" className="mt-6">
            <button
              type="submit"
              className="rounded-full border border-[#cfd6da]/28 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#eef2f4] transition hover:border-[#4f9dff]/70 hover:bg-[#4f9dff]/10"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-5 inline-block text-[0.68rem] uppercase tracking-[0.24em] text-[#cfd6da]/60 transition hover:text-white"
          >
            Back to Fina Calle OS
          </Link>
        </Panel>
      </Shell>
    );
  }

  // anonymous
  return (
    <Shell>
      <AdminLogin />
    </Shell>
  );
}
