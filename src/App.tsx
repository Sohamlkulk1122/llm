import { useState } from 'react';
import { GitBranch, BarChart3, Activity } from 'lucide-react';
import type { LogEntry } from '@/lib/types';
import { generateMockLogs } from '@/lib/mockData';
import RouterSandbox from '@/components/RouterSandbox';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

type Tab = 'sandbox' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('sandbox');
  const [logs, setLogs] = useState<LogEntry[]>(() => generateMockLogs());

  const handleNewLog = (log: LogEntry) => {
    setLogs((prev) => [...prev, log]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 leading-tight">
                  Cost-Aware LLM Router
                </h1>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Intelligent model routing & cost optimization
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <TabButton
                active={activeTab === 'sandbox'}
                onClick={() => setActiveTab('sandbox')}
                icon={<Activity className="w-4 h-4" />}
                label="Live Router"
              />
              <TabButton
                active={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
                icon={<BarChart3 className="w-4 h-4" />}
                label="Analytics"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'sandbox' ? (
          <RouterSandbox onNewLog={handleNewLog} />
        ) : (
          <AnalyticsDashboard logs={logs} onClearLogs={handleClearLogs} />
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default App;
