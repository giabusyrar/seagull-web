// Install @gateway-experience/contracts into node_modules from a local
// Seagull-gateway checkout, for working without the GitLab package registry.
//
// Why a copy and not `npm install <path>`: that writes a `file:` path into
// packages/beauty-sdk/package.json and package-lock.json, which then cannot be
// committed (the path only resolves on this machine, and it points outside any
// Docker build context). A copy into node_modules leaves every tracked file
// alone. The cost is that `npm install` wipes it — re-run this script after.
//
// Usage:  npm run contracts:local
//         SEAGULL_GATEWAY_PATH=../some/other/checkout npm run contracts:local

import { execSync } from 'node:child_process';
import { cpSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';

// Where the gateway checkout sits relative to this repo. Overridable because
// it is a property of one machine's layout, not of this project.
const DEFAULT_GATEWAY_PATH = '../seagull-gateway';

const repoRoot = path.resolve(import.meta.dirname, '..');
const gatewayRoot = path.resolve(
  repoRoot,
  process.env.SEAGULL_GATEWAY_PATH || DEFAULT_GATEWAY_PATH,
);
const source = path.join(gatewayRoot, 'packages', 'contracts');
const target = path.join(repoRoot, 'node_modules', '@gateway-experience', 'contracts');

if (!existsSync(path.join(source, 'package.json'))) {
  console.error(
    `No contracts package at ${source}\n` +
      `Clone Seagull-gateway beside this repo, or set SEAGULL_GATEWAY_PATH to its location.`,
  );
  process.exit(1);
}

console.log(`building contracts in ${source}`);
// Through a shell: npm is a .cmd shim on Windows, which Node refuses to spawn
// directly. The command is a fixed string — nothing here is interpolated.
execSync('npm run build --workspace=packages/contracts', {
  cwd: gatewayRoot,
  stdio: 'inherit',
});

if (!existsSync(path.join(source, 'dist', 'index.js'))) {
  console.error('contracts build produced no dist/index.js');
  process.exit(1);
}

// A symlink would be the obvious move, but Turbopack refuses to compile files
// outside the project directory, so the package has to physically live here.
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
for (const entry of ['dist', 'src', 'package.json']) {
  cpSync(path.join(source, entry), path.join(target, entry), { recursive: true });
}

console.log(`copied contracts into ${path.relative(repoRoot, target)}`);
