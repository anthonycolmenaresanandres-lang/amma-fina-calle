"use client";

import { useState } from "react";
import styles from "./page.module.css";

const NOTE_TYPES = ["Loved something", "Menu idea", "Order issue", "Event or catering", "Other"] as const;
type SubmitStatus = "idle" | "loading" | "success" | "error";

export function BodegaGuestNoteForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [noteType, setNoteType] = useState<(typeof NOTE_TYPES)[number]>("Loved something");
  const [message, setMessage] = useState("");
  const [mayContact, setMayContact] = useState<"yes" | "no" | "">("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState("");
  const canSubmit = status !== "loading";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || !mayContact || status === "loading") return;
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/bodega/guest-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          noteType,
          message,
          mayContact: mayContact === "yes",
          sourceUrl: window.location.href,
          company: "",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "Your note could not be sent.");
      setStatus("success");
      setName("");
      setContact("");
      setMessage("");
      setMayContact("");
      setNoteType("Loved something");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Your note could not be sent.");
    }
  }

  return (
    <section className={styles.guestNotes} aria-labelledby="bodega-guest-note-title">
      <div className={styles.guestNoteIntro}>
        <p className={styles.noteKicker}>Straight from the counter</p>
        <h2 id="bodega-guest-note-title">Leave us a note.</h2>
        <p>Tell us what hit, what needs attention, or what you want to see next. For an order issue you need fixed now, please speak with the café team.</p>
      </div>

      {status === "success" ? (
        <div className={styles.noteSuccess} role="status">
          <strong>Note received.</strong>
          <span>Thanks for helping us keep the Bodega vibe right.</span>
          <button type="button" onClick={() => setStatus("idle")}>Leave another note</button>
        </div>
      ) : (
        <form className={styles.noteForm} onSubmit={submit} aria-busy={status === "loading"}>
          <div className={styles.notePair}>
            <label>Name <span>Optional</span><input name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={120} placeholder="e.g. Ana…" /></label>
            <label>Contact <span>Optional</span><input name="contact" value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="email" maxLength={240} placeholder="e.g. email or phone…" /></label>
          </div>
          <label>Note type<select name="noteType" autoComplete="off" value={noteType} onChange={(event) => setNoteType(event.target.value as (typeof NOTE_TYPES)[number])}>
            {NOTE_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select></label>
          <label>Message<textarea name="message" autoComplete="off" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={3000} rows={5} required placeholder="Drop the note here…" /></label>
          <fieldset>
            <legend>May Fina Calle contact you?</legend>
            <div className={styles.noteChoices}>
              <label><input type="radio" name="bodega-may-contact" checked={mayContact === "yes"} onChange={() => setMayContact("yes")} required /> Yes</label>
              <label><input type="radio" name="bodega-may-contact" checked={mayContact === "no"} onChange={() => setMayContact("no")} required /> No</label>
            </div>
          </fieldset>
          {status === "error" ? <p className={styles.noteError} role="alert">{error} Your message is still here.</p> : null}
          <button className={styles.noteSubmit} type="submit" disabled={!canSubmit}>{status === "loading" ? "Sending…" : "Send guest note"}</button>
          <p className={styles.notePrivacy}>No account needed. Do not include payment information or other sensitive details.</p>
        </form>
      )}
    </section>
  );
}
