import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const ALLOWED_REQUEST_TYPES = new Set([
  "Menu update",
  "Price change",
  "New item",
  "Remove item",
  "Photo/design upload",
  "Website idea",
  "Game idea",
  "Question for Anthony",
]);

const ALLOWED_PRIORITIES = new Set(["Low", "Normal", "Urgent"]);

const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const MAX_TEXT_LEN = 4000;
const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

function cleanText(value: FormDataEntryValue | null, maxLen = MAX_TEXT_LEN) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function sanitizeFilename(filename: string) {
  return (
    filename
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "upload"
  );
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function envDiagnostics() {
  return {
    hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
    hasOwnerNotificationEmail: Boolean(process.env.OWNER_NOTIFICATION_EMAIL),
    hasFromEmail: Boolean(process.env.FROM_EMAIL),
  };
}

function missingEnvVars() {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!process.env.OWNER_NOTIFICATION_EMAIL) missing.push("OWNER_NOTIFICATION_EMAIL");
  if (!process.env.FROM_EMAIL) missing.push("FROM_EMAIL");
  return missing;
}

function validateFile(file: File) {
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return `Unsupported file type for "${file.name}". Allowed: images and PDF.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File "${file.name}" exceeds the 8MB limit.`;
  }
  return null;
}

function getResendErrorDiagnostics(error: unknown) {
  if (!error || typeof error !== "object") {
    return {
      name: "unknown",
      message: "unknown_email_error",
      status: null,
      statusCode: null,
      ...envDiagnostics(),
    };
  }

  const record = error as Record<string, unknown>;
  return {
    name: typeof record.name === "string" ? record.name : "unknown",
    message: typeof record.message === "string" ? record.message : "unknown_email_error",
    status: typeof record.status === "number" || typeof record.status === "string" ? record.status : null,
    statusCode:
      typeof record.statusCode === "number" || typeof record.statusCode === "string"
        ? record.statusCode
        : null,
    hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
    hasOwnerNotificationEmail: Boolean(process.env.OWNER_NOTIFICATION_EMAIL),
    hasFromEmail: Boolean(process.env.FROM_EMAIL),
  };
}

async function uploadFiles(files: File[]) {
  const timestamp = Date.now();
  const uploads = files.map((file, index) => {
    const safeName = sanitizeFilename(file.name || `file-${index + 1}`);
    const pathname = `owner-requests/${timestamp}-${index + 1}-${safeName}`;
    return put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  });

  const settled = await Promise.allSettled(uploads);
  const uploadedUrls = settled
    .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof put>>> => result.status === "fulfilled")
    .map((result) => result.value.url);

  const failedCount = settled.length - uploadedUrls.length;
  if (failedCount > 0) {
    console.error("[owner-requests] Blob upload partial failure", { failedCount });
  }

  return { uploadedUrls, failedCount };
}

export async function POST(request: Request) {
  const missing = missingEnvVars();
  if (missing.length > 0) {
    console.warn("[owner-requests] Missing environment variables", {
      missing,
      ...envDiagnostics(),
    });
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_form_data" }, { status: 400 });
  }

  const honeypot = cleanText(formData.get("company"));
  if (honeypot) {
    return NextResponse.json({ ok: true, uploadedFileUrls: [] });
  }

  const name = cleanText(formData.get("name"), 200);
  const contactInfo = cleanText(formData.get("contactInfo"), 300);
  const requestType = cleanText(formData.get("requestType"), 80);
  const priority = cleanText(formData.get("priority"), 20);
  const message = cleanText(formData.get("message"));
  const sourcePage = cleanText(formData.get("sourcePage"), 700) || "request-update";
  const submittedAt = new Date().toISOString();

  if (!name) {
    return NextResponse.json({ ok: false, reason: "missing_name" }, { status: 400 });
  }
  if (!contactInfo) {
    return NextResponse.json({ ok: false, reason: "missing_contact" }, { status: 400 });
  }
  if (!ALLOWED_REQUEST_TYPES.has(requestType)) {
    return NextResponse.json({ ok: false, reason: "invalid_request_type" }, { status: 400 });
  }
  if (!ALLOWED_PRIORITIES.has(priority)) {
    return NextResponse.json({ ok: false, reason: "invalid_priority" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ ok: false, reason: "missing_message" }, { status: 400 });
  }

  const files = formData
    .getAll("files")
    .filter(
      (value): value is File =>
        typeof value === "object" &&
        value !== null &&
        "size" in value &&
        (value as File).size > 0 &&
        "name" in value,
    );

  if (files.length > MAX_FILES) {
    return NextResponse.json({ ok: false, reason: "too_many_files" }, { status: 400 });
  }

  for (const file of files) {
    const validationError = validateFile(file);
    if (validationError) {
      return NextResponse.json(
        { ok: false, reason: "invalid_file", detail: validationError },
        { status: 400 },
      );
    }
  }

  let uploadedFileUrls: string[] = [];
  let uploadNote: string | null = null;

  if (files.length > 0 && !process.env.BLOB_READ_WRITE_TOKEN) {
    uploadNote = "File upload was skipped because Blob storage is not configured.";
  } else if (files.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
    const uploadResult = await uploadFiles(files);
    uploadedFileUrls = uploadResult.uploadedUrls;
    if (uploadResult.failedCount > 0) {
      uploadNote =
        "Files were attached, but upload failed. Please ask the owner to resend files by email.";
    }
  }

  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL!;
  const fromEmail = process.env.FROM_EMAIL!;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = `Colattao Owner Request: ${requestType}`;

  const linksBlock =
    uploadedFileUrls.length > 0
      ? uploadedFileUrls.map((url) => `- ${url}`).join("\n")
      : "- No files attached";

  const textBody = [
    "New Colattao owner request",
    "",
    `Name: ${name}`,
    `Email or phone: ${contactInfo}`,
    `Request type: ${requestType}`,
    `Priority: ${priority}`,
    `Message: ${message}`,
    "",
    "Uploaded file links:",
    linksBlock,
    ...(uploadNote ? ["", `Upload note: ${uploadNote}`] : []),
    "",
    `Source page URL: ${sourcePage}`,
    `Timestamp: ${submittedAt}`,
  ].join("\n");

  const htmlLinks =
    uploadedFileUrls.length > 0
      ? `<ul>${uploadedFileUrls
          .map((url) => `<li><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>`)
          .join("")}</ul>`
      : "<p>No files attached.</p>";

  const htmlBody = `
    <h2>New Colattao owner request</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email or phone:</strong> ${escapeHtml(contactInfo)}</p>
    <p><strong>Request type:</strong> ${escapeHtml(requestType)}</p>
    <p><strong>Priority:</strong> ${escapeHtml(priority)}</p>
    <p><strong>Message:</strong><br/>${escapeHtml(message).replaceAll("\n", "<br/>")}</p>
    <h3>Uploaded file links</h3>
    ${htmlLinks}
    ${uploadNote ? `<p><strong>Upload note:</strong> ${escapeHtml(uploadNote)}</p>` : ""}
    <p><strong>Source page URL:</strong> ${escapeHtml(sourcePage)}</p>
    <p><strong>Timestamp:</strong> ${escapeHtml(submittedAt)}</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    if (error) {
      console.error("[owner-requests] Email notification failed", getResendErrorDiagnostics(error));
      return NextResponse.json({ ok: false, reason: "email_failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("[owner-requests] Email notification failed", getResendErrorDiagnostics(error));
    return NextResponse.json({ ok: false, reason: "email_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, uploadedFileUrls });
}
