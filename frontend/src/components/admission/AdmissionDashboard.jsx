import admissionData from "../../data/admission-data.json";
import PageTitleSection from "../main/PageTitleSection";
import StatusChips from "../main/StatusChips";
import { useEffect, useMemo, useState } from "react";
import {
  AdmissionFilters,
  AdmissionKPICards,
  EnrollmentRateChart,
  OpportunityBalanceChart,
  AdmissionInsights,
  AdmissionTable,
} from "./index";
import { getThemeDetailGrid } from "../../services/api";

export default function AdmissionDashboard() {
  const {
    pageTitle,
    pageSubtitle,
    baseYear,
    filters,
    enrollmentRates,
    opportunityBalance,
    insights,
    tablePreview,
  } = admissionData;

  // ✅ 최상단 KPI 카드는 DB 값만 사용 (샘플 fallback 제거)
  const [kpiCards, setKpiCards] = useState([]);

  const params = useMemo(
    () => ({
      screen_code: "admission",
      screen_ver: "v0.1",
      screen_base_year: 2025,
      schl_nm: "충남대학교",
    }),
    [],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getThemeDetailGrid(params);
        const items = Array.isArray(data?.items) ? data.items : [];

        // `AdmissionKPICards` 계약(shape)로 매핑 (UI는 그대로 유지)
        const mapped = items.map((row) => ({
          id: row.metricCode,
          label: row.metricName,
          value: row.myValueDisplay,
          unit: "",
          regionalAvg: row.regionAvgDisplay,
          nationalAvg: row.nationalAvgDisplay,
          accentColorHex: row.accentColorHex,
        }));

        setKpiCards(mapped);
      } catch {
        // DB 호출 실패 시 빈 값 유지
        setKpiCards([]);
      }
    };
    load();
  }, [params]);

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection
        title={pageTitle}
        subtitle={pageSubtitle}
        baseYear={baseYear}
      />

      <StatusChips filters={filters} />
      <AdmissionKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <EnrollmentRateChart enrollmentRates={enrollmentRates} />
        <OpportunityBalanceChart opportunityBalance={opportunityBalance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AdmissionInsights insights={insights} />
        <AdmissionTable tablePreview={tablePreview} />
      </div>
    </div>
  );
}
