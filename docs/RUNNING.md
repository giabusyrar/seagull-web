# Running the dashboard

The dashboard runs on your machine. It is not deployed from this repository.

(It used to be built by Railway from the GitHub mirror `giabusyrar/seagull`;
that is no longer how it is run, and this file replaces the Railway notes.
`apps/web/Dockerfile` is kept for whenever a container build is wanted again —
see "If the dashboard is containerised again" at the bottom.)

## What has to be running

| Piece | Where it comes from | Default address |
|---|---|---|
| gateway-engine | Seagull-gateway | `:8081` locally, `gw.<host>` deployed |
| data plane | Seagull-gateway — gateway-proxy locally, APISIX deployed | `:8080` locally, `api.<host>` deployed |
| core-engine | Seagull-core | `:8082` |
| reference-service | Seagull-core | `:8086` |
| vision ai-worker | Seagull-core | `:8088` |

Ports are global across the three repositories — see [PORTS.md](PORTS.md)
before starting anything.

The dashboard does not need all of them to boot; it needs gateway-engine to log
in, and each feature needs whichever service it calls.

## Setup

```bash
cp apps/web/.env.example apps/web/.env.local   # then fill in the two secrets
npm install
npm run dev                                    # :3000
```

`ENCRYPTION_KEY` must be the same value the gateway uses, and `REDIS_URL` the
same Upstash instance — each is documented in `.env.example`.

### Contracts, without the package registry

`npm install` resolves `@gateway-experience/contracts` from GitLab's package
registry and needs `GITLAB_NPM_TOKEN` (see [../README.md](../README.md)). To
work from a local Seagull-gateway checkout instead:

```bash
npm run contracts:local
```

It builds the contracts package in the sibling checkout and copies it into
`node_modules`, leaving every tracked file alone. Re-run it after any
`npm install`, and after a contract change on the gateway side.

## Pointing at a deployed gateway

To run the dashboard locally against a gateway on a VPS, set the gateway pair
in `apps/web/.env.local` to the Caddy hostnames and leave the core services on
`127.0.0.1`:

```
GATEWAY_ENGINE_URL=https://gw.<PUBLIC_HOST>
NEXT_PUBLIC_GATEWAY_ENGINE_URL=https://gw.<PUBLIC_HOST>
GATEWAY_PROXY_URL=https://api.<PUBLIC_HOST>
NEXT_PUBLIC_GATEWAY_PROXY_URL=https://api.<PUBLIC_HOST>
```

`PUBLIC_HOST` is set in the gateway's root `.env` **on the VPS** — it is not in
any checkout. See Seagull-gateway `docs/DEPLOY-SUMOPOD.md` for how that
deployment is put together.

`NEXT_PUBLIC_*` values are inlined at build time, so restart the dev server
after changing them.

## If the dashboard is containerised again

`apps/web/Dockerfile` runs `npm ci`, which needs a `package-lock.json` — and
that lockfile must not be the one `npm run contracts:local` situations produce.
A lockfile written while `packages/beauty-sdk` points at a `file:` path resolves
only on the machine that made it, and the path lies outside any build context,
so `npm ci` fails inside the image. Publish the contracts package first, install
against the registry, and commit that lockfile. The gateway URLs are build-time
`ARG`s in the Dockerfile, not runtime variables.
