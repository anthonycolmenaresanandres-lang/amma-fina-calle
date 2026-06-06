"use client";

import { useMemo, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

type SubmitResult = {
  referenceId?: string | null;
  filesStored?: number;
  persistenceActive?: boolean;
  emailActive?: boolean;
  uploadStorageActive?: boolean;
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

const fieldClass =
  "w-full rounded-xl border border-[#cfd6da]/18 bg-[#11161a] px-3 py-2.5 text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none transition focus:border-[#d8b36d]/70 focus:ring-2 focus:ring-[#d8b36d]/18";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#aeb7bd]";

export default function CustomerRequestForm() {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [requestType, setRequestType] =
    useState<(typeof REQUEST_TYPES)[number]>("Business info update");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("Normal");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const selectedFileNames = useMemo(() => files.map((file) => file.name), [files]);
  const isValid = businessName.trim() && contactName.trim() && contactInfo.trim() && message.trim();

  const resetForm = () => {
    setBusinessName("");
    setContactName("");
    setContactInfo("");
    setRequestType("Business info update");
    setPriority("Normal");
    setMessage("");
    setFiles([]);
    setCompany("");
    setErrorMessage("");
    setResult(null);
    setStatus("idle");
  };

  const onFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const limitedSelection = selected.slice(0, MAX_FILES);
    const totalSize = limitedSelection.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > MAX_TOTAL_FILE_SIZE_BYTES) {
      setFiles([]);
      setErrorMessage("Total file size exceeds 4MB. Please select fewer files or smaller images.");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setFiles(limitedSelection);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("businessName", businessName);
    formData.append("contactName", contactName);
    formData.append("contactInfo", contactInfo);
    formData.append("requestType", requestType);
    formData.append("priority", priority);
    formData.append("message", message);
    formData.append("sourcePage", window.location.href);
    formData.append("company", company);

    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const response = await fetch("/api/customer-requests", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | ({ ok?: boolean; detail?: string } & SubmitResult)
        | null;

      if (response.ok && payload?.ok) {
        setResult(payload);
        setStatus("success");
        return;
      }

      setErrorMessage(payload?.detail || "The request could not be submitted. Please try again.");
      setStatus("error");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    const tracked = result?.persistenceActive;
    const filesStored = result?.filesStored ?? 0;
    const emailed = result?.emailActive;

    return (
      <section className="rounded-2xl border border-[#cfd6da]/18 bg-[#0f1418] px-5 py-7 text-center text-[#f4f6f7] shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b36d]">
          Intake received
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          {tracked ? "We've got your request." : "Fina Calle OS has the request."}
        </h2>

        {result?.referenceId ? (
          <p className="mx-auto mt-3 text-sm text-[#c8d0d4]">
            Reference{" "}
            <span className="font-mono font-semibold text-[#f4d99c]">
              {result.referenceId}
            </span>
          </p>
        ) : null}

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c8d0d4]">
          {tracked
            ? "We'll review what your business needs and reply with a clear direction, the right package, and a fixed quote."
            : "Your request was validated and confirmed. Once the backend is connected it will be tracked end to end."}
        </p>

        {tracked ? (
          <ul className="mx-auto mt-5 inline-flex flex-col gap-2 text-left text-xs text-[#aeb7bd]">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d8b36d]" /> Request saved to the inbox
            </li>
            {filesStored > 0 ? (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d8b36d]" /> {filesStored}{" "}
                {filesStored === 1 ? "file" : "files"} stored
              </li>
            ) : null}
            {emailed ? (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d8b36d]" /> Team notified
              </li>
            ) : null}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={resetForm}
          className="mx-auto mt-6 block rounded-full border border-[#cfd6da]/28 px-5 py-2 text-sm font-semibold text-[#eef2f4] transition hover:border-[#d8b36d]/70 hover:bg-[#d8b36d]/10"
        >
          Submit another request
        </button>
      </section>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[#cfd6da]/16 bg-[#0b0f12] p-5 text-[#f4f6f7] shadow-sm sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="business-name" className={labelClass}>
            Business name
          </label>
          <input
            id="business-name"
            type="text"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            className={fieldClass}
            placeholder="Cafe, restaurant, shop, or brand"
            required
          />
        </div>

        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Contact name
          </label>
          <input
            id="contact-name"
            type="text"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            className={fieldClass}
            placeholder="Owner or manager"
            autoComplete="name"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-info" className={labelClass}>
          Email or phone
        </label>
        <input
          id="contact-info"
          type="text"
          value={contactInfo}
          onChange={(event) => setContactInfo(event.target.value)}
          className={fieldClass}
          placeholder="you@email.com / (555) 000-0000"
          autoComplete="off"
          required
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="request-type" className={labelClass}>
            Request type
          </label>
          <select
            id="request-type"
            value={requestType}
            onChange={(event) => setRequestType(event.target.value as (typeof REQUEST_TYPES)[number])}
            className={fieldClass}
            required
          >
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className={labelClass}>
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as (typeof PRIORITIES)[number])}
            className={fieldClass}
            required
          >
            {PRIORITIES.map((priorityOption) => (
              <option key={priorityOption} value={priorityOption}>
                {priorityOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="request-message" className={labelClass}>
          What needs to change?
        </label>
        <textarea
          id="request-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          className={fieldClass}
          placeholder="Describe the QR menu, branded web system, mini-game, customer journey, content update, or support request."
          required
        />
      </div>

      <div className="mt-4">
        <label htmlFor="request-files" className={labelClass}>
          Files or images
        </label>
        <input
          id="request-files"
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={onFilesChange}
          className="block w-full rounded-xl border border-[#cfd6da]/18 bg-[#11161a] px-3 py-2.5 text-sm text-[#f4f6f7] file:mr-3 file:rounded-full file:border-0 file:bg-[#d8b36d] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#080a0c]"
        />
        <p className="mt-1.5 text-xs leading-5 text-[#8f9aa1]">
          Optional. Up to 10 files, 4MB total. Images and PDF — menus, logos, photos, or references.
        </p>
        {selectedFileNames.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-[#c8d0d4]">
            {selectedFileNames.map((filename) => (
              <li key={filename} className="rounded-lg bg-[#151b20] px-2 py-1">
                {filename}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting" || !isValid}
        className="mt-6 w-full rounded-full bg-[#eef2f4] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#07090b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        {status === "submitting" ? "Submitting request..." : "Submit request"}
      </button>

      {status === "error" ? (
        <p className="mt-3 rounded-xl border border-[#ff7a66]/30 bg-[#8f3e2e]/16 px-3 py-2 text-center text-sm font-semibold text-[#ffad9f]">
          {errorMessage || "The request could not be submitted."}
        </p>
      ) : null}

      <div className="mt-4 rounded-xl border border-[#cfd6da]/14 bg-[#151b20]/72 px-3 py-3 text-xs leading-5 text-[#aeb7bd]">
        For customer change requests, business updates, menu/content updates, and operational
        support. No payment is taken here and no account is created — billing always stays separate
        from your POS.
      </div>
    </form>
  );
}
