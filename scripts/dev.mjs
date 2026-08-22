import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(rootDir, '..');

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

const server = startProcess('node', ['server/server.js'], 'server');
const clientCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const client = startProcess(clientCommand, ['run', 'dev', '--', '--host'], 'client');

const shutdown = () => {
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
