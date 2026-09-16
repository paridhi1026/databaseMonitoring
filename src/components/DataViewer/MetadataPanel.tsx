import React from 'react';
import { DataNode, DatasetSummary } from '../../types/dbs';
import { Database, FileText, Calendar, User, ShieldCheck, Tag, Hash, Activity } from 'lucide-react';

interface MetadataPanelProps {
  entity: DataNode;
  summary?: DatasetSummary | null;
  parentEntity?: DataNode | null;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  entity,
  summary,
  parentEntity,
}) => {
  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return null;
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (timestamp?: string | number) => {
    if (!timestamp) return null;
    const num = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    if (isNaN(num)) return String(timestamp);
    // DBS timestamps are often in epoch seconds or milliseconds
    const date = num > 1e11 ? new Date(num) : new Date(num * 1000);
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  const metadataEntries: { key: string; value: React.ReactNode; icon?: React.ElementType }[] = [
    { key: 'Name', value: entity.name, icon: FileText },
    { key: 'Type', value: entity.type.toUpperCase(), icon: Tag },
    { key: 'ID', value: entity.id, icon: Hash },
    { key: 'Path', value: entity.path || entity.id, icon: Database },
    { key: 'Parent', value: parentEntity ? parentEntity.name : entity.parentId || null, icon: Database },
    { key: 'Status', value: entity.status || null, icon: ShieldCheck },
    { key: 'Created', value: formatDate(entity.creationDate), icon: Calendar },
    { key: 'Modified', value: formatDate(entity.lastModified), icon: Calendar },
    { key: 'Created By', value: entity.createdBy || null, icon: User },
    { key: 'Size', value: formatBytes(entity.sizeBytes || summary?.file_size), icon: Activity },
    { key: 'Event Count', value: entity.eventCount !== undefined ? entity.eventCount.toLocaleString() : summary?.num_event !== undefined ? summary.num_event.toLocaleString() : null },
    { key: 'File Count', value: entity.fileCount !== undefined ? entity.fileCount.toLocaleString() : summary?.num_file !== undefined ? summary.num_file.toLocaleString() : null },
    { key: 'Block Count', value: summary?.num_block !== undefined ? summary.num_block.toLocaleString() : null },
    { key: 'Lumi Sections', value: summary?.num_lumi !== undefined ? summary.num_lumi.toLocaleString() : null },
  ];

  // Additional raw metadata fields from API
  if (entity.metadata) {
    Object.entries(entity.metadata).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && !metadataEntries.some(m => m.key.toLowerCase() === k.toLowerCase())) {
        metadataEntries.push({
          key: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        });
      }
    });
  }

  // Filter entries to ONLY show fields that actually exist in the API response
  const activeEntries = metadataEntries.filter(
    (item) => item.value !== null && item.value !== undefined && item.value !== ''
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          System Metadata
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">
          {activeEntries.length} API Attributes Returned
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeEntries.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-slate-950/70 border border-slate-800/80 rounded p-2.5 flex flex-col justify-between"
            >
              <span className="text-[10px] font-medium text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3 text-slate-500 shrink-0" />}
                {item.key}
              </span>
              <span className="text-xs font-mono font-medium text-slate-200 mt-1 break-all select-text">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
