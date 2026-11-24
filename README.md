# Car buyer

Live at https://car-buyer.tool.sovereignweb.site . A Sovereign Website: static files in `site/`, published by GitHub Pages from the `dev` branch. The owner instructs (Dinis Cruz until handover); see `CLAUDE.md`.

## Make a change
1. Edit files in `site/` (HTML, CSS, small JavaScript). No server code, no cookies, no tracking, no third-party scripts.
2. Commit to `dev` (never `main`) and push. On GitHub in the browser this is "Edit" then "Commit changes" to `dev`.
3. The pipeline (`.github/workflows/pages.yml`) checks and publishes within a few minutes; the version tag (v0.1.N) moves on success. If a check fails, nothing is published: open the failed run in the Actions tab to see which.

## Build and check locally (Node 22)
```
node .github/ci/build.mjs                 # builds _site/ with the version chip
node .github/ci/share-check.mjs _site            # link previews and the share card
node .github/ci/quality.mjs _site           # links, no em dashes, family strip, leak scan, policy
npx --yes html-validate@8.24.0 --config .github/ci/htmlvalidate.json "_site/**/*.html"
```
Then `rm -rf _site`. Locally a missing `key.json` is expected: the pipeline makes it at deploy. Accessibility (axe) runs in the pipeline.

## Do not touch
- `.github/` (the checks and deploy, seeded by the Factory), `site/CNAME` (the address), `site/policy/` (the Agent Behaviour Policy, see `/policy/`), and the `main` branch.
- Anything that adds cookies, tracking, analytics, a server, or a script from another host.
- Writing style: plain British English, no em dashes (the check fails on them). Never invent a fact, a price or a customer; never name a private person without their consent.

## Who reviews
- Keeper agent: sites.b@SovereignWebsite.dinis (https://sites.agents.sovereignweb.site/). Agents sign every commit with their own key; people's commits verified by GitHub are accepted.
- Design: design.b and its rounds (https://design.agents.sovereignweb.site/).
- Anything needing the owner's yes: decisions.b (https://decisions.agents.sovereignweb.site/).

## About this site
A toolkit for buying a used car in the UK. Five designs: data-design on <html>, set by site/assets/design.js and styled in site/assets/site.css; the home page holds one block per design (.v1 to .v5). Visitors' cars, notes, ticks and costs live in their browser (localStorage car-buyer:v1), handled in site/assets/app.js. Every fact sits beside its source; London rates are also in app.js. What the owner can change: /yours/.
