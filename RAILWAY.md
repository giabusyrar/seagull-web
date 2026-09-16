# Railway — Seagull Web

## Railway does not build from GitLab

Verified against the live project on 2026-09-16: every code service in the
Railway project `experience-gateway` (environment `production`) builds from the
**GitHub** repository `giabusyrar/seagull`, branch `master` — not from the
GitLab remotes. Splitting the GitLab repositories therefore changes nothing on
Railway by itself. Each service has to be repointed at a new source, and that
source has to be a repository Railway can see.

Postgres, Redis, ClickHouse Log and etcd are not built from a repository and are
untouched by the split. **They stay shared across all three repositories.**

## The service that belongs to this repository

| Railway service | Dockerfile path today | Path after repointing here |
|---|---|---|
| Frontend | `/apps/web/Dockerfile` | unchanged |

It serves `experience-gateway.up.railway.app`. Only the source repository
changes.

## One new build variable is required

`apps/web/Dockerfile` now installs `@gateway-experience/contracts` from
GitLab's package registry. The deps stage declares `ARG GITLAB_NPM_TOKEN`, and
Railway passes a variable into a Docker build **only when it is declared as an
ARG** — which it now is. Set `GITLAB_NPM_TOKEN` as a service variable to a token
with `read_api`, and put the publishing project's numeric ID into `.npmrc`.

Without it the build fails at `npm ci`. That is intended: the alternative is a
build that silently resolves nothing.

## Do not repoint this service before the lockfile exists

`npm ci` needs `package-lock.json`, which cannot be generated until the
contracts package has been published once. See `README.md`. Repointing the
Frontend service before then guarantees a failed deploy.

## Existing build variables are unchanged

The gateway URLs are resolved at **build** time — see the ARG block in
`apps/web/Dockerfile`.
