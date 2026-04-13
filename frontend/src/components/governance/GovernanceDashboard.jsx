import governanceData from "../../data/governance-data.json";
import PageTitleSection from "../main/PageTitleSection";
import StatusChips from "../main/StatusChips";
import AdmissionTable from "../admission/AdmissionTable";
import InsightsTableLayout from "../main/InsightsTableLayout";
import InsightsPanel from "../main/InsightsPanel";
import { useEffect, useMemo, useState } from "react";
import { getThemeDetailGrid, getThemeTextBlocks } from "../../services/api";
import { useThemeSourceRefs } from "../../hooks/useThemeSourceRefs";
import { useThemeHeaderContext } from "../../hooks/useThemeHeaderContext";
import { useThemePanelSummary } from "../../hooks/useThemePanelSummary";
import { useUniversityContext } from "../../hooks/useUniversityContext";
import { mapDetailGridRowToGovernanceKpiCard } from "../../utils/mapThemeDetailGridToGovernanceKpiCards";
import { GovernanceKPICards } from "./index";

const INSIGHT_BLOCK_CODE = "SAMPLE_INSIGHT";
const INSIGHT_LINE_ROLE = "INSIGHT";

export default function GovernanceDashboard() {
  const { schlNm, ready: universityReady } = useUniversityContext();
  const { meta, filters } = governanceData;

  const [kpiCards, setKpiCards] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightTitle, setInsightTitle] = useState(null);
  const [insightItems, setInsightItems] = useState([]);

  const params = useMemo(
    () => ({
      screen_code: "governance",
      screen_ver: "v0.1",
      screen_base_year: meta.baseYear,
      schl_nm: schlNm,
    }),
    [meta.baseYear, schlNm],
  );

  const { title: headerTitle, subtitle: headerSubtitle } =
    useThemeHeaderContext({
      screenCode: params.screen_code,
      screenVer: params.screen_ver,
      screenBaseYear: params.screen_base_year,
      schlNm: params.schl_nm,
    });

  const { title: panelTitle, subtitle: panelSubtitle } = useThemePanelSummary({
    screenCode: params.screen_code,
    screenVer: params.screen_ver,
    screenBaseYear: params.screen_base_year,
    schlNm: params.schl_nm,
  });

  const showSummaryJudgment = Boolean(
    (panelTitle && panelTitle.trim()) || (panelSubtitle && panelSubtitle.trim()),
  );

  const { refs: sourceRefs } = useThemeSourceRefs({
    screenCode: params.screen_code,
    screenVer: params.screen_ver,
    screenBaseYear: params.screen_base_year,
    schlNm: params.schl_nm,
  });

  useEffect(() => {
    if (!universityReady || !schlNm) return;

    let cancelled = false;
    const load = async () => {
      try {
        const data = await getThemeDetailGrid(params);
        const items = Array.isArray(data?.items) ? data.items : [];
        if (!cancelled) {
          setKpiCards(items.map(mapDetailGridRowToGovernanceKpiCard));
        }
      } catch {
        if (!cancelled) setKpiCards([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params, universityReady, schlNm]);

  useEffect(() => {
    if (!universityReady || !schlNm) return;

    let cancelled = false;
    const load = async () => {
      setInsightsLoading(true);
      try {
        const data = await getThemeTextBlocks(params);
        const blocks = Array.isArray(data?.blocks) ? data.blocks : [];
        const block = blocks.find((b) => b.blockCode === INSIGHT_BLOCK_CODE);

        const title = (block?.title || "").trim();
        const lines = Array.isArray(block?.lines) ? block.lines : [];
        const items = lines
          .filter((l) => l?.role === INSIGHT_LINE_ROLE)
          .map((l) => ({ text: l.text }))
          .filter((x) => (x.text || "").trim() !== "");

        if (!cancelled) {
          setInsightTitle(title || null);
          setInsightItems(items);
        }
      } catch {
        if (!cancelled) {
          setInsightTitle(null);
          setInsightItems([]);
        }
      } finally {
        if (!cancelled) {
          setInsightsLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params, universityReady, schlNm]);

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection
        title={headerTitle}
        subtitle={headerSubtitle}
        baseYear={meta.baseYear}
        showSummaryJudgment={showSummaryJudgment}
        summaryJudgmentTitle={panelTitle}
        summaryJudgmentSubtitle={panelSubtitle}
      />

      <StatusChips filters={filters} />
      <GovernanceKPICards kpiCards={kpiCards} />

      <InsightsTableLayout
        insightsComponent={
          <InsightsPanel
            title={insightTitle}
            items={insightItems}
            loading={insightsLoading}
          />
        }
        tableComponent={<AdmissionTable refs={sourceRefs} />}
      />
    </div>
  );
}