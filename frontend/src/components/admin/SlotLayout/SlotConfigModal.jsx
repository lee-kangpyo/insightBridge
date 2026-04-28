import React, { useState, useEffect } from 'react';
import { executeSqlPreview, handleApiError, createItem, updateItem } from '../../../services/adminApi';
import api from '../../../services/api';
import { CONTENT_TYPE_MAP } from '../../../constants/contentTypes';
import { ChartDetail, GridDetail, CardDetail, SqlDetail } from '../../content-detail';

const TABS = [
  { id: 'form', label: '형태' },
  { id: 'sql', label: 'SQL' },
  { id: 'mapping', label: '맵핑' },
];

export default function SlotConfigModal({ slot, assignment, items, onSave, onCancel }) {
  const [viewMode, setViewMode] = useState(assignment?.item_id ? 'config' : 'list');
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
  const [itemName, setItemName] = useState('');
  
  // 데이터 연동을 위한 상태
  const [contentDetail, setContentDetail] = useState(null);
  const [sqlPreviewData, setSqlPreviewData] = useState(null);
  const [prevSelectedCntsId, setPrevSelectedCntsId] = useState(null);
  const [prevSelectedSqlId, setPrevSelectedSqlId] = useState(null);

  useEffect(() => {
    if (selectedItem) {
      setSelectedCnts(selectedItem.shape_cnts_id ? { cnts_id: selectedItem.shape_cnts_id } : null);
      setSelectedSql(selectedItem.sql_cnts_id ? { cnts_id: selectedItem.sql_cnts_id } : null);
      setMappingJson(selectedItem.mapping_json || {});
      setItemName(selectedItem.item_nm || '');
    }
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedCnts) return;
    if (prevSelectedCntsId !== null && prevSelectedCntsId !== selectedCnts.cnts_id) {
      setMappingJson({ type: '', mapping: {} });
    }
    setPrevSelectedCntsId(selectedCnts.cnts_id);
  }, [selectedCnts]);

  useEffect(() => {
    if (!selectedSql) return;
    if (prevSelectedSqlId !== null && prevSelectedSqlId !== selectedSql.cnts_id) {
      setMappingJson({ type: '', mapping: {} });
    }
    setPrevSelectedSqlId(selectedSql.cnts_id);
  }, [selectedSql]);

  // contentDetail 동기화 로직 (기존 유지)
  useEffect(() => {
    if (contentDetail && viewMode === 'config' && !selectedItem?.item_id) {
      setMappingJson(prev => {
        if (prev.type === contentDetail.contentType && 
            (contentDetail.contentType !== 'chart' || prev.chartType === contentDetail.data?.chartType)) {
          return prev;
        }
        const newMapping = {
          type: contentDetail.contentType,
          mapping: prev.mapping || {}
        };
        if (contentDetail.contentType === 'chart') {
          newMapping.chartType = contentDetail.data?.chartType || 'bar';
          if (!newMapping.mapping.categoryField) newMapping.mapping.categoryField = '';
          if (typeof newMapping.mapping.series !== 'object' || newMapping.mapping.series === null) {
            newMapping.mapping.series = {};
          }
        }
        return newMapping;
      });
    }
  }, [contentDetail, viewMode, selectedItem]);

  const handleSelectItem = (item) => {
    const assignment = {
      item_id: item.item_id,
      item_nm: item.item_nm,
      cnts_tp: item.mapping_json?.type || 'default',
    };
    onSave(slot.slot_id, assignment);
  };

  const handleFinalSave = async () => {
    if (!itemName.trim()) {
      setError('아이템 이름을 입력해주세요.');
      return;
    }

    try {
      let itemToSave = selectedItem;
      const payload = {
        item_nm: itemName,
        shape_cnts_id: selectedCnts?.cnts_id || null,
        sql_cnts_id: selectedSql?.cnts_id || null,
        mapping_json: mappingJson,
      };

      if (selectedItem?.item_id) {
        // 수정 모드
        await updateItem(selectedItem.item_id, payload);
        itemToSave = { ...selectedItem, ...payload };
      } else {
        // 신규 생성 모드
        const result = await createItem(payload);
        itemToSave = { ...payload, item_id: result.item_id };
      }

      onSave(slot.slot_id, {
        item_id: itemToSave.item_id,
        item_nm: itemToSave.item_nm,
        cnts_tp: itemToSave.mapping_json?.type || 'default',
      });
    } catch (err) {
      setError(handleApiError(err, '저장 중 오류가 발생했습니다.'));
    }
  };

  const isMappingEnabled = selectedCnts && selectedSql;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-[1100px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-outline/10 bg-surface-container-low">
          <div>
            <h2 className="text-xl font-bold text-on-surface">
              {viewMode === 'list' ? '아이템 선택' : `아이템 설정 (${slot.slot_id})`}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              {viewMode === 'list' ? '사용할 아이템을 선택하거나 새로 만듭니다.' : '형태, 데이터, 매핑 규칙을 설정합니다.'}
            </p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            ✕
          </button>
        </div>

        {viewMode === 'list' ? (
          /* Step 1: Item Selection List */
          <div className="flex-1 overflow-auto p-8 bg-surface">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-on-surface-variant">기존 아이템 ({items.length})</span>
              <button
                onClick={() => setViewMode('config')}
                className="px-5 py-2.5 text-sm font-bold text-on-primary bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all duration-300"
              >
                + 새 아이템 만들기
              </button>
            </div>
            
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-outline/20 rounded-3xl">
                <p className="text-on-surface-variant">등록된 아이템이 없습니다.</p>
                <button onClick={() => setViewMode('config')} className="mt-4 text-primary font-bold hover:underline">
                  첫 아이템 만들기 →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <button
                    key={item.item_id}
                    onClick={() => handleSelectItem(item)}
                    className="group flex flex-col p-5 bg-white rounded-2xl border border-outline/10 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 text-left"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-1 bg-surface-container-high text-[10px] font-bold text-primary rounded-md uppercase tracking-wider">
                        {item.mapping_json?.type || '미지정'}
                      </span>
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
        ) : (
          /* Step 2: Configuration View (Tabs) */
          <div className="flex-1 flex flex-col overflow-hidden bg-surface">
            {/* Config Sub-Header with Name Input */}
            <div className="px-8 py-4 bg-surface-container-lowest border-b border-outline/10 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter mb-1">아이템 이름</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-4 py-2 bg-white rounded-xl border border-outline/20 focus:outline-none focus:border-primary font-medium"
                  placeholder="아이템 이름을 입력하세요"
                />
              </div>
              <div className="flex flex-col justify-end h-full">
                 <button onClick={() => setViewMode('list')} className="text-xs text-on-surface-variant hover:text-primary transition-colors mt-4">
                   ← 목록으로 돌아가기
                 </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex px-8 border-b border-outline/10 bg-surface-container-lowest">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'mapping' && !isMappingEnabled) return;
                    setActiveTab(tab.id);
                  }}
                  disabled={tab.id === 'mapping' && !isMappingEnabled}
                  className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                    } ${tab.id === 'mapping' && !isMappingEnabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-auto p-8">
              {error && (
                <div className="mb-6 p-4 bg-error-container text-error rounded-2xl text-sm flex items-center gap-3">
                  <span className="text-lg">⚠️</span> {error}
                </div>
              )}

              {activeTab === 'form' && (
                <FormTab
                  selectedCnts={selectedCnts}
                  onSelectCnts={setSelectedCnts}
                  onContentDetailChange={setContentDetail}
                />
              )}

              {activeTab === 'sql' && (
                <SqlTab
                  selectedSql={selectedSql}
                  onSelectSql={setSelectedSql}
                  onPreviewDataChange={setSqlPreviewData}
                />
              )}

              {activeTab === 'mapping' && isMappingEnabled && (
                <MappingTab
                  selectedCnts={selectedCnts}
                  selectedSql={selectedSql}
                  contentDetail={contentDetail}
                  sqlPreviewData={sqlPreviewData}
                  mappingJson={mappingJson}
                  onMappingJsonChange={setMappingJson}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center px-8 py-5 border-t border-outline/10 bg-surface-container-low">
              <button
                onClick={() => setViewMode('list')}
                className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
              >
                취소 후 목록으로
              </button>
              <button
                onClick={handleFinalSave}
                className="px-8 py-2.5 text-sm font-bold text-on-primary bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all duration-300"
              >
                아이템 저장 및 적용
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormTab({ selectedCnts, onSelectCnts, onContentDetailChange }) {
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
      onContentDetailChange(null);
      return;
    }
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/api/admin/contents/${selectedCnts.cnts_id}`);
        setContentDetail(response.data.content);
        onContentDetailChange(response.data.content);
      } catch (err) {
        console.error('Failed to fetch content detail:', err);
      }
    };
    fetchDetail();
  }, [selectedCnts, onContentDetailChange]);

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
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === f.id
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
                className={`border-b border-outline/10 cursor-pointer hover:bg-surface-container ${selectedCnts?.cnts_id === content.cnts_id ? 'bg-primary-container' : ''
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

function SqlTab({ selectedSql, onSelectSql, onPreviewDataChange }) {
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
    onPreviewDataChange(null);
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
      onPreviewDataChange(data);
    } catch (err) {
      setPreviewError(handleApiError(err, 'SQL 미리보기 실행 중 오류가 발생했습니다.'));
      onPreviewDataChange(null);
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
                className={`border-b border-outline/10 cursor-pointer hover:bg-surface-container ${selectedSql?.cnts_id === content.cnts_id ? 'bg-primary-container' : ''
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

function MappingTab({ selectedCnts, selectedSql, contentDetail, sqlPreviewData, mappingJson, onMappingJsonChange }) {
  const [draggingColumn, setDraggingColumn] = useState(null);

  // SQL 미리보기 결과에서 컬럼 동적으로 추출
  const sqlColumns = React.useMemo(() => {
    if (sqlPreviewData?.columns && Array.isArray(sqlPreviewData.columns)) {
      return sqlPreviewData.columns;
    }
    return [];
  }, [sqlPreviewData]);

  // 형태(그리드/차트/카드)의 data 구조에서 매핑 대상 필드 추출
  const widgetFields = React.useMemo(() => {
    const fields = [];
    const contentType = contentDetail?.contentType || selectedCnts?.contentType;
    const data = contentDetail?.data;

    switch (contentType) {
      case 'chart': {
        const xAxisName = data?.xAxis || 'xAxis';
        const yAxisName = data?.yAxis || 'series';
        const xAxisLabel = xAxisName;
        const yAxisLabel = yAxisName;
        fields.push({
          id: `category_${xAxisName}`,
          label: `${xAxisLabel} (X축/카테고리)`,
          type: 'string'
        });
        fields.push({
          id: `series_${yAxisName}`,
          label: `${yAxisLabel} (Y축/시리즈)`,
          type: 'array'
        });
        break;
      }
      case 'grid': {
        if (data?.columns && Array.isArray(data.columns)) {
          data.columns.forEach((col, idx) => {
            const label = col.displayName || col.header || col.dataKey || col.field || `컬럼 ${idx + 1}`;
            const colId = col.dataKey || col.field || `column_${idx}`;
            const dataKeyStr = col.dataKey ? ` [${col.dataKey}]` : '';
            fields.push({
              id: `column_${colId}`,
              label: `${label}${dataKeyStr}`,
              field: col.field,
              type: 'column'
            });
          });
        } else {
          fields.push({ id: 'columns', label: '컬럼 목록', type: 'array' });
        }
        break;
      }
      case 'card': {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          data.items.forEach((item) => {
            const contentKey = item.content || item.label || 'unknown';
            fields.push({
              id: `card_item_${contentKey}`,
              label: item.label || item.content || contentKey,
              type: 'item'
            });
          });
        }
        break;
      }
      default:
        fields.push({ id: 'field_1', label: '필드 1', type: 'string' });
        fields.push({ id: 'field_2', label: '필드 2', type: 'string' });
    }
    return fields;
  }, [contentDetail, selectedCnts]);

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

    if (fieldId.startsWith('column_')) {
      if (!newMapping.mapping.columns || typeof newMapping.mapping.columns !== 'object') {
        newMapping.mapping.columns = {};
      }
      const colKey = fieldId.substring(7);
      newMapping.mapping.columns[colKey] = { field: draggingColumn };
    } else if (fieldId.startsWith('category_')) {
      newMapping.mapping.categoryField = draggingColumn;
    } else if (fieldId.startsWith('series_')) {
      if (!newMapping.mapping.series || typeof newMapping.mapping.series !== 'object') {
        newMapping.mapping.series = {};
      }
      const seriesKey = fieldId.substring(7);
      newMapping.mapping.series[seriesKey] = { field: draggingColumn };
    } else if (fieldId.startsWith('card_item_')) {
      if (!newMapping.mapping.items || typeof newMapping.mapping.items !== 'object') {
        newMapping.mapping.items = {};
      }
      const cardKey = fieldId.substring(10);
      newMapping.mapping.items[cardKey] = { field: draggingColumn };
    } else {
      newMapping.mapping[fieldId] = draggingColumn;
    }

    onMappingJsonChange(newMapping);
    setDraggingColumn(null);
  };

  const handleRemoveMapping = (fieldId) => {
    const newMapping = { ...mappingJson };
    if (newMapping.mapping) {
      if (fieldId.startsWith('column_')) {
        const colKey = fieldId.substring(7);
        if (newMapping.mapping.columns) {
          delete newMapping.mapping.columns[colKey];
        }
      } else if (fieldId.startsWith('category_')) {
        delete newMapping.mapping.categoryField;
      } else if (fieldId.startsWith('series_')) {
        const seriesKey = fieldId.substring(7);
        if (newMapping.mapping.series) {
          delete newMapping.mapping.series[seriesKey];
        }
      } else if (fieldId.startsWith('card_item_')) {
        const cardKey = fieldId.substring(10);
        if (newMapping.mapping.items) {
          delete newMapping.mapping.items[cardKey];
        }
      } else {
        delete newMapping.mapping[fieldId];
      }
    }
    onMappingJsonChange(newMapping);
  };

  return (
    <div className="flex gap-6">
      {/* SQL Columns */}
      <div className="w-64">
        <h3 className="font-semibold text-on-surface mb-4">SQL 컬럼</h3>
        {sqlColumns.length > 0 ? (
          <div className="space-y-2">
            {sqlColumns.map((column) => (
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
        ) : (
          <div className="text-on-surface-variant text-sm">
            SQL 탭에서 미리보기를 실행하면 컬럼이 표시됩니다.
          </div>
        )}
        <p className="mt-4 text-xs text-on-surface-variant">
          컬럼을 드래그하여 우측 필드에 맵핑하세요.
        </p>
      </div>

      {/* Mappings */}
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface mb-4">맵핑 설정</h3>
        {widgetFields.length > 0 ? (
          <div className="space-y-2">
            {widgetFields.map((field) => {
              const isGridColumn = field.id.startsWith('column_');
              const isCategory = field.id.startsWith('category_');
              const isSeries = field.id.startsWith('series_');
              const isCardItem = field.id.startsWith('card_item_');
              let mappedValue;
              if (isGridColumn) {
                mappedValue = mappingJson.mapping?.columns?.[field.id.substring(7)]?.field;
              } else if (isCategory) {
                mappedValue = mappingJson.mapping?.categoryField;
              } else if (isSeries) {
                mappedValue = mappingJson.mapping?.series?.[field.id.substring(7)]?.field;
              } else if (isCardItem) {
                mappedValue = mappingJson.mapping?.items?.[field.id.substring(10)]?.field;
              } else {
                mappedValue = mappingJson.mapping?.[field.id];
              }
              const isMapped = !!mappedValue;

              return (
                <div
                  key={field.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(field.id)}
                  className={`px-3 py-2 rounded-lg border-2 border-dashed transition-colors ${isMapped
                    ? 'bg-primary-container border-primary'
                    : 'bg-surface-container border-outline hover:border-primary'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{field.label}</div>
                      <div className="text-xs text-on-surface-variant">
                        {isMapped && isCardItem
                          ? `${field.label} → ${mappedValue}`
                          : (mappedValue || '여기에 드롭')}
                      </div>
                    </div>
                    {isMapped && (
                      <button
                        onClick={() => handleRemoveMapping(field.id)}
                        className="text-error hover:text-error/80 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-on-surface-variant text-sm text-center py-8">
            {(() => {
              const ct = contentDetail?.contentType || selectedCnts?.contentType;
              if (ct === 'card') return '카드 항목(items)이 정의되어야 매핑 필드가 표시됩니다. (카드 설정에서 항목을 추가하세요)';
              return '형태 탭에서 콘텐츠를 선택하면 매핑 필드가 표시됩니다.';
            })()}
          </div>
        )}
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
