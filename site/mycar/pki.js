// Copied from crm.tool.sovereignweb.site (app/pki.js, Apache-2.0, by cell.email@AgentiCCells.dinis), with the browser database and label renamed for Car buyer.
// The page's own key pair, and secrets kept sealed to it. Approved by Dinis Cruz, 16 November
// 2026 ("yes"; and "can't you store the vault key safely ... encrypted so that only the session
// with the private key ... can read it").
//
// - The key pair is made in this browser with WebCrypto, in sgit pki's shape (RSA-OAEP 4096 to
//   encrypt, ECDSA P-256 to sign), with the private halves NOT extractable: the page can use them,
//   but neither the page nor anything else can read or export their bytes. They are kept in this
//   browser's IndexedDB, so they survive a reload. Clearing the site's data deletes them.
// - The public half is shown as a pki.sgit.ai k1 code (and QR code), for someone to seal to.
// - A sealed m1 code (from pki.sgit.ai or sgit pki) is opened with the private key; a signature is
//   checked against the trusted senders pinned in trusted.js (built from team/keys/).
// - Vault keys are kept sealed to the page's own public key, so the stored bytes are ciphertext
//   that only this browser's private key opens.
// The format code is pki.sgit.ai's own (vendor/pki/v0.2.28, unedited). unsealWith below mirrors
// keys.js unseal, taking a CryptoKey because the private key here has no exportable bytes.
// By cell.email@AgentiCCells.dinis, 2026-11-16. Apache-2.0.
import { bundleOf, seal, parseEnvelope, unb64, verifyBytes, RSA_GEN, EC } from './vendor/pki/v0.2.28/keys.js?v=2b2f4c9';
import { keyCode, parseQrText, parseCode, verifyMessage, problems, KIND } from './vendor/pki/v0.2.28/message.js?v=2b2f4c9';

// Vault keys in text, with or without sgit's prefix. (message.js vaultKeysIn v0.2.28 misses the
// prefixed form: its \b after "vault_" cannot match between "_" and the passphrase.)
const PREFIX = 'sgit_private_' + 'vault_';
export function findVaultKeys(text) {
  const re = new RegExp('(?:' + PREFIX + ')?(?<![a-z0-9])([a-z0-9]{16,64}):([a-z0-9]{6,32})(?![a-z0-9])', 'g');
  const out = [], seen = new Set();
  for (const m of String(text || '').matchAll(re)) if (!seen.has(m[2])) { seen.add(m[2]); out.push({ id: m[2], key: PREFIX + m[1] + ':' + m[2] }); }
  return out;
}

const DB = 'car-buyer-mycar', STORE = 'keys', IDENTITY = 'page-identity';
const subtle = () => crypto.subtle;

function db() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function idb(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
  });
}
const get = (k) => idb('readonly', (s) => s.get(k));
const put = (k, v) => idb('readwrite', (s) => s.put(v, k));
const del = (k) => idb('readwrite', (s) => s.delete(k));

// The identity if this browser already has one, without making one.
export async function existingIdentity() { const have = await get(IDENTITY).catch(() => null); return have?.bundle && have.encrypt && have.sign ? have : null; }

// The page's identity: { bundle, encrypt: CryptoKey (private, not extractable), sign: CryptoKey }.
export async function identity(label = 'Car buyer page, ' + location.host) {
  const have = await get(IDENTITY);
  if (have?.bundle && have.encrypt && have.sign) return have;
  const enc = await subtle().generateKey(RSA_GEN, false, ['encrypt', 'decrypt']);
  const sig = await subtle().generateKey(EC, false, ['sign', 'verify']);
  const encSpki = new Uint8Array(await subtle().exportKey('spki', enc.publicKey));
  const sigSpki = new Uint8Array(await subtle().exportKey('spki', sig.publicKey));
  const id = { bundle: await bundleOf(encSpki, sigSpki, label), encrypt: enc.privateKey, sign: sig.privateKey, created: new Date().toISOString() };
  await put(IDENTITY, id);
  return id;
}

export const publicCode = (id) => keyCode(id.bundle).code;
// The strict JSON pki.sgit.ai puts in a QR code for agents: { v, kind: qr/key/v1, fp, label, code }.
export const publicQrText = (id) => JSON.stringify({ v: 1, kind: 'pki.sgit.ai/qr/key/v1', fp: id.bundle.signing_fingerprint, label: String(id.bundle.label).slice(0, 80), code: publicCode(id) });

