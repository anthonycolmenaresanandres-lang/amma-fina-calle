"use client";

import { useMemo, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

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
  "w-full rounded-md border border-[#8d6a25]/35 bg-[#fffaf0] px-3 py-2 text-sm text-[#24170f] placeholder:text-[#6f5a42]/50 outline-none focus:border-[#335b70] focus:ring-2 focus:ring-[#335b70]/20";

const labelClass = "mb-1 block text-xs font-semibold uppercase text-[#335b70]";

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
        | { ok?: boolean; detail?: string; referenceId?: string }
        | null;

      if (response.ok && payload?.ok) {
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
    return (
      <section className="rounded-md border border-[#d9b66d]/35 bg-[#fff7e8] px-5 py-7 text-center text-[#24170f] shadow-sm">
        <p className="text-xs font-semibold uppercase text-[#335b70]">Request received</p>
        <h2 className="mt-2 text-2xl font-semibold">AMMA has the request draft.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#4c382a]">
          This first version validates the request and confirms the intake path. Email, file
          storage, and request tracking are intentionally not active yet.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-5 rounded-md border border-[#335b70] px-4 py-2 text-sm font-semibold text-[#335b70] transition hover:bg-[#335b70] hover:text-white"
        >
          Submit another request
        </button>
      </section>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-[#d9b66d]/35 bg-[#fff7e8] p-5 text-[#24170f] shadow-sm sm:p-6"
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
          placeholder="Describe menu/content updates, contact changes, business info, support needs, or module ideas."
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
          className="block w-full rounded-md border border-[#8d6a25]/35 bg-[#fffaf0] px-3 py-2 text-sm text-[#24170f] file:mr-3 file:rounded-md file:border-0 file:bg-[#d9b66d] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#24170f]"
        />
        <p className="mt-1 text-xs text-[#6f5a42]">
          Optional for now. Up to 10 files, 4MB total. This Phase 1 endpoint validates files but does
          not store or email them yet.
        </p>
        {selectedFileNames.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-[#4c382a]">
            {selectedFileNames.map((filename) => (
              <li key={filename} className="rounded-md bg-[#f4e6cb] px-2 py-1">
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
        className="mt-6 w-full rounded-md bg-[#335b70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#274657] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {status === "submitting" ? "Submitting request..." : "Submit request"}
      </button>

      {status === "error" ? (
        <p className="mt-3 rounded-md border border-[#8f3e2e]/30 bg-[#8f3e2e]/10 px-3 py-2 text-center text-sm font-semibold text-[#8f3e2e]">
          {errorMessage || "The request could not be submitted."}
        </p>
      ) : null}

      <div className="mt-4 rounded-md border border-[#d9b66d]/35 bg-[#f4e6cb]/65 px-3 py-3 text-xs leading-5 text-[#4c382a]">
        This is the first AMMA/Fina Calle request foundation. It is for customer change requests,
        business updates, menu/content updates, and operational support. It does not process
        payments, create accounts, store uploads, or send email yet.
      </div>
    </form>
  );
}
