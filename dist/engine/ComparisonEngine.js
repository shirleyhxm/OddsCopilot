"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComparisonEngine = void 0;
const ExpectedValueCalculator_1 = require("./ExpectedValueCalculator");
/**
 * ComparisonEngine: Help users see tradeoffs between options
 * Philosophy: Illuminate differences, don't prescribe choices
 */
class ComparisonEngine {
    /**
     * Compare all scenarios in a decision
     * Generate insights about the differences
     */
    static compare(decision) {
        const scenarios = decision.scenarios.map(scenario => {
            const result = ExpectedValueCalculator_1.ExpectedValueCalculator.calculate(scenario);
            return {
                name: scenario.name,
                expectedValue: result.expectedValue,
                result
            };
        });
        const insights = this.generateInsights(decision, scenarios);
        const sensitivityNotes = this.generateSensitivityNotes(decision);
        return {
            scenarios,
            insights,
            sensitivityNotes: sensitivityNotes.length > 0 ? sensitivityNotes : undefined
        };
    }
    /**
     * Generate insights by comparing scenarios
     * Help users understand what drives the differences
     */
    static generateInsights(decision, scenarios) {
        var _a;
        const insights = [];
        if (scenarios.length < 2) {
            return insights;
        }
        // Sort by EV
        const sorted = [...scenarios].sort((a, b) => b.expectedValue - a.expectedValue);
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        // Check if there's a clear winner
        const evDiff = best.expectedValue - sorted[1].expectedValue;
        const evRange = best.expectedValue - worst.expectedValue;
        if (evRange === 0) {
            insights.push('All options have the same expected value. Other factors should drive your decision.');
        }
        else if (evDiff / Math.abs(best.expectedValue) > 0.5) {
            insights.push(`${best.name} has a significantly higher expected value (+${this.formatPercentage(evDiff / Math.abs(sorted[1].expectedValue))})`);
        }
        else if (evDiff / Math.abs(best.expectedValue) < 0.1) {
            insights.push(`The top options are very close in expected value (within ${this.formatPercentage(evDiff / Math.abs(best.expectedValue))}). ` +
                `Small changes in assumptions could flip the ranking.`);
        }
        // Check confidence levels
        const lowConfidence = scenarios.filter(s => s.result.confidence === 'low');
        if (lowConfidence.length > 0) {
            insights.push(`${lowConfidence.map(s => s.name).join(', ')} ${lowConfidence.length === 1 ? 'has' : 'have'} low confidence. ` +
                `Consider gathering more information before deciding.`);
        }
        // Check for scenarios with warnings
        const withWarnings = scenarios.filter(s => s.result.warnings && s.result.warnings.length > 0);
        if (withWarnings.length > 0) {
            insights.push(`Review the warnings for ${withWarnings.map(s => s.name).join(', ')}. ` +
                `They highlight important considerations about your assumptions.`);
        }
        // Check if best option has tail risks
        if ((_a = best.result.warnings) === null || _a === void 0 ? void 0 : _a.some(w => w.includes('tail risks') || w.includes('low-probability'))) {
            insights.push(`The highest EV option has tail risks. If you're risk-averse, you might prefer a lower-EV, lower-variance option.`);
        }
        return insights;
    }
    /**
     * Generate notes about sensitivity
     * Which assumptions matter most?
     */
    static generateSensitivityNotes(decision) {
        const notes = [];
        decision.scenarios.forEach(scenario => {
            // Find outcomes that contribute >40% to EV
            const ev = scenario.getExpectedValue();
            if (ev === 0)
                return;
            const dominantOutcomes = scenario.outcomes.filter(o => Math.abs(o.getContribution() / ev) > 0.4);
            if (dominantOutcomes.length > 0) {
                notes.push(`${scenario.name}: Most sensitive to your estimate of "${dominantOutcomes[0].name}" ` +
                    `(${(dominantOutcomes[0].probability * 100).toFixed(0)}% probability)`);
            }
        });
        return notes;
    }
    /**
     * Format percentage for display
     */
    static formatPercentage(value) {
        return `${(Math.abs(value) * 100).toFixed(0)}%`;
    }
    /**
     * Run sensitivity analysis across all scenarios
     * Show how robust the ranking is to changes in assumptions
     */
    static sensitivityAnalysis(decision, outcomeName, probabilityDelta) {
        return decision.scenarios.map(scenario => {
            try {
                const analysis = ExpectedValueCalculator_1.ExpectedValueCalculator.sensitivityAnalysis(scenario, outcomeName, probabilityDelta);
                return Object.assign({ scenario: scenario.name }, analysis);
            }
            catch (error) {
                // Outcome not found in this scenario
                return {
                    scenario: scenario.name,
                    original: scenario.getExpectedValue(),
                    adjusted: scenario.getExpectedValue(),
                    delta: 0
                };
            }
        });
    }
}
exports.ComparisonEngine = ComparisonEngine;
