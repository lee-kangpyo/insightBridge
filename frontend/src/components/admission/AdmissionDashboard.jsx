import admissionData from "../../data/admission-data.json";
import PageTitleSection from "../main/PageTitleSection";
import StatusChips from "../main/StatusChips";
import { useEffect, useMemo, useState } from "react";
import {
  AdmissionKPICards,
  EnrollmentRateChart,
  OpportunityBalanceChart,
  AdmissionInsights,
  AdmissionTable,
} from "./index";
import {
  getAdmissionEnrollmentRates,
  getAdmissionOpportunityBalance,
  getThemeDetailGrid,
} from "../../services/api";
import { useThemeSourceRefs } from "../../hooks/useThemeSourceRefs";
import { useThemeTextBlockLines } from "../../hooks/useThemeTextBlockLines";
import { useThemeHeaderContext } from "../../hooks/useThemeHeaderContext";

const INSIGHT_BLOCK_CODE = "SAMPLE_INSIGHT";
const INSIGHT_LINE_ROLE = "INSIGHT";

export default function AdmissionDashboard() {
  const { pageTitle, pageSubtitle, baseYear, filters } = admissionData;

  // ✅ 최상단 KPI 카드는 DB 값만 사용 (샘플 fallback 제거)
  const [kpiCards, setKpiCards] = useState([]);
  const [dbEnrollmentRates, setDbEnrollmentRates] = useState([]);
  const [enrollmentMeta, setEnrollmentMeta] = useState({
    title: "",
    subtitle: "",
  });
  const [dbOpportunityBalance, setDbOpportunityBalance] = useState([]);
  const [opportunityBalanceMeta, setOpportunityBalanceMeta] = useState({
    title: "",
    subtitle: "",
  });
  // sourceRefs: DB 기반 참조 테이블 프리뷰는 공통 훅으로 로드

  const params = useMemo(
    () => ({
      screen_code: "admission",
      screen_ver: "v0.1",
      screen_base_year: 2025,
      schl_nm: "충남대학교",
    }),
    [],
  );

  const { title: headerTitle, subtitle: headerSubtitle } = useThemeHeaderContext({
    screenCode: params.screen_code,
    screenVer: params.screen_ver,
    screenBaseYear: params.screen_base_year,
    schlNm: params.schl_nm,
  });

  const { title: insightTitle, items: dbInsights } = useThemeTextBlockLines({
    screenCode: params.screen_code,
    screenVer: params.screen_ver,
    screenBaseYear: params.screen_base_year,
    schlNm: params.schl_nm,
    blockCode: INSIGHT_BLOCK_CODE,
    lineRole: INSIGHT_LINE_ROLE,
  });

  const { refs: sourceRefs } = useThemeSourceRefs({
    screenCode: params.screen_code,
    screenVer: params.screen_ver,
    screenBaseYear: params.screen_base_year,
    schlNm: params.schl_nm,
  });

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

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdmissionEnrollmentRates({
          ...params,
          block_code: "CHART_LEFT",
        });
        setDbEnrollmentRates(Array.isArray(data?.items) ? data.items : []);
        setEnrollmentMeta({
          title: typeof data?.title === "string" ? data.title : "",
          subtitle: typeof data?.subtitle === "string" ? data.subtitle : "",
        });
      } catch {
        setDbEnrollmentRates([]);
        setEnrollmentMeta({ title: "", subtitle: "" });
      }
    };
    load();
  }, [params]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdmissionOpportunityBalance({
          ...params,
          block_code: "CHART_RIGHT",
        });
        setDbOpportunityBalance(Array.isArray(data?.items) ? data.items : []);
        setOpportunityBalanceMeta({
          title: typeof data?.title === "string" ? data.title : "",
          subtitle: typeof data?.subtitle === "string" ? data.subtitle : "",
        });
      } catch {
        setDbOpportunityBalance([]);
        setOpportunityBalanceMeta({ title: "", subtitle: "" });
      }
    };
    load();
  }, [params]);

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection
        title={headerTitle}
        subtitle={headerSubtitle}
        baseYear={baseYear}
      />

      <StatusChips filters={filters} />
      <AdmissionKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <EnrollmentRateChart
          title={enrollmentMeta.title}
          subtitle={enrollmentMeta.subtitle}
          enrollmentRates={dbEnrollmentRates}
        />
        <OpportunityBalanceChart
          title={opportunityBalanceMeta.title}
          subtitle={opportunityBalanceMeta.subtitle}
          opportunityBalance={dbOpportunityBalance}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AdmissionInsights title={insightTitle} insights={dbInsights} />
        <AdmissionTable refs={sourceRefs} />
      </div>
    </div>
  );
}
