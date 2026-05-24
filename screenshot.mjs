import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  process.exit(1);
}

if (url.startsWith('file://')) {
  console.error('Refusing to screenshot a file:// URL. Start serve.mjs and use http://localhost:3000.');
  process.exit(1);
}

const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const existing = fs.readdirSync(outDir)
  .map(f => f.match(/^screenshot-(\d+)(?:-.*)?\.png$/))
  .filter(Boolean)
  .map(m => parseInt(m[1], 10));
const next = (existing.length ? Math.max(...existing) : 0) + 1;

const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;
const outPath = path.join(outDir, filename);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved ${outPath}`);
} finally {
  await browser.close();
}
