import admissionData from "../../data/admission-data.json";
import PageTitleSection from "../main/PageTitleSection";
import StatusChips from "../main/StatusChips";
import InsightsTableLayout from "../main/InsightsTableLayout";
import { useEffect, useMemo, useState } from "react";
import {
  AdmissionKPICards,
  EnrollmentRateChart,
  OpportunityBalanceChart,
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
import { useThemePanelSummary } from "../../hooks/useThemePanelSummary";
import { useUniversityContext } from "../../hooks/useUniversityContext";
import InsightsPanel from "../main/InsightsPanel";

const INSIGHT_BLOCK_CODE = "SAMPLE_INSIGHT";
const INSIGHT_LINE_ROLE = "INSIGHT";

export default function AdmissionDashboard() {
  const { schlNm, ready: universityReady } = useUniversityContext();
  const { pageTitle, pageSubtitle, baseYear, filters } = admissionData;

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

  const params = useMemo(
    () => ({
      screen_code: "admission",
      screen_ver: "v0.1",
      screen_base_year: 2025,
      schl_nm: schlNm,
    }),
    [schlNm],
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
    (panelTitle && panelTitle.trim()) ||
    (panelSubtitle && panelSubtitle.trim()),
  );

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
    if (!universityReady || !schlNm) return;

    const load = async () => {
      try {
        const data = await getThemeDetailGrid(params);
        const items = Array.isArray(data?.items) ? data.items : [];

        const mapped = items.map((row) => ({
          id: row.metricCode,
          label: row.metricName,
          value: row.myValueDisplay,
          unit: "",
          year: row.metricYear,
          regionalAvg: row.regionAvgDisplay,
          nationalAvg: row.nationalAvgDisplay,
          accentColorHex: row.accentColorHex,
        }));

        setKpiCards(mapped);
      } catch {
        setKpiCards([]);
      }
    };
    load();
  }, [params, universityReady, schlNm]);

  useEffect(() => {
    if (!universityReady || !schlNm) return;

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
  }, [params, universityReady, schlNm]);

  useEffect(() => {
    if (!universityReady || !schlNm) return;

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
  }, [params, universityReady, schlNm]);

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection
        title={headerTitle}
        subtitle={headerSubtitle}
        baseYear={baseYear}
        showSummaryJudgment={showSummaryJudgment}
        summaryJudgmentTitle={panelTitle}
        summaryJudgmentSubtitle={panelSubtitle}
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

      <InsightsTableLayout
        insightsComponent={
          <InsightsPanel title={insightTitle} items={dbInsights} loading={false} />
        }
        tableComponent={<AdmissionTable refs={sourceRefs} />}
      />
    </div>
  );
}