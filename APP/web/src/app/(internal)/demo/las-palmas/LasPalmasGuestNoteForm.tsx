"use client";

import { useState } from "react";

// Bottom-of-menu guest intake, mirroring the Colattao Guest Notes form on the
// Café Rush QR menu, restyled to the Las Palmas parchment identity. Posts to
// the existing public intake endpoint (/api/customer-requests) so notes land
// in the Fina Calle team pipeline — during the prospect demo nothing goes to
// restaurant staff (same honesty rule as the Table OS service buttons).

const NOTE_TYPES = [
  "Loved something",
  "Menu idea",
  "Order issue",
  "Event or catering",
  "Other",
] as const;

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function LasPalmasGuestNoteForm(): React.JSX.Element {
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [noteType, setNoteType] = useState<(typeof NOTE_TYPES)[number]>("Loved something");
  const [message, setMessage] = useState("");
  const [mayContact, setMayContact] = useState<"Yes" | "No" | "">("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const canSubmit = message.trim().length > 0 && Boolean(mayContact) && status !== "loading";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");

    const safeName = name.trim() || "Las Palmas guest";
    const safeContact = contactInfo.trim() || "Not provided";
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    const formData = new FormData();
    formData.set("businessName", "Las Palmas Lynnhaven (prospect demo)");
    formData.set("contactName", safeName);
    formData.set("contactInfo", safeContact);
    formData.set("requestType", "Question for AMMA");
    formData.set("priority", "Normal");
    formData.set(
      "message",
      [
        "Las Palmas Guest Note (demo menu)",
        `Type: ${noteType}`,
        `Name: ${safeName}`,
        `Contact: ${safeContact}`,
        `May contact: ${mayContact}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
    );
    formData.set("sourcePage", currentUrl ? `Las Palmas demo menu - ${currentUrl}` : "Las Palmas demo menu");
    formData.set("company", "");

    try {
      const response = await fetch("/api/customer-requests", { method: "POST", body: formData });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      setName("");
      setContactInfo("");
      setNoteType("Loved something");
      setMessage("");
      setMayContact("");
    } catch {
      setStatus("error");
    }
  }

  const inputClasses =
    "min-h-11 w-full rounded-[3px] border border-[#9b805c] bg-[#fffaf0] px-3 py-2.5 text-base text-[#362014] placeholder:text-[#79634c] focus:border-[#a63f19]";
  const labelClasses = "mb-1.5 block text-sm font-medium text-[#59402b]";

  return (
    <section className="mt-10 border-t border-[#987954] pt-8" aria-labelledby="guest-note-heading">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#785437]">
        Share feedback with Fina Calle
      </p>
      <h2 id="guest-note-heading" className="mt-2 text-center font-serif text-3xl font-bold text-[#362014]">
        <span lang="es">Deja tu nota</span>
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-[#634f3b]">
        Your note goes to the Fina Calle team, not Las Palmas staff. For an order issue
        or anything you need right now, please speak with restaurant staff.
      </p>

      {status === "success" ? (
        <p role="status" className="mx-auto mt-6 max-w-md border border-[#54704c] bg-[#e7eddd] px-4 py-4 text-center text-base font-semibold text-[#193b24]">
          ¡Gracias! Your note was sent to Fina Calle, not restaurant staff.
        </p>
      ) : (
        <form onSubmit={onSubmit} aria-busy={status === "loading"} className="mx-auto mt-6 max-w-md space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lp-guest-name" className={labelClasses}>
                Name <span className="opacity-60">(optional)</span>
              </label>
              <input
                id="lp-guest-name"
                name="guestName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="lp-guest-contact" className={labelClasses}>
                Contact <span className="opacity-60">(optional)</span>
              </label>
              <input
                id="lp-guest-contact"
                name="guestContact"
                spellCheck={false}
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Email or phone"
                autoComplete="email"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label htmlFor="lp-guest-type" className={labelClasses}>
              Note type
            </label>
            <select
              id="lp-guest-type"
              name="noteType"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as (typeof NOTE_TYPES)[number])}
              required
              className={inputClasses}
            >
              {NOTE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lp-guest-message" className={labelClasses}>
              Message
            </label>
            <textarea
              id="lp-guest-message"
              name="guestMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              placeholder="Write your note here…"
              className={inputClasses}
            />
          </div>

          <fieldset>
            <legend className={labelClasses}>May Fina Calle contact you?</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["Yes", "No"] as const).map((option) => (
                <label
                  key={option}
                  className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[3px] border border-[#9b805c] text-sm font-semibold text-[#362014] has-[:checked]:border-[#285236] has-[:checked]:bg-[#dce6d2]"
                >
                  <input
                    type="radio"
                    name="lp-may-contact"
                    value={option}
                    checked={mayContact === option}
                    onChange={() => setMayContact(option)}
                    required
                    className="h-4 w-4 accent-[#285236]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          {status === "error" ? (
            <p role="alert" className="border border-[#a63f19] bg-[#fae7d9] px-3 py-2 text-sm text-[#6b240b]">
              Your note could not be sent to Fina Calle. Your message is still here; please try again.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="min-h-12 w-full rounded-[4px] border border-[#733216] bg-[#a63f19] px-5 py-3.5 text-center text-sm font-bold tracking-[0.06em] text-[#fff4dc] hover:bg-[#883010] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Sending…" : "Send note to Fina Calle"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-xs leading-5 text-[#6b5741]">
        No account needed. Please do not include payment details or other sensitive information.
      </p>
    </section>
  );
}