// keys.js unseal, with the private key as a CryptoKey.
export async function unsealWith(privateKey, enc, signerBundles = []) {
  const env = parseEnvelope(enc);
  let raw;
  try { raw = await subtle().decrypt({ name: 'RSA-OAEP' }, privateKey, unb64(env.w)); } catch { throw new Error('not sealed to this page\'s key'); }
  const aes = await subtle().importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
  let bytes;
  try { bytes = new Uint8Array(await subtle().decrypt({ name: 'AES-GCM', iv: unb64(env.i), tagLength: 128 }, aes, unb64(env.c))); }
  catch { throw new Error('changed on the way: the ciphertext does not check'); }
  const out = { bytes, text: null, signed: !!(env.s && env.f), signer: env.f || null, verified: null };
  try { out.text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { out.text = null; }
  if (out.signed) {
    const b = signerBundles.find((x) => x && x.signing_fingerprint === env.f);
    if (b) out.verified = await verifyBytes(b.sign, unb64(env.s), unb64(env.c));
  }
  return out;
}

// Open a sealed code (m1 text, a pki.sgit.ai link, or the QR JSON) with the page's key. A message
// signed by a trusted sender opens. An unsigned one, or one signed by a key the page does not
// know, opens only with { carried: true }: the person confirms they brought the code themselves
// (Dinis, 16 November 2026: "I'm acting like that sender by copying and pasting the QR codes").
// Returns { from, msg, vaultKeys: [{ id, key }], grant }, or { needsConfirm, signer }.
export async function openSealed(id, text, trusted, { carried = false } = {}) {
  const q = parseQrText(text);
  if (q.kind !== 'sealed') throw new Error('that is a public key, not a sealed message');
  const c = parseCode(q.code);
  if (c.to !== id.bundle.signing_fingerprint) throw new Error('sealed to another key, not this page\'s');
  const signer = trusted.find((t) => t.bundle.signing_fingerprint === c.signer);
  if (!signer && !carried) return { needsConfirm: true, signer: c.signer || null };
  const opened = await unsealWith(id.encrypt, c.enc, signer ? [signer.bundle] : []);
  if (signer && opened.verified !== true) throw new Error('the envelope\'s signature does not check');
  let msg = null;
  try { msg = JSON.parse(opened.text); } catch { /* sealed with sgit pki encrypt: plain text */ }
  if (msg && msg.kind === KIND) {
    const p = problems(msg, [id.bundle.signing_fingerprint]);
    if (p.length) throw new Error(p.join('; '));
    if (signer && msg.sig && (await verifyMessage(msg, signer.bundle)) !== true) throw new Error('the message\'s signature does not check');
  }
  const body = msg && msg.kind === KIND ? [msg.text, ...(msg.files || []).filter((f) => /^text\//.test(f.type)).map((f) => atob(f.data))].join('\n') : opened.text || '';
  // An SG/Send access token, handed over in pki.sgit.ai's grant field, for the vault service only.
  const g = msg && msg.kind === KIND && msg.grant;
  const grant = g && g.service === 'sg-send' && typeof g.token === 'string' && /^https:\/\/dev\.send\.sgraph\.ai\/?$/.test(g.endpoint || 'https://dev.send.sgraph.ai') ? { token: g.token, name: g.name || '' } : null;
  return { from: signer ? signer.label + ', signature checked' : 'a code you brought yourself (not signed by a trusted sender)', msg, vaultKeys: findVaultKeys(body), grant };
}

// Secrets kept sealed to the page's own key, under a name (for example "vault:outbox").
export async function keep(id, name, secret) { await put('secret:' + name, { enc: await seal(id.bundle, String(secret)), saved: new Date().toISOString() }); }
export async function recall(id, name) {
  const s = await get('secret:' + name);
  if (!s) return null;
  return (await unsealWith(id.encrypt, s.enc)).text;
}
export const forget = (name) => del('secret:' + name);
export async function kept(name) { return !!(await get('secret:' + name)); }

// A key-value store for vendored code that wants one (pki.sgit.ai's sso.js, which defaults to the
// browser's plain web storage): held in memory, and kept at rest only sealed to the page's key,
// under one name. flush() waits until the last change is kept.
export async function sealedStore(id, name) {
  const map = JSON.parse((await recall(id, name).catch(() => null)) || '{}');
  let pending = Promise.resolve();
  const save = () => { pending = pending.then(() => keep(id, name, JSON.stringify(map))).catch(() => {}); };
  return {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null),
    setItem: (k, v) => { map[k] = String(v); save(); },
    removeItem: (k) => { delete map[k]; save(); },
    flush: () => pending,
  };
}
