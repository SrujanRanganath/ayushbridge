import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NAMASTECode, MappingJob } from '../types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mapNAMASTECode, MappingResult } from '../services/mappingService';
import { generateFHIRBundle } from '../services/fhirService';
import { useNavigate } from 'react-router-dom';

const MappingPage: React.FC = () => {
  const location = useLocation();
  const [selectedTerm, setSelectedTerm] = useState<NAMASTECode | null>(null);
  // removed manual ICD inputs — mapping is fetched automatically

  // Dynamic state for mapping jobs list to display newly added maps
  const [mappings] = useState<MappingJob[]>([
    {
      id: 'MAP-101',
      sourceSystem: 'Ayurveda (National Morbidity Codes)',
      sourceTerm: 'Amlapitta (अम्லபித்தா)',
      targetSystem: 'ICD-11',
      targetCode: 'DA60.0 (Gastro-oesophageal reflux disease)',
      confidence: 94,
      dateCreated: '2026-06-12',
    },
    {
      id: 'MAP-102',
      sourceSystem: 'Siddha Morbidity Codes',
      sourceTerm: 'Kaba Suram (கபசுரம்)',
      targetSystem: 'ICD-11',
      targetCode: 'CA40.0 (Pneumonia)',
      confidence: 88,
      dateCreated: '2026-06-13',
    },
    {
      id: 'MAP-103',
      sourceSystem: 'Unani Medicine Registry',
      sourceTerm: 'Waja-ul-Mafasil (وجع المفاصل)',
      targetSystem: 'ICD-11',
      targetCode: 'FA10.0 (Osteoarthritis of hip or knee)',
      confidence: 91,
      dateCreated: '2026-06-14',
    },
  ]);

  useEffect(() => {
    // 1. Try to load selection from Router navigation state
    if (location.state?.selectedCode) {
      console.log('[MappingPage] Loaded selected code from navigation state:', location.state.selectedCode);
      setSelectedTerm(location.state.selectedCode);
    } else {
      // 2. Try to fallback onto sessionStorage
      const stored = sessionStorage.getItem('selectedNAMASTECode');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as NAMASTECode;
          console.log('[MappingPage] Loaded selected code from sessionStorage cache:', parsed);
          setSelectedTerm(parsed);
        } catch (e) {
          console.error('[MappingPage] Error parsing sessionStorage selected term:', e);
        }
      }
    }
  }, [location.state]);

  const clearSelectedTerm = () => {
    console.log('[MappingPage] Clearing selection');
    sessionStorage.removeItem('selectedNAMASTECode');
    setSelectedTerm(null);
  };

  // mapping is fetched automatically via React Query when a selection exists

  const {
    data: mappingResult,
    isLoading: isMappingLoading,
    isError: isMappingError,
    error: mappingError,
  } = useQuery<MappingResult, Error>({
    queryKey: ['map', selectedTerm?.code],
    queryFn: async () => {
      if (!selectedTerm) throw new Error('No NAMASTE term selected');
      return mapNAMASTECode(selectedTerm.code, selectedTerm.name);
    },
    enabled: !!selectedTerm,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  const navigate = useNavigate();

  const bundleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTerm || !mappingResult) throw new Error('Missing mapping or selection');
      return generateFHIRBundle({
        patientId: 'patient-unknown',
        namasteCode: selectedTerm.code,
        icd11Code: mappingResult.icdCode,
        icd11Title: mappingResult.icdTitle,
        conditionName: mappingResult.conditionName || selectedTerm.name,
      });
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 to-cyan-200 bg-clip-text text-transparent">
              ICD-11 Mapping Studio
            </h1>
            <p className="mt-2 text-emerald-300/80">
              Manage semantic mappings between AYUSH terms and ICD-11 classifications.
            </p>
          </div>
        </div>

        {/* Selected Draft Card */}
        {selectedTerm && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-emerald-400/30 backdrop-blur-md shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Drafting Mapping Reference
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Source: {selectedTerm.name} ({selectedTerm.code})
                </h2>
                <p className="text-sm text-emerald-200/70 mt-1 max-w-3xl">
                  {selectedTerm.description || 'No description available for this NAMASTE term.'}
                </p>
                <div className="text-xs text-teal-400 font-semibold mt-2">
                  Category: {selectedTerm.category || 'Morbidity'}
                </div>
              </div>
              <button
                onClick={clearSelectedTerm}
                className="text-xs font-semibold px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all"
              >
                Clear selection
              </button>
            </div>

            <div className="pt-4 border-t border-emerald-500/10">
              {isMappingLoading && (
                <div className="p-4 text-emerald-200/90">Searching ICD-11 mapping...</div>
              )}

              {isMappingError && (
                <div className="p-4 text-yellow-300">Error fetching mapping: {mappingError?.message}</div>
              )}

              {mappingResult && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-emerald-300 font-semibold">NAMASTE Code</div>
                      <div className="font-bold text-white mt-1">{selectedTerm?.code} — {selectedTerm?.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-300 font-semibold">Condition Name</div>
                      <div className="font-medium text-white mt-1">{mappingResult.conditionName || selectedTerm?.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-300 font-semibold">ICD-11 Mapping</div>
                      <div className="font-bold text-white mt-1">{mappingResult.icdCode} — {mappingResult.icdTitle}</div>
                      <div className="text-xs text-emerald-400 mt-2">Confidence: <span className="font-semibold text-green-400">{mappingResult.confidence}%</span></div>
                      <div className="text-xs text-emerald-400 mt-1">Source: {mappingResult.source}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={async () => {
                        try {
                          const result = await bundleMutation.mutateAsync();
                          // navigate to bundle viewer passing bundle in state
                          navigate('/bundle', { state: { bundle: result } });
                        } catch (err) {
                          console.error('Error generating bundle', err);
                        }
                      }}
                      disabled={!mappingResult || bundleMutation.status === 'pending'}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-emerald-950 font-bold text-sm rounded-xl hover:from-emerald-300 hover:to-cyan-300 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {bundleMutation.status === 'pending' ? 'Generating Bundle...' : 'Generate FHIR Bundle'}
                    </button>
                    <button
                      onClick={clearSelectedTerm}
                      className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 text-sm font-semibold"
                    >
                      Clear selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-sm">
            <span className="text-emerald-400 font-medium text-sm">Mapping Success Rate</span>
            <div className="text-3xl font-bold mt-2">91.3%</div>
            <div className="w-full bg-emerald-950 rounded-full h-1.5 mt-3">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '91.3%' }}></div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-sm">
            <span className="text-emerald-400 font-medium text-sm">Pending Verifications</span>
            <div className="text-3xl font-bold mt-2">24</div>
            <div className="text-xs text-yellow-400 mt-2 font-medium">⚠️ 12 require urgent attention</div>
          </div>
          <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-sm">
            <span className="text-emerald-400 font-medium text-sm">Mapped Terminology Count</span>
            <div className="text-3xl font-bold mt-2">1,248</div>
            <div className="text-xs text-cyan-300 mt-2 font-medium">✨ +84 mapped this week</div>
          </div>
        </div>

        {/* Mappings Table */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-900/10 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-emerald-500/20">
            <h3 className="font-bold text-lg">Active Mappings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Source term (AYUSH)</th>
                  <th className="p-4">Target term (ICD-11)</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Date Created</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10 text-sm text-emerald-100/90">
                {mappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-emerald-950/20 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-cyan-400 font-semibold">{mapping.id}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">{mapping.sourceTerm}</div>
                      <div className="text-xs text-emerald-400/70">{mapping.sourceSystem}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{mapping.targetCode}</div>
                      <div className="text-xs text-emerald-400/70">{mapping.targetSystem}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${
                          mapping.confidence >= 90 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {mapping.confidence}%
                        </span>
                        <div className="w-16 bg-emerald-950 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${
                              mapping.confidence >= 90 ? 'bg-green-400' : 'bg-yellow-400'
                            }`}
                            style={{ width: `${mapping.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-emerald-300/80">{mapping.dateCreated}</td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all">
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingPage;

