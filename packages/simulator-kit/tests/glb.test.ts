import { describe, expect, it } from 'vitest';
import { glbExtras, glbJson } from '@/lib/glb';

/** A minimal GLB: 12-byte header, then one JSON chunk padded to 4 bytes (glTF 2.0 §4.4). */
function glb(doc: unknown): ArrayBuffer {
  let json = new TextEncoder().encode(JSON.stringify(doc));
  const pad = (4 - (json.length % 4)) % 4;
  json = new Uint8Array([...json, ...new Array(pad).fill(0x20)]);
  const buf = new ArrayBuffer(20 + json.length);
  const v = new DataView(buf);
  v.setUint32(0, 0x46546c67, true);
  v.setUint32(4, 2, true);
  v.setUint32(8, buf.byteLength, true);
  v.setUint32(12, json.length, true);
  v.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(buf, 20).set(json);
  return buf;
}

describe('glb', () => {
  it("reads the head report from asset.extras", () => {
    const report = { hair: { mode: 'template', template: { id: 'bob_03', author: 'A', license: 'CC0', iou: 0.71 }, attribution: [] }, photoSkin: [{ view: 'front', triangles: 1200, textureSize: [1024, 1024] }] };
    expect(glbExtras(glb({ asset: { version: '2.0', extras: report } }))).toEqual(report);
  });

  it('is null for anything that is not a GLB with JSON', () => {
    expect(glbJson(new ArrayBuffer(8))).toBeNull();
    expect(glbJson(new TextEncoder().encode('not a glb at all, really').buffer)).toBeNull();
    expect(glbExtras(glb({ asset: { version: '2.0' } }))).toBeNull();
  });
});
