// Generates abstract "speed line" poster SVGs per series into public/img/series.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SERIES = {
  f1: ["#e10600", "F1"],
  f2: ["#0090d0", "F2"],
  f3: ["#d90478", "F3"],
  motogp: ["#ff8000", "MotoGP"],
  nascar: ["#ffd659", "NASCAR"],
  indycar: ["#0066cc", "IndyCar"],
  wec: ["#00a19a", "WEC"],
  wrc: ["#ffcc00", "WRC"],
  supercup: ["#d5001c", "Supercup"],
  general: ["#7a7a85", "Motorsport"],
};

// deterministic pseudo-random per series so posters differ
function rng(seed) {
  let s = [...seed].reduce((a, c) => a + c.charCodeAt(0), 7);
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

const dir = join(process.cwd(), "public", "img", "series");
mkdirSync(dir, { recursive: true });

for (const [key, [color, label]] of Object.entries(SERIES)) {
  const r = rng(key);
  let lines = "";
  for (let i = 0; i < 14; i++) {
    const y = 40 + r() * 640;
    const x = -100 + r() * 500;
    const w = 250 + r() * 800;
    const h = 2 + r() * 7;
    const o = (0.05 + r() * 0.3).toFixed(2);
    const rot = -16 + r() * 4;
    lines += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(1)}" rx="${(h / 2).toFixed(1)}" fill="${color}" opacity="${o}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  let dots = "";
  for (let i = 0; i < 10; i++) {
    const cx = r() * 1280;
    const cy = r() * 720;
    const rad = 1 + r() * 3;
    const o = (0.1 + r() * 0.4).toFixed(2);
    dots += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(1)}" fill="#ffffff" opacity="${o}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="g1" cx="78%" cy="22%" r="95%">
<stop offset="0%" stop-color="${color}" stop-opacity="0.34"/>
<stop offset="46%" stop-color="${color}" stop-opacity="0.10"/>
<stop offset="100%" stop-color="#0a0a0b" stop-opacity="0"/>
</radialGradient>
<linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#141417"/>
<stop offset="100%" stop-color="#0a0a0b"/>
</linearGradient>
<linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
<stop offset="0%" stop-color="${color}" stop-opacity="0"/>
<stop offset="55%" stop-color="${color}" stop-opacity="0.85"/>
<stop offset="100%" stop-color="${color}" stop-opacity="0"/>
</linearGradient>
</defs>
<rect width="1280" height="720" fill="url(#g2)"/>
<rect width="1280" height="720" fill="url(#g1)"/>
${lines}
${dots}
<rect x="0" y="600" width="1280" height="4" fill="url(#sweep)" transform="rotate(-14 640 602)"/>
<text x="64" y="648" font-family="'Zen Dots', sans-serif" font-size="58" letter-spacing="14" fill="#ffffff" opacity="0.16" style="text-transform:uppercase">${label.toUpperCase()}</text>
</svg>`;
  writeFileSync(join(dir, `${key}.svg`), svg);
  console.log("wrote", key + ".svg");
}
