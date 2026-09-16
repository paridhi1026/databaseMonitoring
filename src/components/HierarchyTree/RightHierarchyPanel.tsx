import React, { useState } from 'react';
import { DataNode, EntityType } from '../../types/dbs';
import { HierarchyNode } from './HierarchyNode';
import {
  FolderTree,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Network
} from 'lucide-react';

interface RightHierarchyPanelProps {
  isConnected: boolean;
  selectedEntity: DataNode | null;
  parentChain: DataNode[];
  children: DataNode[];
  isLoading: boolean;
  error: string | null;
  onSelectNode: (id: string, type?: EntityType) => void;
}

export const RightHierarchyPanel: React.FC<RightHierarchyPanelProps> = ({
  isConnected,
  selectedEntity,
  parentChain,
  children,
  isLoading,
  error,
  onSelectNode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-10 bg-slate-900 border-l border-slate-800 flex flex-col items-center py-3 shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition mb-4"
          title="Expand Hierarchy Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="rotate-90 text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase whitespace-nowrap">
          HIERARCHY
        </div>
      </div>
    );
  }

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none overflow-hidden">
      {/* Panel Header */}
      <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/90 shrink-0">
        <div className="flex items-center space-x-2">
          <FolderTree className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Hierarchy
          </h2>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Subheader info */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
        <span>Ancestry Path</span>
        {selectedEntity && (
          <span className="text-blue-400 font-semibold">{parentChain.length + 1} Levels</span>
        )}
      </div>

      {/* Hierarchy Tree Area */}
      <div className="flex-1 p-3 overflow-y-auto overflow-x-auto space-y-1">
        {!isConnected ? (
          <div className="p-4 bg-slate-950/50 rounded border border-slate-800 text-center space-y-2 my-auto">
            <Network className="w-5 h-5 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">No data source connected.</p>
            <p className="text-[10px] text-slate-500">Connect CERN DBS API service to populate ancestry tree.</p>
          </div>
        ) : isLoading ? (
          <div className="p-6 text-center text-slate-400 font-mono text-xs space-y-2">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin mx-auto" />
            <span>Loading hierarchy...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded text-center space-y-2">
            <AlertCircle className="w-5 h-5 text-rose-400 mx-auto" />
            <p className="text-xs font-bold text-rose-300 font-mono">Unable to load hierarchy</p>
            <p className="text-[10px] text-rose-400 font-mono break-all">{error}</p>
            {selectedEntity && (
              <button
                onClick={() => onSelectNode(selectedEntity.id, selectedEntity.type)}
                className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-900 border border-rose-700 text-rose-200 text-[10px] font-mono rounded transition"
              >
                Retry
              </button>
            )}
          </div>
        ) : selectedEntity ? (
          <div className="space-y-1">
            {/* Render Ancestor Chain */}
            {parentChain.map((ancestorNode, index) => (
              <HierarchyNode
                key={ancestorNode.id}
                node={ancestorNode}
                depth={index}
                isSelected={false}
                isAncestor={true}
                onSelectNode={onSelectNode}
              />
            ))}

            {/* Render Currently Selected Node */}
            <HierarchyNode
              node={selectedEntity}
              depth={parentChain.length}
              isSelected={true}
              isAncestor={false}
              onSelectNode={onSelectNode}
              childrenNodes={children}
            />
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 font-mono text-xs">
            No dataset or file selected.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 text-[10px] font-mono text-slate-400 flex items-center justify-between shrink-0">
        <span>Click node to switch focus</span>
        <span className="text-slate-400">CMS DBS3</span>
      </div>
    </aside>
  );
};
