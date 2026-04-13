import { useEffect, useMemo, useState } from 'react';
import studentCareerData from '../../data/student-career-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import InsightsTableLayout from '../main/InsightsTableLayout';
import InsightsPanel from '../main/InsightsPanel';
import { AdmissionKPICards, EnrollmentRateChart } from '../admission';
import { StudentCareerTable } from './index';
import {
  getAdmissionEnrollmentRates,
  getThemeDetailGrid,
} from "../../services/api";
import { useThemeSourceRefs } from "../../hooks/useThemeSourceRefs";
import { useThemeTextBlockLines } from "../../hooks/useThemeTextBlockLines";
import { useThemeHeaderContext } from "../../hooks/useThemeHeaderContext";
import { useThemePanelSummary } from "../../hooks/useThemePanelSummary";
import { useUniversityContext } from "../../hooks/useUniversityContext";

const INSIGHT_BLOCK_CODE = "SAMPLE_INSIGHT";
const INSIGHT_LINE_ROLE = "INSIGHT";

export default function StudentCareerDashboard() {
  const { schlNm, ready: universityReady } = useUniversityContext();
  const { pageTitle, pageSubtitle, baseYear, filters } = studentCareerData;
  const BASE_YEAR_OPTIONS = [2025, 2024, 2023];
  const [selectedBaseYear, setSelectedBaseYear] = useState(2025);

  const sourceRefParams = useMemo(
    () => ({
      screen_code: "student",
      screen_ver: "v0.1",
      screen_base_year: selectedBaseYear,
      schl_nm: schlNm,
    }),
    [schlNm, selectedBaseYear],
  );

  const { title: headerTitle, subtitle: headerSubtitle } =
    useThemeHeaderContext({
      screenCode: sourceRefParams.screen_code,
      screenVer: sourceRefParams.screen_ver,
      screenBaseYear: sourceRefParams.screen_base_year,
      schlNm: sourceRefParams.schl_nm,
    });

  const { title: panelTitle, subtitle: panelSubtitle } = useThemePanelSummary({
    screenCode: sourceRefParams.screen_code,
    screenVer: sourceRefParams.screen_ver,
    screenBaseYear: sourceRefParams.screen_base_year,
    schlNm: sourceRefParams.schl_nm,
  });

  const showSummaryJudgment = Boolean(
    (panelTitle && panelTitle.trim()) ||
    (panelSubtitle && panelSubtitle.trim()),
  );

  const [kpiCards, setKpiCards] = useState([]);
  const [chartLeftItems, setChartLeftItems] = useState([]);
  const [chartLeftMeta, setChartLeftMeta] = useState({
    title: "",
    subtitle: "",
  });
  const [chartRightItems, setChartRightItems] = useState([]);
  const [chartRightMeta, setChartRightMeta] = useState({
    title: "",
    subtitle: "",
  });

  const { title: insightTitle, items: dbInsights } = useThemeTextBlockLines({
    screenCode: sourceRefParams.screen_code,
    screenVer: sourceRefParams.screen_ver,
    screenBaseYear: sourceRefParams.screen_base_year,
    schlNm: sourceRefParams.schl_nm,
    blockCode: INSIGHT_BLOCK_CODE,
    lineRole: INSIGHT_LINE_ROLE,
  });

  const { refs: sourceRefs } = useThemeSourceRefs({
    screenCode: sourceRefParams.screen_code,
    screenVer: sourceRefParams.screen_ver,
    screenBaseYear: sourceRefParams.screen_base_year,
    schlNm: sourceRefParams.schl_nm,
  });

  useEffect(() => {
    if (!universityReady || !schlNm) return;

    const load = async () => {
      try {
        const data = await getThemeDetailGrid(sourceRefParams);
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
  }, [sourceRefParams, universityReady, schlNm]);

  useEffect(() => {
    if (!universityReady || !schlNm) return;

    const load = async () => {
      try {
        const data = await getAdmissionEnrollmentRates({
          ...sourceRefParams,
          block_code: "CHART_LEFT",
        });
        setChartLeftItems(Array.isArray(data?.items) ? data.items : []);
        setChartLeftMeta({
          title: typeof data?.title === "string" ? data.title : "",
          subtitle: typeof data?.subtitle === "string" ? data.subtitle : "",
        });
      } catch {
        setChartLeftItems([]);
        setChartLeftMeta({ title: "", subtitle: "" });
      }
    };
    load();
  }, [sourceRefParams, universityReady, schlNm]);

  useEffect(() => {
    if (!universityReady || !schlNm) return;

    const load = async () => {
      try {
        const data = await getAdmissionEnrollmentRates({
          ...sourceRefParams,
          block_code: "CHART_RIGHT",
        });
        setChartRightItems(Array.isArray(data?.items) ? data.items : []);
        setChartRightMeta({
          title: typeof data?.title === "string" ? data.title : "",
          subtitle: typeof data?.subtitle === "string" ? data.subtitle : "",
        });
      } catch {
        setChartRightItems([]);
        setChartRightMeta({ title: "", subtitle: "" });
      }
    };
    load();
  }, [sourceRefParams, universityReady, schlNm]);

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6 space-y-8">
      <PageTitleSection
        title={headerTitle}
        subtitle={headerSubtitle}
        baseYear={selectedBaseYear}
        baseYearOptions={BASE_YEAR_OPTIONS}
        onBaseYearChange={setSelectedBaseYear}
        showSummaryJudgment={showSummaryJudgment}
        summaryJudgmentTitle={panelTitle}
        summaryJudgmentSubtitle={panelSubtitle}
      />

      <StatusChips filters={filters} />
      <AdmissionKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EnrollmentRateChart
          title={chartLeftMeta.title}
          subtitle={chartLeftMeta.subtitle}
          enrollmentRates={chartLeftItems}
        />
        <EnrollmentRateChart
          title={chartRightMeta.title}
          subtitle={chartRightMeta.subtitle}
          enrollmentRates={chartRightItems}
        />
      </div>

      <InsightsTableLayout
        insightsComponent={
          <InsightsPanel title={insightTitle} items={dbInsights} loading={false} />
        }
        tableComponent={<StudentCareerTable refs={sourceRefs} />}
      />
    </div>
  );
}