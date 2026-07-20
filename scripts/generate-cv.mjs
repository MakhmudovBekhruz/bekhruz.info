/**
 * Renders dist/cv-print/ to dist/cv/bekhruz-makhmudov-cv.pdf with headless
 * Chromium. Runs as part of `npm run build` (after `astro build`), so the CV
 * is regenerated from the live site content on every build.
 */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const DIST = new URL('../dist/', import.meta.url).pathname;
const OUT = join(DIST, 'cv', 'bekhruz-makhmudov-cv.pdf');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let path = join(DIST, decodeURIComponent(url.pathname));
    const s = await stat(path).catch(() => null);
    if (!s || s.isDirectory()) path = join(path, 'index.html');
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const response = await page.goto(`http://localhost:${port}/cv-print/`, { waitUntil: 'networkidle' });
  if (!response?.ok()) throw new Error(`cv-print page returned ${response?.status()}`);

  const name = await page.textContent('h1');
  if (!name?.includes('Bekhruz')) throw new Error('cv-print page did not render expected content');

  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await mkdir(join(DIST, 'cv'), { recursive: true });
  await writeFile(OUT, pdf);
  console.log(`[generate-cv] wrote ${OUT} (${(pdf.length / 1024).toFixed(0)} kB)`);
} finally {
  await browser.close();
  server.close();
}
