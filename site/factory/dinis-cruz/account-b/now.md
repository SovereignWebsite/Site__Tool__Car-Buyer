# Now (2026-11-24T22:12Z)

Area is up. Key published here (b0bff1e). conductor.b (22:13 UTC): it cannot add keys to IaC team/keys.json, and need not; under record 2026-11-24__own-keys-principle the key in this repository is authoritative. If I ever commit in IaC I add my own entry, signed by this key.

## Done (2026-11-24T22:20Z)
- /mycar/ and /not-yet/ built on dev (checks pass locally; Chromium run clean). Vault code is the CRM's pinned copy, untested against the live service (no token).
- Decision request: site/decisions/requests/2026-11-24__car-buyer-my-car-vault.json (link to decisions.b next).

## Done after design.b's brief (162db44)
- My car rebuilt to the brief: plate as a picture, one next step first, done steps folded, honesty line under the question box, vault behind one button, link to /not-yet/. Five treatments in CSS: Forecourt plain, Service book stamps, Dashboard warning lights, Tax disc, Road atlas junctions.
- Still to do from the brief: the other pages in the new looks (the design names in the chooser still say the old ones), the wayfinder, an axe run, security.b review of the vault panel.

## Documents (asked 24 Nov, after the V5C photo)
- Vault panel on /mycar/ has Documents: add a picture or PDF (encrypted in the browser into /documents), list, open here, read text only with the browser's own detector. Untested against the live vault (no token) and untested on Apple devices.
- The photo Dinis sent shows a named private person's address and a document reference number: it is NOT in this repository and must not be. Tests use synthetic data only.
- Still to do: passkey-made vault (copy the CRM's step).
- LIVE at 2026-11-24T22:52Z: My car, documents, /not-yet/. Signer block cleared (Dinis's owner override, 24 Nov; the key file needed bundle.sign). Lesson: run axe locally (node .github/ci/axe.mjs needs playwright and @axe-core/playwright) before every push.
- Next: tell design.b.rounds it is live (done), round 12 fixes, other pages in the new looks, passkey vault, answers from decisions.b.

## Asked by Dinis, not yet done
- More creative designs: the rest of the pages (brief received).
- Apple Intelligence: no web interface known; in /not-yet/.
- Sealed token hand-over: needs the owner to issue tokens (question 1 in the request).

## Open
- Round 12 fixes from sites.b's hand-over, none done yet:
  - checklist junction ranges to match the map (viewing and costs J3 to J4, London J5, paying J6 to J7);
  - desktop map: labels off the roads, drop decorative roads, blobs and grid numbers;
  - Windscreen: a "Check a car" button on its home, and its price card no longer overlapping the windscreen;
  - MOT: button after the table on phones;
  - Forecourt: drawing floats left with a gap on desktop;
  - Road atlas dark mode: lift the dark-blue marks.
- Rating is 3. The next design round runs only on a real change.
- The draft notice stays until Dinis says he has looked.
- Waiting on Dinis (via decisions.b): real photos, or the full map (the hand-over records option b, Road atlas as a map, as decided).

## Notes
- The Factory repository was not readable from this session at start, so the area layout follows the guidance text, not a copy of a.factory's files.

