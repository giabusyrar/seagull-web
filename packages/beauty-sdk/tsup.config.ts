import { defineConfig } from 'tsup';

const shared = {
  format: ['esm', 'cjs'] as ('esm' | 'cjs')[],
  dts: true,
  splitting: false,
  sourcemap: true,
  treeshake: true,
  // Entries reference each other only via package subpaths, kept external, so each
  // module (React context, BeautyApiError) exists exactly once across entries.
  external: ['react', 'react-dom', 'next', 'three', /^@gateway-experience\/beauty-sdk\//],
};

export default defineConfig([
  {
    // React-free: importable from Server Components and route handlers.
    ...shared,
    clean: true,
    entry: { 'client/index': 'src/client/index.ts', 'server/index': 'src/server/index.ts' },
  },
  {
    // Client modules: hooks and components.
    ...shared,
    clean: false,
    entry: { 'react/index': 'src/react/index.ts', 'photo/index': 'src/photo/index.ts' },
    banner: { js: '"use client";' },
    // tsup's rollup tree-shake pass drops the directive from the output; without it the banner survives.
    treeshake: false,
  },
  {
    // Legacy entries, replaced experience by experience in phases 2–5.
    ...shared,
    clean: false,
    entry: {
      index: 'src/index.ts',
      'core/index': 'src/core/index.ts',
      'hooks/index': 'src/hooks/index.ts',
      'ui/index': 'src/ui/index.ts',
      'vision/index': 'src/ui/index.ts',
      'types/index': 'src/core/types.ts',
    },
  },
]);
