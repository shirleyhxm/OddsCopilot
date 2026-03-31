import { Scenario as IScenario, Outcome as IOutcome } from '../types';
import { Outcome } from './Outcome';

export class Scenario implements IScenario {
  name: string;
  description: string;
  outcomes: Outcome[];
  assumptions?: string[];
  context?: string;

  constructor(
    name: string,
    description: string,
    outcomes: IOutcome[],
    assumptions?: string[],
    context?: string
  ) {
    this.name = name;
    this.description = description;
    this.outcomes = outcomes.map(
      o => new Outcome(o.name, o.probability, o.value, o.description, o.timeframe)
    );
    this.assumptions = assumptions;
    this.context = context;

    this.validateProbabilities();
  }

  private validateProbabilities(): void {
    const total = this.outcomes.reduce((sum, o) => sum + o.probability, 0);
    const tolerance = 0.01;

    if (Math.abs(total - 1) > tolerance) {
      console.warn(
        `Warning: Probabilities sum to ${total.toFixed(3)}, not 1.0. ` +
        `This might be intentional (e.g., some outcomes not modeled), ` +
        `but double-check your assumptions.`
      );
    }
  }

  getExpectedValue(): number {
    return this.outcomes.reduce((sum, outcome) => sum + outcome.getContribution(), 0);
  }

  getOutcomeByName(name: string): Outcome | undefined {
    return this.outcomes.find(o => o.name === name);
  }
}
