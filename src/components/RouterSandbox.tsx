import { useState } from 'react';
import {
  Play,
  Zap,
  Cpu,
  Clock,
  DollarSign,
  TrendingDown,
  Hash,
  CheckCircle2,
} from 'lucide-react';
import type { LogEntry, RoutingResult } from '@/lib/types';
import { routePrompt, resultToLog } from '@/lib/router';
import { SAMPLE_PROMPTS, TIER_COLORS, TIER_LABELS } from '@/lib/constants';

interface Props {
  onNewLog: (log: LogEntry) => void;
}

export default function RouterSandbox({ onNewLog }: Props) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRoute = () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    setTimeout(() => {
      const res = routePrompt(prompt);
      setResult(res);
      onNewLog(resultToLog(res, prompt));
      setIsRunning(false);
    }, 600);
  };

  const handleSample = (text: string) => {
    setPrompt(text);
    setResult(null);
  };

  const difficultyPct = result ? Math.round(result.difficulty * 100) : 0;
  const scoreColor = result
    ? result.tier === 'cheap'
      ? '#22c55e'
      : result.tier === 'mid'
        ? '#f59e0b'
        : '#ef4444'
    : '#64748b';

  return (
    <div className="space-y-6">
      {/* Prompt Input Section */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-100">Prompt Tester</h2>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type or paste a prompt to route..."
          className="w-full h-32 px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-700/50 text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all font-mono text-sm leading-relaxed"
        />

        <div className="flex flex-wrap gap-2 mt-4">
          {SAMPLE_PROMPTS.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSample(s.text)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleRoute}
          disabled={!prompt.trim() || isRunning}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
        >
          <Play className="w-5 h-5" />
          {isRunning ? 'Routing...' : 'Test Route'}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Difficulty Gauge + Model Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Difficulty Score Bar */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Difficulty Score
                </h3>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold" style={{ color: scoreColor }}>
                  {result.difficulty.toFixed(2)}
                </span>
                <span className="text-sm text-slate-400 mb-1">
                  {result.tier === 'cheap'
                    ? 'Low Complexity'
                    : result.tier === 'mid'
                      ? 'Medium Complexity'
                      : 'High Complexity'}
                </span>
              </div>
              <div className="relative w-full h-4 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${difficultyPct}%`,
                    background: `linear-gradient(90deg, #22c55e 0%, #f59e0b 50%, #ef4444 100%)`,
                  }}
                />
                <div className="absolute top-0 left-[35%] h-full w-px bg-slate-600/50" />
                <div className="absolute top-0 left-[70%] h-full w-px bg-slate-600/50" />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                <span>0.00</span>
                <span>0.35</span>
                <span>0.70</span>
                <span>1.00</span>
              </div>
            </div>

            {/* Model Tier Badge */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Routed Model
                </h3>
              </div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-3"
                style={{
                  backgroundColor: `${TIER_COLORS[result.tier]}20`,
                  color: TIER_COLORS[result.tier],
                  border: `1px solid ${TIER_COLORS[result.tier]}40`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_COLORS[result.tier] }} />
                {TIER_LABELS[result.tier]}
              </div>
              <p className="text-2xl font-bold text-slate-100">{result.model.name}</p>
              <p className="text-sm text-slate-400 mt-1">
                ${result.model.costPer1kPrompt.toFixed(5)}/1K prompt · ${result.model.costPer1kCompletion.toFixed(3)}/1K completion
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard icon={<Hash className="w-4 h-4" />} label="Prompt Tokens" value={result.promptTokens.toString()} color="text-slate-200" />
            <MetricCard icon={<Hash className="w-4 h-4" />} label="Completion Tokens" value={result.completionTokens.toString()} color="text-slate-200" />
            <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Routed Cost" value={`$${result.actualCost.toFixed(4)}`} color="text-green-400" />
            <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Baseline Cost" value={`$${result.baselineCost.toFixed(4)}`} color="text-red-400" />
            <MetricCard icon={<TrendingDown className="w-4 h-4" />} label="Net Savings" value={`$${result.savings.toFixed(4)} (${result.savingsPct.toFixed(1)}%)`} color="text-green-400" />
            <MetricCard icon={<Clock className="w-4 h-4" />} label="Latency" value={`${result.latencyMs}ms`} color="text-amber-400" />
          </div>

          {/* Simulated Output */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                Simulated Output
              </h3>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono leading-relaxed bg-slate-950/40 rounded-xl p-4 border border-slate-800/50">
              {result.simulatedOutput}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl p-4">
      <div className="flex items-center gap-1.5 text-slate-500 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
