import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const apiEntry = path.join(rootDir, 'server', 'index.ts');

const apiProc = spawn(process.execPath, [apiEntry], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env },
});

const webProc = spawn(process.execPath, [viteBin], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env },
});

function shutdown() {
  apiProc.kill();
  webProc.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

webProc.on('exit', (code) => {
  apiProc.kill();
  process.exit(code ?? 0);
});
