"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./landing.module.css";

// Package inquiries use the existing public intake. Only report receipt when
// the endpoint confirms persistence or email delivery, not HTTP success alone.

type SubmitStatus = "idle" | "loading" | "success" | "error";

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function LeadForm(): React.JSX.Element {
  const isHydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (status === "error" || status === "success") feedbackRef.current?.focus();
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isHydrated || inFlight.current) return;
    if (!business.trim() || !contact.trim()) {
      setStatus("error");
      return;
    }
    inFlight.current = true;
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
        "Restaurant package inquiry — request a written plan starting at $199/month per location",
        `Restaurant: ${business.trim()}`,
        `Contact: ${contact.trim()}`,
        "",
        note.trim() || "(no note)",
      ].join("\n"),
    );
    formData.set("sourcePage", "for-restaurants package inquiry");
    formData.set("company", "");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/customer-requests", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const receipt: unknown = await response.json();
      if (
        !response.ok ||
        typeof receipt !== "object" ||
        receipt === null ||
        !("ok" in receipt) ||
        receipt.ok !== true ||
        !(("persistenceActive" in receipt && receipt.persistenceActive === true) ||
          ("emailActive" in receipt && receipt.emailActive === true))
      ) {
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
    } finally {
      window.clearTimeout(timeoutId);
      inFlight.current = false;
    }
  }

  if (status === "success") {
    return (
      <p ref={feedbackRef} className={styles.success} role="status" tabIndex={-1}>
        Your restaurant-plan inquiry was received. We will use your contact details to reply
        about the scope. No subscription or charge has started.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} aria-busy={status === "loading"}>
      <noscript>
        <p className={styles.formNote}>
          JavaScript is needed to send this form. You can <a className={styles.proofLink} href="mailto:Ammaventuresvb@gmail.com">email Fina Calle</a> to request a restaurant plan instead.
        </p>
      </noscript>
      <fieldset disabled={!isHydrated || status === "loading"}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="lead-business">Restaurant name</label>
        <input
          id="lead-business"
          name="businessName"
          className={styles.input}
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          required
          maxLength={200}
          disabled={status === "loading"}
          autoComplete="organization"
          placeholder="e.g. Ocean View Cantina…"
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="lead-name">
            Your name <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="lead-name"
            name="contactName"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={200}
            disabled={status === "loading"}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="lead-contact">Email or phone</label>
          <input
            id="lead-contact"
            name="contactInfo"
            type="text"
            className={styles.input}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            autoComplete="email"
            spellCheck={false}
            maxLength={300}
            disabled={status === "loading"}
            placeholder="Email or phone for your reply…"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="lead-note">
          Anything we should know <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="lead-note"
          name="message"
          className={styles.input}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={3000}
          disabled={status === "loading"}
          placeholder="Your current menu link or what you need…"
        />
      </div>

      {status === "error" ? (
        <p ref={feedbackRef} className={styles.error} role="alert" tabIndex={-1}>
          We could not confirm receipt. Your details are still here. Check your restaurant name
          and contact details, then retry, or <a className={styles.proofLink} href="mailto:Ammaventuresvb@gmail.com">email Fina Calle</a>.
        </p>
      ) : null}

      <button className={styles.submit} type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Request the plan in writing"}
      </button>
      <p className={styles.formNote} role="status">{status === "loading" ? "Sending your inquiry…" : ""}</p>
      <p className={styles.formNote}>
        We use these details to review your inquiry and reply. This form does not start
        a subscription or authorize payment.
      </p>
      </fieldset>
    </form>
  );
}
