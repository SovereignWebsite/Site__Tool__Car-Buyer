// My car: a plate, the steps that make a bought car legal in the UK, a question box, and a private vault.
// Stored in this browser (localStorage car-buyer:mycar). The vault is made in the visitor's browser with
// sgit's own library (pinned in vendor/, from crm.tool.sovereignweb.site); the page talks to
// dev.send.sgraph.ai only when a vault button is pressed. By b.site.car-buyer@SWS, 2026-11-24.
import { identity, existingIdentity, publicQrText, openSealed } from './pki.js';
import qrcode from './vendor/qrcode-generator/2.0.4/qrcode.mjs';

const $ = (i) => document.getElementById(i);
const KEY = 'car-buyer:mycar', ENDPOINT = 'https://dev.send.sgraph.ai';
const say = (t) => { $('status').textContent = t; };

// Every step names where it comes from. "Our advice" marks the ones that are not official.
const STEPS = [
  { id: 'tax', t: 'Tax the car in your own name before you drive it', w: 'Vehicle tax does not pass to you when you buy. Tax it online on the day, then drive.', k: 'tax drive road legal today home', s: 'https://www.gov.uk/vehicle-tax', n: 'GOV.UK, vehicle tax' },
  { id: 'ins', t: 'Insure it before you drive it', w: 'Driving without insurance is an offence. Ask your insurer about cover for driving it home.', k: 'insurance insure insured cover drive today home', s: 'https://www.gov.uk/vehicle-insurance', n: 'GOV.UK, vehicle insurance' },
  { id: 'keeper', t: 'Make sure DVLA is told you are the new keeper', w: 'The seller tells DVLA online or by post, and you complete the new keeper part of the V5C. The official page says who does what.', k: 'keeper v5c logbook dvla registration owner name change', s: 'https://www.gov.uk/sold-bought-vehicle', n: 'GOV.UK, buying or selling a vehicle' },
  { id: 'v5c', t: 'Look out for your new V5C in the post', w: 'It is your proof of who keeps the car. If it does not arrive, the same page says what to do.', k: 'v5c logbook post arrive document proof', s: 'https://www.gov.uk/sold-bought-vehicle', n: 'GOV.UK, buying or selling a vehicle' },
  { id: 'mot', t: 'Check the MOT is valid, and when the next one is due', w: 'Look up the plate on the official MOT history service and diary the expiry date.', k: 'mot test expiry due valid history', s: 'https://www.gov.uk/check-mot-history', n: 'GOV.UK, check MOT history' },
  { id: 'recall', t: 'Check for open safety recalls', w: 'The official recall check takes the plate and shows any recall not yet carried out.', k: 'recall safety fault', s: 'https://www.gov.uk/check-vehicle-recall', n: 'GOV.UK, check for vehicle recalls' },
  { id: 'london', t: 'If you drive in London, check the charges', w: 'Transport for London has a checker for the Ultra Low Emission Zone and other charges.', k: 'london ulez congestion charge zone tfl', s: 'https://tfl.gov.uk/modes/driving/check-your-vehicle/', n: 'TfL, check your vehicle' },
  { id: 'papers', t: 'Keep the receipt and the paperwork together', w: 'Bill of sale, service history, spare key, handbook: one folder, or the vault below.', k: 'receipt paperwork proof sale history keys documents', s: null, n: 'Our advice' }
];

const load = () => { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && typeof d === 'object') return d; } catch (e) {} return { plate: '', what: '', bought: '', ticks: {}, notes: '' }; };
let data = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { say('This browser would not keep that. Private mode?'); } };

