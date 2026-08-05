import {
  ExternalLink,
  History,
  LogOut,
} from "lucide-react";
import {
  Button,
  ButtonLink,
  Eyebrow,
  Panel,
  SectionHeading,
  cn,
} from "@/components/ui";
import type { BillingSummary } from "@/lib/billing/types";
import type { PaymentNotice, ZelleInstructions } from "@/lib/zelle/types";
import AskBar from "./AskBar";
import BillingCard from "./BillingCard";
import ZellePaymentCard from "./ZellePaymentCard";
import styles from "./owner-portal.module.css";

const COLATTAO_MENU_URL = "https://colattao-cafe-rush.vercel.app/menu";

export type ItemSize = { label: string; price: number | string };

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  photo_url: string | null;
  is_available: boolean;
  sizes?: ItemSize[] | null;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export type AuditEntry = {
  id: string;
  actor_email: string | null;
  table_name: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

export type DashboardData = {
  restaurantId: string;
  businessName: string;
  siteUrl: string | null;
  email: string;
  logo?: string | null;
  categories: MenuCategory[];
  audit: AuditEntry[];
  billing?: BillingSummary;
  billingNotice?: string | null;
  paymentNotices?: PaymentNotice[];
  zelleInstructions?: ZelleInstructions;
};

function publicMenuHref(restaurantId: string): string {
  return restaurantId === "colattao" ? COLATTAO_MENU_URL : `/m/${restaurantId}`;
}

const FIELD_LABELS: Record<string, string> = {
  price: "price",
  name: "name",
  description: "description",
  is_available: "availability",
  open_time: "opening time",
  close_time: "closing time",
  is_closed: "open/closed",
};

const OWNER_SECTIONS = [
  { number: "01", label: "Request", href: "#owner-request" },
  { number: "02", label: "Billing", href: "#owner-billing" },
  { number: "03", label: "History", href: "#owner-history" },
] as const;

/** Human label for an audit field, including per-size prices ("sizes:Large" → "Large price"). */
function fieldLabel(name: string): string {
  if (name.startsWith("sizes:")) return `${name.slice("sizes:".length)} price`;
  return FIELD_LABELS[name] ?? name;
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

// --- Dashboard ---------------------------------------------------------------

export default function OwnerDashboard({
  data,
  readOnly = false,
}: {
  data: DashboardData;
  readOnly?: boolean;
}) {
  const allItems = data.categories.flatMap((c) =>
    c.items.map((it) => ({ ...it, category: c.name })),
  );
  return (
    <div className={styles.dashboard}>
      <header className={styles.masthead}>
        <div className={styles.brandBlock}>
          <Eyebrow>Owner</Eyebrow>
          <div className={styles.brandLockup}>
            {data.logo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.logo}
                  alt=""
                  width={160}
                  height={48}
                  className={styles.brandLogo}
                />
                <h1 className="sr-only">{data.businessName}</h1>
              </>
            ) : (
              <h1 className={styles.brandName}>{data.businessName}</h1>
            )}
          </div>
        </div>
        <div className={styles.utilityActions}>
          <ButtonLink href={publicMenuHref(data.restaurantId)} variant="ghost">
            <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
            Menu
          </ButtonLink>
          {readOnly ? (
            <Button variant="subtle" disabled>
              <LogOut size={14} strokeWidth={1.75} aria-hidden />
              Sign out
            </Button>
          ) : (
            <form action={`/owner/${data.restaurantId}/signout`} method="post">
              <Button variant="subtle" type="submit">
                <LogOut size={14} strokeWidth={1.75} aria-hidden />
                Sign out
              </Button>
            </form>
          )}
        </div>
      </header>

      <nav className={styles.sectionIndex} aria-label="Owner portal sections">
        <ol className={styles.indexList}>
          {OWNER_SECTIONS.map((section) => (
            <li key={section.href}>
              <a className={styles.indexLink} href={section.href}>
                <span className={styles.indexNumber} aria-hidden="true">
                  {section.number}
                </span>
                <span>{section.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className={styles.board}>
        <section
          id="owner-request"
          aria-label="Request"
          tabIndex={-1}
          className={cn(styles.requestFrame, styles.sectionAnchor)}
        >
          <AskBar
            restaurantId={data.restaurantId}
            items={allItems.map((item) => ({
              name: item.name,
              price: item.price,
              is_available: item.is_available,
            }))}
            demo={readOnly}
          />
        </section>

        <section
          id="owner-billing"
          tabIndex={-1}
          className={cn(styles.moneyFrame, styles.sectionAnchor)}
          aria-labelledby="owner-billing-heading"
        >
          <h2 id="owner-billing-heading" className={styles.frameLabel}>
            <span className={styles.frameNumber}>02</span>
            Billing
          </h2>
          {data.billing ? (
            <BillingCard
              restaurantId={data.restaurantId}
              billing={data.billing}
              notice={data.billingNotice}
              readOnly={readOnly}
            />
          ) : null}
          {data.zelleInstructions ? (
            <ZellePaymentCard
              restaurantId={data.restaurantId}
              instructions={data.zelleInstructions}
              notices={data.paymentNotices ?? []}
              readOnly={readOnly}
            />
          ) : null}
        </section>

        <section
          id="owner-history"
          aria-label="History"
          tabIndex={-1}
          className={cn(styles.activityFrame, styles.sectionAnchor)}
        >
          <Panel>
            <SectionHeading
              tone="accent"
              icon={<History size={13} strokeWidth={1.75} aria-hidden />}
            >
              <span className={styles.frameNumber}>03</span>
              History
            </SectionHeading>
            {data.audit.length === 0 ? (
              <p className="mt-4 text-sm text-[#aeb7bd]">No changes yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.audit.map((entry) => (
                  <li
                    key={entry.id}
                    className={cn(
                      styles.rowCard,
                      "flex items-center justify-between gap-3 border border-white/[0.05] px-3.5 py-2.5 text-sm",
                    )}
                  >
                    <span className={styles.historyValue}>
                      {fieldLabel(entry.field_name)} → {entry.new_value ?? "—"}
                    </span>
                    <span className="shrink-0 text-[0.7rem] text-[#7f8a91]">
                      {timeAgo(entry.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
      </div>

      <p className={styles.footerMark}>Fina Calle OS</p>
    </div>
  );
}
