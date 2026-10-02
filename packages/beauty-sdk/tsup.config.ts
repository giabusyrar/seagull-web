import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'hooks/index': 'src/hooks/index.ts',
    'ui/index': 'src/ui/index.ts',
    'vision/index': 'src/ui/index.ts',
    'client/index': 'src/core/client.ts',
    'types/index': 'src/core/types.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', 'next'],
});
