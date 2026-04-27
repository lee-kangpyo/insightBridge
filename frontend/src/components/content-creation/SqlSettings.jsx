import { useEffect, useMemo, useState } from 'react';
import { queryAdminStream } from '../../services/api';

const DEFAULT_PROMPT =
  '예: 최근 5년간의 연도별, 학과별 등록금 수입 데이터를 추출해줘. 단과대 이름도 포함하고, 등록금 수입이 높은 순으로 정렬해.';

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
          {safeRows.slice(0, 20).map((r, idx) => (
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

export default function SqlSettings({ value, onChange, visible }) {
  const sqlValue = (value?.sql ?? '').toString();

  const [prompt, setPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState(null);

  const displaySql = useMemo(() => {
    const fromCandidate = candidate?.sql ? String(candidate.sql) : '';
    return sqlValue || fromCandidate;
  }, [sqlValue, candidate]);

  useEffect(() => {
    if (candidate?.sql) {
      onChange?.({ ...(value || {}), sql: String(candidate.sql) });
    }
    // value/onChange는 부모에서 주입되며, onChange 호출은 candidate 변경에만 반응시키기 위함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.sql]);

  const handleGenerate = async () => {
    const q = prompt.trim();
    if (!q || isStreaming) return;

    setIsStreaming(true);
    setError('');
    setCandidate(null);

    await queryAdminStream(
      q,
      (cand) => {
        // SSE로 candidate 이벤트가 여러 번 와도, admin 화면에서는 1개만 유지(마지막 값으로 덮어씀).
        setCandidate(cand);
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

  const handleReRunPreview = async () => {
    const sql = (value?.sql ?? '').toString().trim();
    if (!sql || isStreaming) return;
    // 같은 SQL이라도 "데이터 미리보기"를 다시 받고 싶을 수 있어, prompt에 SQL을 넣어 재요청하지 않고
    // 현재는 백엔드가 자연어 기반이므로, 사용자가 프롬프트로 재생성하도록 유도한다.
    setError('현재는 프롬프트 기반 재생성만 지원합니다. 프롬프트를 수정 후 다시 생성하세요.');
  };

  if (!visible) return null;

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
        <span className="material-symbols-outlined text-secondary">database</span>
        <h2 className="font-headline text-xl font-bold text-primary">데이터 조회 상세</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
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

          <div className="flex flex-col flex-grow">
            <label className="ds-label flex items-center justify-between">
              <span>생성된 SQL 쿼리</span>
              <button
                type="button"
                onClick={() => safeCopy(displaySql)}
                className="text-secondary hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                <span className="text-[10px] normal-case">복사</span>
              </button>
            </label>
            <div className="bg-inverse-surface text-inverse-on-surface p-5 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto h-full shadow-inner min-h-[220px]">
              <pre className="whitespace-pre-wrap"><code>{displaySql || '(아직 생성된 SQL이 없습니다)'}</code></pre>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="ds-label flex items-center justify-between mb-2">
            <span>데이터 미리보기 (Top 20)</span>
            <button
              type="button"
              onClick={handleReRunPreview}
              className="flex items-center gap-1 text-secondary text-xs hover:underline disabled:opacity-60"
              disabled={isStreaming}
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              재실행
            </button>
          </label>
          <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/20 flex-grow flex flex-col min-h-[320px]">
            <DataPreviewTable rows={candidate?.data || []} />
            <div className="mt-auto bg-surface px-4 py-3 border-t border-outline-variant/20 flex justify-between items-center text-xs text-on-surface-variant">
              <span>
                {Array.isArray(candidate?.data) ? `Showing ${Math.min(candidate.data.length, 20)} rows` : 'Showing 0 rows'}
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