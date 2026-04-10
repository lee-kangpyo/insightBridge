import { useEffect, useMemo, useState } from 'react';
import researchData from '../../data/research-industry-startup-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import {
  ResearchIndustryStartupKPICards,
  ResearchFundStructureChart,
  TechStartupProgressChart,
  ResearchIndustryStartupInsights,
  ResearchIndustryStartupTable,
} from './index';
import { getThemeDetailGrid } from '../../services/api';
import { useThemeSourceRefs } from '../../hooks/useThemeSourceRefs';
import { useThemeChartBlockMeta } from '../../hooks/useThemeChartBlockMeta';
import { mapThemeItemsToResearchFundSources } from '../../utils/mapThemeItemsToResearchFundSources';
import { mapThemeItemsToResearchStartupProgress } from '../../utils/mapThemeItemsToResearchStartupProgress';
import { useThemeTextBlockLines } from '../../hooks/useThemeTextBlockLines';
import { useThemeHeaderContext } from '../../hooks/useThemeHeaderContext';
import { useThemePanelSummary } from '../../hooks/useThemePanelSummary';
import { useSchlNm } from '../../hooks/useSchlNm';

const RESEARCH_SCREEN_BASE_YEAR = 2025;
const INSIGHT_BLOCK_CODE = 'SAMPLE_INSIGHT';
const INSIGHT_LINE_ROLE = 'INSIGHT';

export default function ResearchIndustryStartupDashboard() {
  const { pageTitle, pageSubtitle, baseYear, filters } = researchData;
  const schlNm = useSchlNm();

  const [kpiCards, setKpiCards] = useState([]);

  const themeParams = useMemo(
    () => ({
      screen_code: 'research',
      screen_ver: 'v0.1',
      screen_base_year: RESEARCH_SCREEN_BASE_YEAR,
      schl_nm: schlNm,
    }),
    [schlNm],
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

  const fundSourcesFromDb = useMemo(
    () => mapThemeItemsToResearchFundSources(leftBlockItems),
    [leftBlockItems],
  );

  const startupProgressFromDb = useMemo(
    () => mapThemeItemsToResearchStartupProgress(rightBlockItems),
    [rightBlockItems],
  );

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
      <ResearchIndustryStartupKPICards kpiCards={kpiCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ResearchFundStructureChart
            overrideSources={fundSourcesFromDb}
            bannerYear={fundSourcesFromDb.length > 0 ? RESEARCH_SCREEN_BASE_YEAR : undefined}
            title={chartLeft.title}
            subtitle={chartLeft.subtitle}
          />
        </div>
        <TechStartupProgressChart
          overrideProgress={startupProgressFromDb}
          title={chartRight.title}
          subtitle={chartRight.subtitle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ResearchIndustryStartupInsights title={insightTitle} insights={dbInsights} />
        <div className="lg:col-span-2">
          <ResearchIndustryStartupTable tablePreview={sourceRefs} />
        </div>
      </div>
    </div>
  );
}
