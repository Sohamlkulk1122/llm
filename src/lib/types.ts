export type Tier = 'cheap' | 'mid' | 'hard';

export interface ModelInfo {
  name: string;
  tier: Tier;
  costPer1kPrompt: number;
  costPer1kCompletion: number;
  latencyPer1k: number;
}

export interface RoutingResult {
  difficulty: number;
  tier: Tier;
  model: ModelInfo;
  promptTokens: number;
  completionTokens: number;
  actualCost: number;
  baselineCost: number;
  savings: number;
  savingsPct: number;
  latencyMs: number;
  simulatedOutput: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  prompt: string;
  difficulty: number;
  tier: Tier;
  modelName: string;
  actualCost: number;
  baselineCost: number;
  savings: number;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
}
