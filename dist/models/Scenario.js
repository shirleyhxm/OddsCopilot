"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scenario = void 0;
const Outcome_1 = require("./Outcome");
class Scenario {
    constructor(name, description, outcomes, assumptions, context) {
        this.name = name;
        this.description = description;
        this.outcomes = outcomes.map(o => new Outcome_1.Outcome(o.name, o.probability, o.value, o.description, o.timeframe));
        this.assumptions = assumptions;
        this.context = context;
        this.validateProbabilities();
    }
    validateProbabilities() {
        const total = this.outcomes.reduce((sum, o) => sum + o.probability, 0);
        const tolerance = 0.01;
        if (Math.abs(total - 1) > tolerance) {
            console.warn(`Warning: Probabilities sum to ${total.toFixed(3)}, not 1.0. ` +
                `This might be intentional (e.g., some outcomes not modeled), ` +
                `but double-check your assumptions.`);
        }
    }
    getExpectedValue() {
        return this.outcomes.reduce((sum, outcome) => sum + outcome.getContribution(), 0);
    }
    getOutcomeByName(name) {
        return this.outcomes.find(o => o.name === name);
    }
}
exports.Scenario = Scenario;
