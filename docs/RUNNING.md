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
| core-engine | Seagull-core | never called directly: through the data plane, `/core/<module>/...` |
| reference-service | Seagull-core | behind the gateway's `/reference` |
| worker-skin | Seagull-core | `:8088` |
| worker-models (registry, dispatch) | Seagull-core | `:8096` |

Ports are global across the three repositories — see [PORTS.md](PORTS.md)
before starting anything.

The dashboard does not need all of them to boot; it needs gateway-engine to log
in, and each feature needs whichever service it calls.

## Setup

```bash
cp apps/web/.env.example apps/web/.env.local   # then fill in the two secrets
npm install
npm run dev                                    # web :3000 + simulator :3200 (npm run dev:web for web only)
```

`ENCRYPTION_KEY` must be the same value the gateway uses, and `REDIS_URL` the
same Upstash instance — each is documented in `.env.example`.

## Pointing at a deployed gateway

To run the dashboard locally against a gateway on a VPS, set the gateway pair
in `apps/web/.env.local` to the Caddy hostnames. Both core-engine and
reference-service are then reached through APISIX — `/core/<module>/...` and
`/reference/<entity>` — so neither needs anything local. Only the Python
workers' own entries remain, for the paths that still address them directly:

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

`apps/web/Dockerfile` runs `npm ci` against the committed `package-lock.json`,
and needs nothing private: the one package that did, `@gateway-experience/
contracts`, was dropped on 2026-10-01. The gateway URLs are build-time `ARG`s
in the Dockerfile, not runtime variables.
