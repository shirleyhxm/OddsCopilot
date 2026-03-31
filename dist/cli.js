"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.program = void 0;
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ExpectedValueCalculator_1 = require("./engine/ExpectedValueCalculator");
const ComparisonEngine_1 = require("./engine/ComparisonEngine");
const Visualizer_1 = require("./engine/Visualizer");
const examples_1 = require("./examples");
const program = new commander_1.Command();
exports.program = program;
program
    .name('odds-copilot')
    .description('A probability copilot for better personal decisions')
    .version('1.0.0');
program
    .command('demo')
    .description('Run a demo with example decisions')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    yield runDemo();
}));
program
    .command('compare')
    .description('Compare scenarios in a decision')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    yield runComparison();
}));
program
    .command('analyze')
    .description('Analyze a single scenario in detail')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    yield runAnalysis();
}));
function runDemo() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.bold.cyan('\n╔════════════════════════════════════════════════════════════════════╗'));
        console.log(chalk_1.default.bold.cyan('║') + chalk_1.default.bold.white('                  Welcome to Odds Copilot                           ') + chalk_1.default.bold.cyan('║'));
        console.log(chalk_1.default.bold.cyan('╚════════════════════════════════════════════════════════════════════╝'));
        console.log(chalk_1.default.gray('\n  Philosophy: AI makes the probability math visible'));
        console.log(chalk_1.default.gray('              so you can decide better.\n'));
        const examples = {
            'Career: Startup vs BigCo': examples_1.careerDecision,
            'Finance: How to invest $50k bonus': examples_1.investmentDecision
        };
        const { selectedExample } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'selectedExample',
                message: 'Choose an example decision to explore:',
                choices: Object.keys(examples)
            }
        ]);
        const decision = examples[selectedExample];
        const { action } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'Compare all options',
                    'Analyze a specific option',
                    'Run sensitivity analysis'
                ]
            }
        ]);
        if (action === 'Compare all options') {
            const comparison = ComparisonEngine_1.ComparisonEngine.compare(decision);
            Visualizer_1.Visualizer.displayComparison(decision, comparison);
        }
        else if (action === 'Analyze a specific option') {
            const { scenarioName } = yield inquirer_1.default.prompt([
                {
                    type: 'list',
                    name: 'scenarioName',
                    message: 'Select an option to analyze:',
                    choices: decision.scenarios.map(s => s.name)
                }
            ]);
            const scenario = decision.getScenarioByName(scenarioName);
            if (scenario) {
                const result = ExpectedValueCalculator_1.ExpectedValueCalculator.calculate(scenario);
                Visualizer_1.Visualizer.displayScenario(scenario, result);
            }
        }
        else if (action === 'Run sensitivity analysis') {
            yield runSensitivityAnalysis(decision);
        }
        const { another } = yield inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'another',
                message: 'Would you like to explore another example?',
                default: false
            }
        ]);
        if (another) {
            yield runDemo();
        }
        else {
            console.log(chalk_1.default.gray('\n  Thanks for using Odds Copilot!\n'));
        }
    });
}
function runComparison() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.bold.cyan('\n  Comparison Mode\n'));
        const examples = {
            'Career: Startup vs BigCo': examples_1.careerDecision,
            'Finance: How to invest $50k bonus': examples_1.investmentDecision
        };
        const { selectedExample } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'selectedExample',
                message: 'Choose a decision to compare:',
                choices: Object.keys(examples)
            }
        ]);
        const decision = examples[selectedExample];
        const comparison = ComparisonEngine_1.ComparisonEngine.compare(decision);
        Visualizer_1.Visualizer.displayComparison(decision, comparison);
    });
}
function runAnalysis() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.bold.cyan('\n  Analysis Mode\n'));
        const examples = {
            'Career: Startup vs BigCo': examples_1.careerDecision,
            'Finance: How to invest $50k bonus': examples_1.investmentDecision
        };
        const { selectedExample } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'selectedExample',
                message: 'Choose a decision:',
                choices: Object.keys(examples)
            }
        ]);
        const decision = examples[selectedExample];
        const { scenarioName } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'scenarioName',
                message: 'Select an option to analyze:',
                choices: decision.scenarios.map(s => s.name)
            }
        ]);
        const scenario = decision.getScenarioByName(scenarioName);
        if (scenario) {
            const result = ExpectedValueCalculator_1.ExpectedValueCalculator.calculate(scenario);
            Visualizer_1.Visualizer.displayScenario(scenario, result);
        }
    });
}
function runSensitivityAnalysis(decision) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.bold.yellow('\n  Sensitivity Analysis\n'));
        console.log(chalk_1.default.gray('  See how changes in probabilities affect expected values\n'));
        // Collect all unique outcome names across scenarios
        const outcomeNames = new Set();
        decision.scenarios.forEach(scenario => {
            scenario.outcomes.forEach(outcome => outcomeNames.add(outcome.name));
        });
        const { outcomeName } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'outcomeName',
                message: 'Which outcome probability do you want to adjust?',
                choices: Array.from(outcomeNames)
            }
        ]);
        const { delta } = yield inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'delta',
                message: 'How much do you want to change the probability?',
                choices: [
                    { name: '+10% (increase confidence)', value: 0.10 },
                    { name: '+5%', value: 0.05 },
                    { name: '-5%', value: -0.05 },
                    { name: '-10% (decrease confidence)', value: -0.10 }
                ]
            }
        ]);
        const results = ComparisonEngine_1.ComparisonEngine.sensitivityAnalysis(decision, outcomeName, delta);
        console.log(chalk_1.default.bold.white(`\n  Sensitivity Analysis: "${outcomeName}" probability ${delta > 0 ? '+' : ''}${(delta * 100).toFixed(0)}%`));
        console.log(chalk_1.default.gray('  ' + '─'.repeat(66)) + '\n');
        results.forEach(result => {
            if (result.delta === 0) {
                console.log(chalk_1.default.gray(`  ${result.scenario}: No change (outcome not in this scenario)`));
            }
            else {
                const deltaStr = result.delta >= 0 ? chalk_1.default.green(`+$${(result.delta / 1000).toFixed(1)}k`) : chalk_1.default.red(`-$${(Math.abs(result.delta) / 1000).toFixed(1)}k`);
                console.log(`  ${chalk_1.default.white(result.scenario.padEnd(30))} ` +
                    `${deltaStr.padEnd(15)} ` +
                    chalk_1.default.gray(`(${formatCurrency(result.original)} → ${formatCurrency(result.adjusted)})`));
            }
        });
        console.log(chalk_1.default.gray('\n  ' + '─'.repeat(66)));
        console.log(chalk_1.default.yellow(`\n  Interpretation: This shows how sensitive your decision is to this assumption.`));
        console.log(chalk_1.default.yellow(`  If small changes flip the ranking, gather more data before deciding.\n`));
    });
}
function formatCurrency(value) {
    const sign = value >= 0 ? '+' : '-';
    const abs = Math.abs(value);
    if (abs >= 1000000) {
        return `${sign}$${(abs / 1000000).toFixed(2)}M`;
    }
    else if (abs >= 1000) {
        return `${sign}$${(abs / 1000).toFixed(1)}k`;
    }
    return `${sign}$${abs.toFixed(0)}`;
}
