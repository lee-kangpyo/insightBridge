import { useEffect, useMemo, useState } from 'react';
import { getThemeChartBlocks } from '../services/api';

function buildMetaByBlockCode(blocks) {
  const map = {};
  for (const b of blocks) {
    const code = b?.blockCode;
    if (!code) continue;
    map[code] = {
      title: typeof b.title === 'string' ? b.title : '',
      subtitle: typeof b.subtitle === 'string' ? b.subtitle : '',
    };
  }
  return map;
}

/**
 * `tq_screen_chart_block` 기준 차트 영역 제목/부제목 (CHART_LEFT, CHART_RIGHT 등).
 */
export function useThemeChartBlockMeta({
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

  const [byCode, setByCode] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getThemeChartBlocks(params);
        const blocks = Array.isArray(data?.blocks) ? data.blocks : [];
        if (!cancelled) {
          setByCode(buildMetaByBlockCode(blocks));
        }
      } catch {
        if (!cancelled) {
          setByCode({});
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const chartLeft = byCode.CHART_LEFT ?? { title: '', subtitle: '' };
  const chartRight = byCode.CHART_RIGHT ?? { title: '', subtitle: '' };

  return { byCode, chartLeft, chartRight };
}
