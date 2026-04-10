import { useEffect, useMemo, useState } from "react";
import financeData from "../../data/finance-data.json";
import PageTitleSection from "../main/PageTitleSection";
import StatusChips from "../main/StatusChips";
import { FinanceKPICards } from "./index";
import AdmissionTable from "../admission/AdmissionTable";
import { getThemeDetailGrid } from "../../services/api";
import { useThemeSourceRefs } from "../../hooks/useThemeSourceRefs";
import { useThemeChartBlockMeta } from "../../hooks/useThemeChartBlockMeta";
import { useThemeTextBlockLines } from "../../hooks/useThemeTextBlockLines";
import { useThemeHeaderContext } from "../../hooks/useThemeHeaderContext";
import { useThemePanelSummary } from "../../hooks/useThemePanelSummary";
import {
  mapThemeItemsToFinanceRevenueTop,
  mapThemeItemsToFinanceTuitionBars,
} from "../../utils/mapThemeItemsToFinanceCharts";
import { useSchlNm } from "../../hooks/useSchlNm";

/** docs/6tap/code.html 계열별 막대(bg-primary, bg-secondary, …)와 동일 — JIT 누락 방지용 hex */
const BAR_FILL = {
  primary: "#002c5a",
  secondary: "#006492",
  "secondary-container": "#58bcfd",
  "on-primary-container": "#84b0f7",
  "primary-fixed-dim": "#a8c8ff",
};

const REVENUE_BORDER = {
  "border-primary": BAR_FILL.primary,
  "border-secondary": BAR_FILL.secondary,
  "border-secondary-container": BAR_FILL["secondary-container"],
  "border-on-primary-container": BAR_FILL["on-primary-container"],
  "border-primary-fixed-dim": BAR_FILL["primary-fixed-dim"],
};

const FINANCE_SCREEN_BASE_YEAR = 2025;
const INSIGHT_BLOCK_CODE = "SAMPLE_INSIGHT";
const INSIGHT_LINE_ROLE = "INSIGHT";

export default function FinanceDashboard() {
  const { meta, filters, tuitionByField, revenueStructure } = financeData;
  const schlNm = useSchlNm();

  const [kpiCards, setKpiCards] = useState([]);

  const themeParams = useMemo(
    () => ({
      screen_code: "finance",
      screen_ver: "v0.1",
      screen_base_year: FINANCE_SCREEN_BASE_YEAR,
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

  const tuitionBlockTitle =
    chartLeft.title?.trim() || "계열별 등록금 수준";
  const tuitionBlockSubtitle = chartLeft.subtitle?.trim() || "";
  const revenueBlockTitle =
    chartRight.title?.trim() || "세입 구조 상위 항목";
  const revenueBlockSubtitle = chartRight.subtitle?.trim() || "";

  const tuitionFromDb = useMemo(() => {
    const mapped = mapThemeItemsToFinanceTuitionBars(leftBlockItems);
    return mapped;
  }, [chartBlocksStatus, leftBlockItems]);

  const revenueFromDb = useMemo(() => {
    const mapped = mapThemeItemsToFinanceRevenueTop(rightBlockItems);
    return mapped;
  }, [chartBlocksStatus, rightBlockItems]);

  const tuitionRows = chartBlocksStatus === "ok" ? tuitionFromDb : [];
  const revenueRows = chartBlocksStatus === "ok" ? revenueFromDb : [];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getThemeDetailGrid(themeParams);
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
      <FinanceKPICards kpiCards={kpiCards} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-low rounded-lg p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-primary font-headline">
              {tuitionBlockTitle}
            </h3>
            {tuitionBlockSubtitle ? (
              <p className="mt-1 text-xs text-on-surface-variant">
                {tuitionBlockSubtitle}
              </p>
            ) : null}
          </div>
          <div className="space-y-6">
            {chartBlocksStatus === "loading" ? (
              <p className="text-sm text-on-surface-variant">
                데이터를 불러오는 중…
              </p>
            ) : chartBlocksStatus === "error" ? (
              <p className="text-sm text-on-surface-variant">
                데이터를 불러오지 못했습니다.
              </p>
            ) : tuitionRows.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                표시할 데이터가 없습니다.
              </p>
            ) : (
              tuitionRows.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                    <span>{item.field}</span>
                    <span>{item.amount.toLocaleString()}원</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
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

        <div className="bg-surface-container-low rounded-lg p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-primary font-headline">
              {revenueBlockTitle}
            </h3>
            {revenueBlockSubtitle ? (
              <p className="mt-1 text-xs text-on-surface-variant">
                {revenueBlockSubtitle}
              </p>
            ) : null}
          </div>
          <div className="space-y-4">
            {chartBlocksStatus === "loading" ? (
              <p className="text-sm text-on-surface-variant">
                데이터를 불러오는 중…
              </p>
            ) : chartBlocksStatus === "error" ? (
              <p className="text-sm text-on-surface-variant">
                데이터를 불러오지 못했습니다.
              </p>
            ) : revenueRows.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                표시할 데이터가 없습니다.
              </p>
            ) : (
              revenueRows.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border-l-4 border-solid"
                  style={{
                    borderLeftColor:
                      item.borderColorHex ||
                      REVENUE_BORDER[item.borderToken || item.borderColor] ||
                      REVENUE_BORDER["border-primary"],
                  }}
                >
                  <span className="text-sm font-medium">{item.item}</span>
                  <span className="text-sm font-extrabold text-secondary">
                    {item.percentage}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {(insightsLoading || dbInsights.length > 0) && (
        <section className="bg-white rounded-lg p-8 border-l-8 border-primary shadow-sm">
          <h3 className="text-lg font-bold text-primary mb-6 font-headline flex items-center gap-2">
            <span className="material-symbols-outlined">lightbulb</span>
            {(insightTitle || "인사이트").trim() || "인사이트"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {insightsLoading ? (
              <p className="text-sm text-on-surface-variant col-span-full">
                인사이트를 불러오는 중…
              </p>
            ) : (
              dbInsights.map((item, index) => (
                <div key={`insight-${index}`} className="flex gap-4">
                  <span className="text-xl font-extrabold text-primary opacity-30 font-headline">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p
                    className="text-sm text-on-surface-variant leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <AdmissionTable refs={sourceRefs} />
    </div>
  );
}
