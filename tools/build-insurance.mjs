// Builds site/insurance/index.html from site/data/insurance.json. The generator holds no words: every sentence is in the JSON.
// Refuses a fact without a source, a source without a "read" date, an em dash, or a source that no fact cites.
//   node tools/build-insurance.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const D = JSON.parse(readFileSync('site/data/insurance.json', 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const errs = [], cited = new Set();
for (const [id, s] of Object.entries(D.sources)) if (!s.url || !s.title || !s.read) errs.push(`source ${id} needs title, url and read`);
const cite = (ids = []) => ids.map((id) => { if (!D.sources[id]) { errs.push(`unknown source ${id}`); return ''; } cited.add(id); return `<sup class="cite"><a href="#src-${id}" aria-label="Source ${id.slice(1)}">[${id.slice(1)}]</a></sup>`; }).join('');
const paras = (a = []) => a.map((p) => `<p>${esc(p)}</p>`).join('\n');
const list = (a = []) => a.length ? `<ul class="plain">${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
const facts = (a = []) => a.length ? `<ul class="facts">${a.map((f) => { if (!f.src?.length) errs.push(`fact without source: ${f.text.slice(0, 40)}`); return `<li>${esc(f.text)} ${cite(f.src)}${f.note ? `<span class="fnote">${esc(f.note)}</span>` : ''}</li>`; }).join('\n')}</ul>` : '';
const table = (t) => !t ? '' : `<div class="tbl cards"><table class="results"><tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${t.rows.map((r) => `<tr>${r.map((c, i) => Array.isArray(c) ? `<td data-label="${esc(t.head[i])}">${cite(c)}</td>` : `<td data-label="${esc(t.head[i])}">${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
const inner = (s) => `${s.label ? `<p class="mark small">${esc(s.label)}</p>` : ''}
${paras(s.paras)}${facts(s.facts)}${table(s.table)}${list(s.list)}${paras(s.paras_after)}${list(s.list_after)}${paras(s.paras_end)}${s.notfound ? `<p class="note"><strong>Not found.</strong> ${esc(s.notfound)}</p>` : ''}`;
// Long sections fold away so the page stays short on a phone (design.b: under 8,000 px); "open" in the JSON keeps one open.
const body = D.sections.map((s) => `<details class="sec" id="${s.id}"${s.open ? ' open' : ''}><summary><h2 id="h-${s.id}">${esc(s.heading)}</h2></summary>
${inner(s)}
</details>`).join('\n');
for (const id of Object.keys(D.sources)) if (!cited.has(id)) errs.push(`source ${id} is never cited`);
const srcs = `<details class="sec" id="sources"><summary><h2 id="h-sources">Sources</h2></summary><p class="small">Every fact above names its source. Dates are the date of the source and the date we read it.</p><ol class="srclist">${Object.entries(D.sources).map(([id, s]) => `<li id="src-${id}"><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a>. Source date: ${esc(s.source_date)}. Read: ${esc(s.read)}.</li>`).join('')}</ol></details>`;
// Head and footer come from an existing page, so the 14 share tags, the family menu and the footer match the site.
const tpl = readFileSync('site/checklist/index.html', 'utf8');
let head = tpl.slice(0, tpl.indexOf('<main id="main">'));
const foot = tpl.slice(tpl.indexOf('<footer>'), tpl.indexOf('</main>'));
head = head.replace(/Checklist, Car buyer/g, D.title).replace(/\/checklist\//g, '/insurance/').replace(/(name="description" content=")[^"]*/, `$1${esc(D.description)}`).replace(/(og:description" content=")[^"]*/, `$1${esc(D.description)}`).replace(/(twitter:description" content=")[^"]*/, `$1${esc(D.description)}`);
head = head.replace('<a href="/insurance/" aria-current="page">Checklist</a>', '<a href="/checklist/">Checklist</a>').replace('<a href="/check/">Check</a>', '<a href="/check/">Check</a>');
if (!head.includes('href="/insurance/"')) head = head.replace('<a href="/costs/">Costs</a>', '<a href="/insurance/" aria-current="page">Insurance</a><a href="/costs/">Costs</a>');
else head = head.replace(/<a href="\/insurance\/">Insurance<\/a>/, '<a href="/insurance/" aria-current="page">Insurance</a>');
head = head.replace('</head>', '<link rel="stylesheet" href="/insurance/insurance.css">\n</head>');
const page = `${head}<main id="main">
<div class="mark">Insurance</div>
<h1>${esc(D.heading)}</h1>
<p class="lede">${esc(D.lede)}</p>
<p class="note"><strong>${esc(D.draft.split(':')[0])}.</strong>${esc(D.draft.slice(D.draft.indexOf(':') + 1))} Read on ${esc(D.read_on)}.</p>
<nav class="toc small" aria-label="On this page">${D.sections.map((s) => `<a href="#${s.id}">${esc(s.heading)}</a>`).join(' ')} <a href="#sources">Sources</a></nav>
${body}
${srcs}
${foot}</main>
<script src="/insurance/insurance.js" defer></script>
</body>
</html>
`;
if (page.includes('—')) errs.push('an em dash in the output');
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
writeFileSync('site/insurance/index.html', page);
console.log(`insurance page built: ${D.sections.length} sections, ${cited.size} sources cited`);
