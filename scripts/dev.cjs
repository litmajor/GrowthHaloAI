#!/usr/bin/env node
const { spawn } = require('child_process');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load local .env files here so the spawned process inherits them
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
  dotenv.config();
} catch (e) {
  // ignore
}

// Run via shell to ensure platform-specific command resolution (npx on Windows uses npx.cmd)
const command = 'npx tsx server/index.ts';

const child = spawn(command, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => process.exit(code));
