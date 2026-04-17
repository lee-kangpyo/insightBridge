
import PageTitleSection from "../components/main/PageTitleSection";
import StatusChips from "../components/main/StatusChips";
import KpiBentoGrid from "../components/main/KpiBentoGrid";
import StrengthWeaknessMatrix from "../components/main/StrengthWeaknessMatrix";
import InsightsPanel from "../components/main/InsightsPanel";
import RiskStrengthTable from "../components/main/RiskStrengthTable";
import OverviewDetailGridTable from "../components/main/OverviewDetailGridTable";
import { useEffect, useMemo, useState } from "react";
import {
  getOverviewKpis,
  getOverviewMatrixPoints,
  getOverviewRiskTable,
  getOverviewDetailGrid,
} from "../services/api";
import {
  applySchoolPrefix,
  useOverviewHeaderContext,
} from "../hooks/useOverviewHeaderContext";
import { useOverviewTextBlockLines } from "../hooks/useOverviewTextBlockLines";
import { useOverviewSummaryJudgmentLabel } from "../hooks/useOverviewPdfReportLabel";
import { useUniversityContext } from "../hooks/useUniversityContext";

export default function MainPage() {
  const {
    schlNm,
    ready: universityReady,
    statusChips,
  } = useUniversityContext();
  const BASE_YEAR_OPTIONS = [2025, 2024, 2023];
  const [selectedBaseYear, setSelectedBaseYear] = useState(2025);

  // ✅ API 기반 KPI (기본: 빈값으로 시작해서 "깨지지 않게" 방어)
  const [largeKpis, setLargeKpis] = useState([]);
  const [smallKpis, setSmallKpis] = useState([]);

  // ✅ API 기반 매트릭스/리스크테이블 (기본: 빈값)
  const [matrix, setMatrix] = useState(null);
  const [riskTable, setRiskTable] = useState([]);
  const [riskLegend, setRiskLegend] = useState([]);

  const [detailGrid, setDetailGrid] = useState([]);

  const screenParams = {
    screenCode: "overview",
    screenVer: "v0.1",
    screenBaseYear: selectedBaseYear,
    schlNm: schlNm,
  };

  const { title: headerTitle, subtitle: headerSubtitle } =
    useOverviewHeaderContext(screenParams);

  const { title: summaryJudgmentTitle, subtitle: summaryJudgmentSubtitle } =
    useOverviewSummaryJudgmentLabel(screenParams);

  const showSummaryJudgment = Boolean(
    (summaryJudgmentTitle && summaryJudgmentTitle.trim()) ||
    (summaryJudgmentSubtitle && summaryJudgmentSubtitle.trim()),
  );

  const { title: insightTitle, items: dbInsights } = useOverviewTextBlockLines({
    ...screenParams,
    blockCode: "SAMPLE_INSIGHT",
    lineRole: "INSIGHT",
  });

  const pageTitle = useMemo(() => {
    const raw = (headerTitle || "").trim();
    if (!raw) return "";
    return applySchoolPrefix(schlNm, raw) || raw;
  }, [headerTitle, schlNm]);

  useEffect(() => {
    if (!universityReady || !schlNm) return;

    const load = async () => {
      try {
        const data = await getOverviewKpis({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: selectedBaseYear,
          schl_nm: schlNm,
        });

        // 방어: 응답이 비정상이어도 항상 배열로 유지
        const nextLarge = Array.isArray(data?.large) ? data.large : [];
        const nextSmall = Array.isArray(data?.small) ? data.small : [];

        setLargeKpis(nextLarge);
        setSmallKpis(nextSmall);
      } catch {
        // fallback: keep empty arrays
      }
    };
    load();
  }, [universityReady, schlNm, selectedBaseYear]);

  useEffect(() => {
    if (!universityReady || !schlNm) return;

    const load = async () => {
      try {
        const data = await getOverviewMatrixPoints({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: selectedBaseYear,
          metric_year: selectedBaseYear,
          schl_nm: schlNm,
        });
        setMatrix(data && Array.isArray(data.points) ? data : null);
      } catch {
        // fallback: keep empty
      }
    };
    load();
  }, [universityReady, schlNm, selectedBaseYear]);

  useEffect(() => {
    if (!universityReady || !schlNm) return;

    const load = async () => {
      try {
        const data = await getOverviewRiskTable({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: selectedBaseYear,
          schl_nm: schlNm,
        });
        const nextItems = Array.isArray(data?.items) ? data.items : [];
        const nextLegend = Array.isArray(data?.legend) ? data.legend : [];

        setRiskTable(nextItems);
        setRiskLegend(nextLegend);
      } catch {
        // fallback: keep empty
      }
    };
    load();
  }, [universityReady, schlNm, selectedBaseYear]);

  useEffect(() => {
    if (!universityReady || !schlNm) return;

    const load = async () => {
      try {
        const data = await getOverviewDetailGrid({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: selectedBaseYear,
          schl_nm: schlNm,
          metric_year: selectedBaseYear,
        });
        setDetailGrid(Array.isArray(data?.items) ? data.items : []);
      } catch {
        setDetailGrid([]);
      }
    };
    load();
  }, [universityReady, schlNm, selectedBaseYear]);

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
        <PageTitleSection
          title={pageTitle || headerTitle}
          subtitle={headerSubtitle}
          baseYear={selectedBaseYear}
          baseYearOptions={BASE_YEAR_OPTIONS}
          onBaseYearChange={setSelectedBaseYear}
          showSummaryJudgment={showSummaryJudgment}
          summaryJudgmentTitle={summaryJudgmentTitle}
          summaryJudgmentSubtitle={summaryJudgmentSubtitle}
        />
        <StatusChips filters={statusChips} />
        <KpiBentoGrid
          baseYear={selectedBaseYear}
          largeKpis={largeKpis}
          smallKpis={smallKpis}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StrengthWeaknessMatrix matrix={matrix} />
          <InsightsPanel title="인사이트" items={dbInsights} loading={false} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RiskStrengthTable data={riskTable} legend={riskLegend} />
          <OverviewDetailGridTable items={detailGrid} />
        </div>
      </div>
  );
}
