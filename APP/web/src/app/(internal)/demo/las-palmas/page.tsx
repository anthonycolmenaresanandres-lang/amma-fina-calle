import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Alfa_Slab_One } from "next/font/google";
import { ArrowUp, ChevronDown, ChevronRight, FileText, Gamepad2, TreePalm, UtensilsCrossed } from "lucide-react";
import { getLasPalmasGuestMenu } from "@/lib/owner/las-palmas-menu";
import { OFFICIAL_MENU_URL, previewItemDetails, previewSectionLabel } from "./menu-presentation";
import LasPalmasGuestNoteForm from "./LasPalmasGuestNoteForm";
import FinaCalleFooter from "@/components/FinaCalleFooter";
import styles from "./LasPalmasWestern.module.css";

// The printed QR contract is permanent. This visual release does not activate
// owner publishing, ordering, billing or table-service routing.
export const metadata: Metadata = {
  title: "Las Palmas · Menu preview | Fina Calle OS",
  description: "Explore the Las Palmas Lynnhaven menu preview. Mexican food, a table game, and the restaurant's full menu PDF. Prices pending restaurant confirmation.",
  alternates: { canonical: "/demo/las-palmas" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};
export const dynamic = "force-dynamic";
const western = Alfa_Slab_One({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-palmas-western" });
function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default async function LasPalmasDemoMenuPage(): Promise<React.JSX.Element> {
  const { sections, notice, state } = await getLasPalmasGuestMenu();
  const isPreview = state === "preview";

  return (
    <main className={western.variable + " " + styles.page} id="top">
      <a className={styles.skipLink} href="#menu">Skip to menu</a>
      <div className={styles.shell}>
        <aside className={styles.gameBar} aria-label="Las Palmas game">
          <Link href="/play/las-palmas" prefetch={false} className={styles.gameInvitation}>
            <Gamepad2 aria-hidden="true" />
            <span><small>Five shots. Big bragging rights.</small><strong>Cantina Shootout</strong></span>
            <span className={styles.playPill}>Play <ChevronRight aria-hidden="true" /></span>
          </Link>
        </aside>
        <header className={styles.hero}>
          <div className={styles.heroTop}>
          <div className={styles.brandRow}>
            <p className={styles.location}>Lynnhaven<span>Virginia Beach</span></p>
            <Image className={styles.logo} src="/assets/laspalmas/brand/las-palmas-original-sign-v1.png" alt="Las Palmas Mexican Restaurant & Cantina" width={600} height={389} preload />
            <p className={styles.approval}>Pending<span>client approval</span></p>
          </div>
          <div className={styles.heroCopy}>
            <h1><span>Big flavor.</span><span>Good times.</span></h1>
            <p>Mexican food <span aria-hidden="true">·</span> Cold drinks<br />Great company</p>
          </div>
          </div>
          <figure className={styles.foodHero}>
            <Image src="/assets/laspalmas/menu/texas-fajitas.webp" alt="Las Palmas Texas Fajitas with grilled steak, chicken, peppers and shrimp" width={640} height={640} sizes="(max-width: 800px) 100vw, 960px" loading="eager" fetchPriority="high" />
            <figcaption>Texas Fajitas <span>Las Palmas menu photo</span></figcaption>
          </figure>
          <div className={styles.actions}>
            <a className={styles.menuButton} href="#menu"><UtensilsCrossed aria-hidden="true" /><span>View menu</span><ChevronRight aria-hidden="true" /></a>
            <div className={styles.secondaryActions}>
              <Link href="/play/las-palmas" prefetch={false}><Gamepad2 aria-hidden="true" /><span>Pick your player</span></Link>
              <a href={OFFICIAL_MENU_URL} target="_blank" rel="noopener noreferrer"><FileText aria-hidden="true" /><span>Full menu PDF<span className={styles.srOnly}> (opens a new tab)</span></span></a>
            </div>
          </div>
        </header>

        <nav className={styles.categoryNav} aria-label="Menu sections">
          {sections.map((section) => (
            <a key={section.name} href={"#sec-" + slugify(section.name)}>{isPreview ? previewSectionLabel(section.name).short : section.name}</a>
          ))}
        </nav>

        <div className={styles.menuPaper} id="menu" tabIndex={-1}>
          <div className={styles.menuIntro}>
            <p className={styles.notice}><strong>Menu preview — awaiting restaurant approval.</strong>{isPreview ? "Public-source prices; portions and options vary. Confirm today's menu with staff." : notice}</p>
            <p>Tap a dish to see its details.</p>
          </div>
          {sections.length === 0 ? <p className={styles.emptyMenu} role="status">{state === "unavailable" ? notice : "No items are currently listed. Please ask staff."}</p> : null}
          {sections.map((section) => (
            <section key={section.name} id={"sec-" + slugify(section.name)} className={styles.menuSection}>
              <div className={styles.sectionHeading}><h2>{isPreview ? previewSectionLabel(section.name).full : section.name}</h2><TreePalm aria-hidden="true" /></div>
              {isPreview && section.name === "Lunch" ? <p className={styles.sectionNote}>Lunch specials: 11 am–3 pm daily. The public menu lists a $3 surcharge after 3 pm. Taco prices below are per taco; ceviche options are separate.</p> : null}
              <ul className={styles.items}>
                {section.items.map((item) => {
                  const detail = previewItemDetails(item, isPreview);
                  return (
                    <li key={item.name}>
                      <details className={styles.item}>
                        <summary><span className={styles.itemName}>{item.name}</span><span className={styles.price}>{detail.price}</span><ChevronDown className={styles.chevron} aria-hidden="true" /></summary>
                        <div className={styles.itemDetail}>
                          <div>
                            {item.description ? <p>{item.description}</p> : <p>Please ask staff about ingredients and preparation.</p>}
                            {detail.options ? <p className={styles.priceOptions}>{detail.options}</p> : null}
                            {isPreview ? <p className={styles.itemDisclaimer}>Public menu reference · confirm price and availability with staff.</p> : null}
                          </div>
                          {detail.photo ? (
                            // Owner media may be remote; retain the existing safe URL handling.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={detail.photo} alt={item.name} width={640} height={640} loading="lazy" decoding="async" />
                          ) : null}
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <aside className={styles.fullMenu}>
            <FileText aria-hidden="true" />
            <h2>There’s more on the menu.</h2>
            <p>{isPreview ? "This page keeps our 39-dish preview. " : ""}Find the restaurant’s additional dishes, vegetarian choices, kids’ meals, desserts and drinks in its full menu.</p>
            <a href={OFFICIAL_MENU_URL} target="_blank" rel="noopener noreferrer">Open restaurant menu PDF <span className={styles.srOnly}>(opens a new tab)</span><ChevronRight aria-hidden="true" /></a>
            <p className={styles.sourceNote}>Public PDF linked by <a href="https://www.laspalmas2mexicanvb.com/" target="_blank" rel="noopener noreferrer">Las Palmas Lynnhaven<span className={styles.srOnly}> (opens a new tab)</span></a>, checked September 13, 2026. Not a certification of today’s prices or availability.</p>
          </aside>
          <div className={styles.serviceNotice}>
            <strong>Need something at your table?</strong>
            <p>Please speak with restaurant staff. This general menu QR does not identify a table or send service requests.</p>
          </div>
          <LasPalmasGuestNoteForm />
          <footer className={styles.footer}><TreePalm aria-hidden="true" /><p>Las Palmas · Lynnhaven<br /><span>Menu preview by Fina Calle</span></p><a href="#top">Back to top <ArrowUp aria-hidden="true" /></a></footer>
        </div>
        <FinaCalleFooter />
      </div>
    </main>
  );
}
