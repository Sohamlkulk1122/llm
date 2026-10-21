import { useState } from 'react';
import { BarChart3, FlaskConical, SlidersHorizontal } from 'lucide-react';
import type { LogEntry } from '@/lib/types';
import { generateMockLogs } from '@/lib/mockData';
import RouterSandbox from '@/components/RouterSandbox';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

type Tab = 'sandbox' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('sandbox');
  const [logs, setLogs] = useState<LogEntry[]>(() => generateMockLogs());

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="site-header">
        <div className="brand-lockup">
          <div>
            <h1 className="brand-name">Prompt Router</h1>
            <p className="brand-tagline">Choose the right model for each prompt.</p>
          </div>
        </div>

        <nav className="tab-switcher" aria-label="Application views">
          <TabButton active={activeTab === 'sandbox'} onClick={() => setActiveTab('sandbox')} icon={<FlaskConical />} label="Live Router Sandbox" />
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 />} label="Analytics Dashboard" />
        </nav>
      </header>

      <main className="site-main">
        {activeTab === 'sandbox' ? (
          <RouterSandbox onNewLog={(log) => setLogs((current) => [...current, log])} />
        ) : (
          <div>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow"><SlidersHorizontal className="h-3.5 w-3.5" /> Operations overview</p>
                <h2 className="page-title">Routing analytics</h2>
                <p className="page-subtitle">A clear view of where the router is saving time and money.</p>
              </div>
              <div className="hidden rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400 sm:block">{logs.length} queries recorded</div>
            </div>
            <AnalyticsDashboard logs={logs} onClearLogs={() => setLogs([])} />
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`tab-button ${active ? 'tab-button-active' : ''}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default App;
