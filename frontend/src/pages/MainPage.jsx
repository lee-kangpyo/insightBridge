import MainLayout from "../layouts/MainLayout";
import PageTitleSection from "../components/main/PageTitleSection";
import StatusChips from "../components/main/StatusChips";
import KpiBentoGrid from "../components/main/KpiBentoGrid";
import StrengthWeaknessMatrix from "../components/main/StrengthWeaknessMatrix";
import AdmissionInsights from "../components/admission/AdmissionInsights";
import RiskStrengthTable from "../components/main/RiskStrengthTable";
import OverviewDetailGridTable from "../components/main/OverviewDetailGridTable";
import sampleData from "../data/main_page_samples.json";
import { useEffect, useState } from "react";
import {
  getOverviewKpis,
  getOverviewMatrixPoints,
  getOverviewRiskTable,
  getOverviewDetailGrid,
} from "../services/api";
import { useOverviewHeaderContext } from "../hooks/useOverviewHeaderContext";
import { useOverviewTextBlockLines } from "../hooks/useOverviewTextBlockLines";
import { useOverviewSummaryJudgmentLabel } from "../hooks/useOverviewPdfReportLabel";
import { useSchlNm } from "../hooks/useSchlNm";

export default function MainPage() {
  const schlNm = useSchlNm();

  // ✅ API 기반 KPI (기본: 빈값으로 시작해서 "깨지지 않게" 방어)
  const [largeKpis, setLargeKpis] = useState([]);
  const [smallKpis, setSmallKpis] = useState([]);

  // 🔁 바로 샘플 fallback으로 되돌리고 싶으면 아래 2줄을 켜세요.
  // const [largeKpis, setLargeKpis] = useState(sampleData.kpis.large);
  // const [smallKpis, setSmallKpis] = useState(sampleData.kpis.small);

  // ✅ API 기반 매트릭스/리스크테이블 (기본: 빈값)
  const [matrix, setMatrix] = useState(null);
  const [riskTable, setRiskTable] = useState([]);
  const [riskLegend, setRiskLegend] = useState([]);

  const [detailGrid, setDetailGrid] = useState([]);

  const screenParams = {
    screenCode: "overview",
    screenVer: "v0.1",
    screenBaseYear: 2025,
    schlNm,
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

  // 🔁 샘플 fallback을 쓰고 싶으면 아래 3줄을 켜세요.
  // const [matrix, setMatrix] = useState(sampleData.matrix);
  // const [riskTable, setRiskTable] = useState(sampleData.riskTable);
  // const [riskLegend, setRiskLegend] = useState(sampleData.riskLegend || []);

  useEffect(() => {
    if (!schlNm) return;
    const load = async () => {
      try {
        const data = await getOverviewKpis({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: 2025,
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
  }, [schlNm]);

  useEffect(() => {
    if (!schlNm) return;
    const load = async () => {
      try {
        const data = await getOverviewMatrixPoints({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: 2025,
          metric_year: 2025,
          schl_nm: schlNm,
        });
        setMatrix(data && Array.isArray(data.points) ? data : null);
      } catch {
        // fallback: keep empty
      }
    };
    load();
  }, [schlNm]);

  useEffect(() => {
    if (!schlNm) return;
    const load = async () => {
      try {
        const data = await getOverviewRiskTable({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: 2025,
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
  }, [schlNm]);

  useEffect(() => {
    if (!schlNm) return;
    const load = async () => {
      try {
        const data = await getOverviewDetailGrid({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: 2025,
          schl_nm: schlNm,
          metric_year: 2025,
        });
        setDetailGrid(Array.isArray(data?.items) ? data.items : []);
      } catch {
        setDetailGrid([]);
      }
    };
    load();
  }, [schlNm]);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
        <PageTitleSection
          title={headerTitle || sampleData.meta?.dashboardTitle}
          subtitle={headerSubtitle || sampleData.meta?.institutionalDashboardLabel}
          baseYear={sampleData.meta?.baseYear}
          showSummaryJudgment={showSummaryJudgment}
          summaryJudgmentTitle={summaryJudgmentTitle}
          summaryJudgmentSubtitle={summaryJudgmentSubtitle}
        />
        <StatusChips filters={sampleData.filters} />
        <KpiBentoGrid
          largeKpis={largeKpis}
          smallKpis={smallKpis}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StrengthWeaknessMatrix matrix={matrix} />
          <AdmissionInsights title={insightTitle} insights={dbInsights} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RiskStrengthTable data={riskTable} legend={riskLegend} />
          <OverviewDetailGridTable items={detailGrid} />
        </div>
      </div>
    </MainLayout>
  );
}
