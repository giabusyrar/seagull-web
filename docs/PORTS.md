# Ports are global across the three repositories

Splitting the repositories did not give each one its own port space. Two
services from two repos still collide on the same machine.

| Port | Service | Repository |
|------|---------|------------|
| 3000 | web (Next.js) | Seagull-web |
| 3100 | next-brand example (dev only) | Seagull-web |
| 3200 | simulator (`apps/simulator`, dev only) | Seagull-web |
| 8080 | gateway-proxy | Seagull-gateway |
| 8081 | gateway-engine | Seagull-gateway |
| 8082 | core-engine | Seagull-core |
| 8086 | reference-service | Seagull-core — reached through the gateway, not directly |
| 8088 | worker-skin (was vision-ai-worker) | Seagull-core |
| 8090 | worker-tryon | Seagull-core |
| 8092 | worker-colour | Seagull-core |
| 8094 | worker-face | Seagull-core |
| 8096 | **retired 2026-10-03 (model registry removed)** worker-models | Seagull-core |
| 9080 | APISIX (data plane) | Seagull-gateway |
| 9180 | APISIX (Admin API) | Seagull-gateway |
| 2379 | etcd | Seagull-gateway |
| 5432 | Postgres | Seagull-gateway (`docker-compose.infra.yml`) |
| 6379 | Redis | Seagull-gateway (`docker-compose.infra.yml`) |
| 8123, 9000 | ClickHouse | Seagull-gateway (`docker-compose.infra.yml`) |

Backing services are defined once, in Seagull-gateway's
`docker-compose.infra.yml`, and both service composes attach to the `seagull`
Docker network it creates. Start infra first.
