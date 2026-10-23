import { MAX_RESUME_BYTES } from '../schema';

/** %PDF at the start of the file. */
export const hasPdfSignature = (bytes: Uint8Array) =>
  bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;

export function checkDeclaredFile(f: { size: unknown; type: unknown; ext: unknown }) {
  if (f.type !== 'application/pdf' || String(f.ext).toLowerCase() !== 'pdf') return 'wrongType' as const;
  const size = Number(f.size);
  if (!Number.isFinite(size) || size <= 0) return 'wrongType' as const;
  if (size > MAX_RESUME_BYTES) return 'tooBig' as const;
  return null;
}
