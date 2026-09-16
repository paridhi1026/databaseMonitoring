import React, { useState } from 'react';
import { DataNode, DatasetSummary, EntityType } from '../../types/dbs';
import { MetadataPanel } from './MetadataPanel';
import { DataPreviewTable } from './DataPreviewTable';
import { JsonViewer } from './JsonViewer';
import { NoDataSourceState } from '../EmptyState/NoDataSourceState';
import {
  Database,
  RefreshCw,
  Copy,
  Check,
  Tag,
  AlertCircle,
  Code,
  Table,
  ChevronRight
} from 'lucide-react';

interface MainDataViewerProps {
  isConnected: boolean;
  selectedEntity: DataNode | null;
  summary: DatasetSummary | null;
  rawMetadata: Record<string, unknown>;
  previewData?: Record<string, unknown>[];
  parentChain: DataNode[];
  isLoading: boolean;
  error: string | null;
  onSelectNode: (id: string, type?: EntityType) => void;
  onOpenConnectionModal: () => void;
}

export const MainDataViewer: React.FC<MainDataViewerProps> = ({
  isConnected,
  selectedEntity,
  summary,
  rawMetadata,
  previewData,
  parentChain,
  isLoading,
  error,
  onSelectNode,
  onOpenConnectionModal,
}) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'table' | 'json'>('metadata');
  const [copied, setCopied] = useState(false);

  // 1. If not connected, render the explicit NoDataSourceState empty state
  if (!isConnected) {
    return <NoDataSourceState onOpenConnectionModal={onOpenConnectionModal} error={error} />;
  }

  // 2. Loading state skeleton
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-400 font-mono text-xs space-y-3">
        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
        <span>Loading entity data from CERN DBS service...</span>
      </div>
    );
  }

  // 3. Error state if query fails
  if (error) {
    return (
      <div className="flex-1 p-6 bg-slate-950 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-rose-800/60 rounded-lg p-5 space-y-4 text-center">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide font-mono">
              Unable to load data
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 break-all">
              {error}
            </p>
          </div>
          <button
            onClick={() => selectedEntity && onSelectNode(selectedEntity.id, selectedEntity.type)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded transition mx-auto font-mono flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. No entity selected initial prompt
  if (!selectedEntity) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-400 space-y-3 font-mono text-xs">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Database className="w-6 h-6" />
        </div>
        <p className="text-slate-300 font-medium">Select a data entity to view details</p>
        <p className="text-slate-500 text-[11px] text-center max-w-sm">
          Use the top query bar or search filters to select a CERN DBS dataset, block, or file.
        </p>
      </div>
    );
  }

  const handleCopyPath = () => {
    navigator.clipboard.writeText(selectedEntity.path || selectedEntity.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const directParent = parentChain.length > 0 ? parentChain[parentChain.length - 1] : null;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Entity Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 space-y-3">
        {/* Breadcrumb path */}
        {parentChain.length > 0 && (
          <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 overflow-x-auto pb-1 scrollbar-none">
            {parentChain.map((parent) => (
              <React.Fragment key={parent.id}>
                <button
                  onClick={() => onSelectNode(parent.id, parent.type)}
                  className="hover:text-blue-400 hover:underline transition truncate max-w-xs"
                >
                  {parent.name}
                </button>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              </React.Fragment>
            ))}
            <span className="text-slate-200 font-semibold truncate max-w-xs">{selectedEntity.name}</span>
          </div>
        )}

        {/* Title and Key Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-950/80 border border-blue-800/80 text-blue-300">
                {selectedEntity.type.replace('_', ' ')}
              </span>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                selectedEntity.status === 'VALID'
                  ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-300'
                  : 'bg-amber-950/80 border border-amber-800/80 text-amber-300'
              }`}>
                {selectedEntity.status || 'UNKNOWN'}
              </span>
            </div>

            <h1 className="text-base font-bold text-slate-100 font-mono tracking-tight break-all">
              {selectedEntity.name}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopyPath}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition flex items-center space-x-1.5"
              title="Copy logical file path or name"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy LFN'}</span>
            </button>

            {directParent && (
              <button
                onClick={() => onSelectNode(directParent.id, directParent.type)}
                className="px-2.5 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-mono font-medium transition flex items-center space-x-1.5"
              >
                <span>Parent Node</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 flex items-center space-x-1 shrink-0">
        <button
          onClick={() => setActiveTab('metadata')}
          className={`px-3 py-2 text-xs font-mono font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'metadata'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Metadata Grid
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`px-3 py-2 text-xs font-mono font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'table'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          Data Table {previewData && `(${previewData.length})`}
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`px-3 py-2 text-xs font-mono font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'json'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          JSON Payload
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === 'metadata' && (
          <MetadataPanel
            entity={selectedEntity}
            summary={summary}
            parentEntity={directParent}
          />
        )}

        {activeTab === 'table' && (
          previewData && previewData.length > 0 ? (
            <DataPreviewTable data={previewData} onRowClick={(id, type) => onSelectNode(id, type as EntityType)} />
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded p-6 text-center text-slate-400 font-mono text-xs">
              <Table className="w-6 h-6 mx-auto mb-2 text-slate-500" />
              Preview unavailable for this entity data type.
            </div>
          )
        )}

        {activeTab === 'json' && (
          <JsonViewer data={rawMetadata} title={`${selectedEntity.name} Raw API JSON`} />
        )}
      </div>
    </div>
  );
};
