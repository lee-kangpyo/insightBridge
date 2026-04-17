import { useState, useMemo, useEffect } from 'react';

export default function AdminTable({
  columns,
  data,
  onSelect,
  searchTerm,
  searchPlaceholder = '검색...',
  selectedId,
  showRowNumber = true,
}) {
  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    if (!localSearch.trim()) return data;
    const lower = localSearch.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key];
        return String(value).toLowerCase().includes(lower);
      })
    );
  }, [data, columns, localSearch]);

  const displayColumns = showRowNumber
    ? [{ key: '_rowNumber', label: 'No', align: 'center', sortable: false }, ...columns]
    : columns;

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  return (
    <div className="flex flex-col bg-surface-container-lowest rounded-lg shadow-[0_8px_32px_rgba(24,28,30,0.04)] overflow-hidden">
      <div className="relative mb-4 p-4 pb-0">
        <span className="material-symbols-outlined absolute left-7 top-1/2 -translate-y-1/2 text-outline-variant text-lg">
          search
        </span>
        <input
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-low text-sm text-on-surface border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all placeholder:text-on-surface-variant/70"
          placeholder={searchPlaceholder}
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar bg-surface-container-lowest">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-surface-container-highest sticky top-0 z-10 font-medium text-on-surface-variant">
            <tr>
              {displayColumns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : ''} ${
                    col.sortable ? 'cursor-pointer hover:bg-surface-container select-none' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'center' ? 'justify-center' : ''}`}>
                    {col.headerRender ? col.headerRender(col) : col.label}
                    {col.sortable && sortConfig.key === col.key && (
                      <span className="material-symbols-outlined text-xs">
                        {sortConfig.direction === 'asc' ? 'expand_less' : 'expand_more'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-on-surface">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length} className="py-8 text-center text-on-surface-variant">
                  {data.length === 0 ? '데이터가 없습니다' : '검색 결과가 없습니다. 검색어를 확인해주세요.'}
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={`cursor-pointer transition-colors ${
                    selectedId === row.id
                      ? 'bg-primary-fixed text-primary-container'
                      : 'hover:bg-surface-container-low'
                  }`}
                  onClick={() => onSelect(row)}
                >
                  {displayColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : ''} ${
                        selectedId === row.id && col.key === displayColumns[1]?.key ? 'font-semibold' : ''
                      }`}
                    >
                      {col.key === '_rowNumber' ? idx + 1 : (col.render ? col.render(row[col.key], row) : row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
