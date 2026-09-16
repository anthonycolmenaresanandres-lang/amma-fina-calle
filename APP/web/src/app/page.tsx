import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { LandingMotion } from "./LandingMotion";
import styles from "./page.module.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fc-display",
});

const companyNav = [
  { label: "Work", href: "#work" },
  { label: "Consulting", href: "#systems" },
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

const systems = [
  {
    code: "Consult",
    name: "Find the useful next step",
    body: "Start with your business, what is getting in the way, and what you want to change. Together, we define a practical direction before deciding what to build.",
    detail: "Problem · priorities · scope",
  },
  {
    code: "Design",
    name: "Make the business clear",
    body: "Shape the words, layout and customer journey around what people need to understand and do. Review the direction on a real screen before launch.",
    detail: "Content · identity · experience",
  },
  {
    code: "Build",
    name: "Put the plan to work",
    body: "We handle the digital implementation: public websites, mobile menu experiences and scoped interactive work. Working examples on this page show what exists today.",
    detail: "Hands-on digital delivery",
  },
  {
    code: "Support",
    name: "Know what happens next",
    body: "Agree on ownership, launch checks and ongoing support in writing. Existing customers have a separate support route for changes and account questions.",
    detail: "Handoff · updates · support",
    href: "/contact#support",
  },
];

const process = [
  {
    step: "01",
    title: "Talk through the need",
    body: "Tell us what your business does, where the friction is, and what a useful outcome would look like.",
  },
  {
    step: "02",
    title: "Agree on the scope",
    body: "Review the deliverables, price, responsibilities and timing in writing. Consulting and custom work are scoped separately from restaurant packages.",
  },
  {
    step: "03",
    title: "Build and review together",
    body: "We implement the agreed work. You review the design, business information and working experience before approving launch.",
  },
  {
    step: "04",
    title: "Verify and hand over",
    body: "Check the real customer journey and confirm what is ready. Ongoing updates and support follow the agreed scope.",
  },
];

const controls = [
  {
    title: "A defined restaurant package",
    body: "A branded mobile menu, one selected existing game module, a private owner portal and print-ready QR files, with hosting and support within scope.",
  },
  {
    title: "Confirmed before launch",
    body: "Your written proposal defines setup, timing, update limits and recurring terms. Menu connections and authorized owner access are verified for your location.",
  },
  {
    title: "Custom work is separate",
    body: "Consulting, custom development and physical printing need separate written scope. Ordering, payments and POS integration are not included in the base package.",
  },
];

export default function Home() {
  return (
    <main className={`${styles.page} ${display.variable}`} data-motion-root>
      <LandingMotion canvasClassName={styles.dustCanvas} />
      <div className={styles.journeyRail} data-journey-rail aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <Link href="#main-content" className={styles.skipLink}>
        Skip to content
      </Link>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="Fina Calle OS home">
            <span className={styles.brandSignal} aria-hidden="true" />
            <span>
              <strong>Fina Calle OS</strong>
              <small>by AMMA Ventures</small>
            </span>
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {companyNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/request-update" className={styles.headerCta}>
            <span className={styles.desktopCopy}>Start a conversation</span>
            <span className={styles.mobileCopy}>Let’s talk</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <section
        id="main-content"
        data-page="01"
        className={styles.hero}
        aria-labelledby="hero-heading"
        tabIndex={-1}
      >
        <div className={styles.heroAtmosphere} aria-hidden="true" />
        <div className={styles.registrationPlate} data-motion-plate aria-hidden="true" />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy} data-motion-reveal="copy">
            <p className={styles.eyebrow}>
              <span /> Family-owned consulting · Virginia Beach
            </p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              <span>Clear direction.</span>
              <em>
                <span>Hands-on delivery.</span>
              </em>
            </h1>
            <p className={styles.heroBody}>
              We help local businesses decide what to improve, then design
              and build the digital tools to put that plan to work.
            </p>

            <div className={styles.heroActions}>
              <Link href="/request-update" className={styles.primaryAction}>
                Start a consultation <span aria-hidden="true">↗</span>
              </Link>
              <Link href="#work" className={styles.secondaryAction}>
                See verified work <span aria-hidden="true">↓</span>
              </Link>
            </div>

            <p className={styles.assurance}>
              <span>Family-owned</span>
              <span>Written scope</span>
              <span>Built with you</span>
            </p>
          </div>

          <div className={styles.instrumentWrap} data-motion-reveal="art">
            <div className={styles.instrument}>
              <div className={styles.instrumentTicks} aria-hidden="true" />
              <div className={styles.instrumentOrbit} aria-hidden="true">
                <span />
              </div>
              <div className={styles.instrumentGlow} aria-hidden="true" />
              <Image
                src="/assets/fina-calle-os-logo.png"
                alt="Fina Calle OS mechanical identity"
                width={1536}
                height={1536}
                className={styles.instrumentLogo}
                data-dust-source="crest"
                data-dust-next="02"
                data-dust-next-image="proof"
                priority
                sizes="(max-width: 900px) 82vw, 44vw"
              />

              <div className={`${styles.coreLabel} ${styles.coreLabelOne}`}>
                <small>Start with</small>
                <strong>Your business</strong>
              </div>
              <div className={`${styles.coreLabel} ${styles.coreLabelTwo}`}>
                <small>Define</small>
                <strong>The direction</strong>
              </div>
              <div className={`${styles.coreLabel} ${styles.coreLabelThree}`}>
                <small>Deliver</small>
                <strong>The work</strong>
              </div>
            </div>

            <div className={styles.coreStatus}>
              <span className={styles.liveSignal} aria-hidden="true" />
              <p>
                <small>Our approach</small>
                <strong>Think it through. See it through.</strong>
              </p>
              <span className={styles.statusCode}>FC / 001</span>
            </div>
          </div>
        </div>

        <div className={styles.heroFoot} aria-label="Fina Calle principles">
          <span>Consulting + digital delivery</span>
          <span>Built in Virginia Beach</span>
          <span>Design first · approval always</span>
        </div>
      </section>

      <section
        id="work"
        data-page="02"
        className={styles.proof}
        aria-labelledby="proof-heading"
      >
        <div className={styles.registrationPlate} data-motion-plate aria-hidden="true" />
        <div className={styles.sectionShell}>
          <div className={styles.proofIntro} data-motion-reveal="copy">
            <p className={styles.eyebrowDark}>Selected work · Live client menu</p>
            <h2 id="proof-heading" className={styles.sectionTitleDark}>
              <span>Real work.</span>
              <em>
                <span>Clear boundaries.</span>
              </em>
            </h2>
            <p className={styles.proofBody}>
              Colattao’s public menu is a working client project. Explore the
              menu, categories and prices in your browser. Game demonstrations
              show separate capabilities; they are not evidence of business results.
            </p>

            <div className={styles.proofLinks}>
              <Link href="/case-studies/colattao" className={styles.darkAction}>
                <span className={styles.desktopCopy}>Explore the case study</span>
                <span className={styles.mobileCopy}>View case study</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <a
                href="https://colattao-cafe-rush.vercel.app/menu"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textLinkDark}
              >
                Visit the public menu <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className={styles.proofVisual} data-motion-reveal="panel">
            <div className={styles.proofImageWrap}>
              <Image
                src="/assets/colattao/colattao-menu-hero-4x5-v1.webp"
                alt="Coffee and pastry presentation used in the Colattao digital menu"
                fill
                className={styles.proofImage}
                data-dust-target="proof"
                sizes="(max-width: 900px) 92vw, 43vw"
              />
              <div className={styles.proofStamp}>
                <span>Live menu</span>
                <strong>Colattao</strong>
                <small>Virginia Beach</small>
              </div>
            </div>

            <dl className={styles.proofFacts}>
              <div>
                <dt>Customer</dt>
                <dd>QR menu</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>Mobile browser</dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>Public project</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className={styles.projectIndex} aria-label="Working demonstrations">
          <article>
            <p className={styles.projectStatus}>Playable demo</p>
            <h3><Link href="/penalty-shootout">Penalty Shootout <span aria-hidden="true">↗</span></Link></h3>
            <p>Try the five-shot game engine. A demonstration of play, with client branding and custom work subject to scope.</p>
          </article>
          <article>
            <p className={styles.projectStatus}>Restaurant review demo</p>
            <h3><Link href="/demo/las-palmas">Las Palmas <span aria-hidden="true">↗</span></Link></h3>
            <p>Explore the public menu and game concept. Available for review; publication does not mean restaurant approval or account activation.</p>
          </article>
        </div>
      </section>

      <section
        id="systems"
        data-page="03"
        className={styles.systems}
        aria-labelledby="systems-heading"
      >
        <div className={styles.registrationPlate} data-motion-plate aria-hidden="true" />
        <div className={styles.sectionShellNarrow}>
          <div className={styles.sectionHeadingRow} data-motion-reveal="copy">
            <div>
              <p className={styles.eyebrow}>How we help</p>
              <h2 id="systems-heading" className={styles.sectionTitle}>
                <span>First, the business.</span>
                <em>
                  <span>Then, the build.</span>
                </em>
              </h2>
            </div>
            <p>
              You do not need to arrive with a technical specification.
              Start with the problem; we can work through the direction together.
            </p>
          </div>

          <div className={styles.systemRows}>
            {systems.map((system) => {
              const content = (
                <>
                  <span className={styles.systemCode}>{system.code}</span>
                  <h3>{system.name}</h3>
                  <p>{system.body}</p>
                  <span className={styles.systemDetail}>{system.detail}</span>
                  {system.href ? (
                    <span className={styles.systemArrow} aria-hidden="true">↗</span>
                  ) : null}
                </>
              );

              return system.href ? (
                <Link
                  key={system.code}
                  href={system.href}
                  className={styles.systemRow}
                  data-motion-reveal="panel"
                >
                  {content}
                </Link>
              ) : (
                <article
                  key={system.code}
                  className={styles.systemRow}
                  data-motion-reveal="panel"
                >
                  {content}
                </article>
              );
            })}
          </div>

          <div className={styles.researchNote}>
            <span>Research bench</span>
            <p>
              New AI and operations concepts stay clearly labeled until they
              are tested, verified, and ready for a real business.
            </p>
            <Link href="/rd">View R&amp;D ↗</Link>
          </div>
        </div>
      </section>

      <section
        id="process"
        data-page="04"
        className={styles.process}
        aria-labelledby="process-heading"
      >
        <div className={styles.registrationPlate} data-motion-plate aria-hidden="true" />
        <div className={styles.sectionShellNarrow}>
          <div className={styles.processIntro} data-motion-reveal="copy">
            <p className={styles.eyebrowDark}>From conversation to delivery</p>
            <h2 id="process-heading" className={styles.sectionTitleDark}>
              <span>A clear plan.</span>
              <em>
                <span>A shared finish line.</span>
              </em>
            </h2>
          </div>

          <ol className={styles.processList}>
            {process.map((item) => (
              <li key={item.step} data-motion-reveal="panel">
                <span>{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="restaurants"
        data-page="05"
        className={styles.control}
        aria-labelledby="control-heading"
      >
        <div className={styles.registrationPlate} data-motion-plate aria-hidden="true" />
        <div className={styles.controlGrid}>
          <div className={styles.controlIntro} data-motion-reveal="copy">
            <p className={styles.eyebrow}>For restaurants · A focused starting point</p>
            <h2 id="control-heading" className={styles.sectionTitle}>
              Your menu.<em>One stable QR.</em>
            </h2>
            <p className={styles.packagePrice}>Starting at <strong>$199</strong><span>/month per location</span></p>
            <p className={styles.packageNote}>Restaurant packages are one part of our work. Consulting and custom projects require a separate written scope.</p>
            <Link href="/for-restaurants" className={styles.secondaryAction}>Explore restaurant packages <span aria-hidden="true">↗</span></Link>
          </div>

          <div className={styles.controlList}>
            {controls.map((item) => (
              <article key={item.title} data-motion-reveal="panel">
                <span aria-hidden="true">✓</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-page="06"
        className={styles.close}
        aria-labelledby="close-heading"
      >
        <div className={styles.closeGlow} aria-hidden="true" />
        <div className={styles.registrationPlate} data-motion-plate aria-hidden="true" />
        <p className={styles.eyebrow} data-motion-reveal="copy">
          Start with a conversation
        </p>
        <h2 id="close-heading" data-motion-reveal="copy">
          What needs<em>to work better?</em>
        </h2>
        <p className={styles.closeBody} data-motion-reveal="panel">
          Tell us about your business, the problem and the outcome you have
          in mind. We’ll review the fit and discuss a written scope before work begins.
        </p>
        <div className={styles.closeActions} data-motion-reveal="action">
          <Link href="/request-update" className={styles.primaryActionLight}>
            Start a consultation <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/contact#support" className={styles.secondaryAction}>
            Existing customer? Get support
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <p>
            Family-owned. Built with care.
          </p>
          <a
            href="https://www.instagram.com/fina_calle?igsh=MXUyZjZwODg3a3hjag=="
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Fina Calle on Instagram"
          >
            @fina_calle ↗
          </a>
        </div>
        <div className={styles.footerMeta}>
          <span>AMMA Ventures LLC DBA Fina Calle</span>
          <span>Virginia Beach, Virginia</span>
          <span>© 2026</span>
        </div>
      </footer>
    </main>
  );
}
