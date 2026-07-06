import Link from "next/link";
import Aurora from "@/components/reactbits/Aurora";
import ShinyText from "@/components/reactbits/ShinyText";

const IG =
  "https://www.instagram.com/fina_calle?igsh=MXUyZjZwODg3a3hjag==";

export default function Home() {
  return (
    <main className="fc-page">
      <div className="fc-bg">
        <div className="fc-vign" />
      </div>
      <Aurora className="fc-aurora" />
      <div className="fc-grain" />

      {/* NAV */}
      <nav className="fc-nav">
        <div className="fc-wm">
          <b>
            <ShinyText>Fina Calle OS</ShinyText>
          </b>
          <span>AMMA Ventures</span>
        </div>
        <div className="fc-links">
          <Link href="/m/colattao" className="fc-navlink">
            See a live menu
          </Link>
          <a href="#pricing" className="fc-navlink">
            Pricing
          </a>
          <Link href="/contact" className="fc-navlink fc-navcta">
            Talk to us
          </Link>
        </div>
      </nav>

      <div className="fc-shell">
        {/* HERO */}
        <section className="fc-hero">
          <div>
            <div className="fc-eyebrow fc-rise fc-d1">
              <span className="fc-kick">Fina Calle OS · Virginia Beach</span>
            </div>
            <h1 className="fc-h1">
              <span className="fc-mask fc-d2">
                <span>Your menu,</span>
              </span>
              <span className="fc-mask fc-d3">
                <span>
                  beautiful and <span className="fc-em">always current.</span>
                </span>
              </span>
            </h1>
            <p className="fc-es fc-rise fc-d4">Su menú, bello y siempre al día.</p>
            <p className="fc-sub fc-rise fc-d5">
              We build you a clean menu customers scan with a QR — on a page
              that&apos;s always up to date. You just ask for a change; we
              handle the tech. No apps. No website to learn.
            </p>
            <div className="fc-cta-row fc-rise fc-d6">
              <Link href="/m/colattao" className="fc-btn gold">
                See a live menu <span className="fc-arw">→</span>
              </Link>
              <Link href="/contact" className="fc-btn ghost">
                Talk to us
              </Link>
            </div>
            <div className="fc-trust fc-rise fc-d6">
              <span>Live at Colattao</span>
              <span className="fc-dot" />
              <span>No setup fee</span>
              <span className="fc-dot" />
              <span>Bilingüe · EN/ES</span>
            </div>
          </div>

          <div className="fc-phwrap fc-rise fc-d5">
            <div className="fc-phone">
              <div className="fc-screen">
                <div className="fc-scrpad">
                  <div className="fc-mhead">
                    <div>
                      <div className="fc-mcafe">Colattao</div>
                      <div className="fc-msub">Virginia Beach · Café</div>
                    </div>
                    <span className="fc-mlive">
                      <i />
                      Updated now
                    </span>
                  </div>

                  <div className="fc-mcat">Espresso &amp; Coffee</div>
                  <div className="fc-mitem">
                    <span className="nm">Cappuccino</span>
                    <span className="pr fc-num">$5.25</span>
                  </div>
                  <div className="fc-mitem">
                    <span className="nm">
                      Churro Latte <small>house cinnamon</small>
                    </span>
                    <span className="pr fc-num upd">$8.00</span>
                  </div>
                  <div className="fc-mitem">
                    <span className="nm">Cortadito</span>
                    <span className="pr fc-num">$4.50</span>
                  </div>

                  <div className="fc-mcat">Kitchen</div>
                  <div className="fc-mitem">
                    <span className="nm">
                      Cubano <small>slow-roast pork</small>
                    </span>
                    <span className="pr fc-num">$12.00</span>
                  </div>
                  <div className="fc-mitem">
                    <span className="nm">Arepa e&apos; Huevo</span>
                    <span className="pr fc-num">$6.00</span>
                  </div>

                  <div className="fc-mcat">Pastries</div>
                  <div className="fc-mitem">
                    <span className="nm">Chocolate Croissant</span>
                    <span className="pr fc-num">$3.95</span>
                  </div>
                </div>
                <div className="fc-mfoot">
                  <div className="fc-mqr" />
                  <div className="ft">
                    <b>Scan to open</b>
                    <br />
                    the live menu on your phone
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* MANIFESTO */}
      <div className="fc-shell fc-ruletop">
        <section className="fc-manifesto fc-reveal">
          <p>
            Most owners&apos; menus are a{" "}
            <span className="fc-em">PDF nobody can read</span> on a phone. Yours
            won&apos;t be.
          </p>
          <p className="fc-mes">La comida es suya. Lo digital es nuestro.</p>
        </section>
      </div>

      {/* HOW IT WORKS */}
      <div className="fc-shell fc-ruletop">
        <section className="fc-sec">
          <div className="fc-eyerow fc-reveal">
            <span className="fc-kick">How it works</span>
          </div>
          <h2 className="fc-sh fc-reveal">Three steps. You never touch the tech.</h2>
          <div className="fc-steps fc-reveal">
            <div className="fc-step">
              <div className="no">01</div>
              <div>
                <div className="stp-t">Send us your menu</div>
                <div className="stp-b">
                  A photo or a link — that&apos;s all we need to get started.
                </div>
              </div>
              <div className="stp-es">Mándenos su menú.</div>
            </div>
            <div className="fc-step">
              <div className="no">02</div>
              <div>
                <div className="stp-t">We build it — live in days</div>
                <div className="stp-b">
                  Your QR menu and public page, on the same system Colattao
                  already runs on.
                </div>
              </div>
              <div className="stp-es">Lo montamos por usted.</div>
            </div>
            <div className="fc-step">
              <div className="no">03</div>
              <div>
                <div className="stp-t">You just ask for changes</div>
                <div className="stp-b">
                  Text us to raise the empanada to $4 — done that day, and every
                  change is recorded.
                </div>
              </div>
              <div className="stp-es">Usted pide, lo cambiamos.</div>
            </div>
          </div>
        </section>
      </div>

      {/* PRICING */}
      <div className="fc-shell fc-ruletop" id="pricing">
        <section className="fc-sec">
          <div className="fc-eyerow fc-reveal">
            <span className="fc-kick">Pricing · no setup fee</span>
          </div>
          <h2 className="fc-sh fc-reveal">Two plans. Cancel anytime.</h2>
          <div className="fc-pricewrap fc-reveal">
            <div className="fc-plan">
              <div className="fc-pn">Basic</div>
              <div className="fc-amt fc-num">
                $150<span> / mo</span>
              </div>
              <ul>
                <li>Digital QR menu</li>
                <li>Public menu page, always current</li>
                <li>Done-for-you updates</li>
                <li>Full change history</li>
              </ul>
            </div>
            <div className="fc-plan pro">
              <div className="fc-pn">Pro</div>
              <div className="fc-amt fc-num">
                $200<span> / mo</span>
              </div>
              <ul>
                <li>Everything in Basic</li>
                <li>Your secure owner portal</li>
                <li>A landing page for your restaurant</li>
                <li>Brand &amp; photo organization</li>
              </ul>
            </div>
          </div>
          <div className="fc-pricenote">
            No setup fee · Cancel anytime · Sin costo de instalación
          </div>
        </section>
      </div>

      {/* PROOF */}
      <div className="fc-shell fc-ruletop">
        <section className="fc-sec">
          <div className="fc-proof fc-reveal">
            <div>
              <div className="pt">It&apos;s already live at Colattao.</div>
              <div className="pb">
                A real café here in Virginia Beach. Scan it and see exactly what
                yours would look like.
              </div>
            </div>
            <Link href="/m/colattao" className="fc-btn gold">
              See the live menu <span className="fc-arw">→</span>
            </Link>
          </div>
        </section>
      </div>

      {/* CLOSE */}
      <div className="fc-shell fc-ruletop">
        <section className="fc-close fc-reveal">
          <div className="fc-eyerow" style={{ justifyContent: "center" }}>
            <span className="fc-kick">Built in Virginia Beach</span>
          </div>
          <h2>
            Real food deserves
            <br />a real menu.
          </h2>
          <span className="fc-es">
            Hagamos que su restaurante se vea tan bien como sabe.
          </span>
          <div className="fc-cta-row" style={{ justifyContent: "center" }}>
            <Link href="/contact" className="fc-btn gold">
              Talk to us <span className="fc-arw">→</span>
            </Link>
            <a
              href={IG}
              target="_blank"
              rel="noopener noreferrer"
              className="fc-btn ghost"
            >
              @fina_calle
            </a>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <div className="fc-shell">
        <footer className="fc-foot">
          <div className="fc-frow">
            <div className="fc-fbrand">
              <b>Fina Calle OS</b>
              <span>AMMA Ventures · Virginia Beach</span>
            </div>
            <div className="fc-fnav">
              <Link href="/case-studies">Case Studies</Link>
              <Link href="/systems">Systems</Link>
              <Link href="/rd">R&amp;D</Link>
              <Link href="/contact">Contact</Link>
              <a href={IG} target="_blank" rel="noopener noreferrer">
                @fina_calle
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
