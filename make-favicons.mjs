import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const { pathG, pathF } = JSON.parse(fs.readFileSync('paths.json', 'utf8'));

// Font metrics
const spacing = 120;
const totalWidth = 1438 + spacing + 966; // 2524
const totalHeight = 1438;

// Scale to fill comfortably in 64x64
const targetWidth = 56;
const scale = targetWidth / totalWidth;
const scaledHeight = totalHeight * scale;
const offsetX = (64 - targetWidth) / 2;
const offsetY = (64 + scaledHeight) / 2;

// 1. Pure Vector SVG (No fonts, no external dependencies, 100% compliant)
// Color #f49795 (Cotton Rose)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}) scale(${scale.toFixed(5)}, ${(-scale).toFixed(5)})" fill="#f49795">
    <path d="${pathG}" />
    <path transform="translate(${1438 + spacing}, 0)" d="${pathF}" />
  </g>
</svg>
`;

fs.writeFileSync('public/favicon.svg', svg);
console.log('Saved public/favicon.svg');

// Render to high-res base PNG for generating icons
const basePngBuffer = await sharp(Buffer.from(svg))
  .resize(512, 512)
  .png()
  .toBuffer();

// Generate PNG favicons
await sharp(basePngBuffer).resize(16, 16).png().toFile('public/favicon-16x16.png');
await sharp(basePngBuffer).resize(32, 32).png().toFile('public/favicon-32x32.png');
await sharp(basePngBuffer).resize(48, 48).png().toFile('public/favicon-48x48.png');
await sharp(basePngBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');

console.log('Saved PNG favicons (16, 32, 48, 180)');

// Generate standard multi-image ICO file (contains 16x16, 32x32, 48x48)
// An ICO file header format:
// Header: 2 bytes reserved (0), 2 bytes type (1 = icon), 2 bytes count (N)
// For each image: 16-byte directory entry + PNG/BMP payload
const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(sizes.map(s => sharp(basePngBuffer).resize(s, s).png().toBuffer()));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // Type 1 = ICO
header.writeUInt16LE(sizes.length, 4);

let offset = 6 + sizes.length * 16;
const dirEntries = [];
for (let i = 0; i < sizes.length; i++) {
  const s = sizes[i];
  const buf = pngBuffers[i];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(s === 256 ? 0 : s, 0); // Width
  entry.writeUInt8(s === 256 ? 0 : s, 1); // Height
  entry.writeUInt8(0, 2); // Color palette
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Color planes
  entry.writeUInt16LE(32, 6); // Bits per pixel
  entry.writeUInt32LE(buf.length, 8); // Size of image data
  entry.writeUInt32LE(offset, 12); // Offset of image data
  dirEntries.push(entry);
  offset += buf.length;
}

const icoBuffer = Buffer.concat([header, ...dirEntries, ...pngBuffers]);
fs.writeFileSync('public/favicon.ico', icoBuffer);
fs.writeFileSync('favicon.ico', icoBuffer);
console.log('Saved public/favicon.ico and favicon.ico');

// Also sync to dist if dist exists
if (fs.existsSync('dist')) {
  fs.copyFileSync('public/favicon.svg', 'dist/favicon.svg');
  fs.copyFileSync('public/favicon-16x16.png', 'dist/favicon-16x16.png');
  fs.copyFileSync('public/favicon-32x32.png', 'dist/favicon-32x32.png');
  fs.copyFileSync('public/apple-touch-icon.png', 'dist/apple-touch-icon.png');
  fs.copyFileSync('public/favicon.ico', 'dist/favicon.ico');
  console.log('Synced to dist');
}
