import Link from "next/link";
import Aurora from "@/components/reactbits/Aurora";
import ShinyText from "@/components/reactbits/ShinyText";

const IG =
  "https://www.instagram.com/fina_calle?igsh=MXUyZjZwODg3a3hjag==";

export default function Home() {
  return (
    <main className="fc-page">
      <div className="fc-bg" />
      <Aurora className="fc-aurora" />
      <div className="fc-grain" />

      {/* NAV */}
      <nav className="fc-nav">
        <div className="fc-wm">
          <b>
            <ShinyText>Fina Calle OS</ShinyText>
          </b>
          <span>AMMA Ventures · VB</span>
        </div>
        <div className="fc-links">
          <a href="#carta" className="fc-navlink">
            La Carta
          </a>
          <a href="#ai-front-desk" className="fc-navlink">
            AI Front Desk
          </a>
          <Link href="/contact" className="fc-navlink fc-navcta">
            Hablemos
          </Link>
        </div>
      </nav>

      <div className="fc-shell">
        {/* HERO */}
        <section className="fc-hero">
          <div>
            <div className="fc-eyebrow fc-rise fc-d1">
              <span className="fc-kick">
                Menús para restaurantes · Virginia Beach
              </span>
            </div>
            <h1 className="fc-h1">
              <span className="fc-mask fc-d2">
                <span>La carta que</span>
              </span>
              <span className="fc-mask fc-d3">
                <span>
                  tu <span className="fc-sz">sazón</span> merece.
                </span>
              </span>
            </h1>
            <p className="fc-en fc-rise fc-d4">
              The menu your food deserves —{" "}
              <b>clean, on every phone, and always current.</b> You handle the
              flavor; we handle the tech.
            </p>
            <div className="fc-cta-row fc-rise fc-d5">
              <Link href="/m/colattao" className="fc-btn gold">
                Ver un menú en vivo <span className="fc-arw">→</span>{" "}
                <small>see a live menu</small>
              </Link>
              <Link href="/contact" className="fc-btn ghost">
                Hablemos
              </Link>
            </div>
            <div className="fc-trust fc-rise fc-d5">
              <span>En vivo en Colattao</span>
              <span className="fc-dot" />
              <span>Sin costo de instalación</span>
              <span className="fc-dot" />
              <span>EN / ES</span>
            </div>
          </div>

          <div className="fc-phwrap fc-rise fc-d4">
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
                      al día
                    </span>
                  </div>

                  <div className="fc-mcat">Café</div>
                  <div className="fc-mitem">
                    <span className="nm">Cappuccino</span>
                    <span className="ld" />
                    <span className="pr">5.25</span>
                  </div>
                  <div className="fc-mitem">
                    <span className="nm">Churro Latte</span>
                    <span className="ld" />
                    <span className="pr">8.00</span>
                  </div>
                  <div className="fc-mitem">
                    <span className="nm">Cortadito</span>
                    <span className="ld" />
                    <span className="pr">4.50</span>
                  </div>

                  <div className="fc-mcat">Cocina</div>
                  <div className="fc-mitem">
                    <span className="nm">Cubano</span>
                    <span className="ld" />
                    <span className="pr">12.00</span>
                  </div>
                  <div className="fc-mitem">
                    <span className="nm">Arepa e&apos; Huevo</span>
                    <span className="ld" />
                    <span className="pr">6.00</span>
                  </div>

                  <div className="fc-mcat">Dulce</div>
                  <div className="fc-mitem">
                    <span className="nm">Pastel de Guayaba</span>
                    <span className="ld" />
                    <span className="pr">3.95</span>
                  </div>
                </div>
                <div className="fc-mfoot">
                  <div className="fc-mqr" />
                  <div className="ft">
                    <b>Escanea</b>
                    <br />y ábrelo en tu celular
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* MANIFESTO — founder voice */}
      <div className="fc-shell fc-ruletop">
        <section className="fc-manifesto fc-reveal">
          <p>Nosotros también tenemos un café.</p>
          <p className="fc-en">
            We built this for ourselves first — then for the block. It runs
            Colattao every day.
          </p>
          <div className="fc-sign">— Anthony · Colattao, Virginia Beach</div>
        </section>
      </div>

      {/* HOW IT WORKS */}
      <div className="fc-shell fc-ruletop">
        <section className="fc-sec">
          <div className="fc-eyerow fc-reveal">
            <span className="fc-kick">Así de fácil · how it works</span>
          </div>
          <h2 className="fc-sh fc-reveal">
            Tres pasos. Tú nunca tocas la tecnología.
          </h2>
          <div className="fc-steps fc-reveal">
            <div className="fc-step">
              <div className="no">i.</div>
              <div>
                <div className="st">Mándanos tu menú</div>
                <div className="sb">Una foto o un link. Con eso arrancamos.</div>
                <div className="ses">Send us your menu — a photo or a link.</div>
              </div>
            </div>
            <div className="fc-step">
              <div className="no">ii.</div>
              <div>
                <div className="st">Lo montamos — listo en días</div>
                <div className="sb">
                  Tu menú QR y tu página, en el mismo sistema que ya corre
                  Colattao.
                </div>
                <div className="ses">We build it, live in days.</div>
              </div>
            </div>
            <div className="fc-step">
              <div className="no">iii.</div>
              <div>
                <div className="st">Tú pides, nosotros cambiamos</div>
                <div className="sb">
                  Súbele a la empanada a $4 — hecho el mismo día, y todo queda
                  registrado.
                </div>
                <div className="ses">You just ask for changes.</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* LA CARTA — offerings as a menu */}
      <div className="fc-shell fc-ruletop" id="carta">
        <section className="fc-sec">
          <div className="fc-cartahd fc-reveal">
            <h2 className="fc-sh">
              <span className="es">Nuestra carta · what we offer</span>La Carta.
            </h2>
            <span className="fc-kick" style={{ paddingBottom: "8px" }}>
              Sin costo de instalación · cancela cuando quieras
            </span>
          </div>

          <div className="fc-carta fc-reveal">
            <div className="fc-course">
              Los Planes <span className="es">· the plans</span>
            </div>

            <div className="fc-item">
              <div className="row">
                <span className="nm">Presence</span>
                <span className="ld" />
                <span className="pr">
                  $99<small>/mes</small>
                </span>
              </div>
              <div className="desc">
                Tu menú digital, siempre en línea — lo cambiamos cuando nos
                pidas. Sin costo de instalación.{" "}
                <span className="es">
                  Your menu online — we change it when you ask.
                </span>
              </div>
            </div>

            <div className="fc-item">
              <div className="row">
                <span className="nm">
                  Fresh <span className="flag">popular</span>
                </span>
                <span className="ld" />
                <span className="pr">
                  $249<small>/mes</small>
                </span>
              </div>
              <div className="desc">
                Todo lo de Presence + lo refrescamos 2× al mes por nuestra cuenta
                — tú nunca lo tocas. Temporadas, fotos, reporte mensual.{" "}
                <span className="es">
                  We refresh it twice a month — you never lift a finger.
                </span>
              </div>
            </div>

            <div className="fc-item">
              <div className="row">
                <span className="nm">Hands-Off</span>
                <span className="ld" />
                <span className="pr">
                  $499<small>/mes</small>
                </span>
              </div>
              <div className="desc">
                Todo lo de Fresh + tu sistema (Square/Clover) lo actualiza solo,
                cambios el mismo día, y ayuda de marca.{" "}
                <span className="es">
                  Your POS syncs it live. You stop thinking about it.
                </span>
              </div>
            </div>

            <div className="fc-course">
              Los Extras <span className="es">· add-ons</span>
            </div>

            <div className="fc-item">
              <div className="row">
                <span className="nm">
                  El Juego <span className="flag">nuevo</span>
                </span>
                <span className="ld" />
                <span className="pr">
                  <span className="from">a la medida</span>$1,500
                  <small> + $79/mes</small>
                </span>
              </div>
              <div className="desc">
                Un juego de arcade hecho a la medida con tu marca — tus clientes
                juegan mientras esperan y vuelven por el highscore.{" "}
                <span className="es">
                  A bespoke branded game — built for you, keeps them coming back.
                </span>
              </div>
            </div>

            <div className="fc-item">
              <div className="row">
                <span className="nm">
                  AI Front Desk <span className="flag">nuevo</span>
                </span>
                <span className="ld" />
                <span className="pr">
                  <span className="from">desde · from</span>$149
                  <small>/mes</small>
                </span>
              </div>
              <div className="desc">
                Un asistente de IA que contesta cada llamada, reserva mesas y
                toma pedidos — 24/7, sin perder una sola.{" "}
                <span className="es">
                  Answers every call, books tables, takes orders — round the
                  clock.
                </span>
              </div>
              <div className="roi">
                ↑ Recupera $3–18 mil/mes en llamadas perdidas.
              </div>
            </div>
          </div>
          <div className="fc-cartanote">
            Los extras se suman a tu plan · add-ons stack on top of your plan
          </div>
        </section>
      </div>

      {/* AI FRONT DESK SPOTLIGHT */}
      <div className="fc-shell fc-ruletop" id="ai-front-desk">
        <section className="fc-sec">
          <div className="fc-spot fc-reveal">
            <div className="fc-eyerow">
              <span className="fc-kick">Nuevo · AI Front Desk</span>
            </div>
            <h3>Nunca pierdas otra llamada.</h3>
            <p className="fc-en">
              43% de las llamadas a restaurantes se quedan sin contestar. La
              nuestra contesta el 100% — explica el menú, agenda y toma el
              pedido mientras tú cocinas.{" "}
              <span style={{ color: "var(--fc-dim)" }}>
                Never miss another call. It answers, books, and takes orders
                24/7.
              </span>
            </p>
            <div className="fc-stats">
              <div className="fc-stat">
                <div className="big">100%</div>
                <div className="lab">de las llamadas, contestadas</div>
              </div>
              <div className="fc-stat">
                <div className="big">−87%</div>
                <div className="lab">menos llamadas perdidas</div>
              </div>
              <div className="fc-stat">
                <div className="big">$3–18k</div>
                <div className="lab">recuperados al mes por local</div>
              </div>
            </div>
            <div className="fc-cta-row" style={{ marginTop: "28px" }}>
              <Link href="/contact" className="fc-btn gold">
                Pídelo para tu restaurante <span className="fc-arw">→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* PROOF */}
      <div className="fc-shell fc-ruletop">
        <section className="fc-sec">
          <div className="fc-proof fc-reveal">
            <div>
              <div className="pt">Ya está en vivo en Colattao.</div>
              <div className="pb">
                Un café de verdad, aquí en Virginia Beach — 1.300 escaneos en sus
                primeras 2 semanas. Escanéalo y mira cómo se vería el tuyo.
              </div>
            </div>
            <Link href="/m/colattao" className="fc-btn gold">
              Ver el menú en vivo <span className="fc-arw">→</span>
            </Link>
          </div>
        </section>
      </div>

      {/* CLOSE */}
      <div className="fc-shell fc-ruletop">
        <section className="fc-close fc-reveal">
          <div className="fc-eyerow" style={{ justifyContent: "center" }}>
            <span className="fc-kick">Hecho en Virginia Beach</span>
          </div>
          <h2>
            Tu comida ya es buena.
            <br />
            Que se vea igual.
          </h2>
          <span className="fc-en">
            Your food&apos;s already good — let&apos;s make it look just as good.
          </span>
          <div className="fc-cta-row">
            <Link href="/contact" className="fc-btn gold">
              Hablemos <span className="fc-arw">→</span>
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
          <div className="fc-sign">— Anthony, fundador</div>
        </section>
      </div>

      {/* FOOTER */}
      <div className="fc-shell">
        <footer className="fc-foot">
          <div className="fc-frow">
            <div className="fc-fb">
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
