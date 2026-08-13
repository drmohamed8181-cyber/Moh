const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Signatures are checked against actual bytes, not the client-supplied MIME
// type, so a renamed/relabeled file can't slip past the extension check.
function detectImageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return "image/webp";
  return null;
}

export interface ValidatedImage {
  bytes: Uint8Array;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Validates a `data:<mime>;base64,<data>` URI: well-formed, declared MIME
 * matches an allowlist, size is within limits, and the actual file bytes
 * match a real image signature (not just a renamed/spoofed extension).
 */
export function validateImageDataUri(dataUri: unknown): { ok: true; image: ValidatedImage } | { ok: false; error: string } {
  if (typeof dataUri !== "string" || !dataUri.startsWith("data:")) {
    return { ok: false, error: "Invalid image data." };
  }

  const match = dataUri.match(/^data:([\w/+.-]+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Invalid image data format." };

  const [, declaredMime, base64] = match;
  if (!ALLOWED_MIME_TYPES.includes(declaredMime as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { ok: false, error: "Unsupported file type. Please upload a JPG, PNG, or WEBP image." };
  }

  let bytes: Buffer;
  try {
    bytes = Buffer.from(base64, "base64");
  } catch {
    return { ok: false, error: "Could not read image data." };
  }

  if (bytes.length === 0) return { ok: false, error: "The uploaded file is empty." };
  if (bytes.length > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: "Image exceeds the 10 MB maximum file size." };
  }

  const detected = detectImageType(bytes);
  if (!detected) {
    return { ok: false, error: "The file does not appear to be a valid image." };
  }
  // image/jpg and image/jpeg both detect as image/jpeg — treat as equivalent.
  const normalizedDeclared = declaredMime === "image/jpg" ? "image/jpeg" : declaredMime;
  if (detected !== normalizedDeclared) {
    return { ok: false, error: "The file content does not match its declared type." };
  }

  return { ok: true, image: { bytes, mimeType: detected, sizeBytes: bytes.length } };
}

export { MAX_FILE_SIZE_BYTES };
