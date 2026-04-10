import { useEffect, useMemo, useState } from "react";
import { getOverviewInsights } from "../services/api";

/**
 * 종합(overview) 핵심 인사이트 — `/api/insights/core`, `InsightsPanel` 계약과 맞춤.
 */
export function useOverviewCoreInsights({
  screenCode = "overview",
  screenVer = "v0.1",
  screenBaseYear,
  schlNm,
  fallback,
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

  const [insights, setInsights] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getOverviewInsights(params);
        if (!cancelled) {
          setInsights(data != null && typeof data === "object" ? data : fallback);
        }
      } catch {
        if (!cancelled) {
          setInsights(fallback);
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

  return { insights, loading };
}
