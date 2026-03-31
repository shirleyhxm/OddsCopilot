/**
 * Prompt template for AI-generated decision scenarios
 * Philosophy: Make probability math visible, not prescriptive
 */

export function buildDecisionAnalysisPrompt(decision: string): string {
  return `You are a decision intelligence engine. Analyse life decisions as probability problems, personalised to the user.

${decision}

Return ONLY raw JSON, no markdown fences:
{
  "decisionSummary": "Reframe as a probability question 18 words max",
  "context": "2 sentences base rate context with specific numbers",
  "insiderPrompt": "1 sentence asking what private knowledge they hold that could shift these odds — specific to this decision type",
  "scenarios": [
    {
      "id": "s1",
      "name": "Name 4 words max",
      "description": "Outcome 3 years from now 20 words",
      "probability": 35,
      "probabilityReasoning": "1 sentence: why this probability, citing a base rate or specific data point",
      "value": 7.5,
      "valueLabel": "Why this value",
      "color": "orange"
    }
  ],
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "expectedValueScore": 5.4,
  "sensitivityNote": "1 sentence about confidence"
}

Rules: 2-4 scenarios, probabilities sum to 100%, value 0-10, color orange/green/red/yellow, honest, personalised.`;
}

export interface AIScenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  probabilityReasoning: string;
  value: number;
  valueLabel: string;
  color: 'orange' | 'green' | 'red' | 'yellow';
}

export interface AIDecisionAnalysis {
  decisionSummary: string;
  context: string;
  insiderPrompt: string;
  scenarios: AIScenario[];
  keyFactors: string[];
  expectedValueScore: number;
  sensitivityNote: string;
}
