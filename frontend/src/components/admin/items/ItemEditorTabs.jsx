import React, { useState, useEffect, useMemo } from 'react';
import { executeSqlPreview, handleApiError } from '../../../services/adminApi';
import api from '../../../services/api';
import { CONTENT_TYPE_MAP } from '../../../constants/contentTypes';
import { ChartDetail, GridDetail, CardDetail, SqlDetail } from '../../content-detail';
// (주의) 카드 equals 미리보기는 selectCardRow(단일 행 선택) 대신
// sqlRows를 직접 필터링해서 "일치하는 모든 행"을 보여주도록 합니다.

const CARD_ROW_SELECTOR_MODES = [
  { value: 'first', label: '첫 행' },
  { value: 'last', label: '마지막 행' },
  { value: 'max', label: '최대값 행' },
  { value: 'min', label: '최소값 행' },
  { value: 'equals', label: '값 일치 행' },
];

export function FormTab({ selectedCnts, onSelectCnts, onContentDetailChange }) {
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
      onContentDetailChange?.(null);
      return;
    }
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/api/admin/contents/${selectedCnts.cnts_id}`);
        setContentDetail(response.data.content);
        onContentDetailChange?.(response.data.content);
      } catch (err) {
        console.error('Failed to fetch content detail:', err);
        onContentDetailChange?.(null);
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
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === f.id
                  ? 'bg-surface-container-high text-on-surface'
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
                  selectedCnts?.cnts_id === content.cnts_id ? 'bg-surface-container-high text-on-surface' : ''
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
              type="button"
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
              type="button"
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

export function SqlTab({ selectedSql, onSelectSql, onPreviewDataChange }) {
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
    onPreviewDataChange?.(null);
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
      onPreviewDataChange?.(data);
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
                  selectedSql?.cnts_id === content.cnts_id ? 'bg-surface-container-high text-on-surface' : ''
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
              type="button"
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
              type="button"
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
            type="button"
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

function inferRowSelectorConditions(row, columnNames) {
  if (!row || !Array.isArray(columnNames) || columnNames.length === 0) return [];

  const preferred = ['구분', '학교명', '기준연도', '권역', '대학명', '학교코드', '대학코드', '연도'];
  const selected = [];
  const used = new Set();

  for (const key of preferred) {
    if (!columnNames.includes(key)) continue;
    const value = row[key];
    if (value == null || value === '') continue;
    selected.push({ field: key, value: String(value) });
    used.add(key);
  }

  if (selected.length > 0) return selected;

  for (const key of columnNames) {
    if (used.has(key)) continue;
    const value = row[key];
    if (value == null || value === '') continue;
    if (typeof value === 'number' || Number.isFinite(Number(value))) continue;
    selected.push({ field: key, value: String(value) });
    if (selected.length >= 3) break;
  }

  return selected;
}

function buildCardItemSummary(mappingItem) {
  const field = typeof mappingItem?.field === 'string' ? mappingItem.field : '';
  const selector = mappingItem?.rowSelector;
  const where = Array.isArray(selector?.where) ? selector.where : [];
  const selectorText =
    selector?.mode === 'where' && where.length > 0
      ? where
          .filter((cond) => cond?.field)
          .map((cond) => `${cond.field}=${cond.value ?? ''}`)
          .join(', ')
      : selector?.mode || '';

  if (field && selectorText) return `${field} <- ${selectorText}`;
  if (field) return field;
  return '여기에 드롭';
}

export function MappingTab({
  selectedCnts,
  contentDetail: contentDetailProp,
  sqlPreviewData,
  mappingJson,
  onMappingJsonChange,
}) {
  const [columns, setColumns] = useState([]);
  const [contentDetail, setContentDetail] = useState(contentDetailProp || null);
  const [draggingColumn, setDraggingColumn] = useState(null);
  const [selectedCardFieldId, setSelectedCardFieldId] = useState(null);

  useEffect(() => {
    // 부모(ScreenItemFormModal)에서 sqlPreviewData를 기본으로 로드하도록 변경했으므로,
    // 여기서는 sqlPreviewData.columns만 사용합니다.
    if (Array.isArray(sqlPreviewData?.columns)) setColumns(sqlPreviewData.columns);
    else setColumns([]);
  }, [sqlPreviewData]);

  useEffect(() => {
    if (contentDetailProp) {
      setContentDetail(contentDetailProp);
    }
  }, [contentDetailProp]);

  useEffect(() => {
    if (contentDetailProp) {
      setContentDetail(contentDetailProp);
      return;
    }
    if (!selectedCnts) {
      setContentDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get(`/api/admin/contents/${selectedCnts.cnts_id}`);
        if (!cancelled) setContentDetail(response.data.content);
      } catch (err) {
        if (!cancelled) setContentDetail(null);
        console.error('Failed to fetch content detail for mapping:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCnts, contentDetailProp]);

  const widgetFields = useMemo(() => {
    const fields = [];
    const contentType = contentDetail?.contentType || selectedCnts?.contentType;
    const data = contentDetail?.data;

    switch (contentType) {
      case 'chart': {
        const xAxisName = data?.xAxis || 'xAxis';
        const yAxisName = data?.yAxis || 'series';
        fields.push({ id: `category_${xAxisName}`, label: `${xAxisName} (X축/카테고리)` });
        fields.push({ id: `series_${yAxisName}`, label: `${yAxisName} (Y축/시리즈)` });
        break;
      }
      case 'grid': {
        if (data?.columns && Array.isArray(data.columns)) {
          data.columns.forEach((col, idx) => {
            const display = col.displayName || col.header || col.dataKey || col.field || `컬럼 ${idx + 1}`;
            const dataKey = col.dataKey || col.field || `column_${idx}`;
            fields.push({ id: `column_${dataKey}`, label: `${display} [${dataKey}]` });
          });
        }
        break;
      }
      case 'card': {
        // 문서 기준: Card key는 item.content (고유 키)
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          data.items.forEach((it) => {
            const key = it?.content;
            if (!key) return;
            const labelRaw = (it?.label || '').trim();
            const label = labelRaw ? `${labelRaw} [${key}]` : `[${key}]`;
            fields.push({ id: `card_item_${key}`, label });
          });
        }
        break;
      }
      default:
        fields.push(
          { id: 'field_1', label: '필드 1' },
          { id: 'field_2', label: '필드 2' }
        );
    }
    return fields;
  }, [selectedCnts, contentDetail]);

  const contentType = contentDetail?.contentType || selectedCnts?.contentType;
  const isCardType = contentType === 'card';
  const sqlRows = Array.isArray(sqlPreviewData?.rows) ? sqlPreviewData.rows : [];
  const cardFields = widgetFields.filter((field) => field.id.startsWith('card_item_'));
  const rowSelector = mappingJson?.mapping?.rowSelector || {};
  const storedRowSelectorMode =
    typeof rowSelector?.mode === 'string' && rowSelector.mode.trim() ? rowSelector.mode : 'first';
  const isWhereMode = storedRowSelectorMode === 'where';
  // 드롭다운에서는 where를 숨기므로, 화면 선택 값은 equals로 보이게 매핑합니다.
  const rowSelectorMode = isWhereMode ? 'equals' : storedRowSelectorMode;
  const rowSelectorField = typeof rowSelector?.field === 'string' ? rowSelector.field : '';
  const rowSelectorValue = rowSelector?.value == null ? '' : String(rowSelector.value);
  const rowSelectorWhere = Array.isArray(rowSelector?.where)
    ? rowSelector.where
        .map((cond) => ({
          field: typeof cond?.field === 'string' ? cond.field : '',
          value: cond?.value == null ? '' : String(cond.value),
        }))
    : [];

  // 요약 카드: equals(값 일치) 조건이 실제로 매칭되면 해당 "모든 행"을 미리보기로 보여줍니다.
  const cardEqualsMatchedRows = useMemo(() => {
    if (!isCardType) return [];
    if (storedRowSelectorMode !== 'equals') return [];

    const targetField = rowSelectorField.trim();
    const targetValue = rowSelectorValue.trim();
    if (!targetField) return [];
    if (!targetValue) return [];

    return sqlRows.filter((r) => {
      const v = r?.[targetField];
      if (v == null || v === '') return false;
      return String(v).trim() === targetValue;
    });
  }, [isCardType, storedRowSelectorMode, rowSelectorField, rowSelectorValue, sqlRows]);

  const previewSqlRows = useMemo(() => {
    if (cardEqualsMatchedRows.length > 0) return cardEqualsMatchedRows.slice(0, 15);
    return sqlRows.slice(0, 15);
  }, [cardEqualsMatchedRows, sqlRows]);

  const updateCardRowSelector = (patch) => {
    const next = { ...(mappingJson || {}) };
    if (!next.mapping || typeof next.mapping !== 'object') {
      next.mapping = {};
    }
    const prevSelector =
      next.mapping.rowSelector && typeof next.mapping.rowSelector === 'object'
        ? next.mapping.rowSelector
        : {};
    const merged = { ...prevSelector, ...patch };
    const mode =
      typeof merged.mode === 'string' && merged.mode.trim() ? merged.mode.trim() : 'first';
    const field = typeof merged.field === 'string' ? merged.field : '';
    const value = merged.value;

    const normalized = { mode, field };
    if (mode === 'equals') {
      normalized.value = value == null ? '' : String(value);
    }
    if (mode === 'where') {
      const nextWhere = Array.isArray(merged.where)
        ? merged.where
            .map((cond) => ({
              field: typeof cond?.field === 'string' ? cond.field : '',
              value: cond?.value == null ? '' : String(cond.value),
            }))
        : [];
      normalized.where = nextWhere;
    }

    next.mapping.rowSelector = normalized;
    onMappingJsonChange(next);
  };

  const updateCardRowSelectorWhereItem = (index, patch) => {
    const base = rowSelectorWhere.length > 0 ? rowSelectorWhere : [{ field: '', value: '' }];
    const nextWhere = base.map((it, i) => (i === index ? { ...it, ...patch } : it));
    updateCardRowSelector({ where: nextWhere });
  };

  const addCardRowSelectorWhereItem = () => {
    const nextWhere = [...rowSelectorWhere, { field: '', value: '' }];
    updateCardRowSelector({ where: nextWhere });
  };

  const removeCardRowSelectorWhereItem = (index) => {
    const nextWhere = rowSelectorWhere.filter((_, i) => i !== index);
    updateCardRowSelector({ where: nextWhere });
  };

  const handleDragStart = (column) => {
    if (isCardType) return; // 요약 카드(Summary Card)는 클릭 매핑만 허용
    setDraggingColumn(column);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (fieldId) => {
    if (isCardType) return; // 요약 카드(Summary Card)는 드래그&드롭 비활성화
    if (!draggingColumn) return;

    const newMapping = { ...mappingJson };
    if (!newMapping.mapping) {
      newMapping.mapping = {};
    }

    // 문서 기준: key 기반 Object 매핑으로 저장
    if (fieldId.startsWith('column_')) {
      if (!newMapping.mapping.columns || typeof newMapping.mapping.columns !== 'object') {
        newMapping.mapping.columns = {};
      }
      const key = fieldId.substring(7);
      newMapping.mapping.columns[key] = { field: draggingColumn };
    } else if (fieldId.startsWith('category_')) {
      newMapping.mapping.categoryField = draggingColumn;
    } else if (fieldId.startsWith('series_')) {
      if (!newMapping.mapping.series || typeof newMapping.mapping.series !== 'object') {
        newMapping.mapping.series = {};
      }
      const key = fieldId.substring(7);
      newMapping.mapping.series[key] = { field: draggingColumn };
    } else if (fieldId.startsWith('card_item_')) {
      if (!newMapping.mapping.items || typeof newMapping.mapping.items !== 'object') {
        newMapping.mapping.items = {};
      }
      const key = fieldId.substring(10);
      newMapping.mapping.items[key] = { field: draggingColumn };
    } else {
      newMapping.mapping[fieldId] = draggingColumn;
    }

    onMappingJsonChange(newMapping);
    setDraggingColumn(null);
  };

  const handleCardCellMapping = (fieldId, row, column) => {
    if (!fieldId || !row || !column) return;

    const rowSelectorWhere = inferRowSelectorConditions(row, columns);
    const nextMapping = { ...(mappingJson || {}) };
    if (!nextMapping.type) nextMapping.type = 'card';
    if (!nextMapping.mapping || typeof nextMapping.mapping !== 'object') {
      nextMapping.mapping = {};
    }
    if (!nextMapping.mapping.items || typeof nextMapping.mapping.items !== 'object') {
      nextMapping.mapping.items = {};
    }

    const key = fieldId.substring(10);
    nextMapping.mapping.items[key] = {
      ...(nextMapping.mapping.items[key] || {}),
      field: column,
      rowSelector:
        rowSelectorWhere.length > 0
          ? { mode: 'where', where: rowSelectorWhere }
          : { mode: 'first' },
    };

    onMappingJsonChange(nextMapping);
  };

  const handleRemoveMapping = (fieldId) => {
    const newMapping = { ...mappingJson };
    if (newMapping.mapping) {
      if (fieldId.startsWith('column_')) {
        const key = fieldId.substring(7);
        if (newMapping.mapping.columns) delete newMapping.mapping.columns[key];
      } else if (fieldId.startsWith('category_')) {
        delete newMapping.mapping.categoryField;
      } else if (fieldId.startsWith('series_')) {
        const key = fieldId.substring(7);
        if (newMapping.mapping.series) delete newMapping.mapping.series[key];
      } else if (fieldId.startsWith('card_item_')) {
        const key = fieldId.substring(10);
        if (newMapping.mapping.items) delete newMapping.mapping.items[key];
      } else {
        delete newMapping.mapping[fieldId];
      }
    }
    onMappingJsonChange(newMapping);
  };

  return (
    <div className="flex gap-6">
      {!isCardType && (
        <div className="w-64">
          <h3 className="font-semibold text-on-surface mb-4">SQL 컬럼</h3>
          {columns.length > 0 ? (
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
          ) : (
            <div className="text-on-surface-variant text-sm">
              SQL을 선택하면 컬럼이 표시됩니다. (필요 시 SQL 탭에서 미리보기를 확인하세요)
            </div>
          )}
          <p className="mt-4 text-xs text-on-surface-variant">컬럼을 드래그하여 우측 필드에 맵핑하세요.</p>
        </div>
      )}

      <div className="flex-1">
        <h3 className="font-semibold text-on-surface mb-4">맵핑 설정</h3>
        {isCardType && (
          <div className="mb-4 rounded-lg border border-outline/20 bg-surface-container-low p-3 space-y-3">
            <div className="text-sm font-medium text-on-surface">카드 대표 행 선택</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">선택 방식</label>
                <select
                  value={rowSelectorMode}
                  onChange={(e) => updateCardRowSelector({ mode: e.target.value })}
                  className="w-full px-2.5 py-2 text-sm bg-surface rounded-lg border border-outline/20 focus:outline-none focus:border-primary"
                >
                  {CARD_ROW_SELECTOR_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              {(storedRowSelectorMode === 'max' ||
                storedRowSelectorMode === 'min' ||
                storedRowSelectorMode === 'equals') && (
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">기준 컬럼</label>
                  <select
                    value={rowSelectorField}
                    onChange={(e) => updateCardRowSelector({ field: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm bg-surface rounded-lg border border-outline/20 focus:outline-none focus:border-primary"
                  >
                    <option value="">선택</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {storedRowSelectorMode === 'equals' && (
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">일치 값</label>
                  <input
                    type="text"
                    value={rowSelectorValue}
                    onChange={(e) => updateCardRowSelector({ value: e.target.value })}
                    placeholder="예: 2025"
                    className="w-full px-2.5 py-2 text-sm bg-surface rounded-lg border border-outline/20 focus:outline-none focus:border-primary"
                  />
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!rowSelectorField) return;
                        updateCardRowSelector({
                          mode: 'where',
                          where: [{ field: rowSelectorField, value: rowSelectorValue }],
                        });
                      }}
                      disabled={!rowSelectorField}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-outline/20 bg-surface hover:bg-surface-container disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      조건 추가 (AND)
                    </button>
                  </div>
                </div>
              )}
            </div>
            {isWhereMode && (
              <div className="space-y-2">
                <div className="text-xs text-on-surface-variant">
                  조건 조합 행(AND): 모든 조건을 만족하는 첫 행을 선택합니다.
                </div>
                {(rowSelectorWhere.length > 0 ? rowSelectorWhere : [{ field: '', value: '' }]).map(
                  (cond, idx) => (
                    <div key={`${idx}-${cond.field}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <div className="md:col-span-5">
                        <label className="block text-xs text-on-surface-variant mb-1">컬럼</label>
                        <select
                          value={cond.field}
                          onChange={(e) => updateCardRowSelectorWhereItem(idx, { field: e.target.value })}
                          className="w-full px-2.5 py-2 text-sm bg-surface rounded-lg border border-outline/20 focus:outline-none focus:border-primary"
                        >
                          <option value="">선택</option>
                          {columns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-5">
                        <label className="block text-xs text-on-surface-variant mb-1">값</label>
                        <input
                          type="text"
                          value={cond.value}
                          onChange={(e) => updateCardRowSelectorWhereItem(idx, { value: e.target.value })}
                          placeholder="예: 전국평균"
                          className="w-full px-2.5 py-2 text-sm bg-surface rounded-lg border border-outline/20 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <button
                          type="button"
                          onClick={() => removeCardRowSelectorWhereItem(idx)}
                          className="w-full px-2.5 py-2 text-sm rounded-lg border border-outline/20 bg-surface hover:bg-surface-container disabled:opacity-50"
                          disabled={rowSelectorWhere.length <= 1}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )
                )}
                <div>
                  <button
                    type="button"
                    onClick={addCardRowSelectorWhereItem}
                    className="px-3 py-1.5 text-xs rounded-lg border border-outline/20 bg-surface hover:bg-surface-container"
                  >
                    조건 추가
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {isCardType && (
          <div className="mb-4 rounded-lg border border-outline/20 bg-surface-container-low p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-on-surface">클릭 매핑</div>
                <div className="text-xs text-on-surface-variant">
                  카드 항목을 먼저 고르고, 아래 SQL 결과에서 원하는 값을 클릭하세요.
                </div>
              </div>
              <div className="text-xs text-on-surface-variant">
                선택 항목: <span className="font-medium text-on-surface">{selectedCardFieldId || '없음'}</span>
              </div>
            </div>

            {cardFields.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cardFields.map((field) => {
                  const itemKey = field.id.substring(10);
                  const mappingItem = mappingJson?.mapping?.items?.[itemKey];
                  const isActive = selectedCardFieldId === field.id;
                  const isMapped =
                    typeof mappingItem?.field === 'string' &&
                    mappingItem.field.trim() !== '' &&
                    typeof mappingItem?.rowSelector?.mode === 'string' &&
                    mappingItem.rowSelector.mode.trim() !== '';

                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedCardFieldId(field.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedCardFieldId(field.id);
                      }}
                      className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                        isActive
                          ? 'border-outline/20 bg-surface-container-high text-on-surface'
                          : 'border-outline/20 bg-surface hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{field.label}</div>
                          <div
                            className="text-[11px] text-on-surface-variant"
                          >
                            {isMapped ? buildCardItemSummary(mappingItem) : '클릭으로 세팅'}
                          </div>
                        </div>
                        {isMapped && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMapping(field.id);
                            }}
                            className="text-error hover:text-error/80 transition-colors shrink-0 mt-0.5"
                            aria-label={`${field.label} 해제`}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!sqlPreviewData && (
              <div className="rounded-lg border border-outline/15 bg-surface px-3 py-2 text-xs text-on-surface-variant">
                SQL 미리보기 결과를 불러오는 중입니다.
              </div>
            )}

            {sqlPreviewData && sqlRows.length > 0 && (
              <div className="overflow-auto rounded-lg border border-outline/15 bg-surface">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-outline/15 bg-surface-container-low">
                      {columns.map((col) => (
                        <th key={col} className="px-2 py-2 text-left whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewSqlRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-outline/10">
                        {columns.map((col) => {
                          const value = row?.[col];
                          const clickable = !!selectedCardFieldId;
                          return (
                            <td key={col} className="px-2 py-1.5">
                              <button
                                type="button"
                                disabled={!clickable}
                                onClick={() => handleCardCellMapping(selectedCardFieldId, row, col)}
                                className={`w-full rounded px-2 py-1 text-left ${
                                  clickable
                                    ? 'hover:bg-surface-container-high/70 cursor-pointer'
                                    : 'cursor-not-allowed opacity-70'
                                }`}
                                title={
                                  clickable
                                    ? `${selectedCardFieldId}에 ${col} 값을 연결`
                                    : '먼저 카드 항목을 선택하세요.'
                                }
                              >
                                {value == null || value === '' ? '—' : String(value)}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {!isCardType && (
          <div className="space-y-2">
            {widgetFields.map((field) => {
              const isGridColumn = field.id.startsWith('column_');
              const isCategory = field.id.startsWith('category_');
              const isSeries = field.id.startsWith('series_');

              let mappedValue;
              let isMapped;
              if (isGridColumn) {
                mappedValue = mappingJson.mapping?.columns?.[field.id.substring(7)]?.field;
                isMapped = !!mappedValue;
              } else if (isCategory) {
                mappedValue = mappingJson.mapping?.categoryField;
                isMapped = !!mappedValue;
              } else if (isSeries) {
                mappedValue = mappingJson.mapping?.series?.[field.id.substring(7)]?.field;
                isMapped = !!mappedValue;
              } else {
                mappedValue = mappingJson.mapping?.[field.id];
                isMapped = !!mappedValue;
              }

              return (
                <div
                  key={field.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(field.id)}
                  className={`px-3 py-2 rounded-lg border-2 border-dashed transition-colors ${
                    isMapped
                      ? 'bg-surface-container-high border-outline/20 text-on-surface'
                      : 'bg-surface-container border-outline hover:border-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{field.label}</div>
                      <div className="text-xs text-on-surface-variant">
                        {mappedValue || '여기에 드롭'}
                      </div>
                    </div>
                    {isMapped && (
                      <button
                        type="button"
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
        )}
      </div>

      <div className="w-64">
        <h3 className="font-semibold text-on-surface mb-4">매핑 JSON</h3>
        <pre className="bg-surface-container rounded-lg p-3 text-xs overflow-auto max-h-80">
          {JSON.stringify(mappingJson, null, 2)}
        </pre>
      </div>
    </div>
  );
}
