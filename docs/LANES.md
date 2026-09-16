# Session Lanes

Coordination table for parallel sessions in this repository.
Protocol: `AGENTS.md` → "Parallel Sessions".

Claim a lane by adding your row before you edit anything. Release it by deleting
your row. Get your session name and `[ref]` from `ListAgents`. Refs change on
restart — treat a row from an earlier run as a record of intent, not a live
address, and re-establish contact before assuming a lane is still held.

## Active claims

| Lane | Session | Paths owned | Claimed |
|------|---------|-------------|---------|

> The claims table is exempt from lane ownership: append or remove your own row
> freely, never anyone else's.

## Lane map

| Lane | Paths |
|------|-------|
| `web` | `apps/web/` |
| `sdk` | `packages/beauty-sdk/` |
| `shared` | `packages/shared/`. Every lane consumes it — notify active peers before a change lands. |
| `docs` | `*.md`, `docs/` |

## Exclusive lanes

One holder each, repo-wide.

| Lane | Grants |
|------|--------|
| `git` | `checkout`, `switch`, `stash`, `reset`, `restore`, `merge`, `rebase`, `clean`. Never `push`. |
| `runtime` | Starting dev servers. **Ports are global across all three Seagull repositories** — see `docs/PORTS.md`. |
