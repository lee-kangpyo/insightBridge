import { useEffect, useMemo, useState } from 'react';
import { CardDetail, ChartDetail, GridDetail } from '../../content-detail';
import { executeSqlPreview, getAdminContentsDetail, handleApiError } from '../../../services/adminApi';
import ChartRenderer from '../../ChartRenderer';
import {
  buildChartPreviewModel,
  buildGridPreviewModel,
  buildCardPreviewModel,
} from '../../../utils/itemDataTransformers';

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

function displayText(v) {
  if (v == null || v === '') return '미공시';
  return String(v);
}

export function CompositeKpiCardPreview({ title, headline, rows, sources }) {
  const hasHeadline = headline != null && headline !== '';
  const hasRows = Array.isArray(rows) && rows.length > 0;

  if (!hasHeadline && !hasRows) return null;

  return (
    <div className="space-y-2">
      <div className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/40 shadow-md hover:shadow-lg hover:border-outline-variant/60 transition-all">
        <div className="flex justify-between items-start gap-3 min-w-0 mb-1.5 min-h-[2.75rem]">
          <span
            className="min-w-0 flex-1 pr-1 text-base font-bold text-on-surface-variant uppercase tracking-wide leading-snug line-clamp-2 break-words"
            title={title}
          >
            {title}
          </span>
        </div>

        {hasHeadline && (
          <div className="text-3xl font-semibold tabular-nums mb-3 text-on-surface">
            {displayText(headline)}
          </div>
        )}

        {hasRows && (
          <div className="space-y-1.5">
            {rows.map((r, idx) => {
              const label = typeof r?.label === 'string' ? r.label : '';
              const value = r?.value;
              const kind = r?.kind;

              // label이 없으면 "큰 값" 스타일(값만 강조)
              if (!label.trim() || kind === 'valueOnly') {
                return (
                  <div key={idx} className="text-xl font-semibold tabular-nums text-on-surface">
                    {displayText(value)}
                  </div>
                );
              }

              // label이 있으면 "권역평균"처럼 (라벨, 값) 2열
              return (
                <div key={idx} className="flex justify-between items-baseline gap-2 text-sm">
                  <span className="text-on-surface-variant font-semibold shrink-0 leading-snug">
                    {label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-on-surface">
                    {displayText(value)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {Array.isArray(sources) && sources.length > 0 && (
        <div className="space-y-1">
          {sources.map((s, i) => (
            <div key={i} className="text-[11px] text-on-surface-variant truncate" title={s}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

  const cardPreviewModel = useMemo(
    () => buildCardPreviewModel(itemType, item, shapeContent, sqlPreview),
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
            ) : !cardPreviewModel ? (
              <div className="rounded-xl border border-outline/15 bg-surface p-4 text-sm text-on-surface-variant">
                실 결과를 만들 수 없습니다. 맵핑 필드(value/items)와 SQL 결과 컬럼이 일치하는지 확인하세요.
              </div>
            ) : (
              <div className="max-w-[720px]">
                <CompositeKpiCardPreview
                  title={cardPreviewModel.title}
                  headline={cardPreviewModel.headline}
                  rows={cardPreviewModel.rows}
                  sources={cardPreviewModel.sources}
                />
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

