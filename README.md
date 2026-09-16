# Seagull Web

The Next.js dashboard and the brand-facing SDK. Split out of the `Seagull`
monorepo; see [docs/SPLIT.md](docs/SPLIT.md) for what moved where.

## What is in here

| Path | Port | What it is |
|------|------|------------|
| `apps/web/` | 3000 | Next.js 16 dashboard. Proxies `/core/*` to the gateway data plane. |
| `packages/beauty-sdk/` | — | `@gateway-experience/beauty-sdk` — studio UI, hooks and the API client. |
| `packages/shared/` | — | `@gateway-experience/shared` — shared UI primitives and utilities. |

## Before your first install

`packages/beauty-sdk` depends on `@gateway-experience/contracts`, which is
**published from the Seagull-gateway repo**, not built here. Resolving it needs
two things:

1. `.npmrc` — replace `REPLACE_ME_GITLAB_PROJECT_ID` with the numeric project ID
   of the GitLab project that publishes the package.
2. `GITLAB_NPM_TOKEN` in your environment — `CI_JOB_TOKEN` in CI, a personal
   access token with `read_api` locally.

Until the contracts package has been published at least once, `npm install`
will fail on that dependency. To work locally against an unpublished change,
point npm at the gateway checkout instead:

```bash
npm install ../Seagull-gateway/packages/contracts --workspace=packages/beauty-sdk
```

Do not commit that; it writes a `file:` path into the lockfile.

## There is no package-lock.json yet, and that is deliberate

`apps/web/Dockerfile` runs `npm ci`, which requires a lockfile — so **the Docker
build cannot succeed until one exists**. A lockfile cannot be generated honestly
until `@gateway-experience/contracts` has been published at least once: locking
it against a local `file:` path would produce a lockfile that only resolves on
the machine that made it.

The order is therefore:

1. In Seagull-gateway: `make publish-contracts`.
2. Here: put the publishing project ID in `.npmrc`, set `GITLAB_NPM_TOKEN`.
3. `npm install` — this writes `package-lock.json`.
4. Commit the lockfile. The Docker build works from this point on.

## Running it

```bash
npm install
npm run build     # packages, then the Next.js build
npm run dev       # :3000
```

## Things that cross repository boundaries

- **Assessment types come from the gateway.** `Contracts` re-exported from the
  SDK is the published package, generated from gateway-engine's Go structs. A
  contract change must be published there before it can be consumed here.
- **The dashboard talks to services this repo does not contain.** The gateway
  URLs are resolved at Next.js **build** time — see the `ARG` block in
  `apps/web/Dockerfile`.
- **Ports are global.** See [docs/PORTS.md](docs/PORTS.md).
