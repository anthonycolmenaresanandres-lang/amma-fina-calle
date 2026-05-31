import Image from "next/image";
import Link from "next/link";
import appTheme from "@/config/theme";
import OwnerRequestForm from "@/components/OwnerRequestForm";

export const metadata = {
  title: "Solicitar un cambio · Colattao",
  description:
    "Formulario de solicitudes para Colattao Coffee House: cambios de menú, precios, productos, diseño, website o juego.",
};

export default function RequestUpdatePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col bg-colattao-page text-[var(--col-parchment)]">
      <header className="px-6 pb-4 pt-7 text-center">
        <Image
          src={appTheme.brand.logoPath}
          alt={appTheme.brand.displayName}
          width={220}
          height={88}
          priority
          className="mx-auto h-auto w-[150px] select-none drop-shadow-[0_0_18px_rgba(212,162,76,0.20)]"
        />
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300/55" />
          <span className="text-[10px] uppercase tracking-[0.32em] text-amber-200/80">
            Solicitar un cambio
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300/55" />
        </div>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-snug text-amber-100/85">
          Cuéntenos qué desea actualizar: menú, precios, nuevos productos, fotos, diseño, website o
          juego.
        </p>
        <p className="mx-auto mt-1 max-w-md text-[11px] italic leading-snug text-amber-200/65">
          Tell us what you&apos;d like to update. Quick, and no account needed.
        </p>
      </header>

      <section className="px-4 py-5">
        <OwnerRequestForm />
      </section>

      <footer className="px-5 pb-9 pt-2 text-center">
        <div className="ceramic-rule mx-auto mb-5 w-2/3" />
        <p className="brand-eyebrow text-amber-200/70">Explorar · Explore</p>
        <nav aria-label="Páginas Colattao" className="mt-3 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/menu"
            className="btn-ceramic inline-block rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            Ver menú
          </Link>
          <Link
            href="/owner-presentation"
            className="btn-gold inline-block rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            Ver presentación
          </Link>
          <Link
            href="/website-concept"
            className="btn-ghost inline-block rounded-full border border-amber-300/40 bg-white/5 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100"
          >
            Concepto web
          </Link>
        </nav>
        <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-amber-200/45">
          © {new Date().getFullYear()} Colattao Coffee House
        </p>
      </footer>
    </main>
  );
}
