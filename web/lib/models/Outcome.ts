import { Outcome as IOutcome } from '../types';

export class Outcome implements IOutcome {
  name: string;
  probability: number;
  value: number;
  description?: string;
  timeframe?: string;

  constructor(
    name: string,
    probability: number,
    value: number,
    description?: string,
    timeframe?: string
  ) {
    if (probability < 0 || probability > 1) {
      throw new Error(`Probability must be between 0 and 1, got ${probability}`);
    }

    this.name = name;
    this.probability = probability;
    this.value = value;
    this.description = description;
    this.timeframe = timeframe;
  }

  getContribution(): number {
    return this.probability * this.value;
  }

  toString(): string {
    const pct = (this.probability * 100).toFixed(1);
    return `${this.name}: ${pct}% chance of ${this.formatValue(this.value)}`;
  }

  private formatValue(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  }
}
