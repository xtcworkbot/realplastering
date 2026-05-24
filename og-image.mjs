import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  // Standard OG image dimensions
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  // small delay to let fonts settle
  await new Promise(r => setTimeout(r, 600));
  const outPath = path.join(__dirname, 'og.jpg');
  await page.screenshot({ path: outPath, type: 'jpeg', quality: 92, fullPage: false });
  console.log(`Saved ${outPath}`);
} finally {
  await browser.close();
}
