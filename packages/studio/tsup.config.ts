import { defineConfig, type Options } from 'tsup';

const shared: Options = {
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  // dist is cleared by the build script: the two configs below run
  // concurrently and would otherwise delete each other's output.
  clean: false,
  external: ['react', 'react-dom', 'next', 'survey-core', 'survey-react-ui'],
};

export default defineConfig([
  // Client entries. Bundling drops each source file's 'use client', so the
  // directive is restored on the bundle as a banner. Rollup's treeshake pass
  // would strip the banner again; esbuild's own tree shaking still applies.
  {
    ...shared,
    entry: {
      index: 'src/index.ts',
      'form/index': 'src/form/index.ts',
      'score/index': 'src/score/index.ts',
      'match/index': 'src/match/index.ts',
      'reference/index': 'src/reference/index.ts',
    },
    treeshake: false,
    banner: { js: "'use client';" },
  },
  // Server-safe entries: no directive, so Server Components can read their
  // values (a 'use client' module only hands them opaque client references).
  {
    ...shared,
    entry: {
      'orchestrator/index': 'src/orchestrator/index.ts',
      'core/index': 'src/core/index.ts',
      'reference/config': 'src/reference/config/reference-entity-configs.ts',
    },
    treeshake: true,
  },
]);
