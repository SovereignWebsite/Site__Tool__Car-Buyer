# Restart: how a new session takes over

1. Read CLAUDE.md and README.md, then agent.json, now.md and role.md in this folder.
2. Check git log on dev and the open items in now.md.
3. Keys: the private halves lived only in the previous session and are not in the repository. A new session makes its own keys (sgit pki keygen --label b.site.car-buyer@SWS, plus an SSH key for git), publishes the public half in a commit of its own, replaces the fingerprints in agent.json and asks conductor.b to update the Factory's team/keys.json.
4. Sign every commit; trailers Agent: and Claude-Session:. Push to dev only.
5. Update agent.json and now.md in the same commit as your status.

Contacts: sites.b (session_01Kw9UwBucXVUaNYRMcWwk67), conductor.b (session_01Kw9UwFkKH5CkDmV8nhSfUD), design.b (session_01Kw9UwCvZbGkWo3D9DEpRMv), design.b.rounds (session_01Kw9UwFCJTPWFaTq4TX5vUT), hub.b (session_01Kw9UwB7XboTsnbPPWaMr2d), decisions.b (session_01Kw9UwEVSYcMDgNqrPVfCtZ).
