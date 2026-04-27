import React, { useState, useEffect, useCallback } from 'react';
import { getContentsByType, getSqlContents, executeSqlPreview, handleApiError, getAdminContentsList } from '../../../services/adminApi';
import api from '../../../services/api';
import { CONTENT_TYPE_MAP } from '../../../constants/contentTypes';

const TABS = [
  { id: 'form', label: '형태' },
  { id: 'sql', label: 'SQL' },
  { id: 'mapping', label: '맵핑' },
];

export default function SlotConfigModal({ slot, assignment, onSave, onCancel }) {
  const [activeTab, setActiveTab] = useState('form');
  const [selectedCnts, setSelectedCnts] = useState(() => {
    if (assignment && assignment.cnts_tp !== 'sql') {
      return { cnts_id: assignment.cnts_id, cnts_nm: assignment.cnts_nm, cnts_tp: assignment.cnts_tp };
    }
    return null;
  });
  const [selectedSql, setSelectedSql] = useState(() => {
    if (assignment && assignment.cnts_tp === 'sql') {
      return { cnts_id: assignment.cnts_id, cnts_nm: assignment.cnts_nm };
    }
    return null;
  });
  const [mappings, setMappings] = useState(() => assignment?.mappings || []);
  const [error, setError] = useState(null);

  const handleSave = useCallback(() => {
    if (!selectedCnts && !selectedSql) {
      setError('형태 또는 SQL을 선택해주세요.');
      return;
    }

    const assignment = {
      cnts_id: selectedCnts?.cnts_id || selectedSql?.cnts_id,
      cnts_nm: selectedCnts?.cnts_nm || selectedSql?.cnts_nm,
      cnts_tp: selectedCnts?.cnts_tp || 'sql',
      mappings,
    };

    onSave(slot.slot_id, assignment);
  }, [slot, selectedCnts, selectedSql, mappings, onSave]);

  const isMappingEnabled = selectedCnts && selectedSql;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-[1100px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/20">
          <h2 className="text-lg font-semibold text-on-surface">
            슬롯 {slot.slot_id} 구성
          </h2>
          <button
            onClick={onCancel}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline/20">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'mapping' && !isMappingEnabled) return;
                setActiveTab(tab.id);
                setError(null);
              }}
              disabled={tab.id === 'mapping' && !isMappingEnabled}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              } ${tab.id === 'mapping' && !isMappingEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-error-container text-error rounded-lg text-sm">
              {error}
            </div>
          )}

          {activeTab === 'form' && (
            <FormTab
              selectedCnts={selectedCnts}
              onSelectCnts={setSelectedCnts}
            />
          )}

          {activeTab === 'sql' && (
            <SqlTab
              selectedSql={selectedSql}
              onSelectSql={setSelectedSql}
            />
          )}

          {activeTab === 'mapping' && isMappingEnabled && (
            <MappingTab
              selectedCnts={selectedCnts}
              selectedSql={selectedSql}
              mappings={mappings}
              onMappingsChange={setMappings}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline/20">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface-container rounded-lg border border-outline hover:bg-surface-container-high transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-on-primary bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function FormTab({ selectedCnts, onSelectCnts }) {
  const [contents, setContents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/admin/contents');
        let allContents = response.data.contents || [];
        if (filter !== 'all') {
          allContents = allContents.filter((c) => c.contentType === filter);
        }
        setContents(allContents);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, [filter]);

  const filters = [
    { id: 'all', label: '전체' },
    { id: 'chart', label: '차트' },
    { id: 'grid', label: '그리드' },
    { id: 'card', label: '카드' },
  ];

  const nonSqlContents = contents.filter((c) => c.contentType !== 'sql');

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="flex gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === f.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-8 text-on-surface-variant">로딩 중...</div>}
        {error && <div className="text-error text-sm mb-4">{error}</div>}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline/20">
              <th className="text-left py-2 px-3">NO</th>
              <th className="text-left py-2 px-3">선택</th>
              <th className="text-left py-2 px-3">콘텐츠명</th>
              <th className="text-left py-2 px-3">유형</th>
            </tr>
          </thead>
          <tbody>
            {nonSqlContents.map((content, index) => (
              <tr
                key={`${content.cnts_id}-${index}`}
                onClick={() => onSelectCnts(content)}
                className={`border-b border-outline/10 cursor-pointer hover:bg-surface-container ${
                  selectedCnts?.cnts_id === content.cnts_id ? 'bg-primary-container' : ''
                }`}
              >
                <td className="py-2 px-3">{index + 1}</td>
                <td className="py-2 px-3">
                  <input
                    type="radio"
                    checked={selectedCnts?.cnts_id === content.cnts_id}
                    onChange={() => onSelectCnts(content)}
                  />
                </td>
                <td className="py-2 px-3">{content.contentName}</td>
                <td className="py-2 px-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: CONTENT_TYPE_MAP[content.contentType]?.bgColor,
                      color: CONTENT_TYPE_MAP[content.contentType]?.textColor,
                    }}
                  >
                    {CONTENT_TYPE_MAP[content.contentType]?.label || content.contentType}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-80 border-l border-outline/20 pl-6">
        <h3 className="font-semibold text-on-surface mb-4">상세 정보</h3>
        {selectedCnts ? (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-on-surface-variant">콘텐츠 유형: </span>
              <span className="font-medium">{CONTENT_TYPE_MAP[selectedCnts.contentType]?.label || selectedCnts.contentType}</span>
            </div>
            <div>
              <span className="text-on-surface-variant">콘텐츠명: </span>
              <span className="font-medium">{selectedCnts.contentName}</span>
            </div>
          </div>
        ) : (
          <div className="text-on-surface-variant text-sm">콘텐츠를 선택해주세요.</div>
        )}

        <div className="mt-6">
          <h4 className="font-medium text-on-surface mb-2">미리보기</h4>
          <div className="bg-surface-container rounded-lg p-4 text-center text-on-surface-variant text-sm">
            미리보기 영역
          </div>
        </div>
      </div>
    </div>
  );
}

