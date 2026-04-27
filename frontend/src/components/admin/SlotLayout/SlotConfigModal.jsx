import React, { useState, useEffect, useCallback } from 'react';
import { getContentsByType, getSqlContents, executeSqlPreview, handleApiError, getAdminContentsList, createItem, updateItem } from '../../../services/adminApi';
import api from '../../../services/api';
import { CONTENT_TYPE_MAP } from '../../../constants/contentTypes';
import { ChartDetail, GridDetail, CardDetail, SqlDetail } from '../../content-detail';

const TABS = [
  { id: 'form', label: '형태' },
  { id: 'sql', label: 'SQL' },
  { id: 'mapping', label: '맵핑' },
];

export default function SlotConfigModal({ slot, assignment, items, onSave, onCancel }) {
  const [activeTab, setActiveTab] = useState('form');
  const [selectedItem, setSelectedItem] = useState(() => {
    if (assignment?.item_id) {
      return items.find((i) => i.item_id === assignment.item_id) || null;
    }
    return null;
  });
  const [selectedCnts, setSelectedCnts] = useState(null);
  const [selectedSql, setSelectedSql] = useState(null);
  const [mappingJson, setMappingJson] = useState(() => selectedItem?.mapping_json || {});
  const [error, setError] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [isEditingItem, setIsEditingItem] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setSelectedCnts(selectedItem.shape_cnts_id ? { cnts_id: selectedItem.shape_cnts_id } : null);
      setSelectedSql(selectedItem.sql_cnts_id ? { cnts_id: selectedItem.sql_cnts_id } : null);
      setMappingJson(selectedItem.mapping_json || {});
    }
  }, [selectedItem]);

  const handleSave = useCallback(async () => {
    if (!selectedItem) {
      setError('아이템을 선택하거나 생성해주세요.');
      return;
    }

    const assignment = {
      item_id: selectedItem.item_id,
      item_nm: selectedItem.item_nm,
      cnts_tp: selectedItem.mapping_json?.type || 'default',
    };

    onSave(slot.slot_id, assignment);
  }, [slot, selectedItem, onSave]);

  const handleCreateItem = async () => {
    if (!itemName.trim()) {
      setError('아이템 이름을 입력해주세요.');
      return;
    }

    try {
      const payload = {
        item_nm: itemName,
        shape_cnts_id: selectedCnts?.cnts_id || null,
        sql_cnts_id: selectedSql?.cnts_id || null,
        mapping_json: mappingJson,
      };
      const result = await createItem(payload);
      const newItem = {
        item_id: result.item_id,
        ...payload,
      };
      setSelectedItem(newItem);
      setIsItemModalOpen(false);
      setItemName('');
      setError(null);
    } catch (err) {
      setError(handleApiError(err, '아이템 생성 중 오류가 발생했습니다.'));
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      const payload = {
        item_nm: itemName || selectedItem.item_nm,
        shape_cnts_id: selectedCnts?.cnts_id || selectedItem.shape_cnts_id,
        sql_cnts_id: selectedSql?.cnts_id || selectedItem.sql_cnts_id,
        mapping_json: mappingJson,
      };
      await updateItem(selectedItem.item_id, payload);
      const updatedItem = { ...selectedItem, ...payload };
      setSelectedItem(updatedItem);
      setIsItemModalOpen(false);
      setIsEditingItem(false);
      setItemName('');
      setError(null);
    } catch (err) {
      setError(handleApiError(err, '아이템 수정 중 오류가 발생했습니다.'));
    }
  };

  const isMappingEnabled = selectedCnts && selectedSql;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-[1100px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-on-surface">
              슬롯 {slot.slot_id} 구성
            </h2>
            {selectedItem && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-primary-container text-primary text-xs rounded-lg font-medium">
                  {selectedItem.item_nm}
                </span>
                <button
                  onClick={() => {
                    setItemName(selectedItem.item_nm);
                    setIsEditingItem(true);
                    setIsItemModalOpen(true);
                  }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  수정
                </button>
              </div>
            )}
          </div>
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

          {/* Item Selection */}
          <div className="mb-6 p-4 bg-surface-container rounded-xl border border-outline/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-on-surface">아이템 선택</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setItemName('');
                    setIsEditingItem(false);
                    setIsItemModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-on-primary bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  새 아이템
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-auto">
              {items.map((item) => (
                <button
                  key={item.item_id}
                  onClick={() => {
                    setSelectedItem(item);
                    setError(null);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                    selectedItem?.item_id === item.item_id
                      ? 'bg-primary-container border-primary text-primary'
                      : 'bg-surface border-outline hover:bg-surface-container-high'
                  }`}
                >
                  <div className="font-medium truncate">{item.item_nm}</div>
                  <div className="text-xs text-on-surface-variant">
                    {item.mapping_json?.type || '미지정'}
                  </div>
                </button>
              ))}
            </div>
          </div>

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
              mappingJson={mappingJson}
              onMappingJsonChange={setMappingJson}
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
            disabled={!selectedItem}
            className="px-4 py-2 text-sm font-medium text-on-primary bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            저장
          </button>
        </div>
      </div>

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-surface rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">
              {isEditingItem ? '아이템 수정' : '새 아이템 생성'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                아이템 이름
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline focus:outline-none focus:border-primary"
                placeholder="아이템 이름을 입력하세요"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsItemModalOpen(false);
                  setItemName('');
                }}
                className="px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface-container rounded-lg border border-outline hover:bg-surface-container-high transition-colors"
              >
                취소
              </button>
              <button
                onClick={isEditingItem ? handleUpdateItem : handleCreateItem}
                className="px-4 py-2 text-sm font-medium text-on-primary bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                {isEditingItem ? '수정' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormTab({ selectedCnts, onSelectCnts }) {
  const [contents, setContents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contentDetail, setContentDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [showPagination, setShowPagination] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const params = { page, limit: pageSize };
        if (filter !== 'all') {
          params.cnts_tp = filter;
        }
        const response = await api.get('/api/admin/contents', { params });
        const allContents = response.data.contents || [];
        const totalCount = response.data.total || 0;
        setContents(allContents);
        setTotal(totalCount);
        setShowPagination(totalCount > 50);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, [filter, page, pageSize]);

  useEffect(() => {
    if (!selectedCnts) {
      setContentDetail(null);
      return;
    }
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/api/admin/contents/${selectedCnts.cnts_id}`);
        setContentDetail(response.data.content);
      } catch (err) {
        console.error('Failed to fetch content detail:', err);
      }
    };
    fetchDetail();
  }, [selectedCnts]);

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

        {showPagination && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            <span className="text-sm text-on-surface-variant">
              {page} / {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          </div>
        )}
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
          {contentDetail ? (
            <div className="bg-surface-container rounded-lg p-4 text-sm">
              {contentDetail.contentType === 'chart' && <ChartDetail data={contentDetail.data} />}
              {contentDetail.contentType === 'grid' && <GridDetail data={contentDetail.data} columnItemClassName="bg-white" />}
              {contentDetail.contentType === 'card' && <CardDetail data={contentDetail.data} itemClassName="bg-white" />}
              {contentDetail.contentType === 'sql' && <SqlDetail data={contentDetail.data} />}
            </div>
          ) : (
            <div className="bg-surface-container rounded-lg p-4 text-center text-on-surface-variant text-sm">
              미리보기 영역
            </div>
          )}
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
  const [previewError, setPreviewError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [showPagination, setShowPagination] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const params = { page, limit: pageSize, cnts_tp: 'sql' };
        const response = await api.get('/api/admin/contents', { params });
        const sqlContents = response.data.contents || [];
        const totalCount = response.data.total || 0;
        setContents(sqlContents);
        setTotal(totalCount);
        setShowPagination(totalCount > 50);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, [page, pageSize]);

  const handleSelect = async (content) => {
    onSelectSql(content);
    setSqlDetail(null);
    setPreviewData(null);
    setPreviewError(null);
    try {
      const response = await api.get(`/api/admin/contents/${content.cnts_id}`);
      setSqlDetail(response.data.content);
    } catch (err) {
      console.error('Failed to fetch SQL detail:', err);
    }
  };

  const handlePreview = async () => {
    if (!selectedSql) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await executeSqlPreview(selectedSql.cnts_id);
      setPreviewData(data);
    } catch (err) {
      setPreviewError(handleApiError(err, 'SQL 미리보기 실행 중 오류가 발생했습니다.'));
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

        {showPagination && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            <span className="text-sm text-on-surface-variant">
              {page} / {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          </div>
        )}
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
            {previewLoading ? '로딩 중...' : '데이터 미리보기'}
          </button>
        </div>

        {previewError && (
          <div className="mt-4 p-3 bg-error-container text-error rounded-lg text-sm">
            {previewError}
          </div>
        )}

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

function MappingTab({ selectedCnts, selectedSql, mappingJson, onMappingJsonChange }) {
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
    switch (selectedCnts?.contentType) {
      case 'chart':
        fields.push(
          { id: 'categoryField', label: '카테고리 필드' },
          { id: 'series', label: '시리즈' }
        );
        break;
      case 'grid':
        fields.push(
          { id: 'columns', label: '컬럼' }
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
    
    const newMapping = { ...mappingJson };
    if (!newMapping.mapping) {
      newMapping.mapping = {};
    }
    newMapping.mapping[fieldId] = draggingColumn;
    onMappingJsonChange(newMapping);
    setDraggingColumn(null);
  };

  const handleRemoveMapping = (fieldId) => {
    const newMapping = { ...mappingJson };
    if (newMapping.mapping) {
      delete newMapping.mapping[fieldId];
    }
    onMappingJsonChange(newMapping);
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
              className="px-3 py-2 bg-surface-container rounded-lg border border-outline cursor-move hover:border-primary transition-colors"
            >
              {column}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-on-surface-variant">
          컬럼을 드래그하여 우측 필드에 맵핑하세요.
        </p>
      </div>

      {/* Mappings */}
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface mb-4">맵핑 설정</h3>
        <div className="space-y-2">
          {widgetFields.map((field) => (
            <div
              key={field.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(field.id)}
              className={`px-3 py-2 rounded-lg border-2 border-dashed transition-colors ${
                mappingJson.mapping?.[field.id]
                  ? 'bg-primary-container border-primary'
                  : 'bg-surface-container border-outline hover:border-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{field.label}</div>
                  <div className="text-xs text-on-surface-variant">
                    {mappingJson.mapping?.[field.id] || '여기에 드롭'}
                  </div>
                </div>
                {mappingJson.mapping?.[field.id] && (
                  <button
                    onClick={() => handleRemoveMapping(field.id)}
                    className="text-error hover:text-error/80 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Preview */}
      <div className="w-64">
        <h3 className="font-semibold text-on-surface mb-4">매핑 JSON</h3>
        <pre className="bg-surface-container rounded-lg p-3 text-xs overflow-auto max-h-80">
          {JSON.stringify(mappingJson, null, 2)}
        </pre>
      </div>
    </div>
  );
}
