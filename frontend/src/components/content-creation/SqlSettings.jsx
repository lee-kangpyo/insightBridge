import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { queryAdminStream } from '../../services/api';
import { handleApiError, previewAdminContentsSql } from '../../services/adminApi';

const DEFAULT_PROMPT =
  '예: 최근 5년간의 연도별, 학과별 등록금 수입 데이터를 추출해줘. 단과대 이름도 포함하고, 등록금 수입이 높은 순으로 정렬해.';

const PREVIEW_DEBOUNCE_MS = 600;

function safeCopy(text) {
  const s = (text ?? '').toString();
  if (!s.trim()) return false;
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(s);
    return true;
  }
  return false;
}

function DataPreviewTable({ rows }) {
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const columns = useMemo(() => {
    const first = safeRows[0];
    if (!first || typeof first !== 'object') return [];
    return Object.keys(first);
  }, [safeRows]);

  if (safeRows.length === 0) {
    return (
      <div className="text-sm text-on-surface-variant py-8 text-center">
        결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-surface-container-highest text-on-surface-variant font-label text-xs uppercase tracking-wider">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 font-medium whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm font-body bg-surface-container-lowest divide-y divide-surface-container-low/50">
          {safeRows.slice(0, 100).map((r, idx) => (
            <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
              {columns.map((c) => (
                <td key={c} className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                  {r?.[c] === null || r?.[c] === undefined ? '' : String(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SqlSettings({ value, onChange, visible, errors, showErrors }) {
  const sqlValue = (value?.sql ?? '').toString();

  const [prompt, setPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState(null);

  const [useBaseYear, setUseBaseYear] = useState(false);
  const [baseYear, setBaseYear] = useState(String(new Date().getFullYear()));

  const [previewRows, setPreviewRows] = useState([]);
  const [previewTruncated, setPreviewTruncated] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewApiError, setPreviewApiError] = useState('');

  const previewRequestId = useRef(0);

  const runPreview = useCallback(async (sqlStr) => {
    const s = (sqlStr ?? '').toString().trim();
    if (!s) {
      previewRequestId.current += 1;
      setPreviewRows([]);
      setPreviewTruncated(false);
      setPreviewApiError('');
      setPreviewLoading(false);
      return;
    }

    const resolvedSql = useBaseYear
      ? s.replace(/\{\{base_year\}\}/g, baseYear)
      : s;

    const seq = ++previewRequestId.current;
    setPreviewLoading(true);
    setPreviewApiError('');
    try {
      const res = await previewAdminContentsSql(resolvedSql);
      if (seq !== previewRequestId.current) return;
      setPreviewRows(Array.isArray(res?.rows) ? res.rows : []);
      setPreviewTruncated(!!res?.truncated);
    } catch (e) {
      if (seq !== previewRequestId.current) return;
      setPreviewRows([]);
      setPreviewTruncated(false);
      setPreviewApiError(handleApiError(e, '미리보기 실행에 실패했습니다.'));
    } finally {
      if (seq === previewRequestId.current) {
        setPreviewLoading(false);
      }
    }
  }, [useBaseYear, baseYear]);

  useEffect(() => {
    if (candidate?.sql) {
      onChange?.({ ...(value || {}), sql: String(candidate.sql) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.sql]);

  useEffect(() => {
    if (!visible) return;

    const s = sqlValue.trim();
    if (!s) {
      previewRequestId.current += 1;
      setPreviewRows([]);
      setPreviewTruncated(false);
      setPreviewApiError('');
      setPreviewLoading(false);
      return;
    }

    if (isStreaming) {
      return () => {};
    }

    const t = window.setTimeout(() => {
      runPreview(s);
    }, PREVIEW_DEBOUNCE_MS);

    return () => window.clearTimeout(t);
  }, [visible, sqlValue, isStreaming, runPreview]);

  const handleGenerate = async () => {
    const q = prompt.trim();
    if (!q || isStreaming) return;

    setIsStreaming(true);
    setError('');
    setCandidate(null);

    await queryAdminStream(
      q,
      { base_year_enabled: useBaseYear },
      (cand) => {
        setCandidate(cand);
        if (Array.isArray(cand?.data) && cand.data.length > 0) {
          setPreviewRows(cand.data);
          setPreviewTruncated(false);
          setPreviewApiError('');
        }
      },
      () => {
        setIsStreaming(false);
      },
      (err) => {
        setError(err?.message || 'SQL 생성 중 오류가 발생했습니다.');
        setIsStreaming(false);
      }
    );
  };

  const handleReRunPreview = () => {
    const s = sqlValue.trim();
    if (!s || isStreaming) return;
    runPreview(s);
  };

  const handleSqlChange = (next) => {
    onChange?.({ ...(value || {}), sql: next });
  };

  if (!visible) return null;

  const sqlError = showErrors ? errors?.sql : '';

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
        <span className="material-symbols-outlined text-secondary">database</span>
        <h2 className="font-headline text-xl font-bold text-primary">데이터 조회 상세</h2>
      </div>
      {sqlError ? (
        <p className="text-xs text-error">{sqlError}</p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useBaseYear}
                onChange={(e) => setUseBaseYear(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              기준연도 사용
            </label>
            {useBaseYear && (
              <input
                type="number"
                value={baseYear}
                onChange={(e) => setBaseYear(e.target.value)}
                className="w-24 px-3 py-1.5 text-sm bg-surface-container-lowest border border-outline rounded-lg
                           text-on-surface tabular-nums
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="ds-label flex items-center justify-between">
              <span>자연어 프롬프트 (요청사항)</span>
              <span className="text-secondary bg-secondary-fixed px-2 py-0.5 rounded text-[10px]">AI Assistant</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={DEFAULT_PROMPT}
                className="w-full px-4 py-3 text-sm bg-surface-container-lowest border border-outline rounded-lg
                           text-on-surface placeholder:text-on-surface-variant
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isStreaming || !prompt.trim()}
                className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-on-primary font-medium
                           hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                {isStreaming ? '생성 중...' : 'SQL 생성'}
              </button>
            </div>
            {error ? (
              <div className="text-sm bg-error-container text-on-error-container rounded-lg px-4 py-3">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col flex-grow min-h-0">
            <label className="ds-label flex items-center justify-between">
              <span>SQL 쿼리 (직접 수정 가능)</span>
              <button
                type="button"
                onClick={() => safeCopy(sqlValue)}
                className="text-secondary hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                <span className="text-[10px] normal-case">복사</span>
              </button>
            </label>
            <textarea
              value={sqlValue}
              onChange={(e) => handleSqlChange(e.target.value)}
              readOnly={isStreaming}
              spellCheck={false}
              placeholder="AI로 생성하거나 SELECT 문을 직접 입력하세요."
              className="w-full min-h-[220px] flex-1 resize-y bg-inverse-surface text-inverse-on-surface p-5 rounded-xl font-mono text-xs leading-relaxed
                         border border-transparent shadow-inner focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         read-only:opacity-70"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="ds-label flex items-center justify-between mb-2">
            <span>데이터 미리보기 (최대 100행)</span>
            <button
              type="button"
              onClick={handleReRunPreview}
              className="flex items-center gap-1 text-secondary text-xs hover:underline disabled:opacity-60"
              disabled={isStreaming || !sqlValue.trim()}
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              재실행
            </button>
          </label>
          <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/20 flex-grow flex flex-col min-h-[320px] relative">
            {previewLoading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-low/60 text-sm text-on-surface-variant">
                미리보기 로딩 중…
              </div>
            ) : null}
            {previewApiError ? (
              <div className="text-sm text-error px-4 py-3 border-b border-outline-variant/20">{previewApiError}</div>
            ) : null}
            <DataPreviewTable rows={previewRows} />
            <div className="mt-auto bg-surface px-4 py-3 border-t border-outline-variant/20 flex justify-between items-center text-xs text-on-surface-variant gap-2 flex-wrap">
              <span>
                {previewRows.length > 0
                  ? `표시 ${previewRows.length}행${previewTruncated ? ' (일부만 표시)' : ''}`
                  : '표시 0행'}
              </span>
              <span className="text-on-surface-variant">
                {candidate?.chart_config?.type ? `추천 차트: ${candidate.chart_config.type}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
