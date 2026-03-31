"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visualizer = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Visualizer: Make the probability math visible
 * Philosophy: Rigorous enough to be credible, human enough to not feel reductive
 */
class Visualizer {
    /**
     * Display a single scenario's expected value calculation
     * Show all the work, not just the answer
     */
    static displayScenario(scenario, result) {
        console.log('\n' + chalk_1.default.bold.cyan('═'.repeat(70)));
        console.log(chalk_1.default.bold.white(`  ${scenario.name}`));
        console.log(chalk_1.default.gray(`  ${scenario.description}`));
        console.log(chalk_1.default.bold.cyan('═'.repeat(70)));
        if (scenario.context) {
            console.log(chalk_1.default.gray(`\n  Context: ${scenario.context}`));
        }
        if (scenario.assumptions && scenario.assumptions.length > 0) {
            console.log(chalk_1.default.yellow('\n  Key Assumptions:'));
            scenario.assumptions.forEach(assumption => {
                console.log(chalk_1.default.yellow(`    • ${assumption}`));
            });
        }
        console.log(chalk_1.default.bold('\n  Probability Breakdown:'));
        console.log(chalk_1.default.gray('  ' + '─'.repeat(66)));
        result.breakdown.forEach(item => {
            const probStr = `${(item.probability * 100).toFixed(1)}%`.padEnd(6);
            const valueStr = this.formatCurrency(item.value).padEnd(12);
            const contribStr = this.formatCurrency(item.contribution).padEnd(12);
            const bar = this.createBar(item.contribution, result.expectedValue);
            console.log(`  ${chalk_1.default.cyan(probStr)} × ${chalk_1.default.white(valueStr)} = ` +
                `${chalk_1.default.green(contribStr)} ${chalk_1.default.gray(bar)} ${chalk_1.default.gray(item.outcome)}`);
        });
        console.log(chalk_1.default.gray('  ' + '─'.repeat(66)));
        console.log(chalk_1.default.bold.white('  Expected Value: ') +
            chalk_1.default.bold.green(this.formatCurrency(result.expectedValue)));
        this.displayConfidence(result.confidence);
        if (result.warnings && result.warnings.length > 0) {
            console.log(chalk_1.default.yellow('\n  ⚠ Things to Consider:'));
            result.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`    ${warning}`));
            });
        }
        console.log(chalk_1.default.bold.cyan('═'.repeat(70)) + '\n');
    }
    /**
     * Compare multiple scenarios side by side
     */
    static displayComparison(decision, comparison) {
        console.log('\n' + chalk_1.default.bold.magenta('╔' + '═'.repeat(68) + '╗'));
        console.log(chalk_1.default.bold.magenta('║') + chalk_1.default.bold.white(` ${decision.question}`.padEnd(68)) + chalk_1.default.bold.magenta('║'));
        console.log(chalk_1.default.bold.magenta('╚' + '═'.repeat(68) + '╝'));
        if (decision.considerations && decision.considerations.length > 0) {
            console.log(chalk_1.default.gray('\n  Beyond the numbers, consider:'));
            decision.considerations.forEach(consideration => {
                console.log(chalk_1.default.gray(`    • ${consideration}`));
            });
        }
        console.log(chalk_1.default.bold('\n  Expected Value Comparison:'));
        console.log(chalk_1.default.gray('  ' + '─'.repeat(66)) + '\n');
        // Sort by EV descending
        const sorted = [...comparison.scenarios].sort((a, b) => b.expectedValue - a.expectedValue);
        sorted.forEach((scenario, index) => {
            const rank = index === 0 ? chalk_1.default.green('▲') : chalk_1.default.gray('•');
            const name = scenario.name.padEnd(30);
            const ev = this.formatCurrency(scenario.expectedValue).padStart(12);
            console.log(`  ${rank} ${chalk_1.default.white(name)} ${chalk_1.default.bold.green(ev)}`);
            // Show confidence
            const confidence = scenario.result.confidence;
            const confSymbol = confidence === 'high' ? '●●●' : confidence === 'medium' ? '●●○' : '●○○';
            const confColor = confidence === 'high' ? chalk_1.default.green : confidence === 'medium' ? chalk_1.default.yellow : chalk_1.default.red;
            console.log(`     ${chalk_1.default.gray('Confidence:')} ${confColor(confSymbol + ' ' + confidence)}\n`);
        });
        console.log(chalk_1.default.gray('  ' + '─'.repeat(66)));
        if (comparison.insights.length > 0) {
            console.log(chalk_1.default.bold.white('\n  Insights:'));
            comparison.insights.forEach(insight => {
                console.log(chalk_1.default.white(`    • ${insight}`));
            });
        }
        if (comparison.sensitivityNotes && comparison.sensitivityNotes.length > 0) {
            console.log(chalk_1.default.yellow('\n  Sensitivity Notes:'));
            comparison.sensitivityNotes.forEach(note => {
                console.log(chalk_1.default.yellow(`    • ${note}`));
            });
        }
        console.log('\n' + chalk_1.default.gray('  Remember: Expected value is a tool for thinking, not a directive.'));
        console.log(chalk_1.default.gray('  The goal is clarity about tradeoffs, not certainty about outcomes.\n'));
    }
    /**
     * Display confidence level
     */
    static displayConfidence(confidence) {
        const symbols = {
            high: { bars: '●●●', color: chalk_1.default.green, text: 'High confidence in this estimate' },
            medium: { bars: '●●○', color: chalk_1.default.yellow, text: 'Medium confidence - watch your assumptions' },
            low: { bars: '●○○', color: chalk_1.default.red, text: 'Low confidence - high uncertainty' }
        };
        const conf = symbols[confidence];
        console.log(`\n  ${chalk_1.default.gray('Confidence:')} ${conf.color(conf.bars + ' ' + conf.text)}`);
    }
    /**
     * Create a visual bar for the contribution
     */
    static createBar(contribution, totalEV) {
        const maxBarLength = 10;
        if (totalEV === 0)
            return '';
        const proportion = Math.abs(contribution / totalEV);
        const barLength = Math.min(Math.round(proportion * maxBarLength), maxBarLength);
        return '█'.repeat(barLength);
    }
    /**
     * Format currency values
     */
    static formatCurrency(value) {
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
}
exports.Visualizer = Visualizer;
