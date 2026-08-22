import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(rootDir, '..');
const nodeBin = process.execPath;
const viteBin = resolve(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');

function startProcess(command, args, label) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  child.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error(`[${label}] failed to start:`, error.message);
    process.exitCode = 1;
  });

  return child;
}

const server = startProcess(nodeBin, ['server/server.js'], 'server');
const client = startProcess(nodeBin, [viteBin, '--host'], 'client');

const shutdown = () => {
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
