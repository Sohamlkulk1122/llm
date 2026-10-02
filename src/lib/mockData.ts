import type { LogEntry } from './types';
import { calculateDifficulty, getTier, routePrompt } from './router';
import { MODELS } from './constants';

const MOCK_PROMPTS = [
  'What is the capital of France?',
  'Write a Python function to parse JSON with error handling.',
  'Derive the architectural trade-offs between Paxos and Raft consensus algorithms with step-by-step proofs.',
  'Summarize the key benefits of a Mediterranean diet.',
  'Refactor this legacy Java class to use the Strategy pattern and analyze the migration trade-offs.',
  'Debug why my React component re-renders on every state update.',
  'List the top 5 tourist attractions in Tokyo.',
  'Design a distributed rate limiter with eventual consistency guarantees and analyze failure modes.',
  'Explain how HTTP/2 multiplexing works.',
  'Implement a thread-safe LRU cache in Rust and evaluate its performance under concurrent load.',
  'What does the acronym DNS stand for?',
  'Analyze the time complexity of quicksort and prove its average-case bound.',
  'Write a haiku about autumn.',
  'Architect a multi-tenant SaaS billing system with detailed trade-offs between isolation models.',
  'Convert 100 degrees Celsius to Fahrenheit.',
  'Compare and contrast SQL vs NoSQL databases with comprehensive reasoning about when to use each.',
  'Optimize this SQL query that takes 30 seconds to run on a 10M row table.',
  'Write a regex to validate email addresses.',
];

export function generateMockLogs(): LogEntry[] {
  const logs: LogEntry[] = [];
  const now = Date.now();

  MOCK_PROMPTS.forEach((prompt, i) => {
    const difficulty = calculateDifficulty(prompt);
    const tier = getTier(difficulty);
    const model = MODELS[tier];
    const result = routePrompt(prompt);

    const promptTokens = result.promptTokens;
    const completionTokens = result.completionTokens;
    const actualCost = result.actualCost;
    const baselineCost = result.baselineCost;

    logs.push({
      id: `mock-${i}`,
      timestamp: now - (MOCK_PROMPTS.length - i) * 1000 * 60 * 7,
      prompt,
      difficulty,
      tier,
      modelName: model.name,
      actualCost,
      baselineCost,
      savings: baselineCost - actualCost,
      latencyMs: result.latencyMs,
      promptTokens,
      completionTokens,
    });
  });

  return logs;
}
