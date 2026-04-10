import { useEffect, useMemo, useState } from 'react';
import educationFacultyData from '../../data/education-faculty-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import {
  EducationFacultyKPICards,
  SemesterFullTimeRatioChart,
  CourseSizeDistributionChart,
  EducationFacultyInsights,
  EducationFacultyTable,
} from './index';
import { getThemeDetailGrid } from '../../services/api';
import { useThemeSourceRefs } from '../../hooks/useThemeSourceRefs';
import { useThemeChartBlockMeta } from '../../hooks/useThemeChartBlockMeta';
import {
  mapThemeItemsToCourseDistribution,
  mapThemeItemsToSemesterRatios,
} from '../../utils/mapThemeChartItemsToEducationBars';
import { useThemeTextBlockLines } from '../../hooks/useThemeTextBlockLines';
import { useThemeHeaderContext } from '../../hooks/useThemeHeaderContext';
import { useThemePanelSummary } from '../../hooks/useThemePanelSummary';

const EDUCATION_SCREEN_BASE_YEAR = 2025;
const INSIGHT_BLOCK_CODE = 'SAMPLE_INSIGHT';
const INSIGHT_LINE_ROLE = 'INSIGHT';

export default function EducationFacultyDashboard() {
  const { pageTitle, pageSubtitle, baseYear, filters } = educationFacultyData;

  const [kpiCards, setKpiCards] = useState([]);

  const themeParams = useMemo(
    () => ({
      screen_code: 'education',
      screen_ver: 'v0.1',
      screen_base_year: EDUCATION_SCREEN_BASE_YEAR,
      schl_nm: '충남대학교',
    }),
    [],
  );

  const { title: headerTitle, subtitle: headerSubtitle } = useThemeHeaderContext({
    screenCode: themeParams.screen_code,
    screenVer: themeParams.screen_ver,
    screenBaseYear: themeParams.screen_base_year,
    schlNm: themeParams.schl_nm,
  });

  const { title: panelTitle, subtitle: panelSubtitle } = useThemePanelSummary({
    screenCode: themeParams.screen_code,
    screenVer: themeParams.screen_ver,
    screenBaseYear: themeParams.screen_base_year,
    schlNm: themeParams.schl_nm,
  });

  const showSummaryJudgment = Boolean(
    (panelTitle && panelTitle.trim()) || (panelSubtitle && panelSubtitle.trim()),
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getThemeDetailGrid(themeParams);
        const items = Array.isArray(data?.items) ? data.items : [];
        const mapped = items.map((row) => ({
          id: row.metricCode,
          label: row.metricName,
          value: row.myValueDisplay,
          unit: '',
          regionalAvg: row.regionAvgDisplay,
          nationalAvg: row.nationalAvgDisplay,
          accentColorHex: row.accentColorHex,
          auxLabel: row.aux?.label,
          auxText: row.aux?.text,
        }));
        setKpiCards(mapped);
      } catch {
        setKpiCards([]);
      }
    };
    load();
  }, [themeParams]);

  const { title: insightTitle, items: dbInsights } = useThemeTextBlockLines({
    screenCode: themeParams.screen_code,
    screenVer: themeParams.screen_ver,
    screenBaseYear: themeParams.screen_base_year,
    schlNm: themeParams.schl_nm,
    blockCode: INSIGHT_BLOCK_CODE,
    lineRole: INSIGHT_LINE_ROLE,
  });

  const { refs: sourceRefs } = useThemeSourceRefs({
    screenCode: themeParams.screen_code,
    screenVer: themeParams.screen_ver,
    screenBaseYear: themeParams.screen_base_year,
    schlNm: themeParams.schl_nm,
  });

  const { chartLeft, chartRight, leftBlockItems, rightBlockItems } = useThemeChartBlockMeta({
    screenCode: themeParams.screen_code,
    screenVer: themeParams.screen_ver,
    screenBaseYear: themeParams.screen_base_year,
    schlNm: themeParams.schl_nm,
  });

  const semesterFromDb = mapThemeItemsToSemesterRatios(leftBlockItems);
  const courseFromDb = mapThemeItemsToCourseDistribution(rightBlockItems);

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
      <EducationFacultyKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemesterFullTimeRatioChart
          semesterRatios={semesterFromDb}
          title={chartLeft.title}
          subtitle={chartLeft.subtitle}
        />
        <CourseSizeDistributionChart
          courseDistribution={courseFromDb}
          title={chartRight.title}
          subtitle={chartRight.subtitle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EducationFacultyInsights title={insightTitle} insights={dbInsights} />
        <div className="lg:col-span-2">
          <EducationFacultyTable tablePreview={sourceRefs} />
        </div>
      </div>
    </div>
  );
}
