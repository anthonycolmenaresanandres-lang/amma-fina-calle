import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_REQUEST_TYPES = new Set([
  "Business info update",
  "Menu/content update",
  "Contact info update",
  "Image/file upload",
  "Website change",
  "Game/module idea",
  "Operational support",
  "Question for AMMA",
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
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

function cleanText(value: FormDataEntryValue | null, maxLen = MAX_TEXT_LEN) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function validateFile(file: File) {
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return `Unsupported file type for "${file.name}". Allowed: images and PDF.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File "${file.name}" exceeds the 4MB limit.`;
  }

  return null;
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_form_data", detail: "The request body was not valid form data." },
      { status: 400 },
    );
  }

  const honeypot = cleanText(formData.get("company"));
  if (honeypot) {
    return NextResponse.json({ ok: true, referenceId: null, filesReceived: 0 });
  }

  const businessName = cleanText(formData.get("businessName"), 200);
  const contactName = cleanText(formData.get("contactName"), 200);
  const contactInfo = cleanText(formData.get("contactInfo"), 300);
  const requestType = cleanText(formData.get("requestType"), 80);
  const priority = cleanText(formData.get("priority"), 20);
  const message = cleanText(formData.get("message"));
  const sourcePage = cleanText(formData.get("sourcePage"), 700) || "request-update";

  if (!businessName) {
    return NextResponse.json(
      { ok: false, reason: "missing_business_name", detail: "Business name is required." },
      { status: 400 },
    );
  }

  if (!contactName) {
    return NextResponse.json(
      { ok: false, reason: "missing_contact_name", detail: "Contact name is required." },
      { status: 400 },
    );
  }

  if (!contactInfo) {
    return NextResponse.json(
      { ok: false, reason: "missing_contact", detail: "Email or phone is required." },
      { status: 400 },
    );
  }

  if (!ALLOWED_REQUEST_TYPES.has(requestType)) {
    return NextResponse.json(
      { ok: false, reason: "invalid_request_type", detail: "Request type is not supported." },
      { status: 400 },
    );
  }

  if (!ALLOWED_PRIORITIES.has(priority)) {
    return NextResponse.json(
      { ok: false, reason: "invalid_priority", detail: "Priority is not supported." },
      { status: 400 },
    );
  }

  if (!message) {
    return NextResponse.json(
      { ok: false, reason: "missing_message", detail: "Request details are required." },
      { status: 400 },
    );
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
    return NextResponse.json(
      { ok: false, reason: "too_many_files", detail: "Upload selection is limited to 10 files." },
      { status: 400 },
    );
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

  // Phase 1 intentionally validates the request only. Email, storage, and persistence attach later.
  const referenceId = `AMMA-${Date.now().toString(36).toUpperCase()}`;
  console.info("[customer-requests] Validated Phase 1 request", {
    referenceId,
    businessName,
    requestType,
    priority,
    filesReceived: files.length,
    sourcePage,
  });

  return NextResponse.json({
    ok: true,
    referenceId,
    filesReceived: files.length,
    emailActive: false,
    uploadStorageActive: false,
    persistenceActive: false,
  });
}
