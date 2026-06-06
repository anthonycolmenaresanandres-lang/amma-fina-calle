import Link from "next/link";
import type { AdminContext } from "@/lib/admin/auth";
import AdminLogin from "./AdminLogin";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-10 text-[#f4f6f7] sm:px-8">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_18%,rgba(205,214,219,0.14),transparent_28%),radial-gradient(circle_at_18%_80%,rgba(216,179,109,0.08),transparent_26%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="relative mx-auto flex min-h-[60dvh] w-full max-w-4xl flex-col justify-center">
        {children}
      </div>
    </main>
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
        <div className="mx-auto w-full max-w-md rounded-2xl border border-[#cfd6da]/16 bg-[#07090b]/82 p-6 text-center">
          <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">Customer accounts</p>
          <h1 className="mt-4 text-2xl font-semibold text-[#f4f6f7]">Setup needed</h1>
          <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
            Supabase isn&apos;t connected yet, so the admin registry is unavailable.
          </p>
        </div>
      </Shell>
    );
  }

  if (ctx.state === "unauthorized") {
    return (
      <Shell>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-[#ff7a66]/24 bg-[#07090b]/82 p-6 text-center">
          <h1 className="text-2xl font-semibold text-[#f4f6f7]">Not authorized</h1>
          <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
            {ctx.email} isn&apos;t an admin for Fina Calle OS.
          </p>
          <form action="/customers/signout" method="post" className="mt-5">
            <button
              type="submit"
              className="rounded-full border border-[#cfd6da]/28 px-5 py-2 text-sm font-semibold text-[#eef2f4] transition hover:border-[#d8b36d]/70"
            >
              Sign out
            </button>
          </form>
          <Link href="/" className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-[#cfd6da]/60">
            Back to Fina Calle OS
          </Link>
        </div>
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
