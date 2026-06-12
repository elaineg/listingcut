// Pure binary parsers for image metadata, used by unit tests and e2e
// assertions on downloaded files. No deps.

/** Returns {width,height} from a PNG buffer's IHDR chunk, or null. */
export function pngSize(buf: Buffer): { width: number; height: number } | null {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(sig)) return null;
  // First chunk must be IHDR at offset 8: 4-byte len, 'IHDR', then w/h.
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Returns {width,height} from a JPEG buffer's SOF marker, or null. */
export function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let off = 2;
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) return null;
    const marker = buf[off + 1];
    // Standalone markers without length payloads.
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      off += 2;
      continue;
    }
    const len = buf.readUInt16BE(off + 2);
    // SOF0..SOF15 except DHT(C4)/JPG(C8)/DAC(CC) carry dimensions.
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: buf.readUInt16BE(off + 5),
        width: buf.readUInt16BE(off + 7),
      };
    }
    if (marker === 0xda) return null; // hit scan data without a SOF
    off += 2 + len;
  }
  return null;
}
