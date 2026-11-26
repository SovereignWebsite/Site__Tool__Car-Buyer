# Restart: how a new session takes over

1. Read CLAUDE.md and README.md, then agent.json, now.md and role.md in this folder.
2. Check git log on dev and the open items in now.md.
3. Keys: the private halves lived only in the previous session and are not in the repository. A new session makes its own keys (sgit pki keygen --label b.site.car-buyer@SWS, plus an SSH key for git), publishes the public half at site/keys/<name>.json (shape: agent, session, status, bundle{encrypt,sign,...}; bundle.sign must be the key that signs commits, an ECDSA P-256 key) alone in its own commit, and replaces the fingerprints in agent.json. Do not ask conductor.b to add it to team/keys.json: the key published in this repository is authoritative (record 2026-11-24__own-keys-principle; sites.b's correction of 25 Nov). A replacement of an existing key file needs an owner override line in the commit message. Before every push run the pipeline's own checks locally, including axe.
4. Sign every commit; trailers Agent: and Claude-Session:. Push to dev only.
5. Update agent.json and now.md in the same commit as your status.

Contacts: sites.b (session_01Kw9UwBucXVUaNYRMcWwk67), conductor.b (session_01Kw9UwFkKH5CkDmV8nhSfUD), design.b (session_01Kw9UwCvZbGkWo3D9DEpRMv), design.b.rounds (session_01Kw9UwFCJTPWFaTq4TX5vUT), hub.b (session_01Kw9UwB7XboTsnbPPWaMr2d), decisions.b (session_01Kw9UwEVSYcMDgNqrPVfCtZ).

Naming: keep the name b.site.car-buyer@SWS, the key file name and the Agent: trailer as they are until sites.b announces this agent's step of the naming model (25 Nov 2026).

Before every push: bash tools/check.sh, and bash tools/checks/axe-phone.sh (390 px, light and dark, five designs, no sideways scroll).

Insurance page: edit site/data/insurance.json, then node tools/build-insurance.mjs (it writes site/insurance/index.html). Every fact needs a source and a read date.

b.security: session_01Kw9UwBQqeQAymiagw8BjRY (reviews the vault panel and the Insurance section).
