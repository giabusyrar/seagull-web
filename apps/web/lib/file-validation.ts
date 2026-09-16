import { fileTypeFromBuffer } from 'file-type';

// Explicit decision (2026-07-27): 10 MB decoded per file.
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_PREFIXES = ['image/', 'application/pdf', 'audio/', 'video/', 'text/'];

function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((prefix) => mime === prefix || mime.startsWith(prefix));
}

export interface ValidatedFile {
  buffer: Buffer;
  mimeType: string;
}

export type FileValidationResult =
  | { ok: true; file: ValidatedFile }
  | { ok: false; error: string };

/**
 * Validates a client-uploaded file: allow-listed MIME category, size limit,
 * and (except for text/*, which has no reliable signature) magic-byte
 * verification that the content actually matches the claimed type — a
 * claimed mimeType alone is trivially spoofable client-side.
 */
export async function validateUploadedFile(
  data: string,
  claimedMimeType: string
): Promise<FileValidationResult> {
  if (!claimedMimeType || !isAllowedMime(claimedMimeType)) {
    return { ok: false, error: `Unsupported file type: ${claimedMimeType || '(missing)'}` };
  }

  const base64Data = data.includes(',') ? data.split(',')[1] : data;
  if (!base64Data) {
    return { ok: false, error: 'Missing file data' };
  }

  // Cheap early rejection before fully decoding: base64 length is ~4/3 of
  // the decoded byte size.
  const approxDecodedSize = Math.floor((base64Data.length * 3) / 4);
  if (approxDecodedSize > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB` };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64Data, 'base64');
  } catch {
    return { ok: false, error: 'Invalid base64 file data' };
  }

  if (buffer.length === 0) {
    return { ok: false, error: 'Empty file' };
  }
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB` };
  }

  // text/* has no binary signature to sniff — accept on claimed type + size
  // once we've confirmed it isn't actually binary data mislabeled as text.
  if (claimedMimeType.startsWith('text/')) {
    if (buffer.includes(0)) {
      return { ok: false, error: 'File claims to be text but contains binary data' };
    }
    return { ok: true, file: { buffer, mimeType: claimedMimeType } };
  }

  const detected = await fileTypeFromBuffer(buffer);
  if (!detected) {
    return { ok: false, error: 'Could not verify file type from its content' };
  }

  // Compare at the category level (image/*, audio/*, ...) rather than exact
  // string match — e.g. claimed "image/jpg" vs detected "image/jpeg" is the
  // same real category, just different naming.
  const claimedCategory = claimedMimeType.split('/')[0];
  const detectedCategory = detected.mime.split('/')[0];
  if (claimedCategory !== detectedCategory || !isAllowedMime(detected.mime)) {
    return {
      ok: false,
      error: `Claimed type "${claimedMimeType}" does not match the file's actual content ("${detected.mime}")`,
    };
  }

  return { ok: true, file: { buffer, mimeType: detected.mime } };
}
