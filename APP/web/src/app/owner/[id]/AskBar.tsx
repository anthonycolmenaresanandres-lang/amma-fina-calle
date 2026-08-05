"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Chip, Panel, buttonClass, cn } from "@/components/ui";
import {
  confirmOwnerRequest,
  sendOwnerReview,
  triageOwnerRequest,
} from "@/lib/owner/request-desk/actions";
import {
  OWNER_REQUEST_FILE_ACCEPT,
  OWNER_REQUEST_MAX_FILES,
  OWNER_REQUEST_MAX_TEXT_LENGTH,
  validateOwnerRequestFiles,
} from "@/lib/owner/request-desk/files";
import styles from "./owner-portal.module.css";

type Item = { name: string; price: number | string; is_available: boolean };

type Result =
  | { kind: "apply"; title: string; detail: string }
  | { kind: "review"; reason: string }
  | { kind: "error"; message: string }
  | null;

type UploadTarget = { file: File; slot: number };
type RetryUpload = {
  referenceId: string;
  files: UploadTarget[];
  uploaded: number;
  total: number;
};
type Done = { tone: "success" | "warning"; message: string } | null;

function money(value: number | string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? `$${parsed.toFixed(2)}` : "Ask";
}

function fileSize(bytes: number) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1_000))} KB`;
}

// Demo-only deterministic matcher. The server repeats every live decision.
function parse(text: string, items: Item[]): Result {
  const normalized = ` ${text.toLowerCase().trim()} `;
  if (!normalized.trim()) return null;
  const found = items.find((item) => normalized.includes(item.name.toLowerCase()));
  if (found && /\b(86|sold out|out of|hide|unavailable|we.?re out|ran out)\b/.test(normalized)) {
    return {
      kind: "apply",
      title: `86 “${found.name}”`,
      detail: "It disappears from your live menu until you bring it back.",
    };
  }
  if (found && /\b(bring back|back on|available again|show|un.?86)\b/.test(normalized)) {
    return {
      kind: "apply",
      title: `Bring back “${found.name}”`,
      detail: "It returns to your live menu right away.",
    };
  }
  const priceMatch = normalized.match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (found && priceMatch && /(\$|\bto\b|\bprice\b|\bnow\b|\bmake\b|dollar)/.test(normalized)) {
    return {
      kind: "apply",
      title: `Change “${found.name}” price`,
      detail: `${money(found.price)} → $${Number(priceMatch[1]).toFixed(2)} — live on your menu.`,
    };
  }
  return {
    kind: "review",
    reason: "The Fina Calle team will review the complete brief before anything changes.",
  };
}

const DEFAULT_CHIPS = ["86 the Flan Latte", "change Mocha to $8", "bring back Cortado"];

export default function AskBar({
  items,
  demo = false,
  restaurantId,
  suggestedPrompts,
}: {
  items: Item[];
  demo?: boolean;
  restaurantId?: string;
  suggestedPrompts?: string[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState("");
  const [submittedFiles, setSubmittedFiles] = useState<File[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [done, setDone] = useState<Done>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [retryUpload, setRetryUpload] = useState<RetryUpload | null>(null);
  const [pending, startTransition] = useTransition();

  const interactive = demo || Boolean(restaurantId);
  const chips = suggestedPrompts?.length ? suggestedPrompts : DEFAULT_CHIPS;

  useEffect(() => {
    if (!text.trim() && files.length === 0 && !retryUpload) return;
    const protectDraft = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", protectDraft);
    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [files.length, retryUpload, text]);

  function clearDraft() {
    setText("");
    setFiles([]);
    setSubmitted("");
    setSubmittedFiles([]);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function reset() {
    clearDraft();
    setResult(null);
    setDone(null);
    setRetryUpload(null);
    setUploadProgress(null);
  }

  function invalidatePreview() {
    setResult(null);
    setDone(null);
    setRetryUpload(null);
    setUploadProgress(null);
  }

  function chooseFiles(nextFiles: File[]) {
    const next = [...files, ...nextFiles];
    const error = validateOwnerRequestFiles(next);
    if (error) {
      setFileError(error);
      invalidatePreview();
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFiles(next);
    setFileError(null);
    invalidatePreview();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setFileError(null);
    invalidatePreview();
  }

  function analyze(value: string) {
    if (!value.trim() || fileError) return;
    const fileSnapshot = [...files];
    setDone(null);
    setRetryUpload(null);
    setSubmitted(value);
    setSubmittedFiles(fileSnapshot);

    if (demo) {
      setResult(
        fileSnapshot.length > 0
          ? {
              kind: "review",
              reason: "Files attached. The team will review the complete request before anything changes.",
            }
          : parse(value, items),
      );
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("text", value);
      formData.set("fileCount", String(fileSnapshot.length));
      const state = await triageOwnerRequest(restaurantId ?? "", { phase: "idle" }, formData);
      if (state.phase === "apply") {
        setResult({
          kind: "apply",
          title: `${state.proposal.entityLabel} · ${state.proposal.fieldLabel}`,
          detail: `${state.proposal.currentDisplay} → ${state.proposal.newDisplay} — live on your menu.`,
        });
      } else if (state.phase === "review") {
        setResult({ kind: "review", reason: state.reason });
      } else if (state.phase === "error") {
        setResult({ kind: "error", message: state.message });
      } else {
        setResult(null);
      }
    });
  }

  async function uploadFiles(
    referenceId: string,
    targets: UploadTarget[],
    total: number,
    uploadedBefore = 0,
  ) {
    let uploaded = uploadedBefore;
    const failed: UploadTarget[] = [];

    for (const [index, target] of targets.entries()) {
      setUploadProgress(`Uploading ${Math.min(total, uploadedBefore + index + 1)} of ${total}…`);
      const formData = new FormData();
      formData.set("slot", String(target.slot));
      formData.set("file", target.file);
      try {
        const response = await fetch(
          `/api/owner/${encodeURIComponent(restaurantId ?? "")}/requests/${encodeURIComponent(referenceId)}/attachments`,
          { method: "POST", body: formData },
        );
        if (response.ok) uploaded += 1;
        else failed.push(target);
      } catch {
        failed.push(target);
      }
    }

    setUploadProgress(null);
    setResult(null);
    clearDraft();
    if (failed.length > 0) {
      setRetryUpload({ referenceId, files: failed, uploaded, total });
      setDone({
        tone: "warning",
        message: `Request ${referenceId} is saved. ${uploaded}/${total} files attached. Retry the missing ${failed.length === 1 ? "file" : "files"}.`,
      });
      return;
    }

    setRetryUpload(null);
    setDone({
      tone: "success",
      message: `Request ${referenceId} sent with ${total} ${total === 1 ? "file" : "files"}.`,
    });
  }

  function confirm() {
    const kind = result?.kind;
    if (kind !== "apply" && kind !== "review") return;

    if (demo) {
      setDone({
        tone: "success",
        message:
          kind === "apply"
            ? "Demo complete — the menu change is ready."
            : `Demo request ready${submittedFiles.length ? ` with ${submittedFiles.length} files` : ""}.`,
      });
      setResult(null);
      clearDraft();
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("text", submitted);
      formData.set("fileCount", String(submittedFiles.length));

      if (kind === "apply" && submittedFiles.length === 0) {
        const state = await confirmOwnerRequest(restaurantId ?? "", { phase: "idle" }, formData);
        if (state.phase === "applied") {
          setDone({ tone: "success", message: `${state.message} Customers see it now.` });
          setResult(null);
          clearDraft();
          router.refresh();
        } else if (state.phase === "error") {
          setResult({ kind: "error", message: state.message });
        }
        return;
      }

      const state = await sendOwnerReview(restaurantId ?? "", { phase: "idle" }, formData);
      if (state.phase === "error") {
        setResult({ kind: "error", message: state.message });
        return;
      }
      if (state.phase !== "sent") return;

      const targets = submittedFiles.map((file, slot) => ({ file, slot }));
      if (targets.length === 0) {
        setDone({ tone: "success", message: `Request ${state.referenceId} sent to the team.` });
        setResult(null);
        clearDraft();
        return;
      }
      await uploadFiles(state.referenceId, targets, targets.length);
    });
  }

  function retryFiles() {
    if (!retryUpload) return;
    startTransition(async () => {
      await uploadFiles(
        retryUpload.referenceId,
        retryUpload.files,
        retryUpload.total,
        retryUpload.uploaded,
      );
    });
  }

  return (
    <Panel className={styles.requestSurface}>
      <p className={styles.requestKicker}>
        <span className={styles.frameNumber}>01</span>
        <Sparkles size={13} strokeWidth={2} aria-hidden />
        Request desk
      </p>
      <h2 className={styles.requestTitle}>Send the full brief.</h2>
      <p className={styles.requestIntro}>
        Tell us what you need, where it goes, exact details, and the deadline.
      </p>
      <p className={styles.requestChecklist}>What · Where · Details · Deadline</p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (interactive) analyze(text);
        }}
        className={styles.requestForm}
      >
        <div className={styles.briefField}>
          <div className={styles.briefLabelRow}>
            <label htmlFor="owner-request-brief">Complete brief</label>
            <span>{text.length}/{OWNER_REQUEST_MAX_TEXT_LENGTH}</span>
          </div>
          <textarea
            id="owner-request-brief"
            name="text"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              invalidatePreview();
            }}
            disabled={!interactive || pending}
            autoComplete="off"
            maxLength={OWNER_REQUEST_MAX_TEXT_LENGTH}
            placeholder="Example: Replace the dinner menu cover with the attached logo by Friday. Use the exact headline…"
            className={styles.briefTextarea}
          />
        </div>

        <div className={styles.fileDock}>
          <div className={styles.fileDockHeader}>
            <span>
              <Paperclip size={14} strokeWidth={2} aria-hidden />
              Supporting files
            </span>
            <strong>{files.length}/{OWNER_REQUEST_MAX_FILES}</strong>
          </div>
          <p>JPG, PNG, WebP, or PDF · 4 MB each</p>
          <label
            className={cn(
              styles.filePicker,
              (!interactive || pending || files.length >= OWNER_REQUEST_MAX_FILES) &&
                styles.filePickerDisabled,
            )}
          >
            <Upload size={14} strokeWidth={2} aria-hidden />
            Add files
            <input
              ref={fileInputRef}
              type="file"
              name="files"
              multiple
              accept={OWNER_REQUEST_FILE_ACCEPT}
              disabled={!interactive || pending || files.length >= OWNER_REQUEST_MAX_FILES}
              onChange={(event) => chooseFiles(Array.from(event.currentTarget.files ?? []))}
              aria-describedby="owner-request-file-help owner-request-file-error"
            />
          </label>
          <span id="owner-request-file-help" className="sr-only">
            Add up to five JPG, PNG, WebP, or PDF files. Each file can be up to 4 MB.
          </span>

          {files.length > 0 ? (
            <ul className={styles.fileList} aria-label="Selected files">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>
                  <FileText size={15} strokeWidth={1.8} aria-hidden />
                  <span className={styles.fileName} title={file.name}>{file.name}</span>
                  <span className={styles.fileSize}>{fileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={pending}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={15} strokeWidth={2} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <p id="owner-request-file-error" role="alert" className={styles.fileError}>
            {fileError}
          </p>
        </div>

        <button
          type="submit"
          disabled={!interactive || !text.trim() || Boolean(fileError) || pending}
          className={cn(styles.requestSubmit, "transition disabled:cursor-not-allowed disabled:opacity-50")}
        >
          {pending && !result ? (
            <Loader2 size={15} strokeWidth={2.25} aria-hidden className="animate-spin" />
          ) : (
            <Send size={15} strokeWidth={2} aria-hidden />
          )}
          Review request
        </button>
      </form>

      {!result && !done ? (
        <div className={styles.promptList} aria-label="Quick request examples">
          {chips.map((chip) =>
            interactive ? (
              <button
                key={chip}
                type="button"
                disabled={pending}
                onClick={() => {
                  setText(chip);
                  analyze(chip);
                }}
                className={cn(styles.promptButton, "px-3 py-1.5 transition disabled:opacity-50")}
              >
                {chip}
              </button>
            ) : (
              <Chip key={chip} className={styles.promptButton}>{chip}</Chip>
            ),
          )}
        </div>
      ) : null}

      {result?.kind === "apply" ? (
        <div aria-live="polite" className={cn(styles.responseCard, styles.responseApply)}>
          <p className={styles.responseTitle}>{result.title}</p>
          <p>{result.detail}</p>
          <div className={styles.responseActions}>
            <button type="button" onClick={confirm} disabled={pending} className={buttonClass("primary")}>
              {pending ? "Applying…" : "Confirm change"}
            </button>
            <button type="button" onClick={reset} disabled={pending} className={buttonClass("ghost")}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {result?.kind === "review" ? (
        <div aria-live="polite" className={cn(styles.responseCard, styles.responseReview)}>
          <p>{result.reason}</p>
          <div className={styles.responseActions}>
            <button type="button" onClick={confirm} disabled={pending} className={buttonClass("primary")}>
              {pending ? "Sending…" : "Send request"}
            </button>
            <button type="button" onClick={reset} disabled={pending} className={buttonClass("ghost")}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {result?.kind === "error" ? (
        <div role="alert" className={cn(styles.responseCard, styles.responseError)}>
          <p>{result.message}</p>
          <button type="button" onClick={() => setResult(null)} className={buttonClass("ghost")}>
            Edit request
          </button>
        </div>
      ) : null}

      {uploadProgress ? (
        <p role="status" className={styles.uploadStatus}>
          <Loader2 size={14} strokeWidth={2} aria-hidden className="animate-spin" />
          {uploadProgress}
        </p>
      ) : null}

      {done ? (
        <div
          aria-live="polite"
          className={cn(
            styles.responseCard,
            done.tone === "warning" ? styles.responseWarning : styles.responseSuccess,
          )}
        >
          <p>{done.message}</p>
          <div className={styles.responseActions}>
            {retryUpload ? (
              <button type="button" onClick={retryFiles} disabled={pending} className={buttonClass("primary")}>
                {pending ? "Retrying…" : "Retry files"}
              </button>
            ) : null}
            <button type="button" onClick={reset} disabled={pending} className={buttonClass("ghost")}>
              Done
            </button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
