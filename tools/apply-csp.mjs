// Puts the site-wide Content-Security-Policy meta tag on every page in site/ (b.security, post-check of the Insurance section, 26 Nov 2026).
// The policy is b.security's, word for word, with three scoped exceptions, each listed here so they can be removed:
//   1. Pages that still carry inline styles keep style-src 'self' 'unsafe-inline' until those styles move into files:
//      the home page, checklist and costs (inline style attributes in the drawings and boxes) and admin, agents and start (a seeded <style> block).
//   2. /mycar/ may also connect to the vault service (connect-src https://dev.send.sgraph.ai) and show a decrypted document (img-src blob:).
//   3. site/policy/ is not touched: the README says agents do not edit it.
//   node tools/apply-csp.mjs        (run after adding a page; build-insurance.mjs calls the same function)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const BASE = { 'default-src': "'none'", 'script-src': "'self'", 'style-src': "'self'", 'img-src': "'self' data:", 'connect-src': "'self'", 'base-uri': "'none'", 'form-action': "'none'" };
const INLINE_STYLES = new Set(['index.html', 'checklist/index.html', 'costs/index.html', 'admin/index.html', 'agents/index.html', 'start/index.html']);
export function policyFor(rel) {
  const p = { ...BASE };
  if (INLINE_STYLES.has(rel)) p['style-src'] = "'self' 'unsafe-inline'";
  if (rel === 'mycar/index.html') { p['connect-src'] = "'self' https://dev.send.sgraph.ai"; p['img-src'] = "'self' data: blob:"; }
  return Object.entries(p).map(([k, v]) => `${k} ${v}`).join('; ');
}
export const metaFor = (rel) => `<meta http-equiv="Content-Security-Policy" content="${policyFor(rel)}">`;
export function withCsp(html, rel) {
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n?/g, '');
  return html.replace(/(<meta charset="utf-8">\n?)/i, `$1${metaFor(rel)}\n`);
}
const walk = (d, out = []) => { for (const e of readdirSync(d)) { const f = join(d, e); if (statSync(f).isDirectory()) { if (e !== 'vendor' && e !== 'policy') walk(f, out); } else if (e === 'index.html') out.push(f); } return out; };
if (process.argv[1] && process.argv[1].endsWith('apply-csp.mjs')) {
  for (const f of walk('site')) { const rel = f.slice('site/'.length); const s = readFileSync(f, 'utf8'), t = withCsp(s, rel); if (s !== t) { writeFileSync(f, t); console.log('csp set:', rel); } }
}
