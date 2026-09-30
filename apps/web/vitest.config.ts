import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Unit tests for the app's pure logic. `lib/api-keys.test.ts` predates this
// config and had no runner; it is included here too.
export default defineConfig({
  test: {
    include: ['{app,features,lib}/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname) },
  },
});
