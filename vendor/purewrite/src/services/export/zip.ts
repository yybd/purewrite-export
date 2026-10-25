/**
 * A minimal ZIP writer — enough for .docx and .epub, which are zipped XML.
 *
 * Entries are stored, not deflated. Every reader (Word, Pages, Google Docs,
 * Apple Books) accepts stored entries, the XML is small, and images are
 * compressed already; in exchange there is no compression code and no
 * dependency to carry. Names are UTF-8 (general-purpose bit 11).
 */

export interface ZipEntry {
    name: string;
    data: Uint8Array | string;
}

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

export function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

// 1980-01-01 00:00, the earliest DOS date: the same input gives the same
// bytes, which keeps the tests exact and an unchanged export identical.
const DOS_TIME = 0;
const DOS_DATE = (0 << 9) | (1 << 5) | 1;

export function zip(entries: ZipEntry[]): Uint8Array {
    const encoder = new TextEncoder();
    const locals: Uint8Array[] = [];
    const centrals: Uint8Array[] = [];
    let offset = 0;

    for (const entry of entries) {
        const name = encoder.encode(entry.name);
        const data = typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
        const crc = crc32(data);

        const local = new Uint8Array(30 + name.length);
        const lv = new DataView(local.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true); // version needed
        lv.setUint16(6, 0x0800, true); // UTF-8 names
        lv.setUint16(8, 0, true); // stored
        lv.setUint16(10, DOS_TIME, true);
        lv.setUint16(12, DOS_DATE, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, data.length, true);
        lv.setUint32(22, data.length, true);
        lv.setUint16(26, name.length, true);
        lv.setUint16(28, 0, true);
        local.set(name, 30);

        const central = new Uint8Array(46 + name.length);
        const cv = new DataView(central.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true); // version made by
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0x0800, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, DOS_TIME, true);
        cv.setUint16(14, DOS_DATE, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, data.length, true);
        cv.setUint32(24, data.length, true);
        cv.setUint16(28, name.length, true);
        cv.setUint32(42, offset, true);
        central.set(name, 46);

        locals.push(local, data);
        centrals.push(central);
        offset += local.length + data.length;
    }

    const centralSize = centrals.reduce((n, c) => n + c.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);

    const parts = [...locals, ...centrals, end];
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let at = 0;
    for (const part of parts) {
        out.set(part, at);
        at += part.length;
    }
    return out;
}

/** Reads back a zip this module wrote (stored entries only) — for tests. */
export function unzip(bytes: Uint8Array): Map<string, Uint8Array> {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const decoder = new TextDecoder();
    const out = new Map<string, Uint8Array>();
    let at = 0;
    while (at + 4 <= bytes.length && view.getUint32(at, true) === 0x04034b50) {
        const size = view.getUint32(at + 18, true);
        const nameLength = view.getUint16(at + 26, true);
        const extra = view.getUint16(at + 28, true);
        const name = decoder.decode(bytes.subarray(at + 30, at + 30 + nameLength));
        const start = at + 30 + nameLength + extra;
        out.set(name, bytes.subarray(start, start + size));
        at = start + size;
    }
    return out;
}
