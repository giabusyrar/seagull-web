# Seagull Web

The Next.js dashboard and the brand-facing SDK. Split out of the `Seagull`
monorepo; see [docs/SPLIT.md](docs/SPLIT.md) for what moved where.

## What is in here

| Path | Port | What it is |
|------|------|------------|
| `apps/web/` | 3000 | Next.js 16 dashboard. Proxies `/core/*` to the gateway data plane. |
| `apps/simulator/` | 3200 | One-page photo simulator calling core-engine and reference-service directly (no gateway). `npm run dev` (with web) or `npm run dev:simulator`. See [apps/simulator/README.md](apps/simulator/README.md). |
| `packages/beauty-sdk/` | — | `@gateway-experience/beauty-sdk` — studio UI, hooks and the API client. |
| `packages/shared/` | — | `@gateway-experience/shared` — shared UI primitives and utilities. |

## Installing

```bash
npm install
```

Nothing private is needed any more: no `.npmrc`, no `GITLAB_NPM_TOKEN`, no
registry setup. `packages/beauty-sdk` used to depend on
`@gateway-experience/contracts`, published from the Seagull-gateway repo, and
that one package is what made installing here a two-step affair. The gateway
emptied it on 2026-10-01 when assessments moved to core-engine, so the
dependency was dropped; the assessment shapes the SDK needs now live in
`packages/beauty-sdk/src/core/assessment-types.ts`.

`package-lock.json` is committed, so `npm ci` — and therefore
`apps/web/Dockerfile` — works. Keep it in step with any dependency change.

If a cross-repo contract package returns, add it back deliberately: a
dependency, its registry configuration and the token it needs, documented
together.

## Running it

```bash
cp apps/web/.env.example apps/web/.env.local   # then fill in the two secrets
npm install
npm run build     # packages, then the Next.js build
npm run dev       # web :3000 + simulator :3200 (dev:web / dev:simulator for one)
```

The dashboard talks to services this repo does not contain, and which services
have to be up depends on what you are doing — see [docs/RUNNING.md](docs/RUNNING.md),
including how to run locally against a deployed gateway.

The camera check on `/colour-analysis` needs two `NEXT_PUBLIC_*` variables and
two local files; without them the camera works unchecked. See
[docs/CAPTURE-CHECK.md](docs/CAPTURE-CHECK.md).

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
