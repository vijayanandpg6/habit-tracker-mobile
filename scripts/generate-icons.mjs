import sharp from 'sharp';
import { writeFileSync } from 'fs';

// App color palette matching the theme
const PRIMARY = '#2563EB';
const PRIMARY_DARK = '#1D4ED8';
const WHITE = '#FFFFFF';

function makeIconSvg(size) {
  const r = Math.round(size * 0.22); // corner radius
  const tFontSize = Math.round(size * 0.58);
  const tY = Math.round(size * 0.725);
  const tX = Math.round(size * 0.5);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PRIMARY_DARK};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${PRIMARY};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>
  <text
    x="${tX}"
    y="${tY}"
    font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
    font-size="${tFontSize}"
    font-weight="700"
    fill="${WHITE}"
    text-anchor="middle"
    letter-spacing="-2"
  >t</text>
</svg>`;
}

function makeSplashSvg(size) {
  const tFontSize = Math.round(size * 0.18);
  const tY = Math.round(size * 0.48);
  const subtitleY = Math.round(size * 0.62);
  const subtitleSize = Math.round(size * 0.038);
  const dotR = Math.round(size * 0.055);
  const dotY = Math.round(size * 0.35);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EFF6FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#DBEAFE;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <circle cx="${size / 2}" cy="${dotY}" r="${dotR}" fill="${PRIMARY}"/>
  <text
    x="${size / 2}"
    y="${tY}"
    font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
    font-size="${tFontSize}"
    font-weight="800"
    fill="${PRIMARY_DARK}"
    text-anchor="middle"
    letter-spacing="-1"
  >tasks</text>
  <text
    x="${size / 2}"
    y="${subtitleY}"
    font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
    font-size="${subtitleSize}"
    font-weight="400"
    fill="#2563EB"
    text-anchor="middle"
    letter-spacing="2"
  >SMART TASK &amp; HABIT TRACKER</text>
</svg>`;
}

async function generate() {
  // App icon — 1024x1024
  await sharp(Buffer.from(makeIconSvg(1024)))
    .png()
    .toFile('assets/icon.png');
  console.log('✓ assets/icon.png');

  // Adaptive icon (Android) — 1024x1024, no rounded corners (Android applies its own mask)
  const adaptiveSvg = makeIconSvg(1024).replace(/rx="\d+" ry="\d+"/, 'rx="0" ry="0"');
  await sharp(Buffer.from(adaptiveSvg))
    .png()
    .toFile('assets/adaptive-icon.png');
  console.log('✓ assets/adaptive-icon.png');

  // Splash icon — 1284x2778 (large enough for all devices)
  await sharp(Buffer.from(makeSplashSvg(1284)))
    .png()
    .toFile('assets/splash-icon.png');
  console.log('✓ assets/splash-icon.png');

  // Favicon — 48x48
  await sharp(Buffer.from(makeIconSvg(48)))
    .png()
    .toFile('assets/favicon.png');
  console.log('✓ assets/favicon.png');

  console.log('\nAll icons generated successfully.');
}

generate().catch(console.error);
