import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Download } from 'lucide-react';
import { exportToCSV } from '../../utils/exportCSV';

function DataTableSkeleton() {
  return (
    <div className="bg-surface-container-low rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="w-24 h-4 bg-surface-container-high rounded animate-pulse" />
        <div className="w-20 h-8 bg-surface-container-high rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-24 h-3 bg-surface-container-high rounded animate-pulse" />
            <div className="w-32 h-3 bg-surface-container-high rounded animate-pulse" />
            <div className="w-20 h-3 bg-surface-container-high rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DataTableTile({ data, isLoading }) {
  const parentRef = useRef(null);

  const hasData = !isLoading && data && data.length > 0;

  const columns = useMemo(() => (hasData ? Object.keys(data[0]) : []), [hasData, data]);

  const rowVirtualizer = useVirtualizer({
    count: hasData ? data.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  if (!hasData) {
    return <DataTableSkeleton />;
  }

  const handleExport = () => {
    exportToCSV(data, `query-result-${Date.now()}.csv`);
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-5 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <span className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">
          Data Snapshot
        </span>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-label text-primary bg-primary-fixed-dim rounded-lg hover:bg-primary-fixed transition-colors"
        >
          <Download size={12} />
          <span>CSV</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-outline-variant">
        <div className="h-full flex flex-col">
          <div className="flex bg-surface-container-high px-4 py-2.5 shrink-0">
            {columns.map((col) => (
              <div
                key={col}
                className="text-xs font-label font-semibold text-on-surface-variant truncate"
                style={{ width: 120, minWidth: 120, flexShrink: 0 }}
              >
                {col}
              </div>
            ))}
          </div>

          <div
            ref={parentRef}
            className="flex-1 overflow-auto custom-scrollbar"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = data[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    className="absolute top-0 left-0 flex items-center px-4 py-2 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {columns.map((col) => (
                      <div
                        key={col}
                        className="text-sm text-on-surface truncate"
                        style={{ width: 120, minWidth: 120, flexShrink: 0 }}
                      >
                        {row[col] ?? '-'}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-on-surface-variant shrink-0">
        {data.length.toLocaleString()} rows
      </div>
    </div>
  );
}

export default DataTableTile;