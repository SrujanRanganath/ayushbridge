import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchNAMASTECodes } from '../services/searchService';
import { NAMASTECode } from '../types';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigate = useNavigate();

  // Debounce the search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Use React Query for caching search queries
  const { data: results = [], isLoading, isError, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => {
      console.log(`[ReactQuery] Fetching query: "${debouncedQuery}"`);
      return searchNAMASTECodes(debouncedQuery);
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });

  const handleSelectResult = (item: NAMASTECode) => {
    console.log('[SearchPage] Selecting NAMASTE code:', item);
    // Store selected record in sessionStorage for persistence across page refreshes
    sessionStorage.setItem('selectedNAMASTECode', JSON.stringify(item));
    // Navigate and pass in React Router state for immediate transition load
    navigate('/mapping', { state: { selectedCode: item } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 to-cyan-200 bg-clip-text text-transparent">
            Terminology & ICD-11 Directory
          </h1>
          <p className="mt-2 text-emerald-300/80">
            Search and cross-reference live NAMASTE codes from MongoDB
          </p>
        </div>

        {/* Search Input Controls */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-emerald-400 text-lg">
            🔍
          </span>
          <input
            type="text"
            placeholder="Type at least 2 characters (e.g. 'vata', 'jvara') to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 shadow-lg text-lg"
          />
        </div>

        {/* Results Area */}
        <div className="space-y-4">
          {/* Query helper text */}
          {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
            <p className="text-xs text-teal-400 animate-pulse">
              Please type at least 2 characters to trigger the backend search...
            </p>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
              <p className="text-sm text-emerald-300/70">Querying NAMASTE dictionary...</p>
            </div>
          )}

          {/* Error Indicator */}
          {isError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              <p className="font-semibold">⚠️ Search failed</p>
              <p className="text-xs text-red-400/80 mt-1">{(error as Error)?.message || 'An error occurred.'}</p>
            </div>
          )}

          {/* Result Card Grid */}
          {!isLoading && !isError && debouncedQuery.trim().length >= 2 && (
            <>
              <div className="text-sm text-emerald-400/80 font-medium">
                Found {results.length} results for "{debouncedQuery}"
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((item) => (
                    <div
                      key={item.code}
                      onClick={() => handleSelectResult(item)}
                      className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-900/20 transition-all duration-300 backdrop-blur-sm group cursor-pointer hover:scale-[1.01] shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.category || 'Morbidity'}
                          </span>
                          <span className="text-xs text-emerald-400/60 uppercase font-mono tracking-wider font-semibold">
                            {item.code}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-emerald-200/70 leading-relaxed mb-4">
                          {item.description || 'No description available for this NAMASTE term.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between text-xs text-emerald-400">
                        <span>Click to map term</span>
                        <span>➔</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-emerald-900/5 rounded-2xl border border-dashed border-emerald-800/30">
                  <span className="text-4xl block mb-2">🍃</span>
                  <h3 className="text-lg font-semibold text-emerald-200">No codes found</h3>
                  <p className="text-sm text-emerald-400/60 mt-1">
                    Try checking your spelling or search for another term like "vata" or "jvara"
                  </p>
                </div>
              )}
            </>
          )}

          {/* Idle state */}
          {debouncedQuery.trim().length < 2 && !isLoading && (
            <div className="text-center py-20 bg-emerald-900/5 rounded-3xl border border-emerald-800/10">
              <span className="text-5xl block mb-4">🌱</span>
              <h3 className="text-xl font-bold text-emerald-200">Enter a query to begin</h3>
              <p className="text-sm text-emerald-400/60 mt-2 max-w-md mx-auto">
                Type term identifiers, definitions, or AYUSH clinical words to pull records from the central NAMASTE database.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

