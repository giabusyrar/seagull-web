# The database was not split

Seagull was split into three repositories. **Postgres was not.**

`gateway-engine` (Seagull-gateway), `core-engine` and `reference-service`
(Seagull-core) each call GORM `AutoMigrate` on startup against the same
`DATABASE_URL`. Before the split, one `go test ./...` and one code review saw
every model at once. Now they do not.

## What this means in practice

- **A model change in one repo can break the other.** `AutoMigrate` adds columns
  and indexes; it does not drop or rename. Two repos adding a differently-typed
  column with the same name on the same table is the failure this document
  exists to prevent.
- **Table ownership is by repo, and it is not enforced by anything.** Nothing in
  Postgres stops core-engine from migrating a gateway table. The only protection
  is that you read this first.
- **Deploy order matters when a contract changes.** A reader deployed before the
  writer that creates its column will fail at query time, not at startup.

## Before changing any GORM model

1. Find which repo owns the table. Run `AutoMigrate` lists in both repos:
   - Seagull-gateway: `apps/gateway-engine/cmd/server/main.go`, `apps/gateway-engine/api/index.go`
   - Seagull-core: `apps/core-engine/cmd/server/main.go`, `apps/services/reference/cmd/server/main.go`
2. If the table is owned by the other repo, raise it there. Do not add the column
   from your side because `AutoMigrate` will happily let you.
3. If the change crosses both, land the additive migration first, deploy both,
   then land the code that depends on it.

## If you want this to stop being a hazard

The durable fix is to take migrations away from `AutoMigrate` and give them to a
single versioned migration tool with one owner. That is a separate piece of work
and it is not done. Until it is, this document is the whole protection.
