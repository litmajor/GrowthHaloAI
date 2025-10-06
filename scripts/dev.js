#!/usr/bin/env node
// Cross-platform dev launcher: ensures NODE_ENV is set and runs tsx
const { spawn } = require('child_process');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Use npx to run the local tsx if available, otherwise fallback to global
const runner = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const child = spawn(runner, ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: false,
  env: process.env,
});

child.on('exit', (code) => process.exit(code));