function drawSteps() {
  const ul = $('steps'); ul.textContent = '';
  let n = 0;
  for (const s of STEPS) {
    const on = !!data.ticks[s.id]; if (on) n++;
    const li = document.createElement('li'); if (on) li.className = 'done';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = 'st-' + s.id; cb.checked = on;
    cb.addEventListener('change', () => { data.ticks[s.id] = cb.checked; save(); drawSteps(); });
    const lab = document.createElement('label'); lab.htmlFor = cb.id;
    const b = document.createElement('strong'); b.className = 't'; b.textContent = s.t;
    const w = document.createElement('span'); w.textContent = ' ' + s.w;
    lab.append(b, w);
    const box = document.createElement('div'); box.append(lab);
    const src = document.createElement('div'); src.className = 'src';
    if (s.s) { const a = document.createElement('a'); a.href = s.s; a.rel = 'noopener'; a.textContent = 'Source: ' + s.n; src.append(a); } else src.textContent = s.n;
    box.append(src); li.append(cb, box); ul.append(li);
  }
  $('progress').textContent = `${n} of ${STEPS.length} done.` + (data.plate ? ` Plate ${data.plate}.` : '');
}

function drawCar() { $('plate').value = data.plate; $('what').value = data.what; $('bought').value = data.bought; }
$('save-car').addEventListener('click', () => {
  data.plate = $('plate').value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim();
  data.what = $('what').value.trim(); data.bought = $('bought').value; save(); drawCar(); drawSteps();
  say(vault ? 'Saved here. Press Save to vault to keep it in the vault too.' : 'Saved in this browser.');
});

// Ask: finds the best matching step by its words. No model, nothing sent.
function find(q) {
  const words = q.toLowerCase().match(/[a-z0-9]+/g) || [];
  let best = null, score = 0;
  for (const s of STEPS) { const hay = (s.k + ' ' + s.t).toLowerCase().split(/\W+/); const sc = words.filter((w) => w.length > 2 && hay.includes(w)).length; if (sc > score) { score = sc; best = s; } }
  return best;
}
$('ask').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('q').value, s = find(q), box = $('answer'); box.hidden = false; box.textContent = '';
  if (!s) { box.textContent = 'I could not match that to a step. Try words like tax, insurance, MOT, V5C or London. If your question is not covered, it is written down on the page of things we cannot do yet.'; return; }
  const st = document.createElement('strong'); st.textContent = s.t + (data.ticks[s.id] ? ' (you have ticked this)' : '');
  box.append(st, ' ' + s.w + ' ');
  if (s.s) { const a = document.createElement('a'); a.href = s.s; a.rel = 'noopener'; a.textContent = s.n; box.append(a); }
});
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SR) {
  $('mic').hidden = false;
  $('mic').addEventListener('click', () => { const r = new SR(); r.lang = 'en-GB'; r.onresult = (ev) => { $('q').value = ev.results[0][0].transcript; $('ask').requestSubmit(); }; r.onerror = () => say('Speech was not available.'); r.start(); say('Listening.'); });
}

// ----- The vault -----
let vault = null, grant = null;
const lib = () => { if (typeof SGVault === 'undefined' || typeof SGSend === 'undefined') throw new Error('the vault library did not load'); return { SGSend, SGVault, SGVaultCrypto }; };
const files = () => [
  { path: 'manifest.json', text: JSON.stringify({ schema: 'car-buyer.vault/1', made_by: location.host }, null, 2) },
  { path: 'car.json', text: JSON.stringify({ plate: data.plate, what: data.what, bought: data.bought }, null, 2) },
  { path: 'steps.json', text: JSON.stringify(data.ticks, null, 2) },
  { path: 'notes.md', text: data.notes || '# Notes\n' }
];
const rand = (n = 24) => { const abc = 'abcdefghijklmnopqrstuvwxyz0123456789', o = []; while (o.length < n) for (const b of crypto.getRandomValues(new Uint8Array(n))) if (b < 252 && o.length < n) o.push(abc[b % 36]); return o.join(''); };
async function writeAll(v, token) {
  v._sgSend.token = token || '';
  try {
    for (const f of files()) {
      const exists = (v.listFolder('/') || []).some((e) => e.name === f.path);
      const bytes = new TextEncoder().encode(f.text);
      if (exists) await v.updateFile('/', f.path, bytes); else await v.addFiles([{ folderPath: '/', fileName: f.path, fileData: bytes }]);
    }
    await v.pushIfMatch();
  } finally { v._sgSend.token = ''; }
}
function show(v) { vault = v; $('save-vault').disabled = !v.writable; $('vstate').textContent = v.writable ? 'Vault open, with write access.' : 'Vault open, read only.'; }

