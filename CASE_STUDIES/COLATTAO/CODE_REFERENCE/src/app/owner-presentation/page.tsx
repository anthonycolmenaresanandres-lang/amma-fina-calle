import Image from "next/image";
import Link from "next/link";
import FeedbackBox from "@/components/FeedbackBox";
import appTheme from "@/config/theme";

export const metadata = {
  title: "Presentación · Colattao Café Rush",
  description:
    "Presentación en español del ecosistema digital de Colattao Café Rush — juego, menú, stickers, privacidad y proceso de actualizaciones.",
};

// ── Colección completa de stickers en public/assets/colattao/stickers ──
type Sticker = {
  src: string;
  alt: string;
  familia: string;
  descripcion: string;
};

const STICKERS: Sticker[] = [
  {
    src: "/assets/colattao/stickers/sticker-colattao-sombrero-01.png",
    alt: "Sticker Colattao con sombrero vueltiao y taza de cerámica",
    familia: "Insignia Patrimonial",
    descripcion: "Sombrero vueltiao, montaña, hibisco y cerámica colombiana",
  },
  {
    src: "/assets/colattao/stickers/sticker-colattao-sombrero-02.png",
    alt: "Sticker circular Colattao con aves del paraíso y plato de cerámica",
    familia: "Insignia Patrimonial",
    descripcion: "Aves del paraíso, hibisco y plato de cerámica",
  },
  {
    src: "/assets/colattao/stickers/sticker-colattao-vinyl-01.png",
    alt: "Logo Colattao Coffee House con disco de vinilo y textil colombiano",
    familia: "Estilo Vinilo",
    descripcion: "Textil colombiano, vinilo, hoja de plátano y rayos de sol",
  },
  {
    src: "/assets/colattao/stickers/sticker-colattao-vinyl-02.png",
    alt: "Variante del sticker Colattao con vinilo",
    familia: "Estilo Vinilo",
    descripcion: "Variante de color · vinilo y textil",
  },
  {
    src: "/assets/colattao/stickers/sticker-colattao-mountain-01.png",
    alt: "Escena Colattao con montañas, sombrero y taza de café",
    familia: "Amanecer Andino",
    descripcion: "Amanecer en las montañas, sombrero y taza de cerámica",
  },
  {
    src: "/assets/colattao/stickers/sticker-heritage-mug-01.png",
    alt: "Mug de porcelana con ave y motivo floral, coronado con crema",
    familia: "Porcelana Nostálgica",
    descripcion: "Mug de porcelana, ave y motivo floral con crema",
  },
  {
    src: "/assets/colattao/stickers/sticker-heritage-cup-01.png",
    alt: "Taza y plato de porcelana con motivo floral azul y crema",
    familia: "Porcelana Nostálgica",
    descripcion: "Taza y plato, toile floral azul con canela",
  },
  {
    src: "/assets/colattao/stickers/sticker-heritage-cup-02.png",
    alt: "Taza y plato de porcelana, segunda variante",
    familia: "Porcelana Nostálgica",
    descripcion: "Variante de color · taza y plato",
  },
  {
    src: "/assets/colattao/stickers/signage-qr-menu-poster.png",
    alt: "Cartel QR para el menú con borde de textil colombiano",
    familia: "Cartelería en Local",
    descripcion: "Cartel QR para escanear el menú, con borde colombiano",
  },
];

