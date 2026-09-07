"use client";

import { useState } from "react";
import styles from "./landing.module.css";

// Campaign lead capture. Posts to the existing public intake endpoint, the same
// one the guest-note forms use, so ad leads land in the Fina Calle pipeline with
// no new backend, no database and no customer data stored in this app.

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function LeadForm(): React.JSX.Element {
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const canSubmit = business.trim().length > 0 && contact.trim().length > 0 && status !== "loading";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");

    const formData = new FormData();
    formData.set("businessName", business.trim());
    formData.set("contactName", name.trim() || "Not provided");
    formData.set("contactInfo", contact.trim());
    // Must be one of the intake endpoint's allowed types (see
    // app/api/customer-requests/route.ts) — anything else is rejected with a
    // 400 and the lead is lost. The ad-campaign context lives in the message
    // body and sourcePage instead.
    formData.set("requestType", "Question for AMMA");
    formData.set("priority", "Normal");
    formData.set(
      "message",
      [
        "Ad campaign lead — /for-restaurants",
        `Restaurant: ${business.trim()}`,
        `Contact: ${contact.trim()}`,
        "",
        note.trim() || "(no note)",
      ].join("\n"),
    );
    formData.set("sourcePage", "for-restaurants ad landing");
    formData.set("company", "");

    try {
      const response = await fetch("/api/customer-requests", { method: "POST", body: formData });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      setBusiness("");
      setName("");
      setContact("");
      setNote("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className={styles.success} role="status">
        Got it. We will build your mock and send you the link — usually within a day.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="lead-business">Restaurant name</label>
        <input
          id="lead-business"
          className={styles.input}
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          required
          autoComplete="organization"
          placeholder="e.g. Ocean View Cantina"
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="lead-name">
            Your name <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="lead-name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="lead-contact">Email or phone</label>
          <input
            id="lead-contact"
            className={styles.input}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            autoComplete="email"
            placeholder="How should we send the link?"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="lead-note">
          Anything we should know <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="lead-note"
          className={styles.input}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Link to your current menu, busiest hours, anything."
        />
      </div>

      {status === "error" ? (
        <p className={styles.error}>
          That did not send. Try again in a moment, or email anthonycolmenaresanandres@gmail.com.
        </p>
      ) : null}

      <button className={styles.submit} type="submit" disabled={!canSubmit}>
        {status === "loading" ? "Sending…" : "Send my menu for a free mock"}
      </button>
      <p className={styles.formNote}>
        We use this only to build your mock and reply. No card, no subscription, no list.
      </p>
    </form>
  );
}
