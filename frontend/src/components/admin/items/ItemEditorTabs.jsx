import React, { useState, useEffect, useMemo } from 'react';
import { executeSqlPreview, handleApiError } from '../../../services/adminApi';
import api from '../../../services/api';
import { CONTENT_TYPE_MAP } from '../../../constants/contentTypes';
import { ChartDetail, GridDetail, CardDetail, SqlDetail } from '../../content-detail';

export function FormTab({ selectedCnts, onSelectCnts }) {
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
              type="button"
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

export function SqlTab({ selectedSql, onSelectSql }) {
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

export function MappingTab({ selectedCnts, selectedSql, mappingJson, onMappingJsonChange }) {
  const [columns, setColumns] = useState([]);
  const [contentDetail, setContentDetail] = useState(null);
  const [draggingColumn, setDraggingColumn] = useState(null);

  useEffect(() => {
    if (!selectedSql) {
      setColumns([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // 문서 기준: SQL 미리보기 결과에서 실제 컬럼을 추출
        const data = await executeSqlPreview(selectedSql.cnts_id);
        if (cancelled) return;
        const cols = Array.isArray(data?.columns) ? data.columns : [];
        setColumns(cols);
      } catch (err) {
        if (!cancelled) setColumns([]);
        console.error('Failed to load SQL preview columns:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSql]);

  useEffect(() => {
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
  }, [selectedCnts]);

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
        <p className="mt-4 text-xs text-on-surface-variant">
          컬럼을 드래그하여 우측 필드에 맵핑하세요.
        </p>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-on-surface mb-4">맵핑 설정</h3>
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
                className={`px-3 py-2 rounded-lg border-2 border-dashed transition-colors ${
                  isMapped
                    ? 'bg-primary-container border-primary'
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
