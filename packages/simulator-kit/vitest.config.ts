import { configDefaults, defineConfig } from 'vitest/config';
import path from 'node:path';

// Tests import the source as '@/…'; the source itself uses relative imports,
// because each host app resolves '@/' to its own folder.
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: { environment: 'node', exclude: [...configDefaults.exclude] },
});
