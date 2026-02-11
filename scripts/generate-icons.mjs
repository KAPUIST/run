/**
 * Generate PWA icons from SVG
 * Run: node scripts/generate-icons.mjs
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="0" fill="#07070B"/>
  <circle cx="256" cy="240" r="180" fill="#FF4D00"/>
  <text x="256" y="295" font-size="220" font-family="sans-serif" font-weight="900" fill="white" text-anchor="middle">뛰</text>
</svg>`;

const SVG_MASKABLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#FF4D00"/>
  <text x="256" y="310" font-size="260" font-family="sans-serif" font-weight="900" fill="white" text-anchor="middle">뛰</text>
</svg>`;

const SVG_APPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="36" fill="#FF4D00"/>
  <text x="90" y="115" font-size="95" font-family="sans-serif" font-weight="900" fill="white" text-anchor="middle">뛰</text>
</svg>`;

fs.writeFileSync('public/icons/icon-512.svg', SVG_ICON);
fs.writeFileSync('public/icons/icon-maskable-512.svg', SVG_MASKABLE);
fs.writeFileSync('public/icons/apple-touch-icon.svg', SVG_APPLE);

// Try to convert with sips (macOS built-in), fall back to keeping SVGs
const sizes = [
  { name: 'icon-192', size: 192, svg: SVG_ICON },
  { name: 'icon-512', size: 512, svg: SVG_ICON },
  { name: 'icon-maskable-512', size: 512, svg: SVG_MASKABLE },
  { name: 'apple-touch-icon', size: 180, svg: SVG_APPLE },
];

for (const { name, size, svg } of sizes) {
  const svgPath = `public/icons/${name}.svg`;
  const pngPath = `public/icons/${name}.png`;
  fs.writeFileSync(svgPath, svg);

  try {
    // Use qlmanage (macOS) to convert SVG to PNG
    execSync(`qlmanage -t -s ${size} -o /tmp "${svgPath}" 2>/dev/null`, { stdio: 'pipe' });
    const tmpPng = `/tmp/${name}.svg.png`;
    if (fs.existsSync(tmpPng)) {
      fs.copyFileSync(tmpPng, pngPath);
      fs.unlinkSync(tmpPng);
      console.log(`✅ ${pngPath} (${size}x${size})`);
    } else {
      throw new Error('no output');
    }
  } catch {
    // Fallback: just keep SVG, browser can handle it
    console.log(`⚠️  ${name}: SVG only (install imagemagick for PNG: brew install imagemagick)`);
  }
}

console.log('\nDone!');
