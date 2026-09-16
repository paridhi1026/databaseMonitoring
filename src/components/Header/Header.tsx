import React, { useState } from 'react';
import { Database, Search, Server, Sliders, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isChecking: boolean;
  baseUrl: string;
  onOpenConnectionModal: () => void;
  onSearch: (query: string) => void;
  selectedInstance: string;
  onInstanceChange: (instance: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  isChecking,
  baseUrl,
  onOpenConnectionModal,
  onSearch,
  selectedInstance,
  onInstanceChange,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-20 shrink-0">
      {/* Brand Section */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold tracking-tighter">
          <Database className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold tracking-wider text-slate-100 uppercase">CERN</span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs font-semibold tracking-wide text-slate-200">DATA MANAGEMENT</span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-tight font-mono">
            Database Bookkeeping Service (DBS3)
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-xl mx-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search CERN dataset path (e.g. /Muon/Run2024*/MINIAOD or /store/data/...)"
            className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-24 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition"
            disabled={!isConnected}
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <button
            type="submit"
            disabled={!isConnected || !searchInput.trim()}
            className="absolute right-1 top-1 bottom-1 px-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-[11px] font-medium rounded transition flex items-center"
          >
            Query
          </button>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Instance Selector */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-400">Instance:</span>
          <select
            value={selectedInstance}
            onChange={(e) => onInstanceChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="global">prod/global</option>
            <option value="phys01">prod/phys01</option>
            <option value="phys02">prod/phys02</option>
            <option value="phys03">prod/phys03</option>
          </select>
        </div>

        {/* Connection Status Pill */}
        <button
          onClick={onOpenConnectionModal}
          className={`flex items-center space-x-2 px-2.5 py-1 rounded border text-xs font-mono transition ${
            isChecking
              ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              : isConnected
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/40'
          }`}
          title={baseUrl ? `API Base URL: ${baseUrl}` : 'Click to configure API connection'}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isChecking ? 'bg-amber-400' : isConnected ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isChecking ? 'bg-amber-500' : isConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span className="text-[11px] font-semibold tracking-wide">
            {isChecking
              ? 'TESTING...'
              : isConnected
              ? 'CONNECTED'
              : 'NO DATA SOURCE'}
          </span>
          {isConnected ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          )}
        </button>

        {/* Configuration Button */}
        <button
          onClick={onOpenConnectionModal}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          title="API Connection Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Official Link */}
        <a
          href="https://cmsweb.cern.ch/dbs/prod/global/DBSReader"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition hidden sm:block"
          title="CERN DBS Web Docs"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
