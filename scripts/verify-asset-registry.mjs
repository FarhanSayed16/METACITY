/**
 * Verify every AssetRegistry relativePath exists under frontend/public/assets/
 * Run: node scripts/verify-asset-registry.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(ROOT, 'frontend', 'src', 'assets', 'AssetRegistry.ts');
const ASSETS_DIR = path.join(ROOT, 'frontend', 'public', 'assets');

const src = fs.readFileSync(REGISTRY_FILE, 'utf8');
const relPaths = [...src.matchAll(/relativePath:\s*'([^']+\.glb)'/g)].map((m) => m[1]);
// Also match A(...) third-arg form: A('id', 'cat', 'path.glb', ...
const fromA = [...src.matchAll(/A\(\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+\.glb)'/g)].map((m) => m[1]);
const paths = [...new Set([...relPaths, ...fromA])];

if (paths.length === 0) {
  console.error('No GLB paths found in AssetRegistry.ts');
  process.exit(1);
}

let missing = 0;
for (const rel of paths) {
  const full = path.join(ASSETS_DIR, rel);
  if (!fs.existsSync(full)) {
    console.error('MISSING', rel);
    missing++;
  }
}

const onDisk = [];
function walk(dir, prefix = '') {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (fs.statSync(p).isDirectory()) walk(p, rel);
    else if (name.endsWith('.glb')) onDisk.push(rel.replace(/\\/g, '/'));
  }
}
walk(ASSETS_DIR);

const registered = new Set(paths.map((p) => p.replace(/\\/g, '/')));
const orphanDisk = onDisk.filter((p) => !registered.has(p));

console.log(`Registry entries: ${paths.length}`);
console.log(`On-disk GLBs:     ${onDisk.length}`);
console.log(`Missing files:    ${missing}`);
if (orphanDisk.length) {
  console.log(`On disk but not in registry (${orphanDisk.length}):`);
  orphanDisk.forEach((p) => console.log('  ·', p));
}

if (missing > 0) {
  process.exit(1);
}
console.log('OK — every registry path resolves on disk.');
