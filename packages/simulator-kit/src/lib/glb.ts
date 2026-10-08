// Reads the JSON chunk of a binary glTF (GLB) — where the face worker puts
// its head report (asset.extras; core facearch/headreport.go). Only the
// header and the first chunk are read; the mesh and textures are left alone.

const MAGIC = 0x46546c67; // "glTF", glTF 2.0 spec §4.4.2
const JSON_CHUNK = 0x4e4f534a; // "JSON"

/** The GLB's JSON document, or null when the bytes are not a GLB with a JSON first chunk. */
export function glbJson(buf: ArrayBuffer): Record<string, unknown> | null {
  if (buf.byteLength < 20) return null;
  const v = new DataView(buf);
  if (v.getUint32(0, true) !== MAGIC) return null;
  const len = v.getUint32(12, true);
  if (v.getUint32(16, true) !== JSON_CHUNK || 20 + len > buf.byteLength) return null;
  try {
    const doc = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, len)));
    return doc && typeof doc === 'object' ? (doc as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** asset.extras of a GLB, or null. */
export function glbExtras(buf: ArrayBuffer): Record<string, unknown> | null {
  const asset = glbJson(buf)?.asset as { extras?: unknown } | undefined;
  return asset?.extras && typeof asset.extras === 'object' ? (asset.extras as Record<string, unknown>) : null;
}
