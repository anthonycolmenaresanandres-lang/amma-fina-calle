import Link from "next/link";
import CustomerRequestForm from "@/components/CustomerRequestForm";

export const metadata = {
  title: "Request an Update | AMMA Ventures LLC DBA Fina Calle",
  description:
    "Customer change request foundation for AMMA/Fina Calle business updates, menu and content updates, files, and operational support.",
};

export default function RequestUpdatePage() {
  return (
    <main className="min-h-dvh bg-[#16100c] px-5 py-8 text-[#f7ead4] sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="py-4 lg:sticky lg:top-8">
          <Link href="/" className="text-sm font-semibold text-[#d9b66d] transition hover:text-[#f1cf83]">
            AMMA / Fina Calle
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase text-[#91b9c6]">
            Customer operations
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-[#fff7e8] sm:text-5xl">
            Request a business, menu, content, or support update.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#ead7b6]">
            This is the first reusable AMMA/Fina Calle request path, adapted from the Colattao owner
            update pattern. It gives business owners a controlled place to describe changes before
            any dashboard, billing, or automation is added.
          </p>
          <div className="mt-6 grid gap-3 text-sm leading-6 text-[#d5c2a5]">
            <p>Use it for customer change requests, business/contact updates, menu/content edits, and operational support.</p>
            <p>File selection is visible so the workflow is ready for future upload storage, but Phase 1 does not store files.</p>
            <p>No Stripe, auth, database, or automatic access control is active in this foundation.</p>
          </div>
        </section>

        <section aria-label="Customer request form">
          <CustomerRequestForm />
        </section>
      </div>
    </main>
  );
}
