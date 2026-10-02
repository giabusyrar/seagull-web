import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
    environmentMatchGlobs: [['src/{react,photo}/**', 'jsdom']],
  },
});
