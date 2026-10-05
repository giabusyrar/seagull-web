/**
 * core-engine's dry-run request header (seagull-core internal/dryrun): with
 * it set to "true", core scores and analyses without storing anything or
 * needing a customer id, and marks its answer `dry_run: true`.
 */
export const DRY_RUN_HEADER = 'X-Dry-Run';
