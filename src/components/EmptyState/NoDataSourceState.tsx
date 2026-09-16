import React from 'react';
import { Database, Server, Terminal, ShieldAlert, Sliders, ExternalLink } from 'lucide-react';

interface NoDataSourceStateProps {
  onOpenConnectionModal: () => void;
  error?: string | null;
}

export const NoDataSourceState: React.FC<NoDataSourceStateProps> = ({
  onOpenConnectionModal,
  error,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-200 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 rounded-lg p-6 shadow-2xl space-y-6">
        {/* Header Icon + Title */}
        <div className="flex items-start space-x-4 border-b border-slate-800 pb-5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 shrink-0">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                No data source connected
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 border border-amber-800/60 text-amber-300">
                DISCONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Connect the CERN Data Bookkeeping Service (DBS3) API backend to begin browsing datasets, parent hierarchies, and file metadata.
            </p>
          </div>
        </div>

        {/* Error message detail if present */}
        {error && (
          <div className="p-3 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="break-all">{error}</div>
          </div>
        )}

        {/* Requirements & Specifications Box */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Server className="w-4 h-4 text-blue-400" />
            Required Service Specifications
          </h3>
          <div className="bg-slate-950 rounded border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">Service API Standard:</span>
              <span className="text-blue-400 font-semibold">CMS DBS3 Reader / dbs2go REST API</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">Environment Variable:</span>
              <span className="text-emerald-400 font-semibold">VITE_API_BASE_URL</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">CERN Official Reader Endpoint:</span>
              <span className="text-slate-200">https://cmsweb.cern.ch/dbs/prod/global/DBSReader</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Required Core Endpoints:</span>
              <span className="text-slate-300 text-[11px]">/datasets, /files, /blocks, /datasetparents, /datasetchildren</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-slate-950/60 rounded border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            Connecting to Live CERN Data
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed font-sans">
            <li>Ensure network connectivity to CERN Grid / CMSWEB or start a local <code className="text-blue-300 font-mono">dbs2go-wrapper</code> proxy server.</li>
            <li>Configure <code className="text-emerald-300 font-mono">VITE_API_BASE_URL</code> in your <code className="text-slate-300 font-mono">.env</code> file or use the interactive configurator below.</li>
            <li>Once connected, the main panel will display live query metadata and the right hierarchy tree will populate ancestry paths.</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <a
            href="https://cmsweb.cern.ch/dbs/prod/global/DBSReader"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-blue-400 transition flex items-center gap-1 font-mono"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            CERN DBS Documentation
          </a>

          <button
            onClick={onOpenConnectionModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded transition flex items-center space-x-2 shadow-md"
          >
            <Sliders className="w-4 h-4" />
            <span>Configure Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
