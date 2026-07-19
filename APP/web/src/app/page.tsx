import Image from "next/image";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
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
  { label: "Systems", href: "#systems" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "/contact" },
];

const systems = [
  {
    code: "S-01",
    name: "Digital storefronts",
    body: "A premium public presence that makes the offer clear, earns trust, and gives every visitor one useful next step.",
    detail: "Identity · proof · conversion",
  },
  {
    code: "S-02",
    name: "QR menu experiences",
    body: "Fast, branded menu journeys designed for the phone already in your customer’s hand.",
    detail: "Menu · discovery · updates",
  },
  {
    code: "S-03",
    name: "Branded engagement",
    body: "Optional game and campaign layers that turn a routine visit into something customers remember.",
    detail: "Play · campaigns · return visits",
    href: "/conquest",
  },
  {
    code: "S-04",
    name: "Owner operations",
    body: "Structured request and owner tools that keep approvals, updates, and business control close to the people responsible.",
    detail: "Control · review · support",
  },
];

const process = [
  {
    step: "01",
    title: "Read the business",
    body: "We start with the customer, the bottleneck, and the action the business needs people to take.",
  },
  {
    step: "02",
    title: "Shape the system",
    body: "Identity, content, interface, and modules are designed as one coherent operating experience.",
  },
  {
    step: "03",
    title: "Approve the truth",
    body: "You review the visual direction and every public-facing business claim before production.",
  },
  {
    step: "04",
    title: "Build and verify",
    body: "We implement, test the real customer journey, and prepare the launch with clear ownership.",
  },
];

const controls = [
  {
    title: "Human approval",
    body: "Nothing factual ships on assumption. Your review is part of the system.",
  },
  {
    title: "Owner control",
    body: "The business stays understandable and manageable after the launch moment.",
  },
  {
    title: "POS separation",
    body: "Fina Calle billing and owner tools stay separate from your point-of-sale system.",
  },
];

