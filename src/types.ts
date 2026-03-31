/**
 * Core types for the Probability Copilot
 * Philosophy: Make probability math visible, not prescriptive
 */

export interface Outcome {
  name: string;
  probability: number;
  value: number;
  description?: string;
  timeframe?: string;
}

export interface UncertaintyRange {
  low: number;
  mid: number;
  high: number;
}

export interface OutcomeWithUncertainty extends Omit<Outcome, 'value'> {
  value: UncertaintyRange;
}

export interface Scenario {
  name: string;
  description: string;
  outcomes: Outcome[];
  assumptions?: string[];
  context?: string;
}

export interface Decision {
  question: string;
  scenarios: Scenario[];
  considerations?: string[];
}

export interface ExpectedValueResult {
  expectedValue: number;
  breakdown: Array<{
    outcome: string;
    probability: number;
    value: number;
    contribution: number;
  }>;
  confidence: 'high' | 'medium' | 'low';
  warnings?: string[];
}

export interface ComparisonResult {
  scenarios: Array<{
    name: string;
    expectedValue: number;
    result: ExpectedValueResult;
  }>;
  insights: string[];
  sensitivityNotes?: string[];
}
