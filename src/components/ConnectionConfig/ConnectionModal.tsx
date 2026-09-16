import React, { useState } from 'react';
import {
  X,
  Server,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { DBSService } from '../../services/dbsService';
import { CERNServerInfo } from '../../types/dbs';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBaseUrl: string;
  onSaveUrl: (newUrl: string) => void;
  isConnected: boolean;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  currentBaseUrl,
  onSaveUrl,
}) => {
  const [inputUrl, setInputUrl] = useState(currentBaseUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    info?: CERNServerInfo;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({
        success: false,
        error: 'Please enter a valid API Base URL.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const info = await DBSService.getServerInfo(inputUrl.trim());
      setTestResult({
        success: true,
        info,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to connect to specified endpoint';
      setTestResult({
        success: false,
        error: errorMsg,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveUrl(inputUrl.trim());
    onClose();
  };

  const presets = [
    { label: 'CERN Global Reader (prod/global)', url: 'https://cmsweb.cern.ch/dbs/prod/global/DBSReader' },
    { label: 'CERN Phys01 Reader (prod/phys01)', url: 'https://cmsweb.cern.ch/dbs/prod/phys01/DBSReader' },
    { label: 'Local dbs2go Proxy', url: 'http://localhost:8000/api' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden font-sans space-y-0">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Server className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              CERN Data Service API Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 font-mono text-xs text-slate-300">
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Quick Endpoint Presets
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputUrl(p.url)}
                  className={`text-left px-3 py-2 rounded border text-xs flex items-center justify-between transition ${
                    inputUrl === p.url
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Target API Base URL (VITE_API_BASE_URL)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://cmsweb.cern.ch/dbs/prod/global/DBSReader"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                onClick={handleTestConnection}
                disabled={testing || !inputUrl.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-slate-200 font-medium text-xs rounded transition flex items-center space-x-1.5 shrink-0"
              >
                {testing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{testing ? 'Testing...' : 'Test'}</span>
              </button>
            </div>
          </div>

          {/* Test Results Output */}
          {testResult && (
            <div
              className={`p-3 rounded border text-xs ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Connection Test Succeeded</span>
                  </div>
                  <div className="text-[11px] text-emerald-200/80 pt-1 space-y-0.5">
                    {testResult.info?.dbs_version && (
                      <div>DBS Version: {testResult.info.dbs_version}</div>
                    )}
                    {testResult.info?.server_time && (
                      <div>Server Time: {testResult.info.server_time}</div>
                    )}
                    <div>Status: {testResult.info?.status || 'ONLINE'}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Connection Failed</span>
                  </div>
                  <p className="text-[11px] text-rose-200/80 break-all">{testResult.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Requirements Note */}
          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1 font-sans">
            <span className="font-semibold text-slate-300 font-mono block">CERN Grid & Authentication Note:</span>
            <p className="leading-relaxed">
              Direct requests to <code className="text-blue-300 font-mono">cmsweb.cern.ch</code> require X.509 grid certificates or a local proxy daemon. If direct browser CORS is blocked by your network, run your local <code className="text-emerald-300 font-mono">dbs2go-wrapper</code> proxy backend.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between font-mono">
          <button
            onClick={() => {
              setInputUrl('');
              onSaveUrl('');
              onClose();
            }}
            className="text-xs text-rose-400 hover:underline"
          >
            Clear Connection
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
