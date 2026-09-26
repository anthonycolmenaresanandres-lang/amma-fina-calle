import type { Metadata } from "next";
import Link from "next/link";
import { getOwnerContext } from "@/lib/owner/auth";
import OwnerLogin from "../../[id]/OwnerLogin";
import RequiredPasswordReset from "../../[id]/RequiredPasswordReset";
import RedeemMuffin from "./RedeemMuffin";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bodega — staff redemption", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function StaffRedemption() {
  const ctx = await getOwnerContext("bodega");
  return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link href="/owner/bodega">← Owner desk</Link><Link href="/demo/bodega">Menu</Link></nav>
    <header className={styles.hero}><p className={styles.eyebrow}>Bodega Cafe · Staff only</p><h1>One muffin.<br />One redemption.</h1></header>
    {ctx.state === "authorized" ? <>
      <RedeemMuffin />
      <form action="/owner/bodega/signout" method="post"><button className={styles.primary}>Sign out of staff access</button></form>
    </> : ctx.state === "anonymous" ? <OwnerLogin restaurantId="bodega" businessName="Bodega Cafe" notice="Sign in with an authorized Bodega staff account to verify and redeem claims." />
      : ctx.state === "password_reset_required" ? <RequiredPasswordReset restaurantId="bodega" businessName="Bodega Cafe" email={ctx.email} />
      : <section className={styles.section}><h2>Staff access is not ready.</h2><p>{ctx.state === "unauthorized" ? "This account is not authorized for Bodega." : "Staff redemption has not been configured."} The public owner desk remains available; it cannot redeem rewards.</p><Link href="/contact">Contact Fina Calle</Link></section>}
  </div></main>;
}
