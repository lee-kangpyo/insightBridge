import React, { useState, useEffect, useMemo } from 'react';
import SlotItemRenderer from '../../SlotItemRenderer';

const CalendarIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function SlotConfigModal({ slot, assignment, items, onSave, onCancel, onNavigate }) {
  const currentYear = new Date().getFullYear();
  const [selectedItem, setSelectedItem] = useState(() => {
    if (assignment?.item_id) {
      return items.find((i) => i.item_id === assignment.item_id) || null;
    }
    return null;
  });
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedBaseYear, setSelectedBaseYear] = useState(currentYear - 1);

  useEffect(() => {
    if (assignment?.item_id && !selectedItem) {
      setSelectedItem(items.find((i) => i.item_id === assignment.item_id) || null);
    }
  }, [assignment, items, selectedItem]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.item_nm?.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = typeFilter === 'all' || item.mapping_json?.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, searchText, typeFilter]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleConfirm = () => {
    if (!selectedItem) return;
    onSave(slot.slot_id, {
      item_id: selectedItem.item_id,
      item_nm: selectedItem.item_nm,
      cnts_tp: selectedItem.mapping_json?.type || 'default',
    });
  };

  const typeFilters = [
    { id: 'all', label: '전체' },
    { id: 'chart', label: '차트' },
    { id: 'grid', label: '그리드' },
    { id: 'card', label: '카드' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-[1100px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
        <div className="flex items-center justify-between px-8 py-5 border-b border-outline/10 bg-surface-container-low">
          <div>
            <h2 className="text-xl font-bold text-on-surface">아이템 선택</h2>
            <p className="text-xs text-on-surface-variant mt-1">사용할 아이템을 선택하세요.</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[420px] flex flex-col border-r border-outline/10">
            <div className="p-6 border-b border-outline/10 space-y-4">
              <input
                type="text"
                placeholder="아이템 이름 검색..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-surface rounded-xl border border-outline focus:outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                {typeFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTypeFilter(f.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${typeFilter === f.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-outline/20 rounded-3xl">
                  <p className="text-on-surface-variant text-sm mb-3">등록된 아이템이 없습니다.</p>
                  <button
                    onClick={() => onNavigate?.('/admin/items')}
                    className="text-primary font-bold text-sm hover:underline"
                  >
                    아이템 관리 →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredItems.map((item) => (
                    <button
                      key={item.item_id}
                      onClick={() => handleSelectItem(item)}
                      className={`group flex flex-col p-4 rounded-2xl border transition-all duration-300 text-left ${selectedItem?.item_id === item.item_id
                        ? 'bg-primary-container border-primary shadow-md'
                        : 'bg-white border-outline/10 hover:border-primary/50 hover:shadow-md'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-1">
                          <span className="px-2 py-1 bg-surface-container-high text-[10px] font-bold text-primary rounded-md uppercase tracking-wider">
                            {item.mapping_json?.type || '미지정'}
                          </span>
                          {item.year_dependent && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                              <CalendarIcon />
                              연도별 데이터
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-on-surface-variant">ID: {item.item_id}</span>
                      </div>
                      <div className="font-bold text-on-surface group-hover:text-primary transition-colors truncate w-full mb-1">
                        {item.item_nm}
                      </div>
                      <div className="text-xs text-on-surface-variant truncate w-full">
                        {item.mapping_json?.chartType ? `${item.mapping_json.chartType} 차트` : '설정 정보 없음'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-outline/10 bg-surface-container-low">
              <span className="text-xs text-on-surface-variant">
                {filteredItems.length}개 아이템
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-surface">
            {selectedItem?.year_dependent && (
              <div className="flex items-center justify-end gap-2 px-6 py-3 border-b border-outline/10 bg-surface-container-low">
                <span className="text-xs text-on-surface-variant">연도:</span>
                <div className="flex gap-1">
                  {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedBaseYear(year)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedBaseYear === year
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                    >
                      {year}년
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-center flex-1">
              {selectedItem ? (
                <div className="w-full h-full p-4">
                  <SlotItemRenderer itemId={selectedItem.item_id} baseYear={selectedItem.year_dependent ? selectedBaseYear : undefined} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-on-surface-variant">
                  <div className="text-4xl mb-4 opacity-30">⊞</div>
                  <p className="text-sm">미리볼 아이템을 선택하세요</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center px-8 py-5 border-t border-outline/10 bg-surface-container-low">
          <button
            onClick={handleConfirm}
            disabled={!selectedItem}
            className="px-8 py-2.5 text-sm font-bold text-on-primary bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}