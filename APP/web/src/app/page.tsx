import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { Barlow_Condensed } from "next/font/google";
import { LandingMotion } from "./LandingMotion";
import motion from "./page.module.css";
import styles from "./comic.module.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: "800",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fc-display",
});

const companyNav = [
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Support", href: "/contact#support" },
];

export const metadata: Metadata = {
  title: "Fina Calle | Family-owned consulting & digital delivery",
  description: "Family-owned consulting in Virginia Beach. Clear business direction and hands-on digital delivery, with verified work and a written scope for every project.",
  openGraph: {
    title: "Fina Calle | Clear direction. Hands-on delivery.",
    description: "Family-owned consulting and digital delivery for local businesses. Explore working projects and start a consultation.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Fina Calle | Family-owned consulting & digital delivery",
    description: "Clear business direction. Hands-on digital delivery. Start with a conversation and a written scope.",
  },
};

const process = [
  { step: "01", title: "Talk it through", body: "Tell us what is getting in the way and what you want to improve." },
  { step: "02", title: "Agree the scope", body: "Define the deliverables, price and timing in writing before work begins." },
  { step: "03", title: "Build and verify", body: "Review the design and working experience together before approving launch." },
];

export default function Home() {
  return (
    <main className={`${motion.page} ${styles.page} ${display.variable}`} data-motion-root>
      <LandingMotion canvasClassName={motion.dustCanvas} />
      <div className={motion.journeyRail} data-journey-rail aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
      </div>
      <Link href="#main-content" className={motion.skipLink}>Skip to content</Link>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="Fina Calle home">
            <strong>Fina Calle</strong>
            <span className={styles.brandMeta}>by AMMA Ventures</span>
          </Link>
          <nav className={styles.nav} aria-label="Main navigation">
            {companyNav.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
          <Link href="/request-update" className={styles.headerCta}>
            Let’s talk <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <section id="main-content" data-page="01" className={styles.hero} aria-labelledby="hero-heading" tabIndex={-1}>
        <div className={motion.heroAtmosphere} aria-hidden="true" />
        <div className={motion.registrationPlate} data-motion-plate aria-hidden="true" />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-motion-reveal="copy">
            <p className={styles.eyebrow}>Family-owned consulting · Virginia Beach</p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              <span>Clear direction.</span>
              <em>Hands-on delivery.</em>
            </h1>
            <p className={styles.heroBody}>
              We help local businesses make a plan and build the website,
              menu or digital experience to match.
            </p>
            <div className={styles.heroActions}>
              <Link href="/request-update" className={styles.primaryAction}>
                Start a consultation <span aria-hidden="true">↗</span>
              </Link>
              <Link href="#work" className={styles.secondaryAction}>
                See the work <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>

          <div className={`${motion.instrumentWrap} ${styles.instrumentWrap}`} data-motion-reveal="art">
            <div className={motion.instrument}>
              <div className={motion.instrumentTicks} aria-hidden="true" />
              <div className={motion.instrumentOrbit} aria-hidden="true"><span /></div>
              <div className={motion.instrumentGlow} aria-hidden="true" />
              <Image
                src="/assets/fina-calle-os-logo.png"
                alt="Fina Calle OS mechanical identity"
                width={1536}
                height={1536}
                className={motion.instrumentLogo}
                data-dust-source="crest"
                data-dust-next="02"
                data-dust-next-image="proof"
                priority
                sizes="(max-width: 900px) 82vw, 44vw"
              />
            </div>
            <p className={styles.artCaption}>Think it through. See it through.</p>
          </div>
        </div>
      </section>

      <section id="work" data-page="02" className={styles.work} aria-labelledby="proof-heading" tabIndex={-1}>
        <div className={motion.registrationPlate} data-motion-plate aria-hidden="true" />
        <div className={styles.sectionInner}>
          <div className={styles.workGrid}>
            <div className={styles.proofVisual} data-motion-reveal="panel">
              <div className={styles.proofImageWrap}>
                <Image
                  src="/assets/colattao/colattao-menu-hero-4x5-v1.webp"
                  alt="Coffee and pastry presentation used in the Colattao digital menu"
                  fill
                  className={`${motion.proofImage} ${styles.proofImage}`}
                  data-dust-target="proof"
                  sizes="(max-width: 900px) 86vw, 36vw"
                />
              </div>
            </div>

            <div className={styles.workCopy} data-motion-reveal="copy">
              <p className={styles.label}>Live client menu</p>
              <h2 id="proof-heading" className={styles.sectionTitle}>Colattao.</h2>
              <p className={styles.proofBody}>
                A real café. A working mobile menu. Explore the categories,
                dishes and prices in your browser.
              </p>
              <div className={styles.workLinks}>
                <a href="https://colattao-cafe-rush.vercel.app/menu" target="_blank" rel="noopener noreferrer" className={styles.primaryAction}>
                  Open the live menu <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <Link href="/case-studies/colattao" className={styles.secondaryAction}>
                  View case study <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <Link href="/penalty-shootout" className={styles.demoLink}>
                <span className={styles.label}>Playable demo</span>
                <strong>Penalty Shootout <span aria-hidden="true">↗</span></strong>
                <p>Five shots. Try the game engine. Client branding and custom work are scoped separately.</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="process" data-page="03" className={styles.process} aria-labelledby="process-heading" tabIndex={-1}>
        <div className={motion.registrationPlate} data-motion-plate aria-hidden="true" />
        <div className={styles.sectionInner}>
          <div className={styles.processHeader} data-motion-reveal="copy">
            <p className={styles.eyebrow}>How we work</p>
            <h2 id="process-heading" className={styles.sectionTitle}>Talk. Plan. Build.</h2>
          </div>
          <ol className={`${motion.processList} ${styles.processList}`}>
            {process.map((item) => (
              <li key={item.step} data-motion-reveal="panel">
                <span>{item.step}</span>
                <div><h3>{item.title}</h3><p>{item.body}</p></div>
              </li>
            ))}
          </ol>
          <div className={styles.contactRow}>
            <div className={motion.closeGlow} aria-hidden="true" />
            <h3 className={styles.contactTitle} data-motion-reveal="copy">What needs to work better?</h3>
            <div className={styles.contactActions} data-motion-reveal="action">
              <Link href="/request-update" className={`${motion.primaryActionLight} ${styles.primaryAction}`}>
                Start a consultation <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/contact#support" className={styles.supportLink}>Existing customer? Get support ↗</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="restaurants" data-page="04" className={styles.restaurant} aria-labelledby="restaurant-heading">
        <div className={styles.restaurantInner}>
          <div>
            <p className={styles.eyebrow}>For restaurants</p>
            <h2 id="restaurant-heading" className={styles.restaurantTitle}>Your menu. One stable QR.</h2>
          </div>
          <div>
            <p className={styles.price}>Starting at <strong>$199</strong><span>/month per location</span></p>
            <p className={styles.packageNote}>Consulting and custom work require a separate written scope.</p>
          </div>
          <Link href="/for-restaurants" className={styles.restaurantLink}>See packages <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>Family-owned. Built with care.</p>
          <a href="https://www.instagram.com/fina_calle?igsh=MXUyZjZwODg3a3hjag==" target="_blank" rel="noopener noreferrer" aria-label="Fina Calle on Instagram (opens in a new tab)">@fina_calle ↗</a>
        </div>
        <div className={styles.footerMeta}>
          <span>AMMA Ventures LLC DBA Fina Calle</span>
          <span>Virginia Beach, Virginia · © 2026</span>
        </div>
      </footer>
    </main>
  );
}
