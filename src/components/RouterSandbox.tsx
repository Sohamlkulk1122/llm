import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CircleGauge,
  Clock3,
  DollarSign,
  Gauge,
  Hash,
  Play,
  Route,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import type { LogEntry, RoutingResult, Tier } from '@/lib/types';
import { calculateDifficulty, getTier, resultToLog, routePrompt } from '@/lib/router';
import { SAMPLE_PROMPTS, TIER_COLORS, TIER_LABELS } from '@/lib/constants';

interface Props {
  onNewLog: (log: LogEntry) => void;
}

const DEFAULT_PROMPT = SAMPLE_PROMPTS[2].text;

const tierNames: Record<Tier, string> = {
  cheap: 'Cheap Tier',
  mid: 'Mid Tier',
  hard: 'Hard Tier',
};

export default function RouterSandbox({ onNewLog }: Props) {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const liveEstimate = useMemo(() => {
    const difficulty = calculateDifficulty(prompt);
    const tier = getTier(difficulty);
    const words = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
    const complexityKeywords = [
      'derive', 'analyze', 'architect', 'refactor', 'proof', 'debug', 'optimize',
      'implement', 'design', 'evaluate', 'compare', 'algorithm', 'distributed',
      'consensus', 'performance', 'trade-off', 'step-by-step',
    ];
    const keywordHits = complexityKeywords.filter((keyword) => prompt.toLowerCase().includes(keyword)).length;
    const stepHits = ['first', 'then', 'step', 'next', 'finally', 'after that'].filter((word) => prompt.toLowerCase().includes(word)).length;

    return {
      difficulty,
      tier,
      length: Math.min(words / 120, 1) * 0.35,
      keywords: Math.min(keywordHits / 5, 1) * 0.35,
      steps: Math.min(stepHits / 3, 1) * 0.15,
    };
  }, [prompt]);

  const handleRoute = () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    window.setTimeout(() => {
      const routed = routePrompt(prompt);
      setResult(routed);
      onNewLog(resultToLog(routed, prompt));
      setIsRunning(false);
    }, 500);
  };

  const handleSample = (text: string) => {
    setPrompt(text);
    setResult(null);
  };

  const scoreColor = TIER_COLORS[liveEstimate.tier];
  const resultColor = result ? TIER_COLORS[result.tier] : '#46d98d';

  return (
    <div>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(330px,0.8fr)_minmax(520px,1.4fr)] gap-5 xl:gap-6 items-stretch">
        <section className="panel flex flex-col p-5 sm:p-6">
          <div className="section-heading">
            <div className="icon-tile icon-tile-amber"><Zap className="h-4 w-4" /></div>
            <p className="eyebrow">Prompt tester</p>
          </div>

          <textarea
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setResult(null);
            }}
            placeholder="Ask anything..."
            className="prompt-input mt-5"
            spellCheck={false}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleSample(sample.text)}
                className={`sample-chip ${prompt === sample.text ? 'sample-chip-active' : ''}`}
              >
                {sample.label}
              </button>
            ))}
          </div>

          <div className="estimate-card mt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-400">Live estimate</span>
              <span className="font-mono text-sm font-semibold" style={{ color: scoreColor }}>
                {liveEstimate.difficulty.toFixed(2)} · {tierNames[liveEstimate.tier]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 font-mono text-[11px] text-slate-500">
              <Estimate label="len" value={liveEstimate.length} />
              <Estimate label="kw" value={liveEstimate.keywords} />
              <Estimate label="steps" value={liveEstimate.steps} />
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${liveEstimate.difficulty * 100}%`, backgroundColor: scoreColor }} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRoute}
            disabled={!prompt.trim() || isRunning}
            className="primary-action mt-5"
          >
            {isRunning ? <CircleGauge className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Routing prompt' : 'Test route'}
            {!isRunning && <ArrowRight className="ml-auto h-4 w-4" />}
          </button>
        </section>

        <section className={`panel result-panel min-h-[560px] ${result ? 'result-panel-ready' : ''}`}>
          {result ? (
            <RoutedResult result={result} color={resultColor} />
          ) : (
            <div className="empty-state">
              <div className="empty-glyph"><Gauge className="h-7 w-7" /></div>
              <p className="text-lg font-medium text-slate-300">Run a prompt to see where it gets routed.</p>
              <p className="mt-2 max-w-xs text-center text-sm leading-6 text-slate-500">The selected model, cost, and savings will appear here.</p>
              <div className="mt-6 flex items-center gap-2 text-xs text-slate-600"><Route className="h-3.5 w-3.5" /> Awaiting input</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Estimate({ label, value }: { label: string; value: number }) {
  return <span><span className="text-slate-600">{label} </span>{value.toFixed(2)}</span>;
}

function RoutedResult({ result, color }: { result: RoutingResult; color: string }) {
  return (
    <div className="h-full p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <p className="eyebrow"><Route className="h-3.5 w-3.5" /> Decision made</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">Routed to {result.model.name}</h3>
          <p className="mt-1 text-sm text-slate-500">The smallest model that can comfortably handle this prompt.</p>
        </div>
        <div className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ color, backgroundColor: `${color}16`, border: `1px solid ${color}35` }}>
          {TIER_LABELS[result.tier]}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-5">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500"><span>Difficulty</span><span className="font-mono" style={{ color }}>{result.difficulty.toFixed(2)}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full" style={{ width: `${result.difficulty * 100}%`, backgroundColor: color }} /></div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-slate-600"><span>simple</span><span>complex</span></div>
        </div>
        <div className="text-right"><p className="text-xs text-slate-500">Savings</p><p className="mt-1 text-2xl font-semibold text-emerald-300">{result.savingsPct.toFixed(0)}%</p></div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ResultMetric icon={<DollarSign />} label="Routed cost" value={`$${result.actualCost.toFixed(4)}`} emphasis="green" />
        <ResultMetric icon={<DollarSign />} label="Baseline" value={`$${result.baselineCost.toFixed(4)}`} />
        <ResultMetric icon={<Clock3 />} label="Latency" value={`${result.latencyMs}ms`} />
        <ResultMetric icon={<Hash />} label="Tokens" value={`${result.promptTokens + result.completionTokens}`} />
      </div>

      <div className="output-card mt-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3"><span className="eyebrow"><Terminal className="h-3.5 w-3.5" /> Preview output</span><span className="flex items-center gap-1.5 text-[11px] text-emerald-300/70"><Check className="h-3.5 w-3.5" /> Simulated</span></div>
        <pre className="mt-4 max-h-52 overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-slate-400">{result.simulatedOutput}</pre>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><Sparkles className="h-3.5 w-3.5 text-amber-300" /> Routing decision completed in the local scoring engine.</div>
    </div>
  );
}

function ResultMetric({ icon, label, value, emphasis }: { icon: React.ReactNode; label: string; value: string; emphasis?: 'green' }) {
  return <div className="metric-tile"><div className="flex items-center gap-1.5 text-slate-600">{icon}<span>{label}</span></div><p className={`mt-2 font-mono text-sm ${emphasis === 'green' ? 'text-emerald-300' : 'text-slate-200'}`}>{value}</p></div>;
}
