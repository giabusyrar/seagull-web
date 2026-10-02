import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'form/index': 'src/form/index.ts',
    'score/index': 'src/score/index.ts',
    'match/index': 'src/match/index.ts',
    'reference/index': 'src/reference/index.ts',
    'orchestrator/index': 'src/orchestrator/index.ts',
    'core/index': 'src/core/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', 'next', 'survey-core', 'survey-react-ui'],
});
