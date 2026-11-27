import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

await build({
  entryPoints: [path.join(rootDir, 'server', 'index.ts')],
  outfile: path.join(rootDir, 'dist-server', 'index.mjs'),
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  packages: 'external',
  sourcemap: false,
});

console.log('[build-server] Bundle de produção gerado em dist-server/index.mjs');
