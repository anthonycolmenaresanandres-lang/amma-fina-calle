import {
  ArrowUpRight,
  BookOpen,
  CreditCard,
  ExternalLink,
  History,
  LogOut,
  MessageCircle,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import {
  Button,
  ButtonLink,
  Panel,
  SectionHeading,
  cn,
} from "@/components/ui";
import type { BillingSummary } from "@/lib/billing/types";
import type { PaymentNotice, ZelleInstructions } from "@/lib/zelle/types";
import AskBar from "./AskBar";
import MenuQuickEdit from "./MenuQuickEdit";
import { ownerGuestMenuPath } from "@/lib/owner/menu-control";
import BillingCard from "./BillingCard";
import AccountInfo from "./AccountInfo";
import type { OwnerAccountProfile } from "@/lib/owner/account-profile";
import ZellePaymentCard from "./ZellePaymentCard";
import styles from "./owner-portal.module.css";

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
  menuConnectionNotice?: string | null;
  account?: OwnerAccountProfile | null;
};

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
  { label: "Edit menu", detail: "One item at a time", icon: Utensils, href: "#owner-menu" },
  { label: "Payments", detail: "Your account, clearly", icon: CreditCard, href: "#owner-billing" },
  { label: "Contact", detail: "Talk to Fina Calle", icon: MessageCircle, href: "#owner-request" },
  { label: "History", detail: "Your recent changes", icon: History, href: "#owner-history" },
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
          <p className={styles.brandEyebrow}>Fina Calle <span aria-hidden> / </span> Owner portal</p>
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
                <p className={styles.restaurantName}>{data.businessName}</p>
              </>
            ) : (
              <p className={styles.brandName}>{data.businessName}</p>
            )}
          </div>
        </div>
        <div className={styles.utilityActions}>
          <ButtonLink href={ownerGuestMenuPath(data.restaurantId)} variant="ghost">
            <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
            Guest menu
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

      <div className={styles.welcome}>
        <div>
          <p className={styles.kicker}>A little less admin. More hospitality.</p>
          <h1>Your restaurant.<br /><em>At your fingertips.</em></h1>
          <p className={styles.welcomeIntro}>A place for the small updates that keep your business moving.</p>
        </div>
        <Link href="/owner/guide" className={styles.guideLink}>
          <BookOpen size={20} strokeWidth={1.5} aria-hidden />
          <span>New here?<strong>Open your owner guide</strong></span>
          <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>

      <nav className={styles.sectionIndex} aria-label="Owner portal sections">
        <ul className={styles.indexList}>
          {OWNER_SECTIONS.map((section) => (
            <li key={section.href}>
              <a className={styles.indexLink} href={section.href}>
                <section.icon size={20} strokeWidth={1.5} aria-hidden />
                <span>{section.label}<small>{section.detail}</small></span>
                <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden className={styles.indexArrow} />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.board}>
        <section id="owner-menu" aria-labelledby="owner-menu-heading" tabIndex={-1} className={cn(styles.menuFrame, styles.sectionAnchor)}>
          <div className={styles.sectionHeading}><p className={styles.kicker}>The everyday essentials</p><h2 id="owner-menu-heading" className={styles.frameLabel}>Make a small menu update.</h2></div>
          {data.menuConnectionNotice ? <p role="status" className={styles.connectionNotice}>{data.menuConnectionNotice}</p> : null}
          {readOnly ? <p className={styles.emptyState}>Direct menu editing is available only to an authorized owner. This preview does not save changes.</p>
            : data.restaurantId === "colattao" ? <div className={styles.menuRequest}><p>Your guest menu runs on the separate Colattao site. Send us the one or two items you need to change; Fina Calle will review the update.</p><a href="#owner-request" className={styles.textLink}>Request a menu update <ArrowUpRight size={17} aria-hidden /></a><span>Direct publishing to the Colattao menu is not connected here yet.</span></div>
              : <MenuQuickEdit restaurantId={data.restaurantId} categories={data.categories} />}
        </section>

        <section
          id="owner-billing"
          tabIndex={-1}
          className={cn(styles.moneyFrame, styles.sectionAnchor)}
          aria-labelledby="owner-billing-heading"
        >
          <div className={styles.sectionHeading}><p className={styles.kicker}>Everything in its place</p><h2 id="owner-billing-heading" className={styles.frameLabel}>Your account &amp; payments.</h2></div>
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
          <AccountInfo businessName={data.businessName} email={data.email} profile={data.account ?? null} />
        </section>

        <section id="owner-request" aria-label="Contact Fina Calle" tabIndex={-1} className={cn(styles.requestFrame, styles.sectionAnchor)}>
          <AskBar restaurantId={data.restaurantId} items={allItems.map((item) => ({ name: item.name, price: item.price, is_available: item.is_available }))} demo={readOnly} />
        </section>

        <section
          id="owner-history"
          aria-label="Recent changes"
          tabIndex={-1}
          className={cn(styles.activityFrame, styles.sectionAnchor)}
        >
          <Panel>
            <SectionHeading
              tone="accent"
              icon={<History size={13} strokeWidth={1.75} aria-hidden />}
            >
              Recent changes
            </SectionHeading>
            {data.audit.length === 0 ? (
              <p className={styles.emptyState}>Your saved menu changes will appear here.</p>
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
                    <span className={styles.historyTime}>
                      {timeAgo(entry.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
      </div>

      <footer className={styles.footerMark}><Link href="/">Fina Calle<span>Made for the way you work.</span></Link><Link href="/owner/guide">Owner guide <ArrowUpRight size={15} aria-hidden /></Link></footer>
    </div>
  );
}
