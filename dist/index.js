#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("./cli");
// If no command specified, run demo
if (process.argv.length === 2) {
    process.argv.push('demo');
}
cli_1.program.parse(process.argv);
