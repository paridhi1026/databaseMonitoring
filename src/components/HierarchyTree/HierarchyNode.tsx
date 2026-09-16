import React, { useState } from 'react';
import { DataNode, EntityType } from '../../types/dbs';
import {
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  Database,
  Box,
  CircleDot,
  Radio,
  Tag
} from 'lucide-react';

interface HierarchyNodeProps {
  node: DataNode;
  depth?: number;
  isSelected?: boolean;
  isAncestor?: boolean;
  onSelectNode: (id: string, type?: EntityType) => void;
  childrenNodes?: DataNode[];
}

export const HierarchyNode: React.FC<HierarchyNodeProps> = ({
  node,
  depth = 0,
  isSelected = false,
  isAncestor = false,
  onSelectNode,
  childrenNodes = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'primary_dataset':
        return Radio;
      case 'acquisition_era':
        return Tag;
      case 'dataset':
        return Layers;
      case 'block':
        return Box;
      case 'file':
        return FileText;
      default:
        return Database;
    }
  };

  const IconComponent = getEntityIcon(node.type);
  const hasChildren = childrenNodes.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectNode(node.id, node.type);
    }
  };

  return (
    <div className="select-none font-mono text-xs">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectNode(node.id, node.type)}
        onKeyDown={handleKeyDown}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2 rounded transition cursor-pointer outline-none focus:ring-1 focus:ring-blue-500 ${
          isSelected
            ? 'bg-blue-600/25 border-l-2 border-blue-400 text-blue-200 font-semibold'
            : isAncestor
            ? 'hover:bg-slate-800/80 text-slate-300'
            : 'hover:bg-slate-800/60 text-slate-400'
        }`}
        title={`${node.type.toUpperCase()}: ${node.name}`}
      >
        <div className="flex items-center space-x-1.5 min-w-0 pr-1">
          {/* Expand/Collapse Chevron */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0.5 text-slate-500 hover:text-slate-300 rounded shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}

          {/* Current Node Indicator / Entity Icon */}
          {isSelected ? (
            <CircleDot className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-pulse" />
          ) : (
            <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isAncestor ? 'text-slate-400' : 'text-slate-500'}`} />
          )}

          {/* Node Name */}
          <span className={`truncate text-xs ${isSelected ? 'text-blue-100 font-bold' : isAncestor ? 'text-slate-200' : 'text-slate-300'}`}>
            {node.name}
          </span>
        </div>

        {/* Status / Child count pill */}
        <div className="flex items-center space-x-1 shrink-0 ml-1">
          {isSelected && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500 text-white uppercase tracking-wider">
              Selected
            </span>
          )}
          {node.status && !isSelected && (
            <span className="text-[9px] text-slate-500 uppercase">
              {node.status}
            </span>
          )}
        </div>
      </div>

      {/* Render children recursively if expanded */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5 mt-0.5">
          {childrenNodes.map((childNode) => (
            <HierarchyNode
              key={childNode.id}
              node={childNode}
              depth={depth + 1}
              isSelected={false}
              isAncestor={false}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
