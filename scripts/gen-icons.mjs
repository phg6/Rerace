/**
 * Generates the Rerace PWA icons into public/icons/:
 *   icon-192.png, icon-512.png, apple-touch-icon.png (180)
 *
 * Run: node scripts/gen-icons.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "icons");

// Rounded near-black square with a stylized racing-red "R" drawn as strokes,
// kept well inside the maskable safe zone (~60% of the canvas).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect x="0" y="0" width="512" height="512" rx="96" fill="#0a0a0b"/>
  <g transform="translate(-14,-4)" stroke="#e10600" stroke-width="52" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M190 140 V380"/>
    <path d="M190 166 H292 a58 58 0 0 1 0 116 H190"/>
    <path d="M286 286 L352 380"/>
  </g>
</svg>`;

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

await mkdir(outDir, { recursive: true });

for (const { file, size } of targets) {
  const out = path.join(outDir, file);
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(size, size)
    .png()
    .toFile(out);
  console.log(`✓ ${path.relative(root, out)} (${size}x${size})`);
}

console.log("Done.");
