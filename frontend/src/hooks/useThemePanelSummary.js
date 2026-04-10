import { useEffect, useMemo, useState } from "react";
import { getThemeTextBlocks } from "../services/api";

const DEFAULT_SCREEN_VER = "v0.1";
const PANEL_SUMMARY_BLOCK_CODE = "PANEL_SUMMARY";

function joinNonEmpty(lines) {
  if (!Array.isArray(lines)) return null;
  const texts = lines
    .map((l) => (l?.text || "").trim())
    .filter((t) => t !== "");
  return texts.length ? texts.join("\n") : null;
}

/**
 * 테마 화면 공통 "패널 요약" 텍스트(우측 상단 카드용).
 *
 * 데이터 소스:
 * - public.tq_screen_text_block (block_code = PANEL_SUMMARY) -> title
 * - public.tq_screen_text_line  (role = SUMMARY)            -> subtitle(여러 줄 join)
 */
export function useThemePanelSummary({
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
        const block = blocks.find((b) => b?.blockCode === PANEL_SUMMARY_BLOCK_CODE);

        const t = (block?.title || "").trim() || null;
        const lines = Array.isArray(block?.lines) ? block.lines : [];

        const summaryLines = lines.filter((l) => l?.role === "SUMMARY");
        const sub = joinNonEmpty(summaryLines) ?? joinNonEmpty(lines);

        if (!cancelled) {
          setTitle(t);
          setSubtitle(sub);
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