function SqlTab({ selectedSql, onSelectSql }) {
  const [contents, setContents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sqlDetail, setSqlDetail] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const allContents = await getAdminContentsList();
        const sqlContents = allContents.filter((c) => c.contentType === 'sql');
        setContents(sqlContents);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, []);

  const handleSelect = async (content) => {
    onSelectSql(content);
    setSqlDetail(null);
    setPreviewData(null);
    try {
      const response = await fetch(`/api/admin/contents/${content.cnts_id}`);
      const data = await response.json();
      setSqlDetail(data.content);
    } catch (err) {
      console.error('Failed to fetch SQL detail:', err);
    }
  };

  const handlePreview = async () => {
    if (!selectedSql) return;
    setPreviewLoading(true);
    try {
      const data = await executeSqlPreview(selectedSql.cnts_id);
      setPreviewData(data);
    } catch (err) {
      setError(handleApiError(err, 'SQL 미리보기 실행 중 오류가 발생했습니다.'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const filteredContents = contents.filter((c) =>
    (c.contentName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="mb-4">
          <input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline focus:outline-none focus:border-primary"
          />
        </div>

        {loading && <div className="text-center py-8 text-on-surface-variant">로딩 중...</div>}
        {error && <div className="text-error text-sm mb-4">{error}</div>}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline/20">
              <th className="text-left py-2 px-3">선택</th>
              <th className="text-left py-2 px-3">No</th>
              <th className="text-left py-2 px-3">데이터조회명</th>
            </tr>
          </thead>
          <tbody>
            {filteredContents.map((content, index) => (
              <tr
                key={content.cnts_id}
                onClick={() => handleSelect(content)}
                className={`border-b border-outline/10 cursor-pointer hover:bg-surface-container ${
                  selectedSql?.cnts_id === content.cnts_id ? 'bg-primary-container' : ''
                }`}
              >
                <td className="py-2 px-3">
                  <input
                    type="radio"
                    checked={selectedSql?.cnts_id === content.cnts_id}
                    onChange={() => handleSelect(content)}
                  />
                </td>
                <td className="py-2 px-3">{index + 1}</td>
                <td className="py-2 px-3">{content.contentName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-80 border-l border-outline/20 pl-6">
        <h3 className="font-semibold text-on-surface mb-4">SQL 문장</h3>
        {sqlDetail?.data?.sql ? (
          <pre className="bg-surface-container rounded-lg p-3 text-xs overflow-auto max-h-40">
            {sqlDetail.data.sql}
          </pre>
        ) : (
          <div className="text-on-surface-variant text-sm">SQL을 선택해주세요.</div>
        )}

        <div className="mt-4">
          <button
            onClick={handlePreview}
            disabled={!selectedSql || previewLoading}
            className="w-full px-4 py-2 text-sm font-medium text-on-primary bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {previewLoading ? '로딩 중...' : '데이터 미리보기 (준비중)'}
          </button>
        </div>

        {previewData && (
          <div className="mt-4">
            <h4 className="font-medium text-on-surface mb-2">미리보기 결과</h4>
            <div className="overflow-auto max-h-60">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-outline/20">
                    {previewData.columns?.map((col) => (
                      <th key={col} className="text-left py-1 px-2">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows?.map((row, i) => (
                    <tr key={i} className="border-b border-outline/10">
                      {previewData.columns?.map((col) => (
                        <td key={col} className="py-1 px-2">{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MappingTab({ selectedCnts, selectedSql, mappings, onMappingsChange }) {
  const [columns, setColumns] = useState([]);
  const [draggingColumn, setDraggingColumn] = useState(null);

  useEffect(() => {
    if (!selectedSql) {
      setColumns([]);
      return;
    }
    const sampleColumns = ['column_1', 'column_2', 'column_3', 'column_4'];
    setColumns(sampleColumns);
  }, [selectedSql]);

  const widgetFields = React.useMemo(() => {
    const fields = [];
    switch (selectedCnts?.cnts_tp) {
      case 'chart':
        fields.push(
          { id: 'x_axis', label: 'X축' },
          { id: 'y_axis', label: 'Y축' },
          { id: 'series', label: '시리즈' }
        );
        break;
      case 'grid':
        fields.push(
          { id: 'columns', label: '컬럼' },
          { id: 'sort', label: '정렬' }
        );
        break;
      case 'card':
        fields.push(
          { id: 'value', label: '값' },
          { id: 'label', label: '라벨' }
        );
        break;
      default:
        fields.push(
          { id: 'field_1', label: '필드 1' },
          { id: 'field_2', label: '필드 2' }
        );
    }
    return fields;
  }, [selectedCnts]);

  const handleDragStart = (column) => {
    setDraggingColumn(column);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (fieldId) => {
    if (!draggingColumn) return;
    
    const existingIndex = mappings.findIndex((m) => m.widgetField === fieldId);
    if (existingIndex >= 0) {
      const newMappings = [...mappings];
      newMappings[existingIndex] = { widgetField: fieldId, sqlColumn: draggingColumn };
      onMappingsChange(newMappings);
    } else {
      onMappingsChange([...mappings, { widgetField: fieldId, sqlColumn: draggingColumn }]);
    }
    setDraggingColumn(null);
  };

  const handleRemoveMapping = (index) => {
    const newMappings = [...mappings];
    newMappings.splice(index, 1);
    onMappingsChange(newMappings);
  };

  const handleKeyMapping = (column, fieldId) => {
    const existingIndex = mappings.findIndex((m) => m.widgetField === fieldId);
    if (existingIndex >= 0) {
      const newMappings = [...mappings];
      newMappings[existingIndex] = { widgetField: fieldId, sqlColumn: column };
      onMappingsChange(newMappings);
    } else {
      onMappingsChange([...mappings, { widgetField: fieldId, sqlColumn: column }]);
    }
  };

  return (
    <div className="flex gap-6">
      {/* SQL Columns */}
      <div className="w-64">
        <h3 className="font-semibold text-on-surface mb-4">SQL 컬럼</h3>
        <div className="space-y-2">
          {columns.map((column) => (
            <div
              key={column}
              draggable
              onDragStart={() => handleDragStart(column)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const firstUnmapped = widgetFields.find(
                    (f) => !mappings.some((m) => m.widgetField === f.id)
                  );
                  if (firstUnmapped) {
                    handleKeyMapping(column, firstUnmapped.id);
                  }
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${column} 컬럼을 드래그하여 맵핑하세요`}
              className="px-3 py-2 bg-surface-container rounded-lg border border-outline cursor-move hover:border-primary focus:outline-none focus:border-primary transition-colors"
            >
              {column}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-on-surface-variant">
          컬럼을 드래그하여 우측 필드에 맵핑하거나, Tab으로 이동 후 Enter 키를 누르세요.
        </p>
      </div>

      {/* Mappings */}
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface mb-4">맵핑 목록</h3>
        <div className="space-y-2">
          {mappings.map((mapping, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-3 py-2 bg-surface-container rounded-lg border border-outline"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{mapping.widgetField}</span>
                <span className="text-on-surface-variant">→</span>
                <span>{mapping.sqlColumn}</span>
              </div>
              <button
                onClick={() => handleRemoveMapping(index)}
                className="text-error hover:text-error/80 transition-colors"
                aria-label="맵핑 삭제"
              >
                ✕
              </button>
            </div>
          ))}
          {mappings.length === 0 && (
            <div className="text-on-surface-variant text-sm text-center py-8">
              맵핑이 없습니다. SQL 컬럼을 드래그하여 추가하세요.
            </div>
          )}
        </div>
      </div>

      {/* Widget Fields */}
      <div className="w-64">
        <h3 className="font-semibold text-on-surface mb-4">위젯 필드</h3>
        <div className="space-y-2">
          {widgetFields.map((field) => (
            <div
              key={field.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(field.id)}
              className={`px-3 py-2 rounded-lg border-2 border-dashed transition-colors ${
                mappings.some((m) => m.widgetField === field.id)
                  ? 'bg-primary-container border-primary'
                  : 'bg-surface-container border-outline hover:border-primary'
              }`}
            >
              <div className="font-medium">{field.label}</div>
              <div className="text-xs text-on-surface-variant">
                {mappings.find((m) => m.widgetField === field.id)?.sqlColumn || '여기에 드롭'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
