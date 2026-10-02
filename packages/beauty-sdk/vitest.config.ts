import path from 'node:path';
import { defineConfig } from 'vitest/config';

const entry = (name: string) => path.resolve(import.meta.dirname, `src/${name}/index.ts`);

export default defineConfig({
  // Entries reference each other through package subpaths (see tsup.config.ts);
  // tests resolve those to source.
  resolve: {
    alias: {
      '@gateway-experience/beauty-sdk/client': entry('client'),
      '@gateway-experience/beauty-sdk/server': entry('server'),
      '@gateway-experience/beauty-sdk/react': entry('react'),
      '@gateway-experience/beauty-sdk/photo': entry('photo'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
    environmentMatchGlobs: [['src/{react,photo}/**', 'jsdom']],
  },
});
