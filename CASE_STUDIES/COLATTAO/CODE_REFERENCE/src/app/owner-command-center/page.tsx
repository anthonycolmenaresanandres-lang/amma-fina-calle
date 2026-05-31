"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const TEMP_OWNER_PIN = "1234";

const ACTIVE_MODULES = [
  "Juego Café Rush",
  "Menú digital",
  "Concepto de website",
  "Campaña de stickers / QR",
  "Destacados del menú",
  "Recepción de solicitudes",
  "Buzón de feedback",
];

const OWNER_MISSIONS = [
  "Confirmar opciones oficiales de leche",
  "Revisar productos destacados del mes.",
  "Revisar diseños de stickers",
  "Aprobar dirección del website",
  "Definir ruta futura de pedidos con Square",
  "Probar enlace de bio en Instagram",
];

const LOCKED_MODULES = [
  "Pedidos con Square",
  "Pedidos desde Instagram",
  "Recompensas de lealtad",
  "Reporte mensual",
];

export default function OwnerCommandCenterPage() {
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pin.trim() === TEMP_OWNER_PIN) {
      setIsAuthorized(true);
      setError("");
      return;
    }

    setError("PIN incorrecto. Inténtalo de nuevo.");
  };

  if (!isAuthorized) {
    return (
      <main className="min-h-dvh bg-[radial-gradient(circle_at_20%_10%,#2e5a7c22_0%,transparent_36%),radial-gradient(circle_at_80%_15%,#d990281f_0%,transparent_30%),linear-gradient(180deg,#120904_0%,#1b0e08_45%,#2a1208_100%)] px-4 py-8 text-[#fff3d6] sm:px-6">
        <div className="mx-auto w-full max-w-xl">
          <section className="rounded-3xl border border-[#f5c46b33] bg-[#1b0e08]/75 p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)] backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#92aecd]">Acceso del dueño</p>
            <h1 className="mt-3 font-serif text-3xl text-[#fff3d6] sm:text-4xl">Centro de Control Colattao</h1>
            <p className="mt-3 text-sm text-[#f4deba]/85 sm:text-base">
              Ingrese su PIN de acceso para abrir el panel de control.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#f5c46b]">PIN de Acceso</span>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#f5c46b40] bg-[#120904]/75 px-4 py-3 text-base text-[#fff3d6] outline-none placeholder:text-[#f4deba]/35 focus:border-[#f5c46b] focus:ring-2 focus:ring-[#f5c46b33]"
                  placeholder="Ingrese PIN"
                />
              </label>
              {error ? <p className="text-sm text-[#f7b0a4]">{error}</p> : null}
              <button
                type="submit"
                className="rounded-full border border-[#f5c46b66] bg-[#d99028] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#2a1208] transition hover:bg-[#f5c46b]"
              >
                Entrar al centro de control
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_20%_10%,#2e5a7c22_0%,transparent_36%),radial-gradient(circle_at_80%_15%,#d990281f_0%,transparent_30%),linear-gradient(180deg,#120904_0%,#1b0e08_45%,#2a1208_100%)] px-4 py-8 text-[#fff3d6] sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <section className="rounded-3xl border border-[#f5c46b33] bg-[#1b0e08]/75 p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)] backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#92aecd]">Centro de Control</p>
          <h1 className="mt-3 font-serif text-3xl text-[#fff3d6] sm:text-4xl">Centro de Control Colattao</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#f4deba]/85 sm:text-base">
            Interfaz para dueños con estilo de videojuego para gestionar el ecosistema digital. El
            menú digital ahora combina textura visual, imágenes por categoría, opciones de leche y
            una experiencia premium sin perder claridad para ordenar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/request-update"
              className="rounded-full border border-[#f5c46b55] bg-[#fff3d61a] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#fff3d6] transition hover:bg-[#fff3d629]"
            >
              Enviar solicitud
            </Link>
            <Link
              href="/menu"
              className="rounded-full border border-[#f5c46b66] bg-[#d99028] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2a1208] transition hover:bg-[#f5c46b]"
            >
              Ver menú
            </Link>
            <Link
              href="/website-concept"
              className="rounded-full border border-[#92aecd66] bg-[#2e5a7c33] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#dbe7f3] transition hover:bg-[#2e5a7c55]"
            >
              Abrir concepto de website
            </Link>
            <Link
              href="/owner-presentation"
              className="rounded-full border border-[#f5c46b55] bg-[#fff3d61a] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#fff3d6] transition hover:bg-[#fff3d629]"
            >
              Abrir presentación para dueños
            </Link>
            <Link
              href="/research-and-development"
              className="rounded-full border border-[#92aecd66] bg-[#2e5a7c44] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#dbe7f3] transition hover:bg-[#2e5a7c66]"
            >
              Abrir laboratorio I+D (interno)
            </Link>
            <Link
              href={`/get-started?key=${process.env.NEXT_PUBLIC_REP_ACCESS_CODE || "1234"}`}
              className="rounded-full border border-[#92aecd66] bg-[#2e5a7c44] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#dbe7f3] transition hover:bg-[#2e5a7c66]"
            >
              Registrar nuevo café (reps)
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-[#f4deba]/55">
            El registro de cafés es una herramienta interna para representantes. No es visible para
            los clientes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f5c46b]">Módulos activos</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVE_MODULES.map((module) => (
              <article
                key={module}
                className="rounded-2xl border border-[#f5c46b2f] bg-[#fff3d610] p-4 shadow-[0_14px_35px_-24px_rgba(0,0,0,0.9)]"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#92aecd]">Módulo activo</p>
                <p className="mt-2 text-sm font-semibold text-[#fff3d6]">{module}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f5c46b]">Misiones del dueño</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OWNER_MISSIONS.map((mission, index) => (
              <article
                key={mission}
                className="rounded-2xl border border-[#92aecd38] bg-[#2e5a7c18] p-4 shadow-[0_14px_35px_-24px_rgba(0,0,0,0.9)]"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#f5c46b]">Misión {index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-[#fff3d6]">{mission}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#f5c46b30] bg-[#fff3d60f] p-6">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f5c46b]">Vista previa de métricas</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#f5c46b2a] bg-[#1b0e08]/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#92aecd]">Visitas al menú</p>
              <p className="mt-2 text-sm font-semibold text-[#fff3d6]">Demostración</p>
            </div>
            <div className="rounded-2xl border border-[#f5c46b2a] bg-[#1b0e08]/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#92aecd]">Partidas jugadas</p>
              <p className="mt-2 text-sm font-semibold text-[#fff3d6]">Demostración</p>
            </div>
            <div className="rounded-2xl border border-[#f5c46b2a] bg-[#1b0e08]/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#92aecd]">Producto más visto</p>
              <p className="mt-2 text-sm font-semibold text-[#fff3d6]">Demostración</p>
            </div>
            <div className="rounded-2xl border border-[#f5c46b2a] bg-[#1b0e08]/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#92aecd]">Solicitudes enviadas</p>
              <p className="mt-2 text-sm font-semibold text-[#fff3d6]">Demostración</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-[#f4deba]/80">
            Interfaz de demostración. Las métricas reales requieren tráfico en producción y acceso
            de seguimiento aprobado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f5c46b]">Módulos futuros bloqueados</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LOCKED_MODULES.map((module) => (
              <article
                key={module}
                className="rounded-2xl border border-dashed border-[#f5c46b38] bg-[#120904]/65 p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#d99028]">Bloqueado</p>
                <p className="mt-2 text-sm font-semibold text-[#f4deba]">{module}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#f5c46b33] bg-[#1b0e08]/75 p-6 text-center">
          <p className="text-sm text-[#fff3d6] sm:text-base">
            Así puede sentirse el lado del dueño: simple, visual y listo para crecer por módulos.
          </p>
        </section>
      </div>
    </main>
  );
}
