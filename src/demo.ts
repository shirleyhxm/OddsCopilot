#!/usr/bin/env node

/**
 * Non-interactive demo showing the core functionality
 */

import chalk from 'chalk';
import { careerDecision, investmentDecision } from './examples';
import { ExpectedValueCalculator } from './engine/ExpectedValueCalculator';
import { ComparisonEngine } from './engine/ComparisonEngine';
import { Visualizer } from './engine/Visualizer';

console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║') + chalk.bold.white('              Odds Copilot - Demo Walkthrough                       ') + chalk.bold.cyan('║'));
console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════════════╝'));
console.log(chalk.gray('\n  Philosophy: AI makes the probability math visible'));
console.log(chalk.gray('              so you can decide better.\n'));

console.log(chalk.bold.white('\n════════════════════════════════════════════════════════════════════'));
console.log(chalk.bold.white('  EXAMPLE 1: Career Decision - Startup vs BigCo'));
console.log(chalk.bold.white('════════════════════════════════════════════════════════════════════\n'));

// Show comparison view
const careerComparison = ComparisonEngine.compare(careerDecision);
Visualizer.displayComparison(careerDecision, careerComparison);

// Show detailed analysis of one option
console.log(chalk.bold.white('\n════════════════════════════════════════════════════════════════════'));
console.log(chalk.bold.white('  Detailed Analysis: Join Startup Option'));
console.log(chalk.bold.white('════════════════════════════════════════════════════════════════════\n'));

const startupScenario = careerDecision.getScenarioByName('Join Startup');
if (startupScenario) {
  const result = ExpectedValueCalculator.calculate(startupScenario);
  Visualizer.displayScenario(startupScenario, result);
}

console.log(chalk.bold.white('\n════════════════════════════════════════════════════════════════════'));
console.log(chalk.bold.white('  EXAMPLE 2: Investment Decision - $50k Bonus'));
console.log(chalk.bold.white('════════════════════════════════════════════════════════════════════\n'));

const investmentComparison = ComparisonEngine.compare(investmentDecision);
Visualizer.displayComparison(investmentDecision, investmentComparison);

console.log(chalk.bold.cyan('\n════════════════════════════════════════════════════════════════════'));
console.log(chalk.bold.cyan('  Try the interactive version with: npm run dev'));
console.log(chalk.bold.cyan('════════════════════════════════════════════════════════════════════\n'));
