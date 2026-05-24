import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2];
const selector = process.argv[3];
const label = process.argv[4] || 'section';
const viewport = process.argv[5] || '1440x900';
const [vw, vh] = viewport.split('x').map(Number);

if (!url || !selector) {
  console.error('Usage: node screenshot-section.mjs <url> <selector> [label] [viewport]');
  process.exit(1);
}

const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const existing = fs.readdirSync(outDir)
  .map(f => f.match(/^screenshot-(\d+)(?:-.*)?\.png$/))
  .filter(Boolean).map(m => parseInt(m[1], 10));
const next = (existing.length ? Math.max(...existing) : 0) + 1;
const outPath = path.join(outDir, `screenshot-${next}-${label}.png`);

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 400));
  const el = await page.$(selector);
  if (!el) throw new Error(`Selector not found: ${selector}`);
  await el.screenshot({ path: outPath });
  console.log(`Saved ${outPath}`);
} finally {
  await browser.close();
}
