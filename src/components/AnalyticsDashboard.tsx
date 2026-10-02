import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Database,
  DollarSign,
  Percent,
  Clock,
  Trash2,
  Download,
  Filter,
} from 'lucide-react';
import type { LogEntry, Tier } from '@/lib/types';
import { TIER_COLORS, TIER_LABELS } from '@/lib/constants';

interface Props {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export default function AnalyticsDashboard({ logs, onClearLogs }: Props) {
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');

  const filteredLogs = useMemo(() => {
    if (tierFilter === 'all') return logs;
    return logs.filter((l) => l.tier === tierFilter);
  }, [logs, tierFilter]);

  const stats = useMemo(() => {
    const totalQueries = logs.length;
    const totalSavings = logs.reduce((sum, l) => sum + l.savings, 0);
    const totalBaseline = logs.reduce((sum, l) => sum + l.baselineCost, 0);
    const totalActual = logs.reduce((sum, l) => sum + l.actualCost, 0);
    const avgReduction = totalBaseline > 0 ? ((totalBaseline - totalActual) / totalBaseline) * 100 : 0;
    const avgLatency = totalQueries > 0 ? logs.reduce((sum, l) => sum + l.latencyMs, 0) / totalQueries : 0;
    return { totalQueries, totalSavings, avgReduction, avgLatency };
  }, [logs]);

  const pieData = useMemo(() => {
    const counts: Record<Tier, number> = { cheap: 0, mid: 0, hard: 0 };
    logs.forEach((l) => counts[l.tier]++);
    return (['cheap', 'mid', 'hard'] as Tier[]).map((tier) => ({
      name: TIER_LABELS[tier],
      value: counts[tier],
      tier,
    }));
  }, [logs]);

  const cumulativeData = useMemo(() => {
    let baselineCum = 0;
    let routerCum = 0;
    return [...logs]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((l, i) => {
        baselineCum += l.baselineCost;
        routerCum += l.actualCost;
        return {
          idx: i + 1,
          baseline: parseFloat(baselineCum.toFixed(4)),
          router: parseFloat(routerCum.toFixed(4)),
        };
      });
  }, [logs]);

  const histogramData = useMemo(() => {
    const bins = [
      { range: '0.0-0.2', min: 0, max: 0.2, count: 0 },
      { range: '0.2-0.4', min: 0.2, max: 0.4, count: 0 },
      { range: '0.4-0.6', min: 0.4, max: 0.6, count: 0 },
      { range: '0.6-0.8', min: 0.6, max: 0.8, count: 0 },
      { range: '0.8-1.0', min: 0.8, max: 1.01, count: 0 },
    ];
    logs.forEach((l) => {
      const bin = bins.find((b) => l.difficulty >= b.min && l.difficulty < b.max);
      if (bin) bin.count++;
    });
    return bins;
  }, [logs]);

  const downloadCSV = () => {
    const headers = [
      'Timestamp',
      'Prompt Snippet',
      'Difficulty Score',
      'Routed Model',
      'Actual Cost',
      'Baseline Cost',
      'Saved ($)',
    ];
    const rows = filteredLogs.map((l) => [
      new Date(l.timestamp).toISOString(),
      `"${l.prompt.slice(0, 80).replace(/"/g, '""')}"`,
      l.difficulty.toFixed(2),
      l.modelName,
      l.actualCost.toFixed(4),
      l.baselineCost.toFixed(4),
      l.savings.toFixed(4),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `router-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Database className="w-5 h-5" />}
          label="Total Queries"
          value={stats.totalQueries.toString()}
          color="text-cyan-400"
          bgColor="bg-cyan-500/10"
        />
        <SummaryCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Savings"
          value={`$${stats.totalSavings.toFixed(4)}`}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <SummaryCard
          icon={<Percent className="w-5 h-5" />}
          label="Avg Cost Reduction"
          value={`${stats.avgReduction.toFixed(1)}%`}
          color={stats.avgReduction > 60 ? 'text-green-400' : 'text-amber-400'}
          bgColor="bg-amber-500/10"
          subtitle={stats.avgReduction > 60 ? 'Above 60% target' : 'Below 60% target'}
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5" />}
          label="Avg Latency Delta"
          value={`${Math.round(stats.avgLatency)}ms`}
          color="text-sky-300"
          bgColor="bg-sky-400/10"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="panel p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
            Model Tier Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.tier} fill={TIER_COLORS[entry.tier]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Cost Line Chart */}
        <div className="panel p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
            Cost Savings Comparison (Cumulative)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="idx" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v.toFixed(3)}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
                formatter={(v) => `${Number(v).toFixed(4)}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="baseline"
                name="Always Expensive Baseline"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="router"
                name="Smart Router Cost"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Histogram */}
      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
          Difficulty Score Histogram
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={histogramData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {histogramData.map((entry, i) => {
                const mid = (entry.min + entry.max) / 2;
                const color = mid < 0.35 ? '#22c55e' : mid < 0.7 ? '#f59e0b' : '#ef4444';
                return <Cell key={i} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Query Logs Table */}
      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Recent Query Logs
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as Tier | 'all')}
                className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                <option value="all">All Tiers</option>
                <option value="cheap">Cheap</option>
                <option value="mid">Mid</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-cyan-300 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900/30 border border-red-800/50 text-red-300 hover:bg-red-800/40 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Logs
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase tracking-wide border-b border-slate-800">
                <th className="pb-3 pr-4 font-medium">Timestamp</th>
                <th className="pb-3 pr-4 font-medium">Prompt Snippet</th>
                <th className="pb-3 pr-4 font-medium">Difficulty</th>
                <th className="pb-3 pr-4 font-medium">Routed Model</th>
                <th className="pb-3 pr-4 font-medium text-right">Actual Cost</th>
                <th className="pb-3 pr-4 font-medium text-right">Baseline Cost</th>
                <th className="pb-3 font-medium text-right">Saved ($)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No logs to display.
                  </td>
                </tr>
              ) : (
                [...filteredLogs]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 pr-4 text-slate-400 whitespace-nowrap text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 pr-4 text-slate-300 max-w-xs truncate">
                        {log.prompt.slice(0, 60)}
                        {log.prompt.length > 60 ? '...' : ''}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className="font-mono font-semibold"
                          style={{ color: TIER_COLORS[log.tier] }}
                        >
                          {log.difficulty.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-300 whitespace-nowrap text-xs">
                        {log.modelName}
                      </td>
                      <td className="py-3 pr-4 text-right text-green-400 font-mono text-xs">
                        ${log.actualCost.toFixed(4)}
                      </td>
                      <td className="py-3 pr-4 text-right text-red-400 font-mono text-xs">
                        ${log.baselineCost.toFixed(4)}
                      </td>
                      <td className="py-3 text-right text-green-400 font-mono text-xs font-semibold">
                        ${log.savings.toFixed(4)}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  bgColor,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  subtitle?: string;
}) {
  return (
    <div className="panel p-5">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bgColor} ${color} mb-3`}>
        {icon}
      </div>
      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
