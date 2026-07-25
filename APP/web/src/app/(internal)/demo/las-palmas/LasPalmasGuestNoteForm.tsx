"use client";

import { useState } from "react";

// Bottom-of-menu guest intake, mirroring the Colattao Guest Notes form on the
// Café Rush QR menu, restyled to the Las Palmas palm/gold identity. Posts to
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
    "w-full rounded-2xl border border-[#188e8e]/20 bg-white/80 px-4 py-3 text-sm text-[#173f3b] shadow-[0_8px_20px_rgba(14,83,78,0.06)] placeholder:text-[#6f8f88]/60 focus:border-[#0b8d94] focus:outline-none focus:ring-2 focus:ring-[#0b8d94]/20";
  const labelClasses =
    "mb-1.5 block text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#52716b]";

  return (
    <section className="mt-14 border-t border-[#18aeb4]/25 pt-9">
      <p className="text-center text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#d94832]">
        Guest Notes
      </p>
      <h2 className="mt-2 text-center font-serif text-3xl tracking-[0.05em] text-[#123f3a]">
        Deja tu nota
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-[#52716b]">
        Tell the Las Palmas team what you loved, what needs attention, or what you want to see
        next.
      </p>

      {status === "success" ? (
        <p className="mx-auto mt-6 max-w-sm rounded-2xl bg-[#dff6ee] px-4 py-4 text-center text-sm font-semibold text-[#126757]">
          ¡Gracias! Your note was sent to the team.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mx-auto mt-6 max-w-md space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lp-guest-name" className={labelClasses}>
                Name <span className="opacity-60">(optional)</span>
              </label>
              <input
                id="lp-guest-name"
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              placeholder="Write your note here..."
              className={inputClasses}
            />
          </div>

          <fieldset>
            <legend className={labelClasses}>May we contact you?</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["Yes", "No"] as const).map((option) => (
                <label
                  key={option}
                  className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-white/80 text-sm font-semibold text-[#315c56] shadow-[0_8px_20px_rgba(14,83,78,0.06)] has-[:checked]:bg-[#d9f5f1] has-[:checked]:text-[#087f85] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0b8d94]"
                >
                  <input
                    type="radio"
                    name="lp-may-contact"
                    value={option}
                    checked={mayContact === option}
                    onChange={() => setMayContact(option)}
                    required
                    className="h-3.5 w-3.5 accent-[#ef5d43]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          {status === "error" ? (
            <p className="rounded-2xl bg-[#ffe4dd] px-4 py-3 text-sm text-[#963522]">
              We could not send this note right now. Please try again in a moment.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-full bg-[#ef5d43] px-5 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_12px_28px_rgba(153,52,35,0.2)] transition hover:bg-[#d94c36] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b8d94] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : "Send guest note"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-[0.66rem] italic leading-5 text-[#5f7e77]/75">
        Demo preview: notes go to the Fina Calle team, not restaurant staff. No account needed.
      </p>
    </section>
  );
}
