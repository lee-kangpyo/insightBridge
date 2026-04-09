import MainLayout from "../layouts/MainLayout";
import PageTitleSection from "../components/main/PageTitleSection";
import StatusChips from "../components/main/StatusChips";
import KpiBentoGrid from "../components/main/KpiBentoGrid";
import StrengthWeaknessMatrix from "../components/main/StrengthWeaknessMatrix";
import InsightsPanel from "../components/main/InsightsPanel";
import RiskStrengthTable from "../components/main/RiskStrengthTable";
import ProgressMetricGrid from "../components/main/ProgressMetricGrid";
import sampleData from "../data/main_page_samples.json";
import { useEffect, useState } from "react";
import {
  getOverviewKpis,
  getOverviewMatrixPoints,
  getOverviewRiskTable,
  getOverviewDetailGrid,
  getOverviewInsights,
} from "../services/api";

export default function MainPage() {
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

  // ✅ API 기반 상세 그리드(확인용)
  const [detailGrid, setDetailGrid] = useState([]);

  // ✅ API 기반 핵심 인사이트 (기본: 샘플 fallback 유지)
  const [insights, setInsights] = useState(sampleData.insights);

  // 🔁 샘플 fallback을 쓰고 싶으면 아래 3줄을 켜세요.
  // const [matrix, setMatrix] = useState(sampleData.matrix);
  // const [riskTable, setRiskTable] = useState(sampleData.riskTable);
  // const [riskLegend, setRiskLegend] = useState(sampleData.riskLegend || []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOverviewKpis({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: 2025,
          schl_nm: "충남대학교",
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
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOverviewMatrixPoints({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: 2025,
          metric_year: 2025,
          schl_nm: "충남대학교",
        });
        setMatrix(data && Array.isArray(data.points) ? data : null);
      } catch {
        // fallback: keep empty
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOverviewRiskTable({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: 2025,
          schl_nm: "충남대학교",
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
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOverviewDetailGrid({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: 2025,
          schl_nm: "충남대학교",
          // 한 해만 보이도록 고정 (screen_base_year=2025 → metric_year=2024)
          metric_year: 2025,
        });

        setDetailGrid(Array.isArray(data?.items) ? data.items : []);
      } catch {
        // fallback: keep empty
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOverviewInsights({
          screen_code: "overview",
          screen_ver: "v0.1",
          screen_base_year: 2025,
          schl_nm: "충남대학교",
        });

        setInsights(data || sampleData.insights);
      } catch {
        // fallback: keep sample insights
      }
    };
    load();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
        <PageTitleSection
          title={sampleData.meta?.dashboardTitle}
          subtitle={sampleData.meta?.institutionalDashboardLabel}
          baseYear={sampleData.meta?.baseYear}
          showPdfButton={true}
        />
        <StatusChips filters={sampleData.filters} />
        <KpiBentoGrid
          largeKpis={sampleData.kpis.large}
          smallKpis={sampleData.kpis.small}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StrengthWeaknessMatrix matrix={matrix} />
          <InsightsPanel insights={sampleData.insights} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RiskStrengthTable data={riskTable} legend={riskLegend} />
          <ProgressMetricGrid metrics={sampleData.progressMetrics} />
        </div>
      </div>
    </MainLayout>
  );
}
