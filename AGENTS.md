# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all
differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Seagull Web

The Next.js dashboard (`apps/web`) and the brand-facing packages
(`beauty-sdk`, `shared`). One of three repos split out of the `Seagull`
monorepo — see `docs/SPLIT.md`.

# What lives in the other two repositories

- **Seagull-gateway** — gateway-proxy, gateway-engine, APISIX, and the
  `@gateway-experience/contracts` package this repo installs.
- **Seagull-core** — core-engine, reference-service, the Python AI workers.

A bug you find there is reported there, not fixed from here.

# The coupling that survived the split

**Assessment types are not defined here.** `@gateway-experience/contracts` is
generated from Go structs in Seagull-gateway and published to GitLab's package
registry. To change a contract you change it there, publish, and bump the
dependency here. `npm install` needs `.npmrc` pointed at the right project ID
and `GITLAB_NPM_TOKEN` set — see `README.md`.

# Git Actions Restriction
- **Do NOT execute git push**: Pushing changes to remote repositories is strictly reserved for the USER. You are only permitted to stage (`git add`) and commit (`git commit`) changes locally. Do not run any commands that push commits to a remote server.

# Workflow Directive for Small Fixes
- **No unnecessary planning for small fixes**: For small fixes, minor UI tweaks, bug fixes, or quick follow-ups, do NOT create design spec documents or implementation plan documents, and do NOT prompt the user to choose between subagent vs inline execution. Execute small fixes directly, verify them, and report the results immediately.
- **No automatic git add or git commit for small fixes**: Do NOT run `git add` or `git commit` automatically after small fixes or UI tweaks. Leave modified files uncommitted in the working tree so the user can review them.

# Parallel Sessions

Multiple sessions may run against this working folder at once. Claim a lane in
`docs/LANES.md` before editing, and release it by deleting your row. Each rule
below was written after the failure it prevents actually happened.

- **Claim a lane before editing.** Add a row with your session name, its `[ref]`,
  the paths you will touch, and the time. Never edit outside your lane.
- **The claims table is exempt from lane ownership.** Any session may append or
  remove its own row. Never edit another session's row.
- **Address sessions by `[ref]`, not name — but only within a run.** Refs are NOT
  stable across restarts. If a send fails, re-run `ListAgents` before assuming a
  peer exited.
- **Prior possession wins.** A lane belongs to whoever was already doing the
  work, not whoever wrote the row first.
- **Single dev-server owner.** Ports are global across ALL THREE repositories,
  not just this one — see `docs/PORTS.md`. A launch entry in
  `.claude/launch.json` is not permission to use a port.
- **Check timestamps before believing tool output.** A stale generated artifact
  and a real error are indistinguishable. Compare mtimes and re-run rather than
  trusting an earlier run.
- **Check before executing a destructive instruction.** The check is cheap.
  Keep it cheap.

# Ground Rules

## Do not hardcode

Anything that varies by environment, deployment, tenant or data belongs in
config, env or the database: hosts, ports, URLs, credentials, model names and
versions, capability codes, dimension keys, thresholds, severity bands, cutoffs.

**If a change genuinely needs a literal, stop and tell the user before writing
it** — what the value is, why no config source exists, and what making it
configurable would take. A magic number nobody flagged is how this codebase once
ended up reporting invented dimension scores and ungrounded 25/50/75 severity
bands as measurements.

Where a literal is unavoidable it must be named, documented with its source, and
defined once — never repeated at call sites.

### What this rule does not cover

A constant describing the world rather than a choice is not a hardcode. Physical
constants, published measurement scales and standards-defined thresholds do not
vary by deployment, and making them configurable is worse than fixing them: it
lets a deployment redefine what a word means. The CIEDE2000 perceptibility bands
(JND 1.0, close-inspection 2.0, at-a-glance 5.0) are properties of human vision.

The test is not "is it a number" but **"could two correct deployments disagree
about it"**. A tolerance a brand might set is policy and belongs in config; a
perceptibility band a brand might cite is a fact and belongs in code, named and
sourced. Where a policy value derives from such a fact, pin them together in a
test so the derivation cannot drift unnoticed.

## A placeholder must be distinguishable from the real thing

A stand-in that cannot be told apart from a measurement is a defect, not a
stopgap. The failure is never the wrong value — it is that the reader, or the
user, has no way to know they are looking at one.

If you need a stand-in, make it announce itself: a name nobody could mistake for
real, a field saying it is simulated, or an error instead of a value. If you
cannot make it announce itself, return nothing and let the caller handle the
absence — an empty panel that says why is better than a full one that lies.

The same applies to comments and descriptions. A comment claiming a protection
the code does not provide is the same defect as a fabricated number.

## Do not duplicate work

Read `docs/LANES.md` before starting. Check for an existing helper, type or
endpoint before writing another.
