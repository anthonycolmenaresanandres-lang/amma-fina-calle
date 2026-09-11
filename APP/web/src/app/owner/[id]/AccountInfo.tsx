import type { OwnerAccountProfile } from "@/lib/owner/account-profile";

export default function AccountInfo({ businessName, email, profile, preview = false }: {
  businessName: string;
  email: string | null;
  profile: OwnerAccountProfile | null;
  preview?: boolean;
}) {
  const missing = preview ? "Pending confirmation" : profile ? "Not provided" : "Unavailable";
  const rows = [
    ["Business", businessName],
    ["Signed in as", email || (preview ? "No active owner account" : "Unavailable")],
    ["Billing name", profile?.billingName || missing],
    ["Account contact", profile?.contactName || missing],
    ["Contact email", profile?.contactEmail || missing],
    ["Contact phone", profile?.contactPhone || missing],
    ["Billing address", profile?.billingAddress.length ? profile.billingAddress.join(" · ") : missing],
  ];
  return <div className="min-w-0 sm:col-span-full">
    <h3 className="text-lg font-semibold text-[#f4f6f7]">Account information</h3>
    <p className="mt-2 text-sm leading-6 text-[#aeb7bd]">{preview
      ? "Local preview only. Las Palmas contact details and billing terms have not been confirmed."
      : profile ? "Details on your AMMA account. Use Request to ask for a correction; changing contact details does not grant portal access."
        : "Account details could not be loaded. Refresh or contact AMMA; payment status is shown separately below."}</p>
    <dl className="mt-5 grid min-w-0 gap-x-8 sm:grid-cols-2">
      {rows.map(([label, value]) => <div key={label} className="min-w-0 border-b border-white/10 py-3">
        <dt className="text-xs font-medium text-[#aeb7bd]">{label}</dt>
        <dd className="mt-1 break-words text-sm leading-6 text-[#eef2f4] [overflow-wrap:anywhere]">{value}</dd>
      </div>)}
    </dl>
  </div>;
}
