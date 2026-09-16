import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Alfa_Slab_One } from "next/font/google";
import { ArrowDown, ArrowUpRight, MoveRight, Trophy } from "lucide-react";
import FinaCalleFooter from "@/components/FinaCalleFooter";
import { GRAN_PATRON_LINKS as links } from "@/table-os/menu/gran-patron";
import GranPatronMenu from "./GranPatronMenu";
import styles from "./GranPatron.module.css";

const western = Alfa_Slab_One({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-palmas-western" });
export const metadata: Metadata = {
  title: "Gran Patrón · Princess Anne Menu & Shootout | Fina Calle",
  description: "Explore the food, lunch, dinner and drinks menu for Gran Patrón on Princess Anne Road, Virginia Beach. A Fina Calle preview.",
  alternates: { canonical: links.menu }, robots: { index: false, follow: false, nocache: true },
};
export default function GranPatronPage() {
  return <main className={`${styles.page} ${western.variable}`}>
    <a href="#menu" className={styles.skip}>Skip to menu</a>
    <Link href={links.game} className={styles.gameBar} prefetch={false}><Trophy aria-hidden="true" /><span>Five shots. Your moment.<strong>Play Gran Patrón Shootout</strong></span><MoveRight aria-hidden="true" /></Link>
    <div className={styles.shell}>
      <header className={styles.brand}><Image src="/assets/granpatron/logo.png" alt="Gran Patrón Mexican Bar & Grill" width={600} height={315} sizes="280px" preload /><p>Princess Anne · Virginia Beach</p></header>
      <section className={styles.hero} aria-labelledby="welcome">
        <div className={styles.heroCopy}><p className={styles.eyebrow}>From our kitchen to your table</p><h1 id="welcome">Big flavor.<br /><span>Gran Patrón.</span></h1><p>Explore sizzling fajitas, seafood, burritos and margaritas. Find your next favorite.</p><div className={styles.actions}><a href="#menu" className={styles.primary}>View menu <ArrowDown aria-hidden="true" /></a><a href={links.order} target="_blank" rel="noopener noreferrer" className={styles.secondary}>Order online <ArrowUpRight aria-hidden="true" /><span className={styles.srOnly}> (opens a new tab)</span></a></div></div>
        <figure className={styles.heroPhoto}><Image src="/assets/granpatron/menu/menu_item_6973755.webp" alt="Molcajete Cielo, Mar Y Tierra, served in a traditional stone bowl" width={800} height={800} sizes="(max-width: 700px) 100vw, 460px" preload /><figcaption><span>Land. Sea. And a little spectacle.</span>Molcajete Cielo, Mar Y Tierra</figcaption></figure>
      </section>
      <GranPatronMenu />
      <section className={styles.visit}><p className={styles.eyebrow}>Join us at the table</p><h2>Made for a good time.</h2><p>5168 Princess Anne Rd, Ste 145<br />Virginia Beach, Virginia</p><a href={links.game}>A little friendly competition <MoveRight aria-hidden="true" /></a></section>
      <FinaCalleFooter />
    </div>
  </main>;
}
