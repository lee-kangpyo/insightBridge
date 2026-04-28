import { useEffect, useMemo, useState } from 'react';
import { CardDetail, ChartDetail, GridDetail } from '../../content-detail';
import { executeSqlPreview, getAdminContentsDetail, handleApiError } from '../../../services/adminApi';
import KPICard from '../../main/KPICard';
import ChartRenderer from '../../ChartRenderer';

function chipClass(kind) {
  const base =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border';
  if (kind === 'ok') return `${base} bg-tertiary-fixed/30 text-on-surface border-outline/15`;
  if (kind === 'warn') return `${base} bg-amber-50 text-amber-900 border-amber-200`;
  if (kind === 'err') return `${base} bg-error-container/40 text-error border-error/30`;
  return `${base} bg-surface-container-low text-on-surface-variant border-outline/15`;
}

function resolveItemType(item, shapeContent) {
  const t = item?.mapping_json?.type;
  if (t === 'chart' || t === 'grid' || t === 'card') return t;
  const ct = shapeContent?.contentType;
  if (ct === 'chart' || ct === 'grid' || ct === 'card') return ct;
  return null;
}

function normalizeMappingItems(mappingItems) {
  if (!mappingItems) return [];
  if (Array.isArray(mappingItems)) return mappingItems.filter(Boolean);
  if (typeof mappingItems === 'object') return Object.values(mappingItems).filter(Boolean);
  return [];
}

function normalizeMappingColumns(mappingColumns) {
  if (!mappingColumns) return [];
  if (Array.isArray(mappingColumns)) return mappingColumns.filter(Boolean);
  if (typeof mappingColumns === 'object') {
    return Object.entries(mappingColumns)
      .map(([dataKey, v]) => ({ dataKey, ...(v || {}) }))
      .filter(Boolean);
  }
  return [];
}

function getRowValue(row, field) {
  if (!row || field == null) return null;
  const v = row[field];
  if (v === undefined) return null;
  return v;
}

function buildGridPreviewModel(itemType, item, shapeContent, preview) {
  if (itemType !== 'grid') return { columns: [], rows: [] };

  const mj = item?.mapping_json;
  const m = mj && typeof mj === 'object' ? mj.mapping || {} : null;
  if (!m || typeof m !== 'object') return { columns: [], rows: [] };

  const mappedColumns = normalizeMappingColumns(m.columns);
  const usableMappings = mappedColumns
    .map((c) => ({
      dataKey: typeof c?.dataKey === 'string' ? c.dataKey : null,
      field: typeof c?.field === 'string' ? c.field : null,
    }))
    .filter((c) => !!c.dataKey && !!c.field);

  if (usableMappings.length === 0) return { columns: [], rows: [] };

  const shapeCols = Array.isArray(shapeContent?.data?.columns) ? shapeContent.data.columns : [];
  const shapeByKey = new Map(
    shapeCols
      .map((c) => {
        const dataKey = c?.dataKey || c?.field;
        if (!dataKey) return null;
        const header = c?.displayName || c?.header || c?.title || dataKey;
        return [String(dataKey), { header: String(header), dataKey: String(dataKey) }];
      })
      .filter(Boolean)
  );

  const columns = usableMappings.map(({ dataKey }) => {
    const meta = shapeByKey.get(dataKey);
    return { dataKey, header: meta?.header || dataKey };
  });

  const sqlRows = Array.isArray(preview?.rows) ? preview.rows : [];
  const rows = sqlRows.map((row) => {
    const out = {};
    for (const { dataKey, field } of usableMappings) {
      out[dataKey] = getRowValue(row, field);
    }
    return out;
  });

  return { columns, rows };
}

function normalizeMappingSeries(series) {
  if (!series) return [];
  if (Array.isArray(series)) return series.filter(Boolean);
  if (typeof series === 'object') {
    return Object.entries(series)
      .map(([name, v]) => ({ name, ...(v || {}) }))
      .filter(Boolean);
  }
  return [];
}

