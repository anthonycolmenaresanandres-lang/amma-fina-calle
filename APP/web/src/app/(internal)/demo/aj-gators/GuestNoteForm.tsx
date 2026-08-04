"use client";

import { useState } from "react";

// Bottom-of-page guest comments, mirroring the Las Palmas guest note form.
// Posts to the existing public intake endpoint (/api/customer-requests) so
// comments land in the Fina Calle team pipeline — during the prospect demo
// nothing goes to restaurant staff (same honesty rule as the game hub).

const NOTE_TYPES = [
  "Loved something",
  "Menu idea",
  "Order issue",
  "Event or catering",
  "Other",
] as const;

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function GuestNoteForm(): React.JSX.Element {
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

    const safeName = name.trim() || "A.J. Gator's guest";
    const safeContact = contactInfo.trim() || "Not provided";
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    const formData = new FormData();
    formData.set("businessName", "A.J. Gator's Holland Road (prospect demo)");
    formData.set("contactName", safeName);
    formData.set("contactInfo", safeContact);
    formData.set("requestType", "Question for AMMA");
    formData.set("priority", "Normal");
    formData.set(
      "message",
      [
        "A.J. Gator's Guest Comment (demo hub)",
        `Type: ${noteType}`,
        `Name: ${safeName}`,
        `Contact: ${safeContact}`,
        `May contact: ${mayContact}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
    );
    formData.set("sourcePage", currentUrl ? `AJ Gator's demo hub - ${currentUrl}` : "AJ Gator's demo hub");
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
    "w-full rounded-[0.35rem] border-2 border-[#f7f3e6]/25 bg-[#02281d] px-3 py-2.5 text-sm text-[#f7f3e6] placeholder:text-[#b7c9be]/50 focus:border-[#e1b52d] focus:outline-none focus:ring-1 focus:ring-[#e1b52d]/60";
  const labelClasses =
    "mb-1 block text-[0.64rem] font-bold uppercase tracking-[0.18em] text-[#b7c9be]";

  return (
    <div>
      {status === "success" ? (
        <p className="mx-auto mt-6 max-w-sm rounded-[0.35rem] border-2 border-[#e1b52d] bg-[#e1b52d]/10 px-4 py-4 text-center text-sm font-bold text-[#f7f3e6]">
          Thanks! Your comment went straight to the team.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mx-auto mt-6 max-w-md space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="aj-guest-name" className={labelClasses}>
                Name <span className="opacity-60">(optional)</span>
              </label>
              <input
                id="aj-guest-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="aj-guest-contact" className={labelClasses}>
                Contact <span className="opacity-60">(optional)</span>
              </label>
              <input
                id="aj-guest-contact"
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
            <label htmlFor="aj-guest-type" className={labelClasses}>
              Comment type
            </label>
            <select
              id="aj-guest-type"
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
            <label htmlFor="aj-guest-message" className={labelClasses}>
              Comment
            </label>
            <textarea
              id="aj-guest-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              placeholder="Write your comment here..."
              className={inputClasses}
            />
          </div>

          <fieldset>
            <legend className={labelClasses}>May we contact you?</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["Yes", "No"] as const).map((option) => (
                <label
                  key={option}
                  className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[0.35rem] border-2 border-[#f7f3e6]/25 text-sm font-bold text-[#f7f3e6] has-[:checked]:border-[#e1b52d] has-[:checked]:bg-[#e1b52d]/10"
                >
                  <input
                    type="radio"
                    name="aj-may-contact"
                    value={option}
                    checked={mayContact === option}
                    onChange={() => setMayContact(option)}
                    required
                    className="h-3.5 w-3.5 accent-[#e1b52d]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          {status === "error" ? (
            <p className="rounded-[0.35rem] border-2 border-[#c82037]/60 bg-[#c82037]/10 px-3 py-2 text-sm text-[#f7f3e6]">
              We could not send this comment right now. Please try again in a moment.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-[0.35rem] border-2 border-[#001c14] bg-[#c82037] px-5 py-3.5 text-center text-base uppercase tracking-[0.05em] text-white shadow-[0.22rem_0.22rem_0_#e1b52d] transition [font-family:var(--font-gator-display),var(--font-gator-body),sans-serif] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[0.34rem_0.34rem_0_#e1b52d] focus-visible:outline-[0.2rem] focus-visible:outline-offset-[0.2rem] focus-visible:outline-[#e1b52d] active:translate-x-[0.22rem] active:translate-y-[0.22rem] active:shadow-none disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-[0.22rem_0.22rem_0_rgba(225,181,45,0.35)] disabled:hover:translate-x-0 disabled:hover:translate-y-0 motion-reduce:transition-none"
          >
            {status === "loading" ? "Sending..." : "Send comment"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-[0.66rem] italic leading-5 text-[#b7c9be]/70">
        Demo preview: comments go to the Fina Calle team, not restaurant staff. No account needed.
      </p>
    </div>
  );
}
