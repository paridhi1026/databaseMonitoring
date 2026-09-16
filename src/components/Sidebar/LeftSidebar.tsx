import React from 'react';
import {
  FolderTree,
  FileText,
  Layers,
  Clock,
  Search,
  Wifi,
  WifiOff,
  Settings,
  Database
} from 'lucide-react';

interface LeftSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isConnected: boolean;
  onOpenConnectionModal: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onTabChange,
  isConnected,
  onOpenConnectionModal,
}) => {
  const navItems = [
    { id: 'browser', label: 'Data Browser', icon: FolderTree, requiresApi: true },
    { id: 'datasets', label: 'Datasets', icon: Layers, requiresApi: true },
    { id: 'files', label: 'Files & LFNs', icon: FileText, requiresApi: true },
    { id: 'search', label: 'Search Query', icon: Search, requiresApi: true },
    { id: 'recent', label: 'Recent Queries', icon: Clock, requiresApi: true },
    { id: 'connection', label: 'API Connection', icon: Settings, requiresApi: false },
  ];

  return (
    <aside className="w-56 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Upper Nav section */}
      <div className="p-3 space-y-4">
        <div className="px-2 pt-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Navigation
          </h3>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.requiresApi && !isConnected;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'connection') {
                    onOpenConnectionModal();
                  } else if (!isDisabled) {
                    onTabChange(item.id);
                  }
                }}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : isDisabled
                    ? 'text-slate-600 cursor-not-allowed hover:bg-transparent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : isDisabled ? 'text-slate-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.requiresApi && !isConnected && (
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-500 uppercase shrink-0">
                    Offline
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Service Status & Help */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {/* Connection status card */}
        <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              {isConnected ? 'Service Connected' : 'No Data Source'}
            </span>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal">
            {isConnected
              ? 'Connected to CERN DBS3 Reader API'
              : 'Requires active connection to CERN DBS REST backend.'}
          </p>

          {!isConnected && (
            <button
              onClick={onOpenConnectionModal}
              className="w-full mt-1 py-1 px-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[10px] font-medium rounded transition text-center font-mono"
            >
              Configure Connection
            </button>
          )}
        </div>

        {/* Technical Footer info */}
        <div className="px-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>CMS DBS Client v1.0</span>
          <span className="text-slate-400 flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-400" /> REST API
          </span>
        </div>
      </div>
    </aside>
  );
};
