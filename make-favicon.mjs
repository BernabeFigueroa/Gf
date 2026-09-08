import fs from 'fs';
import sharp from 'sharp';

const fontBuffer = fs.readFileSync('public/font/Patinio Basica.ttf');
const fontBase64 = fontBuffer.toString('base64');

// Test normal weight, different font-sizes, and letter spacing
const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <style>
      @font-face {
        font-family: 'PatinioBasica';
        src: url('data:font/truetype;charset=utf-8;base64,${fontBase64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      .bg { fill: #24100f; }
      .gf-text {
        font-family: 'PatinioBasica', sans-serif;
        font-weight: normal;
        fill: #f49795;
        font-size: 26px;
        letter-spacing: 0.08em;
      }
    </style>
  </defs>
  <rect width="64" height="64" rx="14" class="bg" />
  <rect width="62" height="62" x="1" y="1" rx="13" fill="none" stroke="#f49795" stroke-width="1.5" stroke-opacity="0.3" />
  <text x="33" y="42" text-anchor="middle" class="gf-text">GF</text>
</svg>`;

const svgTransparent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <style>
      @font-face {
        font-family: 'PatinioBasica';
        src: url('data:font/truetype;charset=utf-8;base64,${fontBase64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      .gf-text {
        font-family: 'PatinioBasica', sans-serif;
        font-weight: normal;
        fill: #f49795;
        font-size: 32px;
        letter-spacing: 0.06em;
      }
    </style>
  </defs>
  <text x="33" y="44" text-anchor="middle" class="gf-text">GF</text>
</svg>`;

const png1 = await sharp(Buffer.from(svg1)).png().toBuffer();
fs.writeFileSync('public/favicon-test-normal.png', png1);

const pngTrans = await sharp(Buffer.from(svgTransparent)).png().toBuffer();
fs.writeFileSync('public/favicon-test-trans.png', pngTrans);

console.log('Generated test images');
