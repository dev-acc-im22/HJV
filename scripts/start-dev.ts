#!/usr/bin/env bun
/**
 * START DEV WITH PREFLIGHT CHECK
 * =============================
 *
 * This script runs preflight checks and then starts the dev server.
 * It ensures issues are caught before the preview panel loads.
 *
 * Usage: bun run scripts/start-dev.ts
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const maxRetries = 3;
const retryDelay = 1000; // 1 second

console.log('');
console.log('🚀 Starting Dev Server with Preflight Check...');
console.log('');

// Check if preflight script exists
const preflightPath = join(projectRoot, 'scripts/preflight-check.ts');
if (!existsSync(preflightPath)) {
  console.error('❌ Preflight check script not found:', preflightPath);
  console.error('Please ensure scripts/preflight-check.ts exists');
  process.exit(1);
}

// Run preflight check first
console.log('Running preflight checks...');
const preflightProcess = spawn('bun', ['run', 'scripts/preflight-check.ts'], {
  cwd: projectRoot,
  detached: true,
  stdio: ['ignore', 'pipe'],
  env: { ...process.env, NODE_NO_WARNINGS: '1' },
});

preflightProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Preflight checks passed. Starting dev server...');
    startDevServer();
  } else {
    console.error('');
    console.error('❌ Preflight checks failed. Fix issues before starting dev server.');
    console.error('See fix.md for documentation');
    console.error('');
    process.exit(1);
  }
});

preflightProcess.on('error', (error) => {
  console.error('❌ Failed to run preflight check:', error.message);
  process.exit(1);
});

function startDevServer() {
  console.log('');
  console.log('Starting dev server...');
  
  const devProcess = spawn('bun', ['run', 'dev'], {
    cwd: projectRoot,
    detached: true,
    stdio: ['ignore', 'pipe'],
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
  });

  devProcess.on('error', (error) => {
    console.error(`Dev server error: ${error.message}`);
    console.error('Please check fix.md for documentation');
    devProcess.kill();
    process.exit(1);
  });

  
  devProcess.on('close', () => {
    console.log('Dev server stopped');
  });

  // Handle termination
  process.on('SIGINT', () => {
    if (devProcess) {
      devProcess.kill();
    }
    console.log('');
    process.exit(0);
  });

  // Wait for dev server to be ready
  let serverReady = false;
  
  const timeout = setTimeout(() => {
    if (!serverReady) {
      console.error('');
      console.error('❌ Dev server failed to start within 30 seconds');
      console.error('Please check fix.md for troubleshooting');
      console.error('');
      devProcess.kill();
      process.exit(1);
    }
  }, 30000);

  devProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready in') || output.includes('Local:')) {
      serverReady = true;
      clearTimeout(timeout);
      console.log('');
      console.log('🎉 Dev server is running successfully!');
      console.log('');
      console.log('📍 Preview URL: http://localhost:3000');
      console.log('');
      console.log('📚 Tips:');
      console.log('   - Use the Preview Panel on the right to view the app');
      console.log('   - Check fix.md if you encounter any issues');
      console.log('');
    }
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});
