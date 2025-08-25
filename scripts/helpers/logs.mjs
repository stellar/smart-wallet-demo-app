#!/usr/bin/env node

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

export const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

export const logStep = (step, message) => {
  log(`\n${colors.bright}${step}${colors.reset}`, 'cyan');
  log(message, 'blue');
};

export const logSuccess = (message) => {
  log(`✓ ${message}`, 'green');
};

export const logError = (message) => {
  log(`✗ ${message}`, 'red');
};

export const logWarning = (message) => {
  log(`⚠ ${message}`, 'yellow');
};

export const logInfo = (message) => {
  log(`ℹ ${message}`, 'blue');
};
