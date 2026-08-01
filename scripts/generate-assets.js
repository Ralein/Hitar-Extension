import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPngBuffer(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdr);

  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * scanlineLength;
    rawData[scanlineOffset] = 0;

    for (let x = 0; x < width; x++) {
      const srcOffset = (y * width + x) * 4;
      const dstOffset = scanlineOffset + 1 + x * 4;
      rawData[dstOffset] = rgbaBuffer[srcOffset];
      rawData[dstOffset + 1] = rgbaBuffer[srcOffset + 1];
      rawData[dstOffset + 2] = rgbaBuffer[srcOffset + 2];
      rawData[dstOffset + 3] = rgbaBuffer[srcOffset + 3];
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? ((crc >>> 1) ^ 0xedb88320) : (crc >>> 1);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function isOutsideCorner(x, y, width, height, radius) {
  if (x < radius && y < radius && Math.hypot(x - radius, y - radius) > radius) return true;
  if (x > width - radius && y < radius && Math.hypot(x - (width - radius), y - radius) > radius) return true;
  if (x < radius && y > height - radius && Math.hypot(x - radius, y - (height - radius)) > radius) return true;
  if (x > width - radius && y > height - radius && Math.hypot(x - (width - radius), y - (height - radius)) > radius) return true;
  return false;
}

/**
 * Draws Hitar's unified Electric Blue-Cyan professional logo emblem.
 */
function drawHitarIconPixels(width, height) {
  const rgba = Buffer.alloc(width * height * 4);
  const radius = Math.floor(width * 0.28);

  const cx = width / 2;
  const cy = height / 2;
  const ringRadius = width * 0.26;
  const ringThickness = Math.max(1, width * 0.08);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;

      if (isOutsideCorner(x, y, width, height, radius)) {
        rgba.fill(0, offset, offset + 4);
        continue;
      }

      const nx = x / width;
      const ny = y / height;

      // Professional Electric Blue (#2563eb) -> Cyan (#06b6d4) gradient
      const r = Math.floor(37 - nx * 30 + ny * 20);
      const g = Math.floor(99 + nx * 80 + ny * 20);
      const b = Math.floor(235 - ny * 20);

      const dist = Math.hypot(x - cx, y - cy);
      let isEmblem = false;

      if (Math.abs(dist - ringRadius) <= ringThickness / 2) {
        isEmblem = true;
      } else if (Math.abs(y - cy) <= ringThickness / 2 && Math.abs(x - cx) <= ringRadius * 1.1) {
        isEmblem = true;
      }

      if (isEmblem) {
        rgba[offset] = 255;
        rgba[offset + 1] = 255;
        rgba[offset + 2] = 255;
        rgba[offset + 3] = 255;
      } else {
        rgba[offset] = Math.max(0, Math.min(255, r));
        rgba[offset + 1] = Math.max(0, Math.min(255, g));
        rgba[offset + 2] = Math.max(0, Math.min(255, b));
        rgba[offset + 3] = 255;
      }
    }
  }

  return rgba;
}

const iconDirs = [path.resolve('public/icon'), path.resolve('src/public/icon')];
for (const iconDir of iconDirs) {
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }
}

const sizes = [16, 32, 48, 128];
for (const size of sizes) {
  const pixels = drawHitarIconPixels(size, size);
  const pngBuf = createPngBuffer(size, size, pixels);
  for (const iconDir of iconDirs) {
    fs.writeFileSync(path.join(iconDir, `${size}.png`), pngBuf);
  }
  console.log(`Generated logo icon ${size}.png`);
}

const promoPixels = drawHitarIconPixels(440, 280);
const promoBuf = createPngBuffer(440, 280, promoPixels);
fs.writeFileSync(path.resolve('public/store-promo-440x280.png'), promoBuf);
console.log('Generated public/store-promo-440x280.png');