export default function OwnerPresentationPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-colattao-page text-[var(--col-parchment)]">
      {/* ──────────────────────────────────────────────────────
          PRESENTACIÓN (HERO)
          ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-6 pt-8 text-center">
        <p className="brand-eyebrow text-amber-200/70">
          Para el Dueño · {new Date().getFullYear()}
        </p>
        <Image
          src={appTheme.brand.logoPath}
          alt={appTheme.brand.displayName}
          width={260}
          height={104}
          priority
          className="mx-auto mt-2 h-auto w-[200px] select-none drop-shadow-[0_0_24px_rgba(212,162,76,0.22)]"
        />
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-300/55" />
          <span className="text-[10px] uppercase tracking-[0.32em] text-amber-200/80">
            El Ecosistema Digital
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-300/55" />
        </div>

        <p className="mt-4 px-2 text-[13px] leading-snug text-amber-100/85">
          Un hogar digital premium para Colattao Coffee House, pensado para el
          celular: un juego, un menú digital y una sola voz de marca.
        </p>

        <ActionRow>
          <ActionLink href="/" variant="gold">
            Abrir juego
          </ActionLink>
          <ActionLink href="/request-update" variant="ceramic">
            Enviar solicitud
          </ActionLink>
          <ActionLink href="/menu" variant="ceramic">
            Ver menú digital
          </ActionLink>
          <ActionLink href="/website-concept" variant="ceramic">
            Ver concepto de website
          </ActionLink>
          <ActionLink href="/owner-command-center" variant="ceramic">
            Abrir Command Center
          </ActionLink>
        </ActionRow>
      </section>

      {/* ──────────────────────────────────────────────────────
          01 · LO QUE YA ESTÁ FUNCIONANDO
          ────────────────────────────────────────────────────── */}
      <SectionBlock eyebrow="01" title="Lo que ya está funcionando">
        <ul className="mt-4 space-y-3 text-left text-[13px] leading-snug text-[var(--col-espresso-3)]">
          <Bullet label="El juego Café Rush">
            Tres niveles para el celular: Warm-up, Rush Hour y Colattao Lovers
            Only. Al ganar, el cliente obtiene una tarjeta "Pass Earned".
          </Bullet>
          <Bullet label="El menú digital (/menu)">
            Menú completo con categorías, precios y bebidas de temporada,
            pensado para que el cliente lo abra escaneando un código QR
            mientras espera en la fila.
          </Bullet>
          <Bullet label="Pulido visual del menú">
            El menú digital ahora combina textura visual, imágenes por categoría y opciones de leche para una experiencia más premium sin perder claridad para ordenar.
          </Bullet>
          <Bullet label="Sistema de marca premium">
            Paleta espresso, pergamino, terracota, oro y azul cerámica;
            tipografía Playfair Display + Inter; detalles inspirados en la
            mochila colombiana.
          </Bullet>
          <Bullet label="Enlace para pedir cambios">
            En el pie del menú hay un enlace que abre un correo ya
            pre-llenado para enviarle a Anthony cualquier solicitud de
            actualización.
          </Bullet>
        </ul>
        <ActionRow>
          <ActionLink href="/" variant="gold">
            Probar Café Rush
          </ActionLink>
          <ActionLink href="/menu" variant="ceramic">
            Revisar menú
          </ActionLink>
        </ActionRow>
      </SectionBlock>

      {/* ──────────────────────────────────────────────────────
          02 · COLECCIÓN DE STICKERS
          ────────────────────────────────────────────────────── */}
      <section className="px-4 pt-7">
        <div className="px-2 text-center">
          <p
            className="text-[10px] text-[var(--col-gold-soft)]"
            style={{ letterSpacing: "0.32em" }}
          >
            02 · COLECCIÓN
          </p>
          <h2
            className="brand-wordmark mt-1 text-[22px] text-amber-50"
            style={{ letterSpacing: "0.04em" }}
          >
            Colección de Stickers
          </h2>
          <div className="mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-amber-300/55 to-transparent" />
          <p className="mt-3 text-[12px] leading-snug text-amber-100/75">
            Cuatro familias visuales — Insignia Patrimonial, Estilo Vinilo,
            Amanecer Andino y Porcelana Nostálgica — más el cartel QR para el
            local.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {STICKERS.map((s) => (
            <figure
              key={s.src}
              className="menu-card flex flex-col items-center px-3 pb-3 pt-3"
            >
              <div className="flex h-32 w-full items-center justify-center">
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={240}
                  height={240}
                  className="max-h-32 w-auto select-none object-contain drop-shadow"
                />
              </div>
              <figcaption className="mt-2 text-center">
                <p
                  className="text-[9px] uppercase text-[var(--col-gold-deep)]"
                  style={{ letterSpacing: "0.22em" }}
                >
                  {s.familia}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-[var(--col-espresso-3)]/85">
                  {s.descripcion}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mx-auto mt-4 max-w-xs text-center text-[11px] italic text-amber-100/65">
          Útiles como stickers físicos, decoración en vasos, sellos en bolsas
          de para llevar o cartelería dentro del local.
        </p>
        <div className="mt-4 flex justify-center">
          <ActionLink href="#proximos-pasos" variant="gold">
            Elegir estilo de stickers
          </ActionLink>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────
          03 · CÓMO AYUDA A COLATTAO
          ────────────────────────────────────────────────────── */}
      <SectionBlock eyebrow="03" title="Cómo ayuda a Colattao">
        <ul className="mt-4 space-y-3 text-left text-[13px] leading-snug text-[var(--col-espresso-3)]">
          <Bullet label="Convierte la fila en experiencia">
            El menú QR y el juego mantienen al cliente activo mientras espera.
            Más escaneos repetidos, capturas compartidas y conversación en la
            barra.
          </Bullet>
          <Bullet label="Fortalece la marca">
            Los stickers, la paleta y la tipografía viajan en vasos, paredes
            y redes sociales. Se reconoce como Colattao antes de leer el logo.
          </Bullet>
          <Bullet label="Sin costos de operación">
            Alojado en Vercel en su plan gratis, generado estáticamente, sin
            base de datos que mantener, sin costos de API ni cuotas
            mensuales.
          </Bullet>
          <Bullet label="Siempre al día">
            El menú digital es la fuente de verdad. Una actualización toma
            pocos minutos y queda en vivo automáticamente para todos.
          </Bullet>
        </ul>
        <ActionRow>
          <ActionLink href="/" variant="gold">
            Ver experiencia completa
          </ActionLink>
        </ActionRow>
      </SectionBlock>

      {/* ──────────────────────────────────────────────────────
          04 · PRIVACIDAD
          ────────────────────────────────────────────────────── */}
      <SectionBlock eyebrow="04" title="Privacidad">
        <div className="mt-4 space-y-4 text-left text-[13px] leading-snug text-[var(--col-espresso)]">
          <p>
            Esta versión <strong>no recopila datos personales</strong> de los
            clientes. El juego corre en el navegador del celular del cliente.
          </p>

          <ul className="space-y-2 rounded-xl border border-[var(--col-gold-deep)]/25 bg-white/55 px-4 py-3 text-[13px]">
            <PrivacyRow>
              No recopilamos datos personales de los clientes.
            </PrivacyRow>
            <PrivacyRow>
              No recopilamos nombres, teléfonos, correos, información de pago
              ni ubicación.
            </PrivacyRow>
            <PrivacyRow>El juego corre en el navegador.</PrivacyRow>
            <PrivacyRow>
              El conteo de pérdidas se queda en el dispositivo del cliente.
            </PrivacyRow>
            <PrivacyRow>
              Vercel Web Analytics puede darnos métricas anónimas de tráfico
              sin cookies.
            </PrivacyRow>
            <PrivacyRow>
              No vendemos datos ni usamos perfiles personales.
            </PrivacyRow>
          </ul>

          <p className="text-[12.5px] leading-snug text-[var(--col-espresso-3)]/85">
            Lo único que se utiliza dentro del juego es almacenamiento local
            básico del navegador (por ejemplo, contar pérdidas para mostrar
            frases divertidas). Esa información permanece en el propio
            dispositivo del cliente.
          </p>

          <div className="rounded-xl border border-[var(--col-ceramic)]/25 bg-[var(--col-ceramic)]/8 px-3 py-3">
            <p
              className="text-[10px] uppercase text-[var(--col-ceramic)]"
              style={{ letterSpacing: "0.22em" }}
            >
              Opcional, con consentimiento
            </p>
            <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--col-espresso)]">
              Si más adelante Colattao desea agregar premios, captura de
              correos, cupones, analíticas o un programa de lealtad, todo eso
              se puede activar de forma intencional y siempre con
              consentimiento claro del cliente.
            </p>
          </div>
        </div>
        <ActionRow>
          <ActionLink href="/menu" variant="ceramic">
            Ver menú sin recopilar datos
          </ActionLink>
        </ActionRow>
      </SectionBlock>

      {/* ──────────────────────────────────────────────────────
          05 · FLUJO PARA PEDIR CAMBIOS
          ────────────────────────────────────────────────────── */}
      <SectionBlock eyebrow="05" title="Flujo para pedir cambios">
        <ol className="mt-4 space-y-3 text-left text-[13px] leading-snug text-[var(--col-espresso-3)]">
          <NumberedStep n={1} label="Usted envía la solicitud">
            Por correo, mensaje, o tocando "Need a menu update?" en el pie del
            menú. En lenguaje natural, sin formatos especiales.
          </NumberedStep>
          <NumberedStep n={2} label="Anthony revisa">
            Confirma el alcance, redacta el cambio y lo pasa al sistema de
            edición.
          </NumberedStep>
          <NumberedStep n={3} label="Se editan y publican los archivos">
            Se actualiza el código, se valida que compile, y se publica con un
            mensaje claro del cambio.
          </NumberedStep>
          <NumberedStep n={4} label="Vercel despliega automáticamente">
            En aproximadamente 1 a 3 minutos. Sin pasos manuales. La URL no
            cambia.
          </NumberedStep>
          <NumberedStep n={5} label="Usted lo ve en vivo">
            Anthony confirma con un mensaje corto y la URL para verificarlo.
          </NumberedStep>
        </ol>
        <ActionRow>
          <ActionLink href="/menu" variant="gold">
            Ir al menú y pedir cambio
          </ActionLink>
          <ActionLink href="/request-update" variant="ceramic">
            Probar formulario de cambios
          </ActionLink>
        </ActionRow>
        <p className="mt-3 text-center text-[11px] italic leading-snug text-[var(--col-espresso-3)]/75">
          Este formulario todavía está en modo demo: no envía ni guarda información hasta que el
          dueño apruebe la conexión final.
        </p>
      </SectionBlock>

      {/* ──────────────────────────────────────────────────────
          COMENTARIOS (antes de Próximos pasos)
          ────────────────────────────────────────────────────── */}
      <section className="px-4 pt-7">
        <FeedbackBox pageSource="presentation" variant="dark" />
      </section>

      {/* ──────────────────────────────────────────────────────
          06 · PRÓXIMOS PASOS
          ────────────────────────────────────────────────────── */}
      <section id="proximos-pasos" className="scroll-mt-6">
      <SectionBlock eyebrow="06" title="Próximos pasos">
        <p className="mt-4 text-center text-[12.5px] leading-snug text-[var(--col-espresso-3)]/85">
          También preparé un concepto visual de cómo podría verse una página web más premium para Colattao.
        </p>
        <ul className="mt-4 space-y-3 text-left text-[13px] leading-snug text-[var(--col-espresso-3)]">
          <Bullet label="Imprimir los stickers">
            Escoger 2 o 3 diseños y mandar una pequeña tanda para vasos y
            bolsas de para llevar.
          </Bullet>
          <Bullet label="Colocar la cartelería QR en el local">
            Usar el cartel QR del menú para que los clientes escaneen mientras
            esperan.
          </Bullet>
          <Bullet label="Definir un premio">
            Cuando esté listo, reactivar un descuento o regalo en la tarjeta
            "Pass Earned" (5% de descuento, una galleta gratis, etc.). El
            sistema ya está preparado.
          </Bullet>
          <Bullet label="Actualizaciones de temporada">
            Enviar a Anthony los menús de primavera, verano u otoño para
            mantener el menú digital sincronizado.
          </Bullet>
        </ul>
        <ActionRow>
          <ActionLink href="/" variant="gold">
            Abrir juego
          </ActionLink>
          <ActionLink href="/request-update" variant="ceramic">
            Enviar solicitud
          </ActionLink>
          <ActionLink href="/menu" variant="ceramic">
            Abrir menú
          </ActionLink>
          <ActionLink href="/website-concept" variant="ceramic">
            Ver concepto de website
          </ActionLink>
        </ActionRow>
      </SectionBlock>
      </section>

      {/* ──────────────────────────────────────────────────────
          PIE / CTA
          ────────────────────────────────────────────────────── */}
      <footer className="px-5 pb-10 pt-8 text-center">
        <div className="ceramic-rule mx-auto mb-6 w-2/3" />
        <p className="brand-eyebrow text-amber-200/70">Pruébelo ahora</p>
        <div className="mt-3 flex flex-col items-center gap-3">
          <Link
            href="/"
            className="btn-gold inline-block w-56 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
          >
            ☕ Jugar Café Rush
          </Link>
          <Link
            href="/menu"
            className="btn-ceramic inline-block w-56 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
          >
            Ver el Menú
          </Link>
          <Link
            href="/website-concept"
            className="btn-ceramic inline-block w-56 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
          >
            Ver concepto de website
          </Link>
          <Link
            href="/owner-command-center"
            className="btn-ceramic inline-block w-56 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
          >
            Abrir Command Center
          </Link>
        </div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.28em] text-amber-200/45">
          © {new Date().getFullYear()} Colattao Coffee House
        </p>
      </footer>
    </main>
  );
}

