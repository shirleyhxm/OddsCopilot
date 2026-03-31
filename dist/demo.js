#!/usr/bin/env node
"use strict";
/**
 * Non-interactive demo showing the core functionality
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const examples_1 = require("./examples");
const ExpectedValueCalculator_1 = require("./engine/ExpectedValueCalculator");
const ComparisonEngine_1 = require("./engine/ComparisonEngine");
const Visualizer_1 = require("./engine/Visualizer");
console.log(chalk_1.default.bold.cyan('\n╔════════════════════════════════════════════════════════════════════╗'));
console.log(chalk_1.default.bold.cyan('║') + chalk_1.default.bold.white('              Odds Copilot - Demo Walkthrough                       ') + chalk_1.default.bold.cyan('║'));
console.log(chalk_1.default.bold.cyan('╚════════════════════════════════════════════════════════════════════╝'));
console.log(chalk_1.default.gray('\n  Philosophy: AI makes the probability math visible'));
console.log(chalk_1.default.gray('              so you can decide better.\n'));
console.log(chalk_1.default.bold.white('\n════════════════════════════════════════════════════════════════════'));
console.log(chalk_1.default.bold.white('  EXAMPLE 1: Career Decision - Startup vs BigCo'));
console.log(chalk_1.default.bold.white('════════════════════════════════════════════════════════════════════\n'));
// Show comparison view
const careerComparison = ComparisonEngine_1.ComparisonEngine.compare(examples_1.careerDecision);
Visualizer_1.Visualizer.displayComparison(examples_1.careerDecision, careerComparison);
// Show detailed analysis of one option
console.log(chalk_1.default.bold.white('\n════════════════════════════════════════════════════════════════════'));
console.log(chalk_1.default.bold.white('  Detailed Analysis: Join Startup Option'));
console.log(chalk_1.default.bold.white('════════════════════════════════════════════════════════════════════\n'));
const startupScenario = examples_1.careerDecision.getScenarioByName('Join Startup');
if (startupScenario) {
    const result = ExpectedValueCalculator_1.ExpectedValueCalculator.calculate(startupScenario);
    Visualizer_1.Visualizer.displayScenario(startupScenario, result);
}
console.log(chalk_1.default.bold.white('\n════════════════════════════════════════════════════════════════════'));
console.log(chalk_1.default.bold.white('  EXAMPLE 2: Investment Decision - $50k Bonus'));
console.log(chalk_1.default.bold.white('════════════════════════════════════════════════════════════════════\n'));
const investmentComparison = ComparisonEngine_1.ComparisonEngine.compare(examples_1.investmentDecision);
Visualizer_1.Visualizer.displayComparison(examples_1.investmentDecision, investmentComparison);
console.log(chalk_1.default.bold.cyan('\n════════════════════════════════════════════════════════════════════'));
console.log(chalk_1.default.bold.cyan('  Try the interactive version with: npm run dev'));
console.log(chalk_1.default.bold.cyan('════════════════════════════════════════════════════════════════════\n'));
