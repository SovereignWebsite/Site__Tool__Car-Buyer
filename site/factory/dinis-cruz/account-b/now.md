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


## Round 13 (2026-11-24T23:03Z)
- design.b.rounds round 13 (7aef897): holds at 3, M3. Fault: question box 549 px on a 390 px phone. Fixed (358 px, no sideways scroll in five designs, light and dark). First screens made each design's own (cover, dash, windscreen, road). Added site/factory/index.json.
- Still to do: round 12 fixes, other pages in the new looks, passkey vault.

## Check-back on 1fecc1e (2026-11-24T23:06Z)
- design.b.rounds (9701360): no sideways scroll, axe clean, factory index answers. Holds at 3. Plates now in each idea's frame. Still shared across designs: heading, intro, draft notice, and the Next card. Next ask: the idea into the Next card and heading, Road atlas furthest. Round 14 when the other pages are rebuilt.

## Naming model (2026-11-25T17:21Z)
- sites.b, passing on conductor.b (25 Nov 17:21 UTC): Dinis agreed a new naming model (Site__Agent__Maestro, site/factory/dinis-cruz/account-a/notes/2026-11-25-naming-model.md). It is incremental. Do NOT rename this agent, its key file (site/keys/b.site.car-buyer.json) or its trailers (Agent: b.site.car-buyer@SWS) until my step is announced.

## Lessons from the Lee-Elle keeper (2026-11-25T18:48Z)
Source: Site__Artist__Lee-Elle-Horowitz, site/factory/dinis-cruz/account-b/learnings.md (Dinis's feedback, 25 Nov), passed on by maestro.b. What fits Car buyer:
- Done: 13, phone-width axe in light and dark in all five designs, plus a sideways-scroll check: bash tools/checks/axe-phone.sh (140 page views, 0 problems). Run it before every push, with tools/check.sh.
- To do, in order of value: 1 (content in JSON: the My car steps are in mycar.js, the pages' words are in the HTML); 6 and 7 (one "Choose a design" button with real screenshots, one-line top bar: today a select at the foot and /designs/); 5 (wow, owner's photo on the first screen: needs Dinis's choice of real photos); 8 (admin area like Kate's: /admin/ is the seeded page); 9 to 11 (a guided-tour presentation with a PDF, named for sharing).
- Not for this site: 2 and 3 (translations, language switch) until Dinis names a second language. 4 (stand-in photos) waits on the same photo decision.
