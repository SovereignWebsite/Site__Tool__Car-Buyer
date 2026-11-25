// Accessibility (axe) on every page at phone width (390 px), in light and dark, in each of the five designs
// (?design=N), and a check that no page scrolls sideways. tools/check.sh runs axe at desktop width only; a serious
// fault was once found by design.b.rounds only at 390 px. Lesson 13 of Dinis's feedback on the Lee-Elle site (25 Nov 2026).
//   bash tools/checks/axe-phone.sh        (builds _site, runs this, removes _site)
// Or: node axe-phone.mjs <built _site dir>, from a folder where playwright and @axe-core/playwright resolve.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(process.argv[2] || '_site');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => {
  let p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); r.end(fs.readFileSync(p));
});
await new Promise((o) => srv.listen(0, o)); const base = `http://127.0.0.1:${srv.address().port}`;
const pages = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'vendor') walk(f); } else if (e.name === 'index.html') pages.push('/' + path.relative(root, path.dirname(f)).replace(/\\/g, '/') + (path.dirname(f) === root ? '' : '/')); } };
walk(root);
const b = await chromium.launch(); let bad = 0, n = 0;
for (const scheme of ['light', 'dark']) for (const design of [1, 2, 3, 4, 5]) for (const u of pages) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme }); const pg = await c.newPage();
  await pg.goto(`${base}${u}?design=${design}`); await pg.waitForTimeout(150); n++;
  const w = await pg.evaluate(() => document.documentElement.scrollWidth);
  if (w > 390) { bad++; console.log(scheme, design, u, 'sideways scroll', w, 'px'); }
  const res = await new AxeBuilder({ page: pg }).analyze();
  for (const v of res.violations) { bad++; console.log(scheme, design, u, v.id, v.impact, v.nodes.length); }
  await c.close();
}
console.log(`phone axe: ${n} page views, ${bad} problem(s)`); await b.close(); srv.close(); process.exit(bad ? 1 : 0);
