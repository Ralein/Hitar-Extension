import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Encodes raw RGBA buffer into a valid uncompressed/zlib-compressed PNG buffer.
 */
function createPngBuffer(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // Truecolor with alpha (RGBA)
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT Chunk (Raw RGBA with scanline filter bytes)
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * scanlineLength;
    rawData[scanlineOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const srcOffset = (y * width + x) * 4;
      const dstOffset = scanlineOffset + 1 + x * 4;
      rawData[dstOffset] = rgbaBuffer[srcOffset]; // R
      rawData[dstOffset + 1] = rgbaBuffer[srcOffset + 1]; // G
      rawData[dstOffset + 2] = rgbaBuffer[srcOffset + 2]; // B
      rawData[dstOffset + 3] = rgbaBuffer[srcOffset + 3]; // A
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND Chunk
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
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Draws Hitar brand logo icon RGBA pixels.
 */
function drawHitarIconPixels(width, height) {
  const rgba = Buffer.alloc(width * height * 4);
  const radius = Math.floor(width * 0.25);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const nx = x / width;
      const ny = y / height;

      // Rounded rectangle mask
      let inRect = true;
      if (x < radius && y < radius && Math.hypot(x - radius, y - radius) > radius) inRect = false;
      if (x > width - radius && y < radius && Math.hypot(x - (width - radius), y - radius) > radius) inRect = false;
      if (x < radius && y > height - radius && Math.hypot(x - radius, y - (height - radius)) > radius) inRect = false;
      if (x > width - radius && y > height - radius && Math.hypot(x - (width - radius), y - (height - radius)) > radius) inRect = false;

      if (!inRect) {
        rgba[offset] = 0;
        rgba[offset + 1] = 0;
        rgba[offset + 2] = 0;
        rgba[offset + 3] = 0;
        continue;
      }

      // Brand gradient background (#0c93e7 -> #0276c5)
      const r = Math.floor(12 + nx * 0 - ny * 10);
      const g = Math.floor(147 - ny * 30);
      const b = Math.floor(231 - ny * 34);

      rgba[offset] = Math.max(0, Math.min(255, r));
      rgba[offset + 1] = Math.max(0, Math.min(255, g));
      rgba[offset + 2] = Math.max(0, Math.min(255, b));
      rgba[offset + 3] = 255;
    }
  }

  return rgba;
}

// Ensure output directories exist
const iconDir = path.resolve('public/icon');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Generate icon files
const sizes = [16, 32, 48, 128];
sizes.forEach((size) => {
  const pixels = drawHitarIconPixels(size, size);
  const pngBuf = createPngBuffer(size, size, pixels);
  fs.writeFileSync(path.join(iconDir, `${size}.png`), pngBuf);
  console.log(`Generated public/icon/${size}.png`);
});

// Generate promo banner 440x280
const promoPixels = drawHitarIconPixels(440, 280);
const promoBuf = createPngBuffer(440, 280, promoPixels);
fs.writeFileSync(path.resolve('public/store-promo-440x280.png'), promoBuf);
console.log('Generated public/store-promo-440x280.png');
