/**
 * Next.js launcher.
 *
 * Some locked-down Windows environments block the native Next.js SWC binary
 * via Application Control policies. When the optional WASM build is present,
 * point Next at it so its built-in fallback can load. Native bindings are still
 * preferred and used first on machines where they are allowed.
 *
 * Usage: node scripts/next-runner.mjs <dev|build|start> [next args...]
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const wasmDir = path.join(root, 'node_modules', '@next', 'swc-wasm-nodejs');
const wasmEntry = path.join(wasmDir, 'wasm.js');

if (
  process.platform === 'win32' &&
  !process.env.NEXT_TEST_WASM_DIR &&
  existsSync(wasmEntry)
) {
  process.env.NEXT_TEST_WASM_DIR = wasmDir;
}

const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/next-runner.mjs <dev|build|start> [next args...]');
  process.exit(1);
}

const result = spawnSync(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
