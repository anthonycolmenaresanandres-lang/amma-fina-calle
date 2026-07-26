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
    "w-full border border-[#a9b8a9]/30 bg-[#0a2317] px-3 py-2 text-sm text-[#f2ead6] placeholder:text-[#a9b8a9]/50 focus:border-[#dfe3e6] focus:outline-none focus:ring-1 focus:ring-[#dfe3e6]/50";
  const labelClasses = "mb-1 block text-[0.64rem] uppercase tracking-[0.2em] text-[#a9b8a9]";

  return (
    <section className="mt-12 border-t-2 border-[#c8ced3]/50 pt-8">
      <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#dfe3e6]">
        Guest Notes
      </p>
      <h2 className="mt-2 text-center font-serif text-3xl tracking-[0.06em] text-[#f7f1e0]">
        Deja tu nota
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-[#a9b8a9]">
        Tell the Las Palmas team what you loved, what needs attention, or what you want to see
        next.
      </p>

      {status === "success" ? (
        <p className="mx-auto mt-6 max-w-sm border border-[#dfe3e6]/40 bg-[#dfe3e6]/10 px-4 py-4 text-center text-sm font-semibold text-[#f3f5f6]">
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
                  className="flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-[#a9b8a9]/30 text-sm font-semibold text-[#f2ead6] has-[:checked]:border-[#dfe3e6] has-[:checked]:bg-[#dfe3e6]/10 has-[:checked]:text-[#f3f5f6]"
                >
                  <input
                    type="radio"
                    name="lp-may-contact"
                    value={option}
                    checked={mayContact === option}
                    onChange={() => setMayContact(option)}
                    required
                    className="h-3.5 w-3.5 accent-[#dfe3e6]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          {status === "error" ? (
            <p className="border border-[#d5322d]/50 bg-[#d5322d]/10 px-3 py-2 text-sm text-[#f2ead6]">
              We could not send this note right now. Please try again in a moment.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full border border-[#dfe3e6] bg-[#dfe3e6] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#06130d] transition hover:bg-[#f4f6f7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : "Send guest note"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-[0.66rem] italic leading-5 text-[#a9b8a9]/70">
        Demo preview: notes go to the Fina Calle team, not restaurant staff. No account needed.
      </p>
    </section>
  );
}