$('mk-key').addEventListener('click', async () => {
  try {
    const id = await identity(); const text = publicQrText(id), qr = qrcode(0, 'M'); qr.addData(text); qr.make();
    $('keyqr').src = qr.createDataURL(4, 8); $('keybox').hidden = false; $('copy-key').onclick = () => navigator.clipboard.writeText(text).then(() => say('Key copied.'), () => say('Could not copy.'));
    say('Your key is made. The private half stays in this browser and cannot be read out of it.');
  } catch (e) { say('Could not make a key: ' + e.message); }
});
async function openCode(text) {
  const id = await existingIdentity(); if (!id) throw new Error('make your key first (step "Send this")');
  let r = await openSealed(id, text, []);
  if (r.needsConfirm) { if (!confirm('This code is not signed by a sender this page knows. Open it only if you brought it yourself. Open it?')) return; r = await openSealed(id, text, [], { carried: true }); }
  grant = r.grant; $('vkey').value = r.vaultKeys[0] ? r.vaultKeys[0].key : '';
  if (grant) $('token').value = grant.token;
  say(`Opened, from ${r.from}.` + (grant ? ' It carried an access token.' : '') + (r.vaultKeys.length ? ' It carried a vault key.' : ''));
}
$('open-sealed').addEventListener('click', () => openCode($('sealed').value.trim()).catch((e) => say(e.message)));
$('qrfile').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const bmp = await createImageBitmap(f), c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height; const x = c.getContext('2d'); x.drawImage(bmp, 0, 0);
    const q = jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height); if (!q) throw new Error('no QR code found in that picture');
    await openCode(q.data);
  } catch (er) { say(er.message); }
});
$('create').addEventListener('click', async () => {
  try {
    const token = $('token').value.trim(); if (!token) throw new Error('paste an access token first');
    const { SGSend, SGVault } = lib(); say('Making the vault, this takes a few seconds.');
    const v = await SGVault.create(new SGSend({ endpoint: ENDPOINT, token }), rand(), { name: 'My car', description: 'A car vault, made by car-buyer.tool.sovereignweb.site' });
    const key = 'sgit_private_' + 'vault_' + v.getVaultKey();
    await writeAll(v, token); $('token').value = ''; show(v);
    const k = $('keyshow'); k.hidden = false; k.textContent = 'Your vault key, shown once. Save it in your password manager now; there is no reset: ' + key;
    say('Vault made and filled.');
  } catch (e) { say('Could not make the vault: ' + e.message); }
});
$('open-vault').addEventListener('click', async () => {
  try {
    const { SGSend, SGVault, SGVaultCrypto } = lib(); const s = $('vkey').value.trim(); if (!s) throw new Error('paste a vault key first');
    const send = new SGSend({ endpoint: ENDPOINT, token: '' }), ro = SGVaultCrypto.parseReadOnlyCredential(s); let v;
    if (ro) { const c = await SGVaultCrypto.deriveReadOnlyCreds(ro.vaultId, ro.readKeyHex); v = await SGVault.openReadOnly(send, c.vaultId, c.readKeyB64, c.refFileId); }
    else v = await SGVault.open(send, SGVaultCrypto.stripKeyPrefix(s), { cloneBranch: 'car-' + rand(6) });
    const dec = new TextDecoder();
    for (const [name, apply] of [['car.json', (j) => Object.assign(data, j)], ['steps.json', (j) => { data.ticks = j; }]]) {
      try { apply(JSON.parse(dec.decode(await v.getFile('/', name)))); } catch (e) { /* not there yet */ }
    }
    save(); drawCar(); drawSteps(); show(v); $('vkey').value = ''; say('Vault opened and read.');
  } catch (e) { say('Could not open the vault: ' + e.message); }
});
$('save-vault').addEventListener('click', async () => {
  const token = $('token').value.trim(); if (!token) { say('Writing needs your access token: paste it above.'); return; }
  try { await writeAll(vault, token); $('token').value = ''; say('Saved to the vault.'); } catch (e) { say('Could not save: ' + e.message); }
});
drawCar(); drawSteps();
