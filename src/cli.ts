import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { Decision } from './models/Decision';
import { ExpectedValueCalculator } from './engine/ExpectedValueCalculator';
import { ComparisonEngine } from './engine/ComparisonEngine';
import { Visualizer } from './engine/Visualizer';
import { careerDecision, investmentDecision } from './examples';

const program = new Command();

program
  .name('odds-copilot')
  .description('A probability copilot for better personal decisions')
  .version('1.0.0');

program
  .command('demo')
  .description('Run a demo with example decisions')
  .action(async () => {
    await runDemo();
  });

program
  .command('compare')
  .description('Compare scenarios in a decision')
  .action(async () => {
    await runComparison();
  });

program
  .command('analyze')
  .description('Analyze a single scenario in detail')
  .action(async () => {
    await runAnalysis();
  });

async function runDemo() {
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + chalk.bold.white('                  Welcome to Odds Copilot                           ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════════════╝'));
  console.log(chalk.gray('\n  Philosophy: AI makes the probability math visible'));
  console.log(chalk.gray('              so you can decide better.\n'));

  const examples: Record<string, Decision> = {
    'Career: Startup vs BigCo': careerDecision,
    'Finance: How to invest $50k bonus': investmentDecision
  };

  const { selectedExample } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedExample',
      message: 'Choose an example decision to explore:',
      choices: Object.keys(examples)
    }
  ]);

  const decision = examples[selectedExample];

  const { action } = await inquirer.prompt([
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
    const comparison = ComparisonEngine.compare(decision);
    Visualizer.displayComparison(decision, comparison);
  } else if (action === 'Analyze a specific option') {
    const { scenarioName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scenarioName',
        message: 'Select an option to analyze:',
        choices: decision.scenarios.map(s => s.name)
      }
    ]);

    const scenario = decision.getScenarioByName(scenarioName);
    if (scenario) {
      const result = ExpectedValueCalculator.calculate(scenario);
      Visualizer.displayScenario(scenario, result);
    }
  } else if (action === 'Run sensitivity analysis') {
    await runSensitivityAnalysis(decision);
  }

  const { another } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'another',
      message: 'Would you like to explore another example?',
      default: false
    }
  ]);

  if (another) {
    await runDemo();
  } else {
    console.log(chalk.gray('\n  Thanks for using Odds Copilot!\n'));
  }
}

async function runComparison() {
  console.log(chalk.bold.cyan('\n  Comparison Mode\n'));

  const examples: Record<string, Decision> = {
    'Career: Startup vs BigCo': careerDecision,
    'Finance: How to invest $50k bonus': investmentDecision
  };

  const { selectedExample } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedExample',
      message: 'Choose a decision to compare:',
      choices: Object.keys(examples)
    }
  ]);

  const decision = examples[selectedExample];
  const comparison = ComparisonEngine.compare(decision);
  Visualizer.displayComparison(decision, comparison);
}

async function runAnalysis() {
  console.log(chalk.bold.cyan('\n  Analysis Mode\n'));

  const examples: Record<string, Decision> = {
    'Career: Startup vs BigCo': careerDecision,
    'Finance: How to invest $50k bonus': investmentDecision
  };

  const { selectedExample } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedExample',
      message: 'Choose a decision:',
      choices: Object.keys(examples)
    }
  ]);

  const decision = examples[selectedExample];

  const { scenarioName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scenarioName',
      message: 'Select an option to analyze:',
      choices: decision.scenarios.map(s => s.name)
    }
  ]);

  const scenario = decision.getScenarioByName(scenarioName);
  if (scenario) {
    const result = ExpectedValueCalculator.calculate(scenario);
    Visualizer.displayScenario(scenario, result);
  }
}

async function runSensitivityAnalysis(decision: Decision) {
  console.log(chalk.bold.yellow('\n  Sensitivity Analysis\n'));
  console.log(chalk.gray('  See how changes in probabilities affect expected values\n'));

  // Collect all unique outcome names across scenarios
  const outcomeNames = new Set<string>();
  decision.scenarios.forEach(scenario => {
    scenario.outcomes.forEach(outcome => outcomeNames.add(outcome.name));
  });

  const { outcomeName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'outcomeName',
      message: 'Which outcome probability do you want to adjust?',
      choices: Array.from(outcomeNames)
    }
  ]);

  const { delta } = await inquirer.prompt([
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

  const results = ComparisonEngine.sensitivityAnalysis(decision, outcomeName, delta);

  console.log(chalk.bold.white(`\n  Sensitivity Analysis: "${outcomeName}" probability ${delta > 0 ? '+' : ''}${(delta * 100).toFixed(0)}%`));
  console.log(chalk.gray('  ' + '─'.repeat(66)) + '\n');

  results.forEach(result => {
    if (result.delta === 0) {
      console.log(chalk.gray(`  ${result.scenario}: No change (outcome not in this scenario)`));
    } else {
      const deltaStr = result.delta >= 0 ? chalk.green(`+$${(result.delta / 1000).toFixed(1)}k`) : chalk.red(`-$${(Math.abs(result.delta) / 1000).toFixed(1)}k`);
      console.log(
        `  ${chalk.white(result.scenario.padEnd(30))} ` +
        `${deltaStr.padEnd(15)} ` +
        chalk.gray(`(${formatCurrency(result.original)} → ${formatCurrency(result.adjusted)})`)
      );
    }
  });

  console.log(chalk.gray('\n  ' + '─'.repeat(66)));
  console.log(chalk.yellow(`\n  Interpretation: This shows how sensitive your decision is to this assumption.`));
  console.log(chalk.yellow(`  If small changes flip the ranking, gather more data before deciding.\n`));
}

function formatCurrency(value: number): string {
  const sign = value >= 0 ? '+' : '-';
  const abs = Math.abs(value);

  if (abs >= 1000000) {
    return `${sign}$${(abs / 1000000).toFixed(2)}M`;
  } else if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

export { program };