function buildChartPreviewModel(itemType, item, shapeContent, preview) {
  if (itemType !== 'chart') return { chartType: null, data: [], chartConfig: null };

  const mj = item?.mapping_json;
  const chartType = mj?.chartType;
  if (typeof chartType !== 'string' || !chartType.trim()) {
    return { chartType: null, data: [], chartConfig: null };
  }

  const mapping = mj?.mapping;
  if (!mapping || typeof mapping !== 'object') {
    return { chartType, data: [], chartConfig: null };
  }

  const categoryField = mapping.categoryField;
  const seriesList = normalizeMappingSeries(mapping.series);

  if (typeof categoryField !== 'string' || !categoryField.trim()) {
    return { chartType, data: [], chartConfig: null };
  }

  const sqlRows = Array.isArray(preview?.rows) ? preview.rows : [];
  if (sqlRows.length === 0) {
    return { chartType, data: [], chartConfig: null };
  }

  const title = shapeContent?.data?.chartTitle || item?.item_nm || '';

  // ChartRenderer는 (x,y,groupKey) 기반 pivot을 지원하므로 long-form으로 변환한다.
  // row: { category, series, value }
  const long = [];
  for (const row of sqlRows) {
    const category = getRowValue(row, categoryField);
    if (category == null) continue;

    if (seriesList.length === 0) {
      // series가 없으면 검증 실패/미리보기 불가로 처리 (임의 대체 금지)
      continue;
    }

    for (const s of seriesList) {
      const seriesName = (s?.name || s?.label || '').toString() || '';
      const field = s?.field;
      if (typeof field !== 'string' || !field.trim()) continue;
      const v = getRowValue(row, field);
      long.push({ category: String(category), series: seriesName || field, value: v == null ? null : Number(v) });
    }
  }

  const data = long;
  if (data.length === 0) {
    return { chartType, data: [], chartConfig: null };
  }

  const chartConfig = {
    type: chartType,
    title,
    x: 'category',
    y: 'value',
    group: 'series',
  };

  return { chartType, data, chartConfig };
}

function buildCardKpis(itemType, item, shapeContent, preview) {
  const rows = preview?.rows || [];
  const row0 = rows[0] || null;

  // Card-only. No arbitrary fallback (must be verifiable).
  if (itemType !== 'card') return [];

  // mapping_json for card must exist and be usable.
  const mj = item?.mapping_json;
  const m = mj && typeof mj === 'object' ? mj.mapping || {} : null;
  if (!m || typeof m !== 'object') return [];
  if (!row0) return [];

  if (itemType === 'card') {
    // value (single KPI)
    if (m.value && typeof m.value === 'string' && row0) {
      const v = getRowValue(row0, m.value);
      return [
        {
          label: shapeContent?.data?.cardTitle || item?.item_nm || '값',
          value: v,
          source: `mapping.value = ${m.value}`,
        },
      ];
    }

    // items (multiple)
    const mappedItems = normalizeMappingItems(m.items);
    if (mappedItems.length > 0 && row0) {
      return mappedItems.slice(0, 6).map((it, idx) => {
        const field = it?.field;
        // header_nm(=label)가 없으면 field로 대체 표시하지 않음(혼란 방지).
        // 대신 카드 자체는 보여야 하므로 라벨은 "빈칸"으로 유지(공백 문자로 KPICard의 early-return 방지).
        const labelRaw = it?.label || shapeContent?.data?.items?.[idx]?.label || '';
        const label = String(labelRaw).trim() ? labelRaw : '\u00A0';
        const v = field ? getRowValue(row0, field) : null;
        return { label, value: v, source: field ? `mapping.items.field = ${field}` : 'mapping.items' };
      });
    }
  }

  return [];
}

