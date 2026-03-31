#!/usr/bin/env node

import { program } from './cli';

// If no command specified, run demo
if (process.argv.length === 2) {
  process.argv.push('demo');
}

program.parse(process.argv);
