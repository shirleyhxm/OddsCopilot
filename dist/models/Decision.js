"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decision = void 0;
const Scenario_1 = require("./Scenario");
class Decision {
    constructor(question, scenarios, considerations) {
        this.question = question;
        this.scenarios = scenarios.map(s => new Scenario_1.Scenario(s.name, s.description, s.outcomes, s.assumptions, s.context));
        this.considerations = considerations;
    }
    getScenarioByName(name) {
        return this.scenarios.find(s => s.name === name);
    }
    getBestScenarioByEV() {
        return this.scenarios.reduce((best, current) => current.getExpectedValue() > best.getExpectedValue() ? current : best);
    }
    getWorstScenarioByEV() {
        return this.scenarios.reduce((worst, current) => current.getExpectedValue() < worst.getExpectedValue() ? current : worst);
    }
}
exports.Decision = Decision;
