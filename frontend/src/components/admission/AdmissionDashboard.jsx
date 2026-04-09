import admissionData from '../../data/admission-data.json';
import { useEffect, useMemo, useState } from "react";
import {
  AdmissionFilters,
  AdmissionKPICards,
  EnrollmentRateChart,
  OpportunityBalanceChart,
  AdmissionInsights,
  AdmissionTable,
} from './index';
import { getThemeDetailGrid } from "../../services/api";

export default function AdmissionDashboard() {
  const { pageTitle, filters, enrollmentRates, opportunityBalance, insights, tablePreview } =
    admissionData;

  // ✅ 최상단 KPI 카드는 DB 값만 사용 (샘플 fallback 제거)
  const [kpiCards, setKpiCards] = useState([]);

  const params = useMemo(
    () => ({
      screen_code: "admission",
      screen_ver: "v0.1",
      screen_base_year: 2025,
      schl_nm: "충남대학교",
    }),
    []
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
    <div className="mb-8 max-w-[1600px] mx-auto">
      <h1 className="font-headline text-3xl font-extrabold text-primary mb-6 tracking-tight">
        {pageTitle}
      </h1>

      <AdmissionFilters filters={filters} />
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