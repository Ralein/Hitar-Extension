import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/* ── PNG encoder (zero-dependency) ──────────────────────────── */
function createPngBuffer(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);   // bit depth
  ihdr.writeUInt8(6, 9);   // RGBA
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowLen = width * 4 + 1;
  const raw = Buffer.alloc(height * rowLen);
  for (let y = 0; y < height; y++) {
    raw[y * rowLen] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * rowLen + 1 + x * 4;
      raw[dst]     = rgbaBuffer[src];
      raw[dst + 1] = rgbaBuffer[src + 1];
      raw[dst + 2] = rgbaBuffer[src + 2];
      raw[dst + 3] = rgbaBuffer[src + 3];
    }
  }

  const idatChunk = makeChunk('IDAT', zlib.deflateSync(raw));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const buf = Buffer.alloc(8 + data.length + 4);
  buf.writeUInt32BE(data.length, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  buf.writeUInt32BE(crc32(buf.subarray(4, 8 + data.length)), 8 + data.length);
  return buf;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) { c ^= b; for (let j = 0; j < 8; j++) c = (c & 1) ? (c >>> 1) ^ 0xedb88320 : c >>> 1; }
  return (c ^ 0xffffffff) >>> 0;
}

/* ── Helpers ────────────────────────────────────────────────── */
function outsideRoundedRect(x, y, w, h, r) {
  const corners = [
    [r, r], [w - 1 - r, r],
    [r, h - 1 - r], [w - 1 - r, h - 1 - r],
  ];
  for (const [cx, cy] of corners) {
    if ((x < r || x > w - 1 - r) && (y < r || y > h - 1 - r)) {
      if (Math.hypot(x - cx, y - cy) > r) return true;
    }
  }
  return false;
}

/** Linear interpolation between two [r,g,b] colors */
function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** Distance from point (px, py) to a line segment (ax,ay)–(bx,by) */
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/* ── The Hitar Mark ─────────────────────────────────────────
 *
 *  A stylized letter "H" whose crossbar is a bidirectional
 *  translation arrow (⇄).
 *
 *  ┃          ┃       Two vertical pillars = two languages
 *  ┃  ◂────▸  ┃       Crossbar with arrowheads = translation
 *  ┃          ┃
 *
 *  This is unique, functional, and brand-aligned ("H" for Hitar).
 * ────────────────────────────────────────────────────────────── */
function drawHitarMark(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const r = Math.round(size * 0.22); // corner radius

  // Gradient colors: Electric Blue → Indigo → Cyan
  const topColor    = [30, 64, 175];   // blue-800
  const bottomColor = [6, 182, 212];   // cyan-500

  // Glyph metrics (normalised to [0,1], then scaled)
  const S  = size;
  const sw = Math.max(1.4, S * 0.14);  // stroke half-width

  // Vertical bars
  const leftX  = S * 0.28;
  const rightX = S * 0.72;
  const topY   = S * 0.18;
  const botY   = S * 0.82;

  // Crossbar
  const midY   = S * 0.50;

  // Arrowheads
  const arrLen = S * 0.16; // arrowhead arm length
  const leftArrTipX  = leftX + S * 0.04;
  const rightArrTipX = rightX - S * 0.04;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const off = (y * size + x) * 4;

      // Rounded-rect mask
      if (outsideRoundedRect(x, y, size, size, r)) {
        rgba[off] = rgba[off + 1] = rgba[off + 2] = rgba[off + 3] = 0;
        continue;
      }

      // Background gradient (top-to-bottom)
      const t = y / (size - 1);
      const bg = lerpColor(topColor, bottomColor, t);

      // Check if pixel is part of the glyph
      let minDist = Infinity;

      // Left vertical bar
      minDist = Math.min(minDist, distToSegment(x, y, leftX, topY, leftX, botY));
      // Right vertical bar
      minDist = Math.min(minDist, distToSegment(x, y, rightX, topY, rightX, botY));
      // Crossbar
      minDist = Math.min(minDist, distToSegment(x, y, leftX, midY, rightX, midY));

      // Left arrowhead (pointing left ◂)
      minDist = Math.min(minDist, distToSegment(x, y, leftArrTipX, midY, leftArrTipX + arrLen, midY - arrLen));
      minDist = Math.min(minDist, distToSegment(x, y, leftArrTipX, midY, leftArrTipX + arrLen, midY + arrLen));

      // Right arrowhead (pointing right ▸)
      minDist = Math.min(minDist, distToSegment(x, y, rightArrTipX, midY, rightArrTipX - arrLen, midY - arrLen));
      minDist = Math.min(minDist, distToSegment(x, y, rightArrTipX, midY, rightArrTipX - arrLen, midY + arrLen));

      // Anti-aliased stroke rendering
      const edgeDist = minDist - sw;
      if (edgeDist < -0.5) {
        // Fully inside glyph → white
        rgba[off]     = 255;
        rgba[off + 1] = 255;
        rgba[off + 2] = 255;
        rgba[off + 3] = 255;
      } else if (edgeDist < 0.5) {
        // Edge → blend white over background
        const alpha = 0.5 - edgeDist; // 0..1
        rgba[off]     = Math.round(255 * alpha + bg[0] * (1 - alpha));
        rgba[off + 1] = Math.round(255 * alpha + bg[1] * (1 - alpha));
        rgba[off + 2] = Math.round(255 * alpha + bg[2] * (1 - alpha));
        rgba[off + 3] = 255;
      } else {
        // Background
        rgba[off]     = bg[0];
        rgba[off + 1] = bg[1];
        rgba[off + 2] = bg[2];
        rgba[off + 3] = 255;
      }
    }
  }
  return rgba;
}

/* ── Generate icon PNGs ─────────────────────────────────────── */
const iconDirs = [path.resolve('public/icon'), path.resolve('src/public/icon')];
for (const d of iconDirs) fs.mkdirSync(d, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const px  = drawHitarMark(size);
  const buf = createPngBuffer(size, size, px);
  for (const d of iconDirs) fs.writeFileSync(path.join(d, `${size}.png`), buf);
  console.log(`✓ Generated Hitar Mark icon ${size}×${size}`);
}

/* ── Store promo banner ─────────────────────────────────────── */
const promoW = 440, promoH = 280;
const promoPx = Buffer.alloc(promoW * promoH * 4);
// Dark background
for (let i = 0; i < promoW * promoH; i++) {
  const off = i * 4;
  const ny = Math.floor(i / promoW) / promoH;
  promoPx[off]     = Math.round(9 + ny * 6);
  promoPx[off + 1] = Math.round(13 + ny * 8);
  promoPx[off + 2] = Math.round(22 + ny * 12);
  promoPx[off + 3] = 255;
}
// Centered icon
const iconSz = 140;
const iconPx = drawHitarMark(iconSz);
const ox = Math.floor((promoW - iconSz) / 2);
const oy = Math.floor((promoH - iconSz) / 2);
for (let y = 0; y < iconSz; y++) {
  for (let x = 0; x < iconSz; x++) {
    const src = (y * iconSz + x) * 4;
    if (iconPx[src + 3] === 0) continue;
    const dst = ((oy + y) * promoW + (ox + x)) * 4;
    promoPx[dst]     = iconPx[src];
    promoPx[dst + 1] = iconPx[src + 1];
    promoPx[dst + 2] = iconPx[src + 2];
    promoPx[dst + 3] = iconPx[src + 3];
  }
}
fs.writeFileSync(path.resolve('public/store-promo-440x280.png'), createPngBuffer(promoW, promoH, promoPx));
console.log('✓ Generated store promo 440×280');
