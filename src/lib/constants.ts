import type { ModelInfo, Tier } from './types';

export const MODELS: Record<Tier, ModelInfo> = {
  cheap: {
    name: 'Claude 3.5 Haiku',
    tier: 'cheap',
    costPer1kPrompt: 0.00025,
    costPer1kCompletion: 0.00125,
    latencyPer1k: 8,
  },
  mid: {
    name: 'Claude 3.5 Sonnet',
    tier: 'mid',
    costPer1kPrompt: 0.003,
    costPer1kCompletion: 0.015,
    latencyPer1k: 15,
  },
  hard: {
    name: 'Claude 3 Opus',
    tier: 'hard',
    costPer1kPrompt: 0.015,
    costPer1kCompletion: 0.075,
    latencyPer1k: 30,
  },
};

export const BASELINE_MODEL = MODELS.hard;

export const TIER_LABELS: Record<Tier, string> = {
  cheap: 'Cheap Tier',
  mid: 'Mid Tier',
  hard: 'Hard Tier',
};

export const TIER_COLORS: Record<Tier, string> = {
  cheap: '#94a3b8',
  mid: '#f59e0b',
  hard: '#ef4444',
};

export const SAMPLE_PROMPTS: { label: string; text: string }[] = [
  {
    label: 'Simple',
    text: 'What is the capital of France?',
  },
  {
    label: 'Medium Code',
    text: 'Write a Python function to parse JSON with error handling.',
  },
  {
    label: 'Complex Reasoning',
    text: 'Derive the architectural trade-offs between Paxos and Raft consensus algorithms with step-by-step proofs.',
  },
];
