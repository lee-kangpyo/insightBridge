import { useEffect, useMemo, useState } from 'react';
import campusData from '../../data/campus-data.json';
import PageTitleSection from '../main/PageTitleSection';
import StatusChips from '../main/StatusChips';
import { CampusKPICards } from './index';
import AdmissionTable from '../admission/AdmissionTable';
import { getThemeDetailGrid } from '../../services/api';
import { useThemeSourceRefs } from '../../hooks/useThemeSourceRefs';
import { useThemeChartBlockMeta } from '../../hooks/useThemeChartBlockMeta';
import { useThemeTextBlockLines } from '../../hooks/useThemeTextBlockLines';
import { useThemeHeaderContext } from '../../hooks/useThemeHeaderContext';
import { useThemePanelSummary } from '../../hooks/useThemePanelSummary';
import {
  mapThemeItemsToCampusConfiguration,
  mapThemeItemsToCampusSafetyStatus,
} from '../../utils/mapThemeItemsToCampusCharts';

const BAR_FILL = {
  primary: '#002c5a',
  secondary: '#006492',
  'secondary-container': '#58bcfd',
  error: '#ba1a1a',
  tertiary: '#61c462',
};

const STATUS_BADGE_COLORS = {
  'tertiary-fixed': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'secondary-fixed': 'bg-secondary-fixed text-on-secondary-fixed',
  'surface-container-high': 'bg-surface-container-high text-on-surface-variant',
};

const SAFETY_BORDER_COLORS = {
  'tertiary-fixed': 'border-b-tertiary-fixed/15',
  'secondary-fixed': 'border-b-secondary-fixed/15',
  'surface-container-high': 'border-b-outline-variant/15',
};

const CAMPUS_SCREEN_BASE_YEAR = 2025;
const INSIGHT_BLOCK_CODE = 'SAMPLE_INSIGHT';
const INSIGHT_LINE_ROLE = 'INSIGHT';

export default function CampusDashboard() {
  const { meta, filters, campusConfiguration, safetyStatus } = campusData;

  const [kpiCards, setKpiCards] = useState([]);

  const themeParams = useMemo(
    () => ({
      screen_code: 'campus',
      screen_ver: 'v0.1',
      screen_base_year: CAMPUS_SCREEN_BASE_YEAR,
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

  const {
    title: insightTitle,
    items: dbInsights,
    loading: insightsLoading,
  } = useThemeTextBlockLines({
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

  const { chartLeft, chartRight, leftBlockItems, rightBlockItems, chartBlocksStatus } =
    useThemeChartBlockMeta({
    screenCode: themeParams.screen_code,
    screenVer: themeParams.screen_ver,
    screenBaseYear: themeParams.screen_base_year,
    schlNm: themeParams.schl_nm,
  });

  const campusConfigTitle =
    chartLeft.title?.trim() || '교지 구성 및 이용 현황';
  const campusConfigSubtitle = chartLeft.subtitle?.trim() || '';
  const safetyTitle =
    chartRight.title?.trim() || '안전·보호 운영 상태';
  const safetySubtitle = chartRight.subtitle?.trim() || '';

  const campusConfigFromDb = useMemo(() => {
    const mapped = mapThemeItemsToCampusConfiguration(leftBlockItems);
    return mapped;
  }, [chartBlocksStatus, leftBlockItems]);

  const safetyFromDb = useMemo(() => {
    const mapped = mapThemeItemsToCampusSafetyStatus(rightBlockItems);
    return mapped;
  }, [chartBlocksStatus, rightBlockItems]);

  const campusConfigRows = chartBlocksStatus === 'ok' ? campusConfigFromDb : [];
  const safetyRows = chartBlocksStatus === 'ok' ? safetyFromDb : [];

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
          year: row.metricYear,
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

  return (
    <div className="max-w-[1920px] mx-auto px-8 py-8 space-y-8">
      <PageTitleSection
        title={headerTitle}
        subtitle={headerSubtitle}
        baseYear={meta.baseYear}
        showSummaryJudgment={showSummaryJudgment}
        summaryJudgmentTitle={panelTitle}
        summaryJudgmentSubtitle={panelSubtitle}
      />

      <StatusChips filters={filters} />
      <CampusKPICards kpiCards={kpiCards} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-low rounded-lg p-8 shadow-sm border border-outline-variant/10">
          <div className="mb-8">
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-xl font-headline font-bold text-primary">
                {campusConfigTitle}
              </h2>
              <span className="text-xs font-label text-outline-variant shrink-0">
                단위: 제곱미터(㎡)
              </span>
            </div>
            {campusConfigSubtitle ? (
              <p className="mt-1 text-xs text-on-surface-variant">
                {campusConfigSubtitle}
              </p>
            ) : null}
          </div>
          <div className="space-y-10">
            {chartBlocksStatus === 'loading' ? (
              <p className="text-sm text-on-surface-variant">데이터를 불러오는 중…</p>
            ) : chartBlocksStatus === 'error' ? (
              <p className="text-sm text-on-surface-variant">데이터를 불러오지 못했습니다.</p>
            ) : campusConfigRows.length === 0 ? (
              <p className="text-sm text-on-surface-variant">표시할 데이터가 없습니다.</p>
            ) : (
              campusConfigRows.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-on-surface">{item.item}</span>
                    <span className="text-primary">{item.value.toLocaleString()} {item.unit}</span>
                  </div>
                  <div className="w-full h-8 bg-surface-container-highest rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor:
                          item.colorHex ||
                          BAR_FILL[item.colorToken || item.color] ||
                          BAR_FILL.primary,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-headline font-bold text-primary">
              {safetyTitle}
            </h2>
            {safetySubtitle ? (
              <p className="mt-1 text-xs text-on-surface-variant">
                {safetySubtitle}
              </p>
            ) : null}
          </div>
          <div className="space-y-6">
            {chartBlocksStatus === 'loading' ? (
              <p className="text-sm text-on-surface-variant">데이터를 불러오는 중…</p>
            ) : chartBlocksStatus === 'error' ? (
              <p className="text-sm text-on-surface-variant">데이터를 불러오지 못했습니다.</p>
            ) : safetyRows.length === 0 ? (
              <p className="text-sm text-on-surface-variant">표시할 데이터가 없습니다.</p>
            ) : (
              safetyRows.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between py-3 border-b ${SAFETY_BORDER_COLORS[item.statusColor] || 'border-b-outline-variant/15'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-on-surface-variant">{item.label}</span>
                    {item.description && (
                      <span className="text-[10px] text-outline">{item.description}</span>
                    )}
                  </div>
                  {item.statusColor ? (
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${STATUS_BADGE_COLORS[item.statusColor] || 'bg-surface-container text-on-surface'}`}>
                      {item.value}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-primary">{item.value}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        {(insightsLoading || dbInsights.length > 0) && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <h2 className="text-lg font-headline font-bold text-primary">
                {(insightTitle || '인사이트 분석').trim() || '인사이트 분석'}
              </h2>
            </div>
            <div className="space-y-4">
              {insightsLoading ? (
                <p className="text-sm text-on-surface-variant">인사이트를 불러오는 중…</p>
              ) : (
                dbInsights.map((item, index) => (
                  <div key={`insight-${index}`} className="flex gap-3 p-4 bg-surface-container-low/50 rounded-xl">
                    <span className="text-xl font-extrabold text-primary opacity-30 font-headline shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p
                      className="text-sm text-on-surface leading-relaxed flex-1"
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <AdmissionTable refs={sourceRefs} />
      </section>
    </div>
  );
}
