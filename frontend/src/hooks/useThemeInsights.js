import { useEffect, useMemo, useState } from "react";
import { getAdmissionInsights } from "../services/api";

/**
 * 테마 화면(입시, 학생·진로 등) 인사이트 — `/api/admission/insights` 단일 진입점.
 * @param {object} opts
 * @param {string} opts.screenCode
 * @param {string} [opts.screenVer='v0.1']
 * @param {number} opts.screenBaseYear
 * @param {string} opts.schlNm
 * @param {string} [opts.lineRole] — 예: 학생·진로 화면은 'INSIGHT'
 */
export function useThemeInsights({
  screenCode,
  screenVer = "v0.1",
  screenBaseYear,
  schlNm,
  lineRole,
}) {
  const params = useMemo(() => {
    const p = {
      screen_code: screenCode,
      screen_ver: screenVer,
      screen_base_year: screenBaseYear,
      schl_nm: schlNm,
    };
    if (lineRole != null && lineRole !== "") {
      p.line_role = lineRole;
    }
    return p;
  }, [screenCode, screenVer, screenBaseYear, schlNm, lineRole]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAdmissionInsights(params);
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
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

  return { items, loading };
}
