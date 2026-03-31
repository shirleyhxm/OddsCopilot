import chalk from 'chalk';
import { ExpectedValueResult, ComparisonResult } from '../types';
import { Scenario } from '../models/Scenario';
import { Decision } from '../models/Decision';

/**
 * Visualizer: Make the probability math visible
 * Philosophy: Rigorous enough to be credible, human enough to not feel reductive
 */
export class Visualizer {
  /**
   * Display a single scenario's expected value calculation
   * Show all the work, not just the answer
   */
  static displayScenario(scenario: Scenario, result: ExpectedValueResult): void {
    console.log('\n' + chalk.bold.cyan('═'.repeat(70)));
    console.log(chalk.bold.white(`  ${scenario.name}`));
    console.log(chalk.gray(`  ${scenario.description}`));
    console.log(chalk.bold.cyan('═'.repeat(70)));

    if (scenario.context) {
      console.log(chalk.gray(`\n  Context: ${scenario.context}`));
    }

    if (scenario.assumptions && scenario.assumptions.length > 0) {
      console.log(chalk.yellow('\n  Key Assumptions:'));
      scenario.assumptions.forEach(assumption => {
        console.log(chalk.yellow(`    • ${assumption}`));
      });
    }

    console.log(chalk.bold('\n  Probability Breakdown:'));
    console.log(chalk.gray('  ' + '─'.repeat(66)));

    result.breakdown.forEach(item => {
      const probStr = `${(item.probability * 100).toFixed(1)}%`.padEnd(6);
      const valueStr = this.formatCurrency(item.value).padEnd(12);
      const contribStr = this.formatCurrency(item.contribution).padEnd(12);
      const bar = this.createBar(item.contribution, result.expectedValue);

      console.log(
        `  ${chalk.cyan(probStr)} × ${chalk.white(valueStr)} = ` +
        `${chalk.green(contribStr)} ${chalk.gray(bar)} ${chalk.gray(item.outcome)}`
      );
    });

    console.log(chalk.gray('  ' + '─'.repeat(66)));
    console.log(
      chalk.bold.white('  Expected Value: ') +
      chalk.bold.green(this.formatCurrency(result.expectedValue))
    );

    this.displayConfidence(result.confidence);

    if (result.warnings && result.warnings.length > 0) {
      console.log(chalk.yellow('\n  ⚠ Things to Consider:'));
      result.warnings.forEach(warning => {
        console.log(chalk.yellow(`    ${warning}`));
      });
    }

    console.log(chalk.bold.cyan('═'.repeat(70)) + '\n');
  }

  /**
   * Compare multiple scenarios side by side
   */
  static displayComparison(decision: Decision, comparison: ComparisonResult): void {
    console.log('\n' + chalk.bold.magenta('╔' + '═'.repeat(68) + '╗'));
    console.log(chalk.bold.magenta('║') + chalk.bold.white(` ${decision.question}`.padEnd(68)) + chalk.bold.magenta('║'));
    console.log(chalk.bold.magenta('╚' + '═'.repeat(68) + '╝'));

    if (decision.considerations && decision.considerations.length > 0) {
      console.log(chalk.gray('\n  Beyond the numbers, consider:'));
      decision.considerations.forEach(consideration => {
        console.log(chalk.gray(`    • ${consideration}`));
      });
    }

    console.log(chalk.bold('\n  Expected Value Comparison:'));
    console.log(chalk.gray('  ' + '─'.repeat(66)) + '\n');

    // Sort by EV descending
    const sorted = [...comparison.scenarios].sort((a, b) => b.expectedValue - a.expectedValue);

    sorted.forEach((scenario, index) => {
      const rank = index === 0 ? chalk.green('▲') : chalk.gray('•');
      const name = scenario.name.padEnd(30);
      const ev = this.formatCurrency(scenario.expectedValue).padStart(12);

      console.log(`  ${rank} ${chalk.white(name)} ${chalk.bold.green(ev)}`);

      // Show confidence
      const confidence = scenario.result.confidence;
      const confSymbol = confidence === 'high' ? '●●●' : confidence === 'medium' ? '●●○' : '●○○';
      const confColor = confidence === 'high' ? chalk.green : confidence === 'medium' ? chalk.yellow : chalk.red;
      console.log(`     ${chalk.gray('Confidence:')} ${confColor(confSymbol + ' ' + confidence)}\n`);
    });

    console.log(chalk.gray('  ' + '─'.repeat(66)));

    if (comparison.insights.length > 0) {
      console.log(chalk.bold.white('\n  Insights:'));
      comparison.insights.forEach(insight => {
        console.log(chalk.white(`    • ${insight}`));
      });
    }

    if (comparison.sensitivityNotes && comparison.sensitivityNotes.length > 0) {
      console.log(chalk.yellow('\n  Sensitivity Notes:'));
      comparison.sensitivityNotes.forEach(note => {
        console.log(chalk.yellow(`    • ${note}`));
      });
    }

    console.log('\n' + chalk.gray('  Remember: Expected value is a tool for thinking, not a directive.'));
    console.log(chalk.gray('  The goal is clarity about tradeoffs, not certainty about outcomes.\n'));
  }

  /**
   * Display confidence level
   */
  private static displayConfidence(confidence: 'high' | 'medium' | 'low'): void {
    const symbols = {
      high: { bars: '●●●', color: chalk.green, text: 'High confidence in this estimate' },
      medium: { bars: '●●○', color: chalk.yellow, text: 'Medium confidence - watch your assumptions' },
      low: { bars: '●○○', color: chalk.red, text: 'Low confidence - high uncertainty' }
    };

    const conf = symbols[confidence];
    console.log(`\n  ${chalk.gray('Confidence:')} ${conf.color(conf.bars + ' ' + conf.text)}`);
  }

  /**
   * Create a visual bar for the contribution
   */
  private static createBar(contribution: number, totalEV: number): string {
    const maxBarLength = 10;
    if (totalEV === 0) return '';

    const proportion = Math.abs(contribution / totalEV);
    const barLength = Math.min(Math.round(proportion * maxBarLength), maxBarLength);

    return '█'.repeat(barLength);
  }

  /**
   * Format currency values
   */
  private static formatCurrency(value: number): string {
    const sign = value >= 0 ? '+' : '-';
    const abs = Math.abs(value);

    if (abs >= 1000000) {
      return `${sign}$${(abs / 1000000).toFixed(2)}M`;
    } else if (abs >= 1000) {
      return `${sign}$${(abs / 1000).toFixed(1)}k`;
    }
    return `${sign}$${abs.toFixed(0)}`;
  }
}
