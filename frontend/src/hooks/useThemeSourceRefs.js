import { useEffect, useMemo, useState } from 'react';
import { getThemeSourceRefs } from '../services/api';

/**
 * 테마 화면 공통 "참조 테이블 프리뷰" — `/api/theme/source-refs`
 * @param {object} opts
 * @param {string} opts.screenCode
 * @param {string} [opts.screenVer='v0.1']
 * @param {number} opts.screenBaseYear
 * @param {string} opts.schlNm
 */
export function useThemeSourceRefs({
  screenCode,
  screenVer = 'v0.1',
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

  const [refs, setRefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getThemeSourceRefs(params);
        if (!cancelled) {
          setRefs(Array.isArray(data?.refs) ? data.refs : []);
        }
      } catch {
        if (!cancelled) {
          setRefs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  return { refs, loading };
}

