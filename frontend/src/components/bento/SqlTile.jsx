import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function SqlTile({ sql, isLoading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!sql) return;
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-low rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-20 h-4 bg-surface-container-high rounded animate-pulse" />
          <div className="w-16 h-4 bg-surface-container-high rounded animate-pulse ml-auto" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 bg-surface-container-high rounded animate-pulse" />
          <div className="w-4/5 h-3 bg-surface-container-high rounded animate-pulse" />
          <div className="w-3/5 h-3 bg-surface-container-high rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">
          SQL Query
        </span>
        {sql && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        )}
      </div>
      <pre className="font-mono text-sm text-on-surface overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        {sql || '/* Query not available */'}
      </pre>
    </div>
  );
}

export default SqlTile;