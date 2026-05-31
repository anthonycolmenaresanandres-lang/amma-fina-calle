"use client";

import { useState } from "react";
import appTheme from "@/config/theme";

/**
 * Lightweight feedback box.
 *
 * On submit, posts feedback to the existing owner request intake endpoint
 * so Anthony receives the message by email.
 *
 * Pass `pageSource` so messages tell us which page the feedback came from.
 */

type FeedbackType =
  | "Question for Anthony"
  | "Menu update"
  | "Game idea"
  | "Website idea";

const FEEDBACK_TYPES: Array<{ label: string; value: FeedbackType }> = [
  { label: "General", value: "Question for Anthony" },
  { label: "Menú", value: "Menu update" },
  { label: "Juego", value: "Game idea" },
  { label: "Website", value: "Website idea" },
];

type Variant = "light" | "dark";

export default function FeedbackBox({
  pageSource,
  variant = "dark",
  title = "¿Algún comentario?",
}: {
  /** Free-form label that identifies which page the box lives on. */
  pageSource?: string;
  /** "dark" = on espresso shell (/, /owner-presentation). "light" = on parchment (/menu). */
  variant?: Variant;
  title?: string;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<FeedbackType>("Question for Anthony");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setStatus("loading");

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    const formData = new FormData();
    formData.set("name", name.trim() || "Anonymous feedback");
    formData.set("contactInfo", "No contact provided");
    formData.set("requestType", type);
    formData.set("priority", "Normal");
    formData.set(
      "message",
      [
        `Feedback type: ${type}`,
        `Page: ${pageSource ?? "(not specified)"}`,
        "",
        comment.trim(),
      ].join("\n"),
    );
    formData.set("sourcePage", currentUrl || pageSource || "feedback-box");
    formData.set("company", "");

    try {
      const response = await fetch("/api/owner-requests", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const isDark = variant === "dark";

  const cardClass = isDark
    ? "rounded-2xl border border-amber-300/20 bg-white/[0.04] p-4 backdrop-blur-sm"
    : "menu-card px-4 pb-4 pt-4";

  const labelClass = isDark
    ? "text-[10px] uppercase tracking-[0.22em] text-amber-200/75"
    : "text-[10px] uppercase tracking-[0.22em] text-[var(--col-gold-deep)]";

  const inputClass = isDark
    ? "w-full rounded-md border border-amber-300/25 bg-black/30 px-3 py-2 text-[13px] text-amber-50 placeholder:text-amber-200/40 focus:border-amber-300/60 focus:outline-none"
    : "w-full rounded-md border border-[var(--col-gold-deep)]/30 bg-white/70 px-3 py-2 text-[13px] text-[var(--col-espresso)] placeholder:text-[var(--col-espresso-3)]/50 focus:border-[var(--col-gold-deep)]/70 focus:outline-none";

  const titleClass = isDark
    ? "brand-wordmark text-[18px] text-amber-50"
    : "brand-wordmark text-[18px] text-[var(--col-espresso)]";

  const noteClass = isDark
    ? "mt-2 text-center text-[10px] italic text-amber-200/55"
    : "mt-2 text-center text-[10px] italic text-[var(--col-espresso-3)]/65";

  return (
    <section className={cardClass}>
      <p className={`text-center ${labelClass}`}>Comentarios</p>
      <h3
        className={`mt-1 text-center ${titleClass}`}
        style={{ letterSpacing: "0.04em" }}
      >
        {title}
      </h3>

      {status === "success" ? (
        <p
          className={`mt-3 text-center text-[12.5px] ${
            isDark ? "text-amber-100/85" : "text-[var(--col-espresso)]"
          }`}
        >
          Comentario enviado. Anthony recibirá una notificación por correo.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-3 space-y-2.5">
          <div>
            <label htmlFor="fb-name" className={`mb-1 block ${labelClass}`}>
              Nombre <span className="opacity-60">(opcional)</span>
            </label>
            <input
              id="fb-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Su nombre"
              className={inputClass}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="fb-type" className={`mb-1 block ${labelClass}`}>
              Tipo de comentario
            </label>
            <select
              id="fb-type"
              value={type}
              onChange={(e) => setType(e.target.value as FeedbackType)}
              className={inputClass}
            >
              {FEEDBACK_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="text-[var(--col-espresso)]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fb-comment" className={`mb-1 block ${labelClass}`}>
              Comentario
            </label>
            <textarea
              id="fb-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Cuéntenos qué piensa..."
              className={inputClass}
              required
            />
          </div>

          {status === "error" ? (
            <p
              className={`text-[12px] ${
                isDark ? "text-amber-100/90" : "text-[var(--col-espresso)]"
              }`}
            >
              No se pudo enviar el comentario. Intente de nuevo.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!comment.trim() || status === "loading"}
            className="btn-gold mt-1 w-full rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {status === "loading" ? "Enviando..." : appTheme.ui.feedbackButtonText}
          </button>
        </form>
      )}

      <p className={noteClass}>
        Este comentario se envía por correo. No se guarda en una base de datos.
      </p>
    </section>
  );
}
