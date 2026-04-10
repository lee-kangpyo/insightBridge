import { useEffect, useMemo, useState } from 'react';
import { getThemeTextBlocks } from '../services/api';

const DEFAULT_SCREEN_VER = 'v0.1';
const HEADER_BLOCK_CODE = 'HEADER_CONTEXT';

function firstNonEmptyText(lines, roles) {
  if (!Array.isArray(lines)) return null;
  for (const role of roles) {
    const line = lines.find((l) => l?.role === role && (l?.text || '').trim() !== '');
    if (line) return line.text;
  }
  const any = lines.find((l) => (l?.text || '').trim() !== '');
  return any ? any.text : null;
}

/**
 * `/api/theme/text-blocks`의 `HEADER_CONTEXT` 블록을 페이지 최상단 타이틀/부제로 사용.
 *
 * 규칙
 * - title: block.title (tq_screen_text_block.block_title)
 * - subtitle: lines 중 role='SUBTITLE' 우선, 없으면 role='SUMMARY', 없으면 첫 비어있지 않은 라인
 */
export function useThemeHeaderContext({
  screenCode,
  screenVer = DEFAULT_SCREEN_VER,
  screenBaseYear,
  schlNm,
}) {
  const params = useMemo(
    () => ({
      screen_code: screenCode,
      screen_ver: screenVer,
      screen_base_year: screenBaseYear,
      schl_nm: schlNm,
    }),
    [screenCode, screenVer, screenBaseYear, schlNm],
  );

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(null);
  const [subtitle, setSubtitle] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getThemeTextBlocks(params);
        const blocks = Array.isArray(data?.blocks) ? data.blocks : [];
        const block = blocks.find((b) => b?.blockCode === HEADER_BLOCK_CODE);

        const t = (block?.title || '').trim();
        const lines = Array.isArray(block?.lines) ? block.lines : [];
        const sub = firstNonEmptyText(lines, ['SUBTITLE', 'SUMMARY']);

        if (!cancelled) {
          setTitle(t || null);
          setSubtitle((sub || '').trim() ? sub : null);
        }
      } catch {
        if (!cancelled) {
          setTitle(null);
          setSubtitle(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!screenCode || !screenBaseYear || !schlNm) {
      setTitle(null);
      setSubtitle(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params, screenCode, screenBaseYear, schlNm]);

  return { title, subtitle, loading };
}

