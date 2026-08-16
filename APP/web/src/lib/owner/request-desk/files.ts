export const OWNER_REQUEST_MAX_TEXT_LENGTH = 4_000;
export const OWNER_REQUEST_MAX_FILES = 5;
export const OWNER_REQUEST_MAX_FILE_BYTES = 4_000_000;

const EXTENSIONS_BY_TYPE: Record<string, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "application/pdf": ["pdf"],
};

export const OWNER_REQUEST_ALLOWED_FILE_TYPES = new Set(Object.keys(EXTENSIONS_BY_TYPE));

export const OWNER_REQUEST_FILE_ACCEPT = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
].join(",");

export type OwnerRequestFileLike = {
  name: string;
  size: number;
  type: string;
};

export function validateOwnerRequestFile(file: OwnerRequestFileLike): string | null {
  const allowedExtensions = EXTENSIONS_BY_TYPE[file.type];
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    return `“${file.name}” is not supported. Add a JPG, PNG, WebP, or PDF.`;
  }
  if (file.size <= 0) {
    return `“${file.name}” is empty.`;
  }
  if (file.size > OWNER_REQUEST_MAX_FILE_BYTES) {
    return `“${file.name}” is larger than 4 MB.`;
  }
  return null;
}

export function ownerRequestFileExtension(file: OwnerRequestFileLike): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSIONS_BY_TYPE[file.type]?.includes(extension) ? extension : null;
}

export function hasOwnerRequestFileSignature(
  type: string,
  bytes: Uint8Array,
): boolean {
  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return png.every((byte, index) => bytes[index] === byte);
  }
  if (type === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  if (type === "application/pdf") {
    return bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  }
  return false;
}

export function validateOwnerRequestFiles(
  files: readonly OwnerRequestFileLike[],
): string | null {
  if (files.length > OWNER_REQUEST_MAX_FILES) {
    return `Add up to ${OWNER_REQUEST_MAX_FILES} files.`;
  }
  for (const file of files) {
    const error = validateOwnerRequestFile(file);
    if (error) return error;
  }
  return null;
}

export function isOwnerRequestReference(value: string): boolean {
  return /^AMMA-[A-Z0-9-]{6,48}$/.test(value);
}

export function isOwnerRequestFileSlot(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < OWNER_REQUEST_MAX_FILES;
}

export function isOwnerRequestId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function ownerRequestAttachmentPath(
  referenceId: string,
  requestId: string,
  slot: number,
): string {
  if (
    !isOwnerRequestReference(referenceId) ||
    !isOwnerRequestId(requestId) ||
    !isOwnerRequestFileSlot(slot)
  ) {
    throw new Error("Invalid owner request attachment target.");
  }
  return `${referenceId}/${requestId}/owner-${slot}`;
}
