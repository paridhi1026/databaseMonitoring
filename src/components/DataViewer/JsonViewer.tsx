import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

interface JsonViewerProps {
  data: Record<string, unknown>;
  title?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title = 'API Payload JSON' }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-md overflow-hidden font-mono text-xs">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <span className="text-slate-300 font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <Code className="w-3.5 h-3.5 text-blue-400" />
          {title}
        </span>
        <button
          onClick={handleCopy}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy Raw'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-300 max-h-96 leading-relaxed select-text font-mono text-[11px] bg-slate-950/90">
        <code>{jsonString}</code>
      </pre>
    </div>
  );
};
