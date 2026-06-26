import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BundleMetadata {
  id: string;
  type: string;
  resourceCount: number;
  systemOrigin: string;
  timestamp: string;
  status: 'Valid' | 'Invalid' | 'Unverified';
}

const BundleViewerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bundle = (location.state as any)?.bundle;

  const jsonString = bundle ? JSON.stringify(bundle, null, 2) : '{\n  "message": "No bundle provided"\n}';

  const metadata: BundleMetadata = {
    id: bundle?.id || 'unknown',
    type: bundle?.type || bundle?.resourceType || 'Bundle',
    resourceCount: bundle?.total ?? (bundle?.entry ? bundle.entry.length : 0),
    systemOrigin: bundle?.meta?.source || bundle?.source || 'Unknown System',
    timestamp: bundle?.timestamp || bundle?.meta?.lastUpdated || new Date().toISOString(),
    status: 'Unverified',
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 to-cyan-200 bg-clip-text text-transparent">Clinical Bundle Viewer</h1>
            <p className="mt-2 text-emerald-300/80">Inspect, validate and serialize FHIR bundles returned by the mapping service.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl bg-emerald-900/40 border border-emerald-500/20 text-emerald-300">Back</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-emerald-500/10 pb-2">Bundle Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-400/80">Bundle ID</span>
                  <span className="font-mono text-cyan-300">{metadata.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400/80">Resource Type</span>
                  <span>{metadata.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400/80">Total Resources</span>
                  <span className="font-bold text-white">{metadata.resourceCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400/80">Origin System</span>
                  <span>{metadata.systemOrigin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400/80">Timestamp</span>
                  <span>{metadata.timestamp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400/80">Status</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">{metadata.status}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-sm space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-emerald-500/10 pb-2">Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fhir-bundle-${metadata.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/60 transition-all text-center"
                >
                  📥 Download FHIR JSON
                </button>
                <button className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/60 transition-all text-center">📤 Push to ABDM</button>
                <button className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/60 transition-all text-center">⚙️ Structural Check</button>
                <button className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/60 transition-all text-center">🔍 Diff Compare</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 backdrop-blur-sm overflow-hidden flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
              <span className="font-semibold text-sm">Raw FHIR Representation</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-800/30 text-emerald-300">JSON</span>
            </div>
            <div className="flex-1 p-6 font-mono text-xs overflow-auto bg-black/25 text-emerald-300 leading-relaxed">
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm text-emerald-300 font-semibold">FHIR Bundle JSON</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(jsonString)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-900/40 border border-emerald-500/10 text-emerald-300 hover:bg-emerald-900/60 transition-all"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([jsonString], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `fhir-bundle-${metadata.id}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-all"
                  >
                    Download JSON
                  </button>
                </div>
              </div>
              <pre>{jsonString}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleViewerPage;