export default function Phase1ItemPreview({ item }) {
  const [shapeContent, setShapeContent] = useState(null);
  const [shapeLoading, setShapeLoading] = useState(false);
  const [shapeError, setShapeError] = useState(null);

  const [sqlPreview, setSqlPreview] = useState(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlError, setSqlError] = useState(null);

  useEffect(() => {
    setShapeContent(null);
    setShapeError(null);

    if (!item?.shape_cnts_id) return;

    let cancelled = false;
    (async () => {
      setShapeLoading(true);
      try {
        const c = await getAdminContentsDetail(item.shape_cnts_id);
        if (!cancelled) setShapeContent(c);
      } catch (e) {
        if (!cancelled) setShapeError(handleApiError(e, '형태 콘텐츠를 불러오지 못했습니다.'));
      } finally {
        if (!cancelled) setShapeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item?.shape_cnts_id]);

  useEffect(() => {
    setSqlPreview(null);
    setSqlError(null);

    if (!item?.sql_cnts_id) return;

    let cancelled = false;
    (async () => {
      setSqlLoading(true);
      try {
        const p = await executeSqlPreview(item.sql_cnts_id);
        console.groupCollapsed?.('[admin/items] SQL preview');
        console.log('sql_cnts_id =', item?.sql_cnts_id);
        console.log('result =', p);
        console.log('columns =', p?.columns);
        console.log('rows.length =', Array.isArray(p?.rows) ? p.rows.length : null);
        console.log('rows[0] =', p?.rows?.[0]);
        console.groupEnd?.();
        if (!cancelled) setSqlPreview(p);
      } catch (e) {
        if (!cancelled) setSqlError(handleApiError(e, 'SQL 미리보기를 실행하지 못했습니다.'));
      } finally {
        if (!cancelled) setSqlLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item?.sql_cnts_id]);

  const itemType = useMemo(() => resolveItemType(item, shapeContent), [item, shapeContent]);

  const cardKpis = useMemo(
    () => buildCardKpis(itemType, item, shapeContent, sqlPreview),
    [itemType, item, shapeContent, sqlPreview]
  );

  const gridPreviewModel = useMemo(
    () => buildGridPreviewModel(itemType, item, shapeContent, sqlPreview),
    [itemType, item, shapeContent, sqlPreview]
  );

  const chartPreviewModel = useMemo(
    () => buildChartPreviewModel(itemType, item, shapeContent, sqlPreview),
    [itemType, item, shapeContent, sqlPreview]
  );

  const sqlMeta = useMemo(() => {
    const cols = sqlPreview?.columns || [];
    const rows = sqlPreview?.rows || [];
    return {
      colCount: cols.length,
      rowCount: rows.length,
      truncated: !!sqlPreview?.truncated,
      cols,
      row0: rows[0] || null,
    };
  }, [sqlPreview]);

  return (
    <section className="rounded-2xl border border-outline/20 bg-surface-container-lowest shadow-sm overflow-hidden">
      <header className="p-6 border-b border-outline/15 bg-gradient-to-br from-surface-container-lowest to-surface-container-low">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-headline text-[20px] font-bold text-primary tracking-tight truncate">
              {item?.item_nm || '선택된 아이템'}
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">
              형태/SQL/맵핑을 기준으로 “결과 느낌”을 빠르게 확인합니다. (Phase 1)
            </p>
          </div>
          <div className="shrink-0 text-xs font-mono text-on-surface-variant bg-surface px-2 py-1 rounded-lg border border-outline/10">
            #{item?.item_id ?? '—'}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={chipClass(itemType ? 'ok' : 'warn')}>
            <span className="material-symbols-outlined text-[16px]">category</span>
            타입: {itemType || '미확정'}
          </span>
          <span className={chipClass(item?.shape_cnts_id ? 'ok' : 'warn')}>
            <span className="material-symbols-outlined text-[16px]">palette</span>
            형태: {item?.shape_cnts_id ? `연결(#${item.shape_cnts_id})` : '미연결'}
          </span>
          <span className={chipClass(item?.sql_cnts_id ? 'ok' : 'warn')}>
            <span className="material-symbols-outlined text-[16px]">database</span>
            SQL: {item?.sql_cnts_id ? `연결(#${item.sql_cnts_id})` : '미연결'}
          </span>
          <span className={chipClass(item?.mapping_json ? 'ok' : 'warn')}>
            <span className="material-symbols-outlined text-[16px]">rule</span>
            맵핑: {item?.mapping_json ? '있음' : '없음'}
          </span>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* 1) 타입별 결과(실 결과) */}
        {itemType === 'card' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">view_agenda</span>
              <h4 className="font-semibold text-on-surface">카드 미리보기</h4>
            </div>

            {!item?.mapping_json ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                card 타입은 <span className="font-semibold">맵핑(mapping_json)</span>이 있어야 실 결과를 검증할 수 있습니다.
              </div>
            ) : !item?.sql_cnts_id ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                card 타입은 <span className="font-semibold">SQL 연결(sql_cnts_id)</span>이 있어야 실 결과를 만들 수 있습니다.
              </div>
            ) : sqlLoading ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                SQL 실행 중...
              </div>
            ) : sqlError ? (
              <div className="rounded-xl border border-error/25 bg-error-container/30 p-4 text-sm text-error">
                {sqlError}
              </div>
            ) : cardKpis.length === 0 ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                실 결과를 만들 수 없습니다. 맵핑 필드(value/items)와 SQL 결과 컬럼이 일치하는지 확인하세요.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {cardKpis.map((it, idx) => (
                  <div key={`${it.label}-${idx}`} className="space-y-2">
                    <KPICard
                      label={it.label}
                      value={it.value == null ? '' : String(it.value)}
                      showAverages={false}
                    />
                    <div className="text-[11px] text-on-surface-variant truncate" title={it.source}>
                      {it.source}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {itemType === 'grid' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">table</span>
              <h4 className="font-semibold text-on-surface">그리드(테이블) 미리보기</h4>
            </div>

            {!item?.mapping_json ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                grid 타입은 <span className="font-semibold">맵핑(mapping_json)</span>이 있어야 실 결과를 검증할 수 있습니다.
              </div>
            ) : !item?.sql_cnts_id ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                grid 타입은 <span className="font-semibold">SQL 연결(sql_cnts_id)</span>이 있어야 실 결과를 만들 수 있습니다.
              </div>
            ) : sqlLoading ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                SQL 실행 중...
              </div>
            ) : sqlError ? (
              <div className="rounded-xl border border-error/25 bg-error-container/30 p-4 text-sm text-error">
                {sqlError}
              </div>
            ) : gridPreviewModel.columns.length === 0 ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                미리보기 불가: <span className="font-semibold">매핑 컬럼(columns)</span>이 필요합니다. (원시 테이블 자동 표시는 금지)
              </div>
            ) : gridPreviewModel.rows.length === 0 ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                조회 결과가 비어 있습니다.
              </div>
            ) : (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-outline/20">
                      {gridPreviewModel.columns.map((c) => (
                        <th key={c.dataKey} className="text-left py-2 px-2 whitespace-nowrap">
                          {c.header || c.dataKey}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gridPreviewModel.rows.slice(0, 25).map((row, i) => (
                      <tr key={i} className="border-b border-outline/10">
                        {gridPreviewModel.columns.map((c) => (
                          <td key={c.dataKey} className="py-1.5 px-2">
                            {row?.[c.dataKey] == null || row?.[c.dataKey] === '' ? '—' : String(row[c.dataKey])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {itemType === 'chart' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
              <h4 className="font-semibold text-on-surface">차트 미리보기</h4>
            </div>

            {!item?.mapping_json ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                chart 타입은 <span className="font-semibold">맵핑(mapping_json)</span>이 있어야 실 결과를 검증할 수 있습니다.
              </div>
            ) : !item?.sql_cnts_id ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                chart 타입은 <span className="font-semibold">SQL 연결(sql_cnts_id)</span>이 있어야 실 결과를 만들 수 있습니다.
              </div>
            ) : sqlLoading ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                SQL 실행 중...
              </div>
            ) : sqlError ? (
              <div className="rounded-xl border border-error/25 bg-error-container/30 p-4 text-sm text-error">
                {sqlError}
              </div>
            ) : !item?.mapping_json?.chartType ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                미리보기 불가: <span className="font-semibold">chartType</span>이 필요합니다.
              </div>
            ) : !item?.mapping_json?.mapping?.categoryField ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                미리보기 불가: <span className="font-semibold">categoryField</span> 매핑이 필요합니다.
              </div>
            ) : !item?.mapping_json?.mapping?.series ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                미리보기 불가: <span className="font-semibold">series</span> 매핑이 필요합니다.
              </div>
            ) : chartPreviewModel.data.length === 0 || !chartPreviewModel.chartConfig ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                실 결과를 만들 수 없습니다. 맵핑 필드(category/series)와 SQL 결과 컬럼이 일치하는지 확인하세요.
              </div>
            ) : (
              <div className="rounded-xl border border-outline/15 bg-surface p-4">
                <div className="h-[360px]">
                  <ChartRenderer data={chartPreviewModel.data} chartConfig={chartPreviewModel.chartConfig} />
                </div>
              </div>
            )}
          </div>
        )}

        {itemType !== 'card' && itemType !== 'grid' && (
          <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
            실 결과 미리보기는 현재 <span className="font-semibold">card / grid / chart</span>만 지원합니다. (현재: {itemType || '미확정'})
          </div>
        )}

        {/* 2) 형태 설정 요약 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <h4 className="font-semibold text-on-surface">형태 설정</h4>
          </div>

          {!item?.shape_cnts_id && (
            <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
              형태 콘텐츠가 연결되어 있지 않습니다.
            </div>
          )}
          {item?.shape_cnts_id && shapeLoading && (
            <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
              불러오는 중...
            </div>
          )}
          {item?.shape_cnts_id && shapeError && (
            <div className="rounded-xl border border-error/25 bg-error-container/30 p-4 text-sm text-error">
              {shapeError}
            </div>
          )}
          {item?.shape_cnts_id && !shapeLoading && !shapeError && shapeContent && (
            <div className="rounded-xl border border-outline/15 bg-surface p-4">
              <div className="text-xs text-on-surface-variant mb-3">
                {shapeContent.contentName || '—'} · <span className="font-mono">{shapeContent.contentType}</span>
              </div>
              {shapeContent.contentType === 'chart' && <ChartDetail data={shapeContent.data} />}
              {shapeContent.contentType === 'grid' && (
                <GridDetail data={shapeContent.data} columnItemClassName="bg-white" />
              )}
              {shapeContent.contentType === 'card' && (
                <CardDetail data={shapeContent.data} itemClassName="bg-white" />
              )}
              {!['chart', 'grid', 'card'].includes(shapeContent.contentType) && (
                <div className="text-sm text-on-surface-variant">지원되지 않는 형태 타입입니다.</div>
              )}
            </div>
          )}
        </div>

        {/* 3) SQL 샘플 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">dataset</span>
            <h4 className="font-semibold text-on-surface">SQL 샘플</h4>
          </div>

          {!item?.sql_cnts_id && (
            <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
              SQL 콘텐츠가 연결되어 있지 않습니다.
            </div>
          )}
          {item?.sql_cnts_id && sqlLoading && (
            <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
              SQL 실행 중...
            </div>
          )}
          {item?.sql_cnts_id && sqlError && (
            <div className="rounded-xl border border-error/25 bg-error-container/30 p-4 text-sm text-error">
              {sqlError}
            </div>
          )}
          {item?.sql_cnts_id && !sqlLoading && !sqlError && sqlPreview && (
            <div className="rounded-xl border border-outline/15 bg-surface p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                <span className="font-medium text-on-surface">미리보기</span>
                <span>컬럼 {sqlMeta.colCount}개</span>
                <span>·</span>
                <span>행 {sqlMeta.rowCount}개</span>
                {sqlMeta.truncated && (
                  <>
                    <span>·</span>
                    <span className="text-amber-900">상위 100행 제한(truncated)</span>
                  </>
                )}
              </div>

              {/* row0 key:value */}
              {sqlMeta.row0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sqlMeta.cols.slice(0, 8).map((c) => (
                    <div key={c} className="rounded-lg border border-outline/10 bg-surface-container-lowest px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant truncate">
                        {c}
                      </div>
                      <div className="text-sm font-medium text-on-surface truncate" title={String(sqlMeta.row0[c] ?? '')}>
                        {sqlMeta.row0[c] == null || sqlMeta.row0[c] === '' ? '—' : String(sqlMeta.row0[c])}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-on-surface-variant">조회 결과가 비어 있습니다.</div>
              )}
            </div>
          )}
        </div>

        {/* mapping_json raw */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">data_object</span>
            <h4 className="font-semibold text-on-surface">맵핑 JSON</h4>
          </div>
          <pre className="text-xs bg-surface rounded-xl p-4 overflow-auto max-h-56 border border-outline/10 text-on-surface-variant">
            {JSON.stringify(item?.mapping_json ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}

