import MainLayout from "../layouts/MainLayout";
import PageTitleSection from "../components/main/PageTitleSection";
import KpiBentoGrid from "../components/main/KpiBentoGrid";
import StrengthWeaknessMatrix from "../components/main/StrengthWeaknessMatrix";
import InsightsPanel from "../components/main/InsightsPanel";
import RiskStrengthTable from "../components/main/RiskStrengthTable";
import sampleData from "../data/main_page_samples.json";
import { useEffect, useState } from "react";
import {
  getOverviewKpis,
  getOverviewMatrixPoints,
  getOverviewRiskTable,
  getOverviewDetailGrid,
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
          metric_year: 2024,
        });

        setDetailGrid(Array.isArray(data?.items) ? data.items : []);
      } catch {
        // fallback: keep empty
      }
    };
    load();
  }, []);

  return (
    <MainLayout>
      <PageTitleSection meta={sampleData.meta} />
      <KpiBentoGrid largeKpis={largeKpis} smallKpis={smallKpis} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <StrengthWeaknessMatrix matrix={matrix} />
        <InsightsPanel insights={sampleData.insights} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RiskStrengthTable data={riskTable} legend={riskLegend} />
        {detailGrid?.length ? (
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
            <h3 className="text-lg font-bold text-primary mb-6">
              핵심 지표 성과 추이
            </h3>
            <div className="mb-4 text-[11px] font-extrabold text-error">
              (DB: public.tq_overview_detail_grid)
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-highest/50 text-[10px] font-bold text-outline uppercase tracking-wider">
                  <th className="px-4 py-3 rounded-tl-lg">지표</th>
                  <th className="px-4 py-3">우리 대학</th>
                  <th className="px-4 py-3">지역 평균</th>
                  <th className="px-4 py-3">전국 평균</th>
                  <th className="px-4 py-3 rounded-tr-lg">원천 테이블</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {detailGrid.map((row, idx) => (
                  <tr
                    key={`${row.metricCode}-${row.metricYear}-${idx}`}
                    className={
                      idx > 0 ? "border-t border-outline-variant/10" : ""
                    }
                  >
                    <td className="px-4 py-3 font-semibold text-primary">
                      {row.metricName}{" "}
                      <span className="text-[11px] text-outline">
                        ({row.metricYear})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {row.myValueDisplay}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.regionAvgDisplay}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.nationalAvgDisplay}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-outline">
                      {row.sourceTableName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
