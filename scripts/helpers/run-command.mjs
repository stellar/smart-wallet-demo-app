#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log, logError } from './logs.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG = {
  SCRIPTS_DIR: __dirname,
};

const runCommand = (command, options = {}) => {
  const { cwd, silent = false, stdio = 'inherit' } = options;

  if (!silent) {
    log(`Running: ${command}`, 'magenta');
  }

  try {
    const result = execSync(command, {
      cwd: cwd || CONFIG.SCRIPTS_DIR,
      stdio,
      encoding: 'utf8',
      env: process.env
    });

    return { success: true, output: result };
  } catch (error) {
    if (!silent) {
      logError(`Command failed: ${command}`);
      logError(`Error: ${error.message}`);
    }

    return { success: false, error };
  }
};

const runMakeCommand = (command, options) => {
  const result = runCommand(command, options);

  if (!result.success) {
    logError(`failed to run command ${command}`);

    return false;
  }

  return true;
}

export { runMakeCommand, runCommand };