// ── helpers ─────────────────────────────────────────────────
function SectionBlock({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 pt-7">
      <div className="menu-card px-5 pb-5 pt-5">
        <div className="text-center">
          <p
            className="text-[10px] uppercase text-[var(--col-gold-deep)]"
            style={{ letterSpacing: "0.32em" }}
          >
            {eyebrow}
          </p>
          <h2
            className="brand-wordmark mt-1 text-[22px] text-[var(--col-espresso)]"
            style={{ letterSpacing: "0.04em" }}
          >
            {title}
          </h2>
          <div className="ceramic-rule mx-auto mt-2 w-2/3" />
        </div>
        {children}
      </div>
    </section>
  );
}

function Bullet({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-2">
      <span
        aria-hidden="true"
        className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--col-gold-deep)]"
      />
      <div>
        <span className="font-semibold text-[var(--col-espresso)]">
          {label}.
        </span>{" "}
        <span className="text-[var(--col-espresso-3)]/85">{children}</span>
      </div>
    </li>
  );
}

function NumberedStep({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--col-gold-deep)]/40 bg-white/50 font-mono text-[11px] font-bold text-[var(--col-espresso)]"
      >
        {n}
      </span>
      <div>
        <span className="font-semibold text-[var(--col-espresso)]">
          {label}.
        </span>{" "}
        <span className="text-[var(--col-espresso-3)]/85">{children}</span>
      </div>
    </li>
  );
}

function ActionRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex flex-wrap justify-center gap-2.5">{children}</div>
  );
}

function ActionLink({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "gold" | "ceramic";
  children: React.ReactNode;
}) {
  const cls =
    variant === "gold"
      ? "btn-gold inline-block rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em]"
      : "btn-ceramic inline-block rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em]";
  // Use a plain <a> for hash anchors (#proximos-pasos) so the browser
  // handles in-page scrolling, and next/link for route navigation.
  if (href.startsWith("#")) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

function PrivacyRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[var(--col-espresso)]">
      <span
        aria-hidden="true"
        className="mt-[5px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--col-terracotta)]"
      />
      <span>{children}</span>
    </li>
  );
}
