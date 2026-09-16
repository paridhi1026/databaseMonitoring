import React from 'react';

interface DataPreviewTableProps {
  data: Record<string, unknown>[];
  onRowClick?: (id: string, type: string) => void;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  data,
  onRowClick,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Extract column keys dynamically from returned items
  const columns = Array.from(
    new Set(data.flatMap((row) => Object.keys(row)))
  ).slice(0, 8); // Limit to top 8 columns for clean dense view

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-md overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
          Associated Records Data Table
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
          Showing {data.length} records
        </span>
      </div>

      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <th className="py-2 px-3 font-semibold text-[11px] border-r border-slate-800">#</th>
              {columns.map((col) => (
                <th key={col} className="py-2 px-3 font-semibold text-[11px] border-r border-slate-800 uppercase tracking-wider whitespace-nowrap">
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {data.map((row, idx) => {
              const rowId = (row.block_name || row.logical_file_name || row.dataset || String(idx)) as string;
              const rowType = row.block_name ? 'block' : row.logical_file_name ? 'file' : 'dataset';

              return (
                <tr
                  key={idx}
                  onClick={() => onRowClick && onRowClick(rowId, rowType)}
                  className="hover:bg-blue-950/40 transition cursor-pointer text-slate-300"
                >
                  <td className="py-1.5 px-3 text-slate-500 border-r border-slate-800/80">
                    {idx + 1}
                  </td>
                  {columns.map((col) => {
                    const val = row[col];
                    const displayVal =
                      val === null || val === undefined
                        ? '-'
                        : typeof val === 'object'
                        ? JSON.stringify(val)
                        : String(val);

                    return (
                      <td
                        key={col}
                        className="py-1.5 px-3 border-r border-slate-800/80 truncate max-w-xs"
                        title={displayVal}
                      >
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
