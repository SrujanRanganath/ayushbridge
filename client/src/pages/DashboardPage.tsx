import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboard, DashboardResponse } from '../services/dashboardService';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top welcome banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-emerald-500/25 relative overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              System Dashboard
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-cyan-200 bg-clip-text text-transparent">
              AyushBridge Data Integration Platform
            </h1>
            <p className="text-emerald-200/80 text-sm sm:text-base leading-relaxed">
              Synthesizing Ayurvedic, Siddha, Unani, and Homeopathic terminology with WHO ICD-11 classifications. Seamlessly process data bundles, map vocabularies, and monitor mapping health.
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 text-emerald-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-300 hover:to-cyan-300 transition-all duration-300 hover:scale-[1.02]"
              >
                Search Directory
              </Link>
              <Link
                to="/mapping"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-950/60 transition-all"
              >
                Open Mapping Studio
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Mapped Codes', value: '4,102', change: '+12% this month', color: 'text-emerald-400', icon: '📁' },
            { title: 'Pending Review', value: '184', change: 'Require clinical audit', color: 'text-yellow-400', icon: '⏳' },
            { title: 'Integrated EHR Bundles', value: '12,940', change: '+342 today', color: 'text-cyan-400', icon: '🔗' },
            { title: 'System Uptime / Status', value: '99.98%', change: 'All services operational', color: 'text-green-400', icon: '🛡️' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-emerald-400/80">{stat.title}</span>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-emerald-300/60 mt-2 font-medium">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Grid for activity & health info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Recent Mappings */}
            <div className="lg:col-span-2 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-900/10 backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
                <h3 className="text-lg font-bold">Recent Mappings</h3>
              </div>

              {/* Fetch dashboard data */}
              <DashboardData />
            </div>

          {/* Side panel - Recent Bundles */}
          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-900/10 backdrop-blur-sm space-y-6">
            <h3 className="text-lg font-bold border-b border-emerald-500/10 pb-4">Recent Bundles</h3>
            <DashboardBundles />
          </div>
        </div>
      </div>
    </div>
  );
};

function DashboardData() {
  const { data, isLoading, isError, error } = useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  if (isLoading) return <div className="p-6 text-emerald-300">Loading recent mappings...</div>;
  if (isError) return <div className="p-6 text-yellow-300">Error loading dashboard: {error?.message}</div>;

  return (
    <div className="space-y-3">
      {data?.recentMappings.length ? (
        data.recentMappings.map((m, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/10 hover:border-emerald-500/20 transition-all">
            <div className="h-8 w-8 rounded-lg bg-emerald-800/30 flex items-center justify-center text-sm">🩺</div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold text-white">{m.namasteCode} — {m.namasteName}</div>
                  <div className="text-xs text-emerald-300/70">{m.icd11Code} — {m.icd11Title}</div>
                </div>
                <div className="text-xs text-emerald-400/70">{m.date}</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-emerald-300">No recent mappings available.</div>
      )}
    </div>
  );
}

function DashboardBundles() {
  const { data, isLoading, isError, error } = useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  if (isLoading) return <div className="p-2 text-emerald-300">Loading bundles...</div>;
  if (isError) return <div className="p-2 text-yellow-300">Error loading bundles: {error?.message}</div>;

  return (
    <div className="space-y-3">
      {data?.recentBundles.length ? (
        data.recentBundles.map((b, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-emerald-950/10 border border-emerald-500/10 text-sm">
            <div className="flex justify-between">
              <div className="font-medium text-white">Patient: <span className="font-mono text-cyan-300">{b.patientId}</span></div>
              <div className="text-xs text-emerald-400">{b.generatedDate}</div>
            </div>
            <div className="text-xs text-emerald-300 mt-2">NAMASTE: {b.namasteCode} • ICD11: {b.icd11Code}</div>
          </div>
        ))
      ) : (
        <div className="p-2 text-emerald-300">No recent bundles found.</div>
      )}
    </div>
  );
}

export default DashboardPage;
