"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CircleCheck, Loader2, Send } from "lucide-react";
import styles from "./ConsultationPages.module.css";

type Status = "idle" | "submitting" | "success" | "error";

type SubmitResult = {
  referenceId?: string | null;
  filesStored?: number;
  persistenceActive?: boolean;
  emailActive?: boolean;
};

const REQUEST_TYPES = [
  "Business info update",
  "Menu/content update",
  "Contact info update",
  "Image/file upload",
  "Website change",
  "Game/module idea",
  "Operational support",
  "Question for AMMA",
] as const;

const PRIORITIES = ["Low", "Normal", "Urgent"] as const;
const MAX_FILES = 10;
const MAX_TOTAL_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "image/heic", "image/heif", "application/pdf",
]);
const CONTACT_EMAIL = "Ammaventuresvb@gmail.com";
const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function CustomerRequestForm({
  mode = "request",
}: {
  mode?: "request" | "consultation";
}) {
  const isConsultation = mode === "consultation";
  const isHydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [requestType, setRequestType] =
    useState<(typeof REQUEST_TYPES)[number]>("Business info update");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("Normal");
  const [message, setMessage] = useState("");
  const [outcome, setOutcome] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const submittingRef = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const selectedFileNames = useMemo(() => files.map((file) => file.name), [files]);
  const isValid = Boolean(
    businessName.trim() && contactName.trim() && contactInfo.trim() &&
    message.trim() && (!isConsultation || outcome.trim()),
  );
  const hasDraft = Boolean(businessName || contactName || contactInfo || message || outcome || files.length);

  useEffect(() => {
    if (status === "success" || status === "error") statusRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (!hasDraft || status === "success") return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasDraft, status]);

  const resetForm = () => {
    setBusinessName("");
    setContactName("");
    setContactInfo("");
    setRequestType("Business info update");
    setPriority("Normal");
    setMessage("");
    setOutcome("");
    setFiles([]);
    setCompany("");
    setErrorMessage("");
    setFileError("");
    setResult(null);
    setStatus("idle");
    requestAnimationFrame(() => businessRef.current?.focus());
  };

  const onFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const totalSize = selected.reduce((sum, file) => sum + file.size, 0);
    const validationError = selected.length > MAX_FILES
      ? "Choose up to 10 files."
      : totalSize > MAX_TOTAL_FILE_SIZE_BYTES
        ? "Your files exceed 4 MB in total. Choose fewer or smaller files."
        : selected.some((file) => !ALLOWED_FILE_TYPES.has(file.type))
          ? "Choose JPEG, PNG, WebP, GIF, HEIC, HEIF, or PDF files."
          : "";

    setFileError(validationError);
    if (validationError) {
      setFiles([]);
      event.target.value = "";
      return;
    }
    setFiles(selected);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!isValid || fileError) {
      setErrorMessage(fileError || "Complete each required field with your details before sending.");
      setStatus("error");
      statusRef.current?.focus();
      return;
    }

    // Lock synchronously: rapid clicks must not send a second request before React renders.
    submittingRef.current = true;
    setStatus("submitting");
    setErrorMessage("");
    const formData = new FormData();
    formData.append("businessName", businessName.trim());
    formData.append("contactName", contactName.trim());
    formData.append("contactInfo", contactInfo.trim());
    // Keep the existing allowlisted server contract; consultation context goes in the message.
    formData.append("requestType", isConsultation ? "Question for AMMA" : requestType);
    formData.append("priority", isConsultation ? "Normal" : priority);
    formData.append("message", isConsultation
      ? `Consultation inquiry\n\nBusiness context and challenge:\n${message.trim()}\n\nDesired outcome:\n${outcome.trim()}`
      : message.trim());
    formData.append("sourcePage", window.location.href);
    formData.append("company", company);
    for (const file of files) formData.append("files", file);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch("/api/customer-requests", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => null)) as
        | ({ ok?: boolean; detail?: string } & SubmitResult)
        | null;

      // A validation-only 200 is not evidence that anyone received the inquiry.
      if (response.ok && payload?.ok &&
          (payload.persistenceActive === true || payload.emailActive === true)) {
        setResult(payload);
        setStatus("success");
        return;
      }

      setErrorMessage(
        payload?.detail ||
        "We couldn’t confirm delivery. Your details are still here. Try again, or email the team below.",
      );
      setStatus("error");
    } catch {
      setErrorMessage(
        "We couldn’t confirm delivery because the connection failed or timed out. Your details are still here. Check your connection, try again, or email the team below.",
      );
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      submittingRef.current = false;
    }
  };

  if (status === "success") {
    const filesStored = result?.filesStored ?? 0;
    return (
      <div ref={statusRef} className={styles.status} role="status" tabIndex={-1}>
        <CircleCheck size={28} strokeWidth={1.5} aria-hidden className={styles.successIcon} />
        <h2>{isConsultation ? "Your inquiry was received." : "Your request was received."}</h2>
        <p>
          {isConsultation
            ? "The team will review the business context you shared. Any consulting or custom work requires a separate written scope before it begins."
            : "The team will review the details you shared."}
        </p>
        {result?.referenceId ? <p>Reference: <strong>{result.referenceId}</strong></p> : null}
        {files.length > 0 ? (
          <p>
            {filesStored === files.length
              ? `${filesStored} ${filesStored === 1 ? "attachment was" : "attachments were"} saved.`
              : `Your message was received, but ${files.length - filesStored} ${files.length - filesStored === 1 ? "attachment was" : "attachments were"} not saved. Email the missing files to the team with your reference.`}
          </p>
        ) : null}
        {files.length > filesStored ? (
          <p><a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a></p>
        ) : null}
        <button type="button" onClick={resetForm} className={styles.submit}>
          {isConsultation ? "Send another inquiry" : "Send another request"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} aria-busy={status === "submitting"}>
      <noscript>
        <p className={styles.status}>
          This form needs JavaScript to send your inquiry. You can email the team at{" "}
          <a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a> instead.
        </p>
      </noscript>
      <p className={styles.formIntro}>All fields are required unless marked optional.</p>
      {status === "error" ? (
        <div
          ref={statusRef}
          className={`${styles.status} ${styles.error}`}
          role="alert"
          tabIndex={-1}
        >
          <p>{errorMessage}</p>
          <p><a href={"mailto:" + CONTACT_EMAIL}>Email {CONTACT_EMAIL}</a></p>
        </div>
      ) : null}
      <fieldset disabled={!isHydrated || status === "submitting"}>
        <legend className="sr-only">{isConsultation ? "Your consultation inquiry" : "Your request"}</legend>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label htmlFor="business-name" className={styles.label}>Business name</label>
            <input
              ref={businessRef}
              id="business-name"
              name="businessName"
              type="text"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              className={styles.input}
              autoComplete="organization"
              maxLength={200}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="contact-name" className={styles.label}>Your name</label>
            <input
              id="contact-name"
              name="contactName"
              type="text"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              className={styles.input}
              autoComplete="name"
              maxLength={200}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-info" className={styles.label}>
            {isConsultation ? "Email address" : "Email or phone"}
          </label>
          <input
            id="contact-info"
            name="contactInfo"
            type={isConsultation ? "email" : "text"}
            value={contactInfo}
            onChange={(event) => setContactInfo(event.target.value)}
            className={styles.input}
            autoComplete={isConsultation ? "email" : "off"}
            spellCheck={false}
            maxLength={300}
            required
          />
        </div>

        {!isConsultation ? (
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label htmlFor="request-type" className={styles.label}>Request type</label>
              <select
                id="request-type"
                name="requestType"
                value={requestType}
                onChange={(event) => setRequestType(event.target.value as (typeof REQUEST_TYPES)[number])}
                className={styles.input}
                required
              >
                {REQUEST_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="priority" className={styles.label}>Priority</label>
              <select
                id="priority"
                name="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as (typeof PRIORITIES)[number])}
                className={styles.input}
                required
              >
                {PRIORITIES.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>
        ) : null}

        <div className={styles.field}>
          <label htmlFor="request-message" className={styles.label}>
            {isConsultation ? "What does your business do, and what needs to work better?" : "What needs to change?"}
          </label>
          <textarea
            id="request-message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            className={styles.input}
            aria-describedby={isConsultation ? "message-help" : undefined}
            maxLength={isConsultation ? 2400 : 4000}
            required
          />
          {isConsultation ? (
            <p id="message-help" className={styles.fieldHelp}>Describe the current situation and what gets in the way. Please leave out passwords, payment details, and sensitive customer information.</p>
          ) : null}
        </div>

        {isConsultation ? (
          <div className={styles.field}>
            <label htmlFor="desired-outcome" className={styles.label}>What would a useful result look like?</label>
            <textarea
              id="desired-outcome"
              name="outcome"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
              rows={3}
              className={styles.input}
              aria-describedby="outcome-help"
              maxLength={1000}
              required
            />
            <p id="outcome-help" className={styles.fieldHelp}>Include any timing or constraints that matter to you.</p>
          </div>
        ) : null}

        <div className={styles.field}>
          <label htmlFor="request-files" className={styles.label}>Reference files (optional)</label>
          <input
            ref={filesRef}
            id="request-files"
            name="files"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,application/pdf"
            onChange={onFilesChange}
            className={`${styles.input} ${styles.fileInput}`}
            aria-describedby={fileError ? "files-help files-error" : "files-help"}
            aria-invalid={Boolean(fileError)}
          />
          <p id="files-help" className={styles.fieldHelp}>Up to 10 files, 4 MB total. JPEG, PNG, WebP, GIF, HEIC, HEIF, or PDF.</p>
          {fileError ? <p id="files-error" role="alert" className={styles.fieldHelp}>{fileError}</p> : null}
          {selectedFileNames.length > 0 ? (
            <ul className={styles.fileList}>
              {selectedFileNames.map((filename, index) => <li key={`${index}-${filename}`}>{filename}</li>)}
            </ul>
          ) : null}
          {files.length > 0 || fileError ? (
            <button
              type="button"
              className={styles.clearFiles}
              onClick={() => {
                setFiles([]);
                setFileError("");
                if (filesRef.current) filesRef.current.value = "";
              }}
            >
              Continue without attachments
            </button>
          ) : null}
        </div>

        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
        </div>
        <button type="submit" disabled={!isHydrated || status === "submitting"} className={styles.submit}>
          {status === "submitting" ? (
            <><Loader2 size={16} aria-hidden className="animate-spin motion-reduce:animate-none" />Sending…</>
          ) : (
            <><Send size={16} aria-hidden />{isConsultation ? "Send consultation inquiry" : "Send request"}</>
          )}
        </button>
      </fieldset>
      <p className={styles.submitNote}>
        {isConsultation
          ? "We’ll use the details you provide to review and respond to your inquiry. No payment is taken here."
          : "No payment is taken here. The team will use your details to review and respond to your request."}
      </p>
    </form>
  );
}
