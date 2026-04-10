import { useEffect, useMemo, useState } from 'react';
import { getThemeTextBlocks } from '../services/api';

const DEFAULT_SCREEN_VER = 'v0.1';

/**
 * `/api/theme/text-blocks`에서 특정 blockCode/lineRole 라인만 추출.
 *
 * @param {object} opts
 * @param {string} opts.screenCode
 * @param {string} [opts.screenVer='v0.1']
 * @param {number} opts.screenBaseYear
 * @param {string} opts.schlNm
 * @param {string} opts.blockCode
 * @param {string} opts.lineRole
 */
export function useThemeTextBlockLines({
  screenCode,
  screenVer = DEFAULT_SCREEN_VER,
  screenBaseYear,
  schlNm,
  blockCode,
  lineRole,
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
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getThemeTextBlocks(params);
        const blocks = Array.isArray(data?.blocks) ? data.blocks : [];
        const block = blocks.find((b) => b?.blockCode === blockCode);

        const t = (block?.title || '').trim();
        const lines = Array.isArray(block?.lines) ? block.lines : [];
        const filtered = lines
          .filter((l) => l?.role === lineRole)
          .map((l) => ({ text: l.text }))
          .filter((x) => (x.text || '').trim() !== '');

        if (!cancelled) {
          setTitle(t || null);
          setItems(filtered);
        }
      } catch {
        if (!cancelled) {
          setTitle(null);
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!screenCode || !screenBaseYear || !schlNm || !blockCode || !lineRole) {
      setTitle(null);
      setItems([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params, blockCode, lineRole, screenCode, screenBaseYear, schlNm]);

  return { title, items, loading };
}

