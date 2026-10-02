// Builds the SDK, packs it like a release, and installs the tarball here —
// so this app sees exactly what a brand installs, not the workspace source.
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const here = path.resolve(import.meta.dirname, '..');
const sdk = path.resolve(here, '../../packages/beauty-sdk');
const out = path.join(here, '.sdk');
mkdirSync(out, { recursive: true });

execSync('npm run build', { cwd: sdk, stdio: 'inherit' });
const [{ filename }] = JSON.parse(execSync(`npm pack --json --pack-destination "${out}"`, { cwd: sdk }).toString());
execSync(`npm install --no-save "${path.join(out, filename)}"`, { cwd: here, stdio: 'inherit' });
console.log(`installed ${filename}`);
