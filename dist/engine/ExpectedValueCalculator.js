"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpectedValueCalculator = void 0;
class ExpectedValueCalculator {
    /**
     * Calculate expected value with full transparency
     * Philosophy: Show the work, don't just give an answer
     */
    static calculate(scenario) {
        const breakdown = scenario.outcomes.map(outcome => ({
            outcome: outcome.name,
            probability: outcome.probability,
            value: outcome.value,
            contribution: outcome.getContribution()
        }));
        const expectedValue = breakdown.reduce((sum, item) => sum + item.contribution, 0);
        const confidence = this.assessConfidence(scenario);
        const warnings = this.generateWarnings(scenario);
        return {
            expectedValue,
            breakdown,
            confidence,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    /**
     * Assess confidence based on probability distribution
     * High variance or extreme probabilities = lower confidence
     */
    static assessConfidence(scenario) {
        const outcomes = scenario.outcomes;
        // Check for extreme probabilities (very high or very low)
        const hasExtremes = outcomes.some(o => o.probability < 0.05 || o.probability > 0.95);
        // Check for high variance in values
        const values = outcomes.map(o => o.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0;
        if (hasExtremes || coefficientOfVariation > 1) {
            return 'low';
        }
        else if (coefficientOfVariation > 0.5) {
            return 'medium';
        }
        return 'high';
    }
    /**
     * Generate warnings about the calculation
     * Help users think critically about their assumptions
     */
    static generateWarnings(scenario) {
        const warnings = [];
        // Check if probabilities sum to ~1
        const totalProb = scenario.outcomes.reduce((sum, o) => sum + o.probability, 0);
        if (Math.abs(totalProb - 1) > 0.1) {
            warnings.push(`Probabilities sum to ${(totalProb * 100).toFixed(1)}%, not 100%. ` +
                `Are you missing some outcomes?`);
        }
        // Check for outcomes that dominate the EV
        const ev = scenario.getExpectedValue();
        const dominantOutcomes = scenario.outcomes.filter(o => Math.abs(o.getContribution() / ev) > 0.5);
        if (dominantOutcomes.length > 0 && ev !== 0) {
            warnings.push(`One outcome (${dominantOutcomes[0].name}) drives >50% of the expected value. ` +
                `Is your probability estimate for this outcome well-calibrated?`);
        }
        // Check for very low probability, high impact outcomes (tail risks)
        const tailRisks = scenario.outcomes.filter(o => o.probability < 0.1 && Math.abs(o.value) > Math.abs(ev) * 2);
        if (tailRisks.length > 0) {
            warnings.push(`You have low-probability, high-impact outcomes. ` +
                `Expected value might not capture the full picture here. ` +
                `Consider: What's your risk tolerance?`);
        }
        return warnings;
    }
    /**
     * Calculate sensitivity: How much does EV change if we adjust a probability?
     * Helps identify which assumptions matter most
     */
    static sensitivityAnalysis(scenario, outcomeName, probabilityDelta) {
        const original = scenario.getExpectedValue();
        const outcome = scenario.getOutcomeByName(outcomeName);
        if (!outcome) {
            throw new Error(`Outcome ${outcomeName} not found`);
        }
        // Temporarily adjust probability
        const originalProb = outcome.probability;
        outcome.probability = Math.max(0, Math.min(1, originalProb + probabilityDelta));
        const adjusted = scenario.getExpectedValue();
        const delta = adjusted - original;
        // Restore original probability
        outcome.probability = originalProb;
        return { original, adjusted, delta };
    }
}
exports.ExpectedValueCalculator = ExpectedValueCalculator;
