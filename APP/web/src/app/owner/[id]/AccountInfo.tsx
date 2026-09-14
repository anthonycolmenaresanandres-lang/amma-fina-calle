import type { OwnerAccountProfile } from "@/lib/owner/account-profile";
import styles from "./owner-portal.module.css";

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
  return <div className={styles.accountInfo}>
    <h3>Account information</h3>
    <p className={styles.accountIntro}>{preview
      ? "Preview only. Contact details and billing terms still need confirmation."
      : profile ? "Your business and billing details. Contact Fina Calle below for corrections; changing a contact does not give them portal access."
        : "Account details could not be loaded. Refresh or contact Fina Calle below; payment status is shown separately."}</p>
    <dl className={styles.accountRows}>
      {rows.map(([label, value]) => <div key={label}>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>)}
    </dl>
  </div>;
}