export default function Home() {
  return (
    <main className={`${styles.page} ${display.variable}`}>
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
            <span className={styles.desktopCopy}>Start a build</span>
            <span className={styles.mobileCopy}>Start</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <section
        id="main-content"
        className={styles.hero}
        aria-labelledby="hero-heading"
        tabIndex={-1}
      >
        <div className={styles.heroAtmosphere} aria-hidden="true" />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span /> Virginia Beach · Digital systems for local business
            </p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              <span className={styles.desktopCopy}>A sharper digital presence.</span>
              <span className={styles.mobileCopy}>Sharper online.</span>
              <em>
                <span className={styles.desktopCopy}>A calmer business behind it.</span>
                <span className={styles.mobileCopy}>Calmer behind it.</span>
              </em>
            </h1>
            <p className={styles.heroBody}>
              Fina Calle builds premium storefronts, branded customer
              experiences, and owner tools as one connected system for
              ambitious local businesses.
            </p>

            <div className={styles.heroActions}>
              <Link href="/request-update" className={styles.primaryAction}>
                Plan your build <span aria-hidden="true">↗</span>
              </Link>
              <Link href="#work" className={styles.secondaryAction}>
                See verified work <span aria-hidden="true">↓</span>
              </Link>
            </div>

            <p className={styles.assurance}>
              <span>Human-approved</span>
              <span>Modular by design</span>
              <span>Separate from your POS</span>
            </p>
          </div>

          <div className={styles.instrumentWrap}>
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
                priority
                sizes="(max-width: 900px) 82vw, 44vw"
              />

              <div className={`${styles.coreLabel} ${styles.coreLabelOne}`}>
                <small>Customer layer</small>
                <strong>Storefront</strong>
              </div>
              <div className={`${styles.coreLabel} ${styles.coreLabelTwo}`}>
                <small>Brand layer</small>
                <strong>Experience</strong>
              </div>
              <div className={`${styles.coreLabel} ${styles.coreLabelThree}`}>
                <small>Owner layer</small>
                <strong>Operations</strong>
              </div>
            </div>

            <div className={styles.coreStatus}>
              <span className={styles.liveSignal} aria-hidden="true" />
              <p>
                <small>Operating principle</small>
                <strong>One engine. Swappable parts.</strong>
              </p>
              <span className={styles.statusCode}>FC / 001</span>
            </div>
          </div>
        </div>

        <div className={styles.heroFoot} aria-label="Fina Calle principles">
          <span>Local-business systems</span>
          <span>Built in Virginia Beach</span>
          <span>Design first · approval always</span>
        </div>
      </section>

      <section id="work" className={styles.proof} aria-labelledby="proof-heading">
        <div className={styles.sectionShell}>
          <div className={styles.proofIntro}>
            <p className={styles.eyebrowDark}>Flagship proof · Colattao Cafe Rush</p>
            <h2 id="proof-heading" className={styles.sectionTitleDark}>
              <span className={styles.desktopCopy}>One neighborhood brand.</span>
              <span className={styles.mobileCopy}>One brand.</span>
              <em>
                <span className={styles.desktopCopy}>Three connected digital moments.</span>
                <span className={styles.mobileCopy}>Three moments.</span>
              </em>
            </h2>
            <p className={styles.proofBody}>
              Colattao is the working reference for the Fina Calle approach: a
              customer-facing QR menu, a branded game layer, and owner tools
              designed as parts of the same system.
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

          <div className={styles.proofVisual}>
            <div className={styles.proofImageWrap}>
              <Image
                src="/assets/colattao/colattao-menu-hero-4x5-v1.webp"
                alt="Coffee and pastry presentation used in the Colattao digital menu"
                fill
                className={styles.proofImage}
                sizes="(max-width: 900px) 92vw, 43vw"
              />
              <div className={styles.proofStamp}>
                <span>Flagship</span>
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
                <dt>Engagement</dt>
                <dd>Branded play</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>Operating tools</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="systems" className={styles.systems} aria-labelledby="systems-heading">
        <div className={styles.sectionShellNarrow}>
          <div className={styles.sectionHeadingRow}>
            <div>
              <p className={styles.eyebrow}>The operating system</p>
              <h2 id="systems-heading" className={styles.sectionTitle}>
                <span className={styles.desktopCopy}>Start with what moves the business.</span>
                <span className={styles.mobileCopy}>Only what matters.</span>
                <em>
                  <span className={styles.desktopCopy}>Add only what earns its place.</span>
                  <span className={styles.mobileCopy}>Nothing extra.</span>
                </em>
              </h2>
            </div>
            <p>
              A frozen engine with swappable parts keeps each build distinctive
              without rebuilding the company from zero.
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
                <Link key={system.code} href={system.href} className={styles.systemRow}>
                  {content}
                </Link>
              ) : (
                <article key={system.code} className={styles.systemRow}>
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

      <section id="process" className={styles.process} aria-labelledby="process-heading">
        <div className={styles.sectionShellNarrow}>
          <div className={styles.processIntro}>
            <p className={styles.eyebrowDark}>A disciplined build sequence</p>
            <h2 id="process-heading" className={styles.sectionTitleDark}>
              <span className={styles.desktopCopy}>Intricate where it matters.</span>
              <span className={styles.mobileCopy}>Built with discipline.</span>
              <em>
                <span className={styles.desktopCopy}>Calm where you operate it.</span>
                <span className={styles.mobileCopy}>Calm to run.</span>
              </em>
            </h2>
          </div>

          <ol className={styles.processList}>
            {process.map((item) => (
              <li key={item.step}>
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

      <section className={styles.control} aria-labelledby="control-heading">
        <div className={styles.controlGrid}>
          <div className={styles.controlIntro}>
            <p className={styles.eyebrow}>Calm by design</p>
            <h2 id="control-heading" className={styles.sectionTitle}>
              <span className={styles.desktopCopy}>
                Powerful systems should make the owner feel
              </span>
              <span className={styles.mobileCopy}>You stay</span>
              <em>
                <span className={styles.desktopCopy}>more in control, not less.</span>
                <span className={styles.mobileCopy}>in control.</span>
              </em>
            </h2>
          </div>

          <div className={styles.controlList}>
            {controls.map((item) => (
              <article key={item.title}>
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

      <section className={styles.close} aria-labelledby="close-heading">
        <div className={styles.closeGlow} aria-hidden="true" />
        <p className={styles.eyebrow}>Your next operating layer</p>
        <h2 id="close-heading">
          <span className={styles.desktopCopy}>Ready for something that feels</span>
          <span className={styles.mobileCopy}>Built for</span>
          <em>
            <span className={styles.desktopCopy}>built, not bought?</span>
            <span className={styles.mobileCopy}>your business.</span>
          </em>
        </h2>
        <p className={styles.closeBody}>
          Tell us the business, the bottleneck, and the outcome. We’ll reply
          with a clear direction, the right package, and a fixed quote.
        </p>
        <div className={styles.closeActions}>
          <Link href="/request-update" className={styles.primaryActionLight}>
            Plan my build <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/contact" className={styles.secondaryAction}>
            Contact AMMA Ventures
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <p>
            <span className={styles.desktopCopy}>Still scrolling? Good. The strategy worked.</span>
            <span className={styles.mobileCopy}>Still here? Good.</span>
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
