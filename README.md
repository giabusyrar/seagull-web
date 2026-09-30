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
will fail on that dependency. To work from a local Seagull-gateway checkout
instead:

```bash
npm run contracts:local
```

It builds the contracts package there and copies it into `node_modules`, so no
tracked file changes. Re-run it after any `npm install` — which wipes it — and
after a contract change on the gateway side. Point it elsewhere with
`SEAGULL_GATEWAY_PATH`; it defaults to `../seagull-gateway`.

Do **not** install that path as a dependency instead
(`npm install ../seagull-gateway/packages/contracts`): it writes a `file:` path
into `packages/beauty-sdk/package.json` and the lockfile, neither of which can
be committed — the path resolves on one machine only, and it points outside any
Docker build context.

## There is no package-lock.json yet, and that is deliberate

A lockfile cannot be generated honestly until `@gateway-experience/contracts`
has been published at least once: locking it against a local `file:` path would
produce a lockfile that only resolves on the machine that made it. It also
matters for any container build — `apps/web/Dockerfile` runs `npm ci`, which
requires a lockfile.

The order is therefore:

1. In Seagull-gateway: `make publish-contracts`.
2. Here: put the publishing project ID in `.npmrc`, set `GITLAB_NPM_TOKEN`.
3. `npm install` — this writes `package-lock.json`.
4. Commit the lockfile.

Without a lockfile, Turbopack cannot infer the workspace root on its own, so
`apps/web/next.config.ts` pins `turbopack.root` explicitly.

## Running it

```bash
cp apps/web/.env.example apps/web/.env.local   # then fill in the two secrets
npm install
npm run build     # packages, then the Next.js build
npm run dev       # :3000
```

The dashboard talks to services this repo does not contain, and which services
have to be up depends on what you are doing — see [docs/RUNNING.md](docs/RUNNING.md),
including how to run locally against a deployed gateway.

## Things that cross repository boundaries

- **Assessment types come from the gateway.** `Contracts` re-exported from the
  SDK is the published package, generated from gateway-engine's Go structs. A
  contract change must be published there before it can be consumed here.
- **The dashboard talks to services this repo does not contain.** Their
  addresses come from `apps/web/.env.local` — start from
  [apps/web/.env.example](apps/web/.env.example). `NEXT_PUBLIC_*` values are
  inlined at build time, so a change needs a restart (and in a container build
  they are `ARG`s — see `apps/web/Dockerfile`).
- **Ports are global.** See [docs/PORTS.md](docs/PORTS.md).
