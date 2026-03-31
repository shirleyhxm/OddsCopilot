import { Decision as IDecision, Scenario as IScenario } from '../types';
import { Scenario } from './Scenario';

export class Decision implements IDecision {
  question: string;
  scenarios: Scenario[];
  considerations?: string[];

  constructor(
    question: string,
    scenarios: IScenario[],
    considerations?: string[]
  ) {
    this.question = question;
    this.scenarios = scenarios.map(
      s => new Scenario(s.name, s.description, s.outcomes, s.assumptions, s.context)
    );
    this.considerations = considerations;
  }

  getScenarioByName(name: string): Scenario | undefined {
    return this.scenarios.find(s => s.name === name);
  }

  getBestScenarioByEV(): Scenario {
    return this.scenarios.reduce((best, current) =>
      current.getExpectedValue() > best.getExpectedValue() ? current : best
    );
  }

  getWorstScenarioByEV(): Scenario {
    return this.scenarios.reduce((worst, current) =>
      current.getExpectedValue() < worst.getExpectedValue() ? current : worst
    );
  }
}
