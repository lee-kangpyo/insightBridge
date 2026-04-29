import ReactECharts from 'echarts-for-react';
import {
  CHART_COLORS,
  AXIS_NAME_COLOR,
  GRID_LINE_COLOR,
  AXIS_LINE_COLOR,
  TOOLTIP_STYLE,
  LEGEND_STYLE,
} from '../../constants/chartTheme';

export interface UniversalChartProps {
  chartType: string;
  data: any;
  config: {
    title?: string;
    xAxisName?: string;
    yAxisName?: string;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    titlePosition?: 'left' | 'center' | 'right';
    /** 캘린더 히트맵에서 month/year 라벨 노출 제어(작은 타일 기본 안정화를 위해 기본값은 false) */
    showCalendarMonthLabel?: boolean;
    showCalendarYearLabel?: boolean;
  };
}

const C = {
  axisLabel: '#475569',
  axisName: AXIS_NAME_COLOR,
  gridLine: GRID_LINE_COLOR,
  axisLine: AXIS_LINE_COLOR,
};

function grad(hex: string, fromAlpha = 'cc', toAlpha = '18'): object {
  return {
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: `${hex}${fromAlpha}` },
      { offset: 1, color: `${hex}${toAlpha}` },
    ],
  };
}

const TOOLTIP_BASE = TOOLTIP_STYLE;

const LEGEND_BASE = LEGEND_STYLE;

const AXIS_SPLIT_LINE = { lineStyle: { color: C.gridLine, type: 'dashed' as const } };
const AXIS_LINE_STYLE = { lineStyle: { color: C.axisLine } };
const AXIS_TICK_STYLE = { lineStyle: { color: C.axisLine } };

const COMMON_THEME = {
  color: CHART_COLORS,
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: { color: '#94a3b8', opacity: 0.5 },
      lineStyle: { color: C.axisLine, type: 'dashed' },
      shadowStyle: { color: 'rgba(2,132,199,0.04)' },
    },
    ...TOOLTIP_BASE,
  },
  animation: true,
  animationDuration: 900,
  animationEasing: 'cubicOut' as const,
  animationDelay: (idx: number) => idx * 40,
};

function buildLegendOption(
  legendPos: NonNullable<UniversalChartProps['config']['legendPosition']>,
  hasTitle: boolean,
) {
  const orient = legendPos === 'top' || legendPos === 'bottom' ? 'horizontal' : 'vertical';

  /**
   * `legend=top` + `title.top=10` 조합에서 서로 겹치지 않도록,
   * 제목이 있으면 범례를 제목 아래로 내린다.
   */
  if (legendPos === 'top') return { ...LEGEND_BASE, top: hasTitle ? 42 : 10, left: 'center', orient };
  if (legendPos === 'bottom') return { ...LEGEND_BASE, bottom: 8, left: 'center', orient };
  /** 왼쪽 세로 범례는 고정 폭으로 두고, 그리드 `left`와 맞물려 Y축 이름과 겹치지 않게 함 */
  if (legendPos === 'left') return { ...LEGEND_BASE, left: 6, top: 'middle', orient, width: 88, padding: [4, 4, 4, 0] };
  return { ...LEGEND_BASE, right: 6, top: 'middle', orient, width: 88, padding: [4, 0, 4, 4] }; // right
}

/** 타일(~300px)에서도 범례·축 이름·축 눈금이 겹치지 않도록 픽셀 기준으로 여백 계산 */
function buildDefaultGrid(config: UniversalChartProps['config']) {
  const legendPos = config.legendPosition || 'bottom';
  const hasTitle = Boolean(config.title);
  const hasXName = Boolean(config.xAxisName?.trim());
  const hasYName = Boolean(config.yAxisName?.trim());

  let top = hasTitle ? 50 : 38;
  if (legendPos === 'top') top += hasTitle ? 54 : 44;

  let bottom = 14;
  if (legendPos === 'bottom') {
    bottom = 52;
    if (hasXName) bottom += 28;
    bottom += 12;
  } else if (hasXName) {
    bottom = 36;
  }

  let left = 12;
  /** 범례(left)·Y축 이름·(containLabel) Y눈금이 같은 왼쪽 띠를 쓰므로 여백을 넉넉히 */
  if (legendPos === 'left') {
    left = 6 + 88 + 10;
    if (hasYName) left += 40;
  } else if (hasYName) {
    left += 20;
  }

  let right = 12;
  if (legendPos === 'right') {
    right = 6 + 88 + 10;
  }

  return {
    left,
    right,
    top,
    bottom,
    containLabel: true,
  };
}

/** 레이더는 `grid`와 무관하게 전체 캔버스에 그려지므로, 범례 위치에 맞춰 중심·반지름을 줄여 겹침 방지 */
const RADAR_LAYOUT_BY_LEGEND: Record<
  NonNullable<UniversalChartProps['config']['legendPosition']>,
  { center: [string, string]; radius: string }
> = {
  bottom: { center: ['50%', '44%'], radius: '46%' },
  top: { center: ['50%', '54%'], radius: '50%' },
  left: { center: ['56%', '50%'], radius: '45%' },
  right: { center: ['44%', '50%'], radius: '45%' },
};

function buildCommonOption(config: UniversalChartProps['config']) {
  const legendPos = config.legendPosition || 'bottom';
  const titlePos = config.titlePosition || 'center';
  const hasTitle = Boolean(config.title);

  return {
    title: config.title ? {
      text: config.title,
      left: titlePos,
      top: 10,
      textStyle: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
    } : undefined,
    legend: {
      show: true,
      ...buildLegendOption(legendPos, hasTitle),
    },
    grid: buildDefaultGrid(config),
  };
}

function buildBarOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || data.xAxis?.data || [];
  const series = data.series || [{ data: data.values || [] }];
  const xName = config.xAxisName?.trim() || '';
  const yName = config.yAxisName?.trim() || '';

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'category',
      data: categories,
      name: xName || undefined,
      nameLocation: 'middle',
      nameGap: xName ? 36 : 28,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel, margin: 6 },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
    },
    yAxis: {
      type: 'value',
      name: yName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: { show: false },
      splitLine: AXIS_SPLIT_LINE,
    },
    series: series.map((s: any, i: number) => ({
      type: 'bar',
      data: s.data,
      name: s.name || `Series ${i + 1}`,
      barMaxWidth: 40,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: grad(CHART_COLORS[i % CHART_COLORS.length]),
      },
    })),
  };
}

function buildLineOption(data: any, config: UniversalChartProps['config'], options: any = {}) {
  const categories = data.categories || data.xAxis?.data || [];
  const series = data.series || (data.values ? [{ data: data.values }] : []);
  const xName = config.xAxisName?.trim() || '';
  const yName = config.yAxisName?.trim() || '';

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'category',
      data: categories,
      name: xName || undefined,
      nameLocation: 'middle',
      nameGap: xName ? 36 : 28,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel, margin: 6 },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: yName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: { show: false },
      splitLine: AXIS_SPLIT_LINE,
    },
    series: series.map((s: any, i: number) => ({
      type: 'line',
      data: s.data,
      name: s.name || `Series ${i + 1}`,
      smooth: true,
      lineStyle: { width: 2.5, color: CHART_COLORS[i % CHART_COLORS.length] },
      itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length], borderWidth: 2, borderColor: '#fff' },
      symbolSize: 6,
      ...options,
    })),
  };
}

function buildAreaOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || data.xAxis?.data || [];
  const series = data.series || (data.values ? [{ data: data.values }] : []);
  const xName = config.xAxisName?.trim() || '';
  const yName = config.yAxisName?.trim() || '';

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'category',
      data: categories,
      name: xName || undefined,
      nameLocation: 'middle',
      nameGap: xName ? 36 : 28,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel, margin: 6 },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: yName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: { show: false },
      splitLine: AXIS_SPLIT_LINE,
    },
    series: series.map((s: any, i: number) => ({
      type: 'line',
      data: s.data,
      name: s.name || `Series ${i + 1}`,
      smooth: true,
      lineStyle: { width: 2.5, color: CHART_COLORS[i % CHART_COLORS.length] },
      itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length], borderWidth: 2, borderColor: '#fff' },
      symbolSize: 6,
      areaStyle: { color: grad(CHART_COLORS[i % CHART_COLORS.length], '44', '06') },
    })),
  };
}

function buildStackedColumnOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || data.xAxis?.data || [];
  const series = data.series || [];
  const xName = config.xAxisName?.trim() || '';
  const yName = config.yAxisName?.trim() || '';

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'category',
      data: categories,
      name: xName || undefined,
      nameLocation: 'middle',
      nameGap: xName ? 36 : 28,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel, margin: 6 },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
    },
    yAxis: {
      type: 'value',
      name: yName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: { show: false },
      splitLine: AXIS_SPLIT_LINE,
    },
    series: series.map((s: any, i: number) => ({
      type: 'bar',
      data: s.data,
      name: s.name || `Series ${i + 1}`,
      stack: 'total',
      barMaxWidth: 48,
      itemStyle: {
        borderRadius: i === series.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0],
        color: CHART_COLORS[i % CHART_COLORS.length],
      },
    })),
  };
}

function buildStackedHorizontalBarOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || data.yAxis?.data || [];
  const series = data.series || [];

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'value',
      name: config.xAxisName || undefined,
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: { show: false },
      splitLine: AXIS_SPLIT_LINE,
    },
    yAxis: {
      type: 'category',
      data: categories,
      name: config.yAxisName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
    },
    series: series.map((s: any, i: number) => ({
      type: 'bar',
      data: s.data,
      name: s.name || `Series ${i + 1}`,
      stack: 'total',
      barMaxWidth: 32,
      itemStyle: {
        borderRadius: i === series.length - 1 ? [0, 6, 6, 0] : [0, 0, 0, 0],
        color: CHART_COLORS[i % CHART_COLORS.length],
      },
    })),
  };
}

function buildStackedAreaOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || data.xAxis?.data || [];
  const series = data.series || [];
  const xName = config.xAxisName?.trim() || '';
  const yName = config.yAxisName?.trim() || '';

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'category',
      data: categories,
      name: xName || undefined,
      nameLocation: 'middle',
      nameGap: xName ? 36 : 28,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel, margin: 6 },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      name: yName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: { show: false },
      splitLine: AXIS_SPLIT_LINE,
    },
    series: series.map((s: any, i: number) => ({
      type: 'line',
      data: s.data,
      name: s.name || `Series ${i + 1}`,
      stack: 'total',
      smooth: true,
      lineStyle: { width: 2, color: CHART_COLORS[i % CHART_COLORS.length] },
      itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      areaStyle: { color: grad(CHART_COLORS[i % CHART_COLORS.length], '55', '18') },
    })),
  };
}

function buildHorizontalBarOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || data.yAxis?.data || [];
  const series = data.series || [{ data: data.values || [] }];

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'value',
      name: config.xAxisName || undefined,
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: { show: false },
      splitLine: AXIS_SPLIT_LINE,
    },
    yAxis: {
      type: 'category',
      data: categories,
      name: config.yAxisName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
    },
    series: series.map((s: any, i: number) => ({
      type: 'bar',
      data: s.data,
      name: s.name || `Series ${i + 1}`,
      barMaxWidth: 28,
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: grad(CHART_COLORS[i % CHART_COLORS.length]),
      },
    })),
  };
}

function buildPieOption(data: any, config: UniversalChartProps['config']) {
  const pieData = Array.isArray(data) ? data : data.values || [];

  return {
    ...COMMON_THEME,
    tooltip: { trigger: 'item', ...TOOLTIP_BASE },
    ...buildCommonOption(config),
    series: [{
      type: 'pie',
      radius: ['0%', '62%'],
      data: pieData,
      label: { fontSize: 11, color: C.axisLabel },
      labelLine: { lineStyle: { color: C.axisLine } },
      itemStyle: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
      emphasis: { itemStyle: { shadowBlur: 16, shadowColor: 'rgba(2,132,199,0.25)' } },
    }],
  };
}

function buildDonutOption(data: any, config: UniversalChartProps['config']) {
  const pieData = Array.isArray(data) ? data : data.values || [];

  return {
    ...COMMON_THEME,
    tooltip: { trigger: 'item', ...TOOLTIP_BASE },
    ...buildCommonOption(config),
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      data: pieData,
      label: { fontSize: 11, color: C.axisLabel },
      labelLine: { lineStyle: { color: C.axisLine } },
      itemStyle: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.95)' },
      emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(96,165,250,0.35)' } },
    }],
  };
}

function buildNightingaleRoseOption(data: any, config: UniversalChartProps['config']) {
  const pieData = Array.isArray(data) ? data : data.values || [];

  return {
    ...COMMON_THEME,
    tooltip: { trigger: 'item', ...TOOLTIP_BASE },
    ...buildCommonOption(config),
    series: [{
      type: 'pie',
      radius: ['18%', '68%'],
      data: pieData,
      roseType: 'area',
      label: { fontSize: 10, color: C.axisLabel },
      labelLine: { lineStyle: { color: C.axisLine } },
      itemStyle: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
      emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(2,132,199,0.2)' } },
    }],
  };
}

function buildScatterOption(data: any, config: UniversalChartProps['config']) {
  const scatterData = Array.isArray(data) ? data : (data.values || data.data || []);

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'value',
      name: config.xAxisName || undefined,
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      splitLine: AXIS_SPLIT_LINE,
      axisLine: AXIS_LINE_STYLE,
    },
    yAxis: {
      type: 'value',
      name: config.yAxisName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      splitLine: AXIS_SPLIT_LINE,
      axisLine: { show: false },
    },
    series: [{
      type: 'scatter',
      data: scatterData,
      symbolSize: 10,
      itemStyle: { color: CHART_COLORS[0], opacity: 0.75, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)' },
      emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(2,132,199,0.3)' } },
    }],
  };
}

function buildBubbleOption(data: any, config: UniversalChartProps['config']) {
  const rawData = Array.isArray(data) ? data : (data.values || data.data || []);
  const bubbleData = rawData.map((d: number[]) => [d[0], d[1], d[2] ?? Math.random() * 50 + 10]);

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'value',
      name: config.xAxisName || undefined,
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      splitLine: AXIS_SPLIT_LINE,
      axisLine: AXIS_LINE_STYLE,
    },
    yAxis: {
      type: 'value',
      name: config.yAxisName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      splitLine: AXIS_SPLIT_LINE,
      axisLine: { show: false },
    },
    series: [{
      type: 'scatter',
      data: bubbleData,
      symbolSize: (val: number[]) => Math.sqrt(val[2]) * 2,
      itemStyle: { color: CHART_COLORS[1], opacity: 0.7, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)' },
      emphasis: { itemStyle: { shadowBlur: 14, shadowColor: 'rgba(5,150,105,0.3)' } },
    }],
  };
}

function normalizeHeatmapSeriesData(data: any): {
  heatmapData: [number, number, number][];
  xCategories: string[];
  yCategories: string[];
} {
  let rows: [number, number, number][] = [];
  let xCats: string[] = [];
  let yCats: string[] = [];

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const raw = data.values ?? data.data;
    if (Array.isArray(raw)) {
      rows = raw.filter((d: unknown) => Array.isArray(d) && (d as number[]).length >= 3) as [number, number, number][];
    }
    xCats = [...(data.xAxis?.data ?? data.xData ?? [])];
    yCats = [...(data.yAxis?.data ?? data.yData ?? [])];
  } else if (Array.isArray(data)) {
    rows = data.filter((d: unknown) => Array.isArray(d) && (d as number[]).length >= 3) as [number, number, number][];
  }

  if (rows.length > 0) {
    let maxX = 0;
    let maxY = 0;
    for (const r of rows) {
      maxX = Math.max(maxX, r[0]);
      maxY = Math.max(maxY, r[1]);
    }
    if (xCats.length === 0) {
      xCats = Array.from({ length: maxX + 1 }, (_, i) => String(i));
    }
    if (yCats.length === 0) {
      yCats = Array.from({ length: maxY + 1 }, (_, i) => String(i));
    }
  }

  return { heatmapData: rows, xCategories: xCats, yCategories: yCats };
}

/** 히트맵 색상 스케일(`visualMap`) 전용 — `grid`는 시리즈 `legend`가 아니라 visualMap 쪽을 비움 */
function buildHeatmapGrid(config: UniversalChartProps['config']) {
  const vmPos = config.legendPosition || 'bottom';
  const hasTitle = Boolean(config.title);
  const hasXName = Boolean(config.xAxisName?.trim());
  const hasYName = Boolean(config.yAxisName?.trim());

  let top = hasTitle ? 50 : 38;
  if (vmPos === 'top') top += 40;

  let bottom = 14;
  /** 하단 가로 visualMap + 양끝 핸들(calculable) + x축 눈금 — `containLabel`과 겹치지 않게 여백 확보 */
  if (vmPos === 'bottom') {
    bottom = 96;
    if (hasXName) bottom += 30;
  } else if (hasXName) {
    bottom = 36;
  }

  let left = 12;
  if (vmPos === 'left') {
    left = 8 + 52 + 10;
    if (hasYName) left += 36;
  } else if (hasYName) {
    left += 20;
  }

  let right = 12;
  if (vmPos === 'right') {
    right = 8 + 52 + 10;
  }

  return {
    left,
    right,
    top,
    bottom,
    containLabel: true,
  };
}

/** 캘린더 히트맵은 `coordinateSystem: 'calendar'`라 `grid`와 무관 — `visualMap`·제목·축 이름 캡션에 맞춰 캘린더 inset만 조정 */
function buildCalendarInset(config: UniversalChartProps['config']) {
  const vmPos = config.legendPosition || 'bottom';
  const hasCaption = Boolean(
    config.title?.trim() || config.xAxisName?.trim() || config.yAxisName?.trim(),
  );
  const hasAxisCaption = Boolean(config.xAxisName?.trim() || config.yAxisName?.trim());
  const hasPrimaryTitle = Boolean(config.title?.trim());
  const hasSecondaryCaption = hasAxisCaption;

  const showMonthLabel = Boolean(config.showCalendarMonthLabel);
  const showYearLabel = Boolean(config.showCalendarYearLabel);

  /**
   * 캘린더는 `grid`가 없어서 캡션/visualMap과 경쟁하기 쉬움.
   * 작은 타일(≈300px)에서도 겹침을 줄이기 위해 캡션 높이를 더 보수적으로 잡는다.
   */
  const captionBlockHeight = !hasCaption
    ? 0
    : (hasPrimaryTitle && hasSecondaryCaption ? 44 : 28); // title(+subtext) vs single-line

  let top = 18 + captionBlockHeight;
  /**
   * `visualMap(top)`은 텍스트+핸들(calculable)까지 포함하면 높이가 꽤 커서,
   * 캘린더 영역이 겹치지 않도록 충분히 크게 비운다(타일≈300px 기준 안정).
   */
  if (vmPos === 'top') top += 76;
  if (showMonthLabel || showYearLabel) top += 18;

  let bottom = 22;
  if (vmPos === 'bottom') {
    bottom = 104;
    if (hasAxisCaption) bottom += 10;
  }

  let left = 26;
  let right = 26;
  if (vmPos === 'left') {
    left = 84;
  } else if (vmPos === 'right') {
    right = 84;
  }

  return { top, bottom, left, right };
}

/** 캘린더에는 카테고리 축이 없으므로 모달의 X/Y 이름을 제목·부제로 표시 */
function buildCalendarTitleOption(config: UniversalChartProps['config']) {
  const primary = config.title?.trim() || '';
  const secondary = [config.xAxisName?.trim(), config.yAxisName?.trim()].filter(Boolean).join(' · ');
  if (!primary && !secondary) return undefined;
  const titlePos = config.titlePosition || 'center';
  const base = {
    left: titlePos,
    top: 8,
    textStyle: { fontSize: 16, fontWeight: 600, color: '#111827' },
    subtextStyle: { fontSize: 12, color: '#6b7280' },
    itemGap: 4,
  };
  if (primary && secondary) return { ...base, text: primary, subtext: secondary };
  if (primary) return { ...base, text: primary };
  return { ...base, text: secondary };
}

function buildHeatmapVisualMap(
  config: UniversalChartProps['config'],
  max: number,
  opts?: { hasTopCaption?: boolean },
) {
  const vmPos = config.legendPosition || 'bottom';
  const hasTitle = opts?.hasTopCaption ?? Boolean(config.title);

  const base = {
    show: true,
    min: 0,
    max,
    calculable: true,
    inRange: { color: ['#e0f2fe', '#0284c7', '#132337'] },
    textStyle: { fontSize: 11, color: C.axisLabel },
  };

  switch (vmPos) {
    case 'top':
      return {
        ...base,
        orient: 'horizontal' as const,
        left: 'center',
        top: hasTitle ? 42 : 30,
        /** 가로 visualMap: 회전 후 두께=itemWidth, 길이=itemHeight (값 뒤바뀌면 세로로 길게 보임) */
        itemWidth: 20,
        itemHeight: 160,
      };
    case 'bottom':
      return {
        ...base,
        orient: 'horizontal' as const,
        left: 'center',
        bottom: 10,
        itemWidth: 20,
        itemHeight: 160,
      };
    case 'left':
      return {
        ...base,
        orient: 'vertical' as const,
        left: 6,
        top: 'middle',
      };
    case 'right':
    default:
      return {
        ...base,
        orient: 'vertical' as const,
        right: 6,
        top: 'middle',
      };
  }
}

function buildHeatmapOption(data: any, config: UniversalChartProps['config']) {
  const { heatmapData, xCategories, yCategories } = normalizeHeatmapSeriesData(data);
  const xName = config.xAxisName?.trim() || '';
  const yName = config.yAxisName?.trim() || '';
  const maxValue = heatmapData.length > 0
    ? Math.max(...heatmapData.map((d) => d[2] || 0))
    : 100;

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    legend: { show: false },
    grid: buildHeatmapGrid(config),
    xAxis: {
      type: 'category',
      data: xCategories,
      name: xName || undefined,
      nameLocation: 'middle',
      nameGap: xName ? 36 : 28,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel, margin: 6 },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
    },
    yAxis: {
      type: 'category',
      data: yCategories,
      name: yName || undefined,
      nameLocation: 'middle',
      nameGap: yName ? 44 : 36,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel, margin: 6 },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
    },
    visualMap: buildHeatmapVisualMap(config, maxValue),
    series: [{
      type: 'heatmap',
      data: heatmapData,
      label: { show: false },
      itemStyle: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 3 },
      emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(2,132,199,0.3)' } },
    }],
  };
}

function buildCalendarHeatmapOption(data: any, config: UniversalChartProps['config']) {
  const calendarData = Array.isArray(data) ? data : (data.values || data.data || []);

  const maxValue = calendarData.length > 0
    ? Math.max(...calendarData.map((d: any) => d[1] || 0))
    : 100;

  const inset = buildCalendarInset(config);
  const common = buildCommonOption(config);
  const calendarTitle = buildCalendarTitleOption(config);
  const hasCalendarCaption = Boolean(calendarTitle);
  const showMonthLabel = Boolean(config.showCalendarMonthLabel);
  const showYearLabel = Boolean(config.showCalendarYearLabel);

  return {
    ...COMMON_THEME,
    ...common,
    legend: { show: false },
    title: calendarTitle ?? common.title,
    calendar: {
      top: inset.top,
      left: inset.left,
      right: inset.right,
      bottom: inset.bottom,
      cellSize: ['auto', 20],
      range: data.range || '2024',
      itemStyle: { borderWidth: 0.5, borderColor: '#e0e0e0' },
      dayLabel: {
        firstDay: 1,
        /** `firstDay: 1`(월 시작)에 맞춘 요일 약어 */
        nameMap: ['월', '화', '수', '목', '금', '토', '일'],
        fontSize: 10,
        color: '#4b5563',
      },
      monthLabel: { show: showMonthLabel, fontSize: 11, color: '#374151', margin: 2 },
      yearLabel: { show: showYearLabel, fontSize: 11, color: '#374151', margin: 2 },
    },
    visualMap: {
      ...buildHeatmapVisualMap(config, maxValue, { hasTopCaption: hasCalendarCaption }),
      inRange: { color: ['#f0fdf4', '#6ee7b7', '#059669', '#132337'] },
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: calendarData,
    }],
  };
}

function buildTreemapOption(data: any, config: UniversalChartProps['config']) {
  const treemapData = Array.isArray(data) ? data : data.values || [];

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    series: [{
      type: 'treemap',
      data: treemapData,
      label: { show: true, formatter: '{b}' },
      visualMin: 0,
      visualMax: 100,
      leafDepth: 2,
      childrenVisibleDepth: 2,
      breadcrumb: { show: true },
    }],
  };
}

function buildRadarOption(data: any, config: UniversalChartProps['config']) {
  const indicator = data.indicator || [];
  const seriesData = data.series || [];
  const legendPos = config.legendPosition || 'bottom';
  const radarLayout = RADAR_LAYOUT_BY_LEGEND[legendPos] ?? RADAR_LAYOUT_BY_LEGEND.bottom;

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    tooltip: {
      ...COMMON_THEME.tooltip,
      trigger: 'axis',
    },
    radar: {
      indicator,
      center: radarLayout.center,
      radius: radarLayout.radius,
      axisNameGap: 6,
      axisName: { color: C.axisLabel, fontSize: 11 },
      axisLine: { lineStyle: { color: C.gridLine } },
      splitLine: { lineStyle: { color: C.gridLine } },
      splitArea: { areaStyle: { color: ['rgba(219,228,240,0.08)', 'rgba(219,228,240,0.03)'] } },
    },
    series: [{
      type: 'radar',
      data: seriesData.map((s: any, i: number) => ({
        value: s.data || s,
        name: s.name || `Series ${i + 1}`,
        lineStyle: { color: CHART_COLORS[i % CHART_COLORS.length], width: 2 },
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
        areaStyle: { color: CHART_COLORS[i % CHART_COLORS.length], opacity: 0.18 },
      })),
    }],
  };
}

function buildCandlestickOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || data.xAxis?.data || [];
  const candleData = data.values || data.data || [];

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'category',
      data: categories,
      name: config.xAxisName || '',
      nameLocation: 'middle',
      nameGap: 30,
    },
    yAxis: {
      type: 'value',
      name: config.yAxisName || '',
      nameLocation: 'middle',
      nameGap: 40,
    },
    series: [{
      type: 'candlestick',
      data: candleData,
      itemStyle: {
        color: CHART_COLORS[4],
        color0: CHART_COLORS[0],
        borderColor: CHART_COLORS[4],
        borderColor0: CHART_COLORS[0],
      },
    }],
  };
}

function buildGaugeOption(data: any, config: UniversalChartProps['config']) {
  const value = data.value ?? 0;

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '90%',
      min: 0,
      max: 100,
      data: [{ value }],
      splitNumber: 8,
      axisLine: {
        lineStyle: {
          width: 10,
          color: [
            [0.3, '#e0f2fe'],
            [0.7, CHART_COLORS[0]],
            [1, '#132337'],
          ],
        },
      },
      pointer: { itemStyle: { color: CHART_COLORS[4] }, width: 5, length: '65%' },
      progress: { show: true, width: 10 },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { distance: 20, fontSize: 10, color: C.axisLabel },
      detail: {
        valueAnimation: true,
        fontSize: 22,
        fontWeight: 700,
        color: '#132337',
        offsetCenter: [0, 0],
      },
    }],
  };
}

function buildWaterfallOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || [];
  const positive = data.positive || [];
  const negative = data.negative || [];

  let cumulative = 0;
  const subtotals = categories.map((_: any, i: number) => {
    if (i === 0) return 0;
    const prev = (positive[i - 1] || 0) + (negative[i - 1] || 0);
    cumulative += prev;
    return cumulative;
  });

  const xName = config.xAxisName?.trim() || '';
  const yName = config.yAxisName?.trim() || '';

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'category',
      data: categories,
      name: xName || undefined,
      nameLocation: 'middle',
      nameGap: xName ? 36 : 28,
      nameTextStyle: { fontSize: 12, color: '#374151' },
      axisLabel: { fontSize: 11, color: '#4b5563', margin: 6 },
    },
    yAxis: {
      type: 'value',
      name: yName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 12, color: '#374151' },
      axisLabel: { fontSize: 11, color: '#4b5563' },
    },
    series: [
      {
        type: 'bar',
        data: subtotals,
        itemStyle: { color: 'transparent', borderWidth: 0 },
        barMaxWidth: 40,
        stack: 'total',
      },
      {
        type: 'bar',
        data: positive,
        name: '증가',
        itemStyle: { color: grad(CHART_COLORS[0]), borderRadius: [6, 6, 0, 0] },
        barMaxWidth: 40,
        stack: 'total',
      },
      {
        type: 'bar',
        data: negative.map((v: number) => Math.abs(v)),
        name: '감소',
        itemStyle: { color: grad(CHART_COLORS[4]), borderRadius: [6, 6, 0, 0] },
        barMaxWidth: 40,
        stack: 'total',
      },
    ],
  };
}

function buildPopulationPyramidOption(data: any, config: UniversalChartProps['config']) {
  const ageGroups = data.ageGroups || [];
  const left = (data.left || []).map((v: number) => Number(v) || 0);
  const right = (data.right || []).map((v: number) => Number(v) || 0);
  const legendPos = config.legendPosition || 'bottom';
  const xName = config.xAxisName?.trim() || '';
  const yName = config.yAxisName?.trim() || '';

  const maxVal = Math.max(1, ...left, ...right);
  const axisMax = Math.ceil(maxVal * 1.1);

  const hasTitle = Boolean(config.title);
  const gridTop = legendPos === 'top' ? (hasTitle ? 88 : 64) : hasTitle ? 52 : 36;
  const gridBottom = legendPos === 'bottom' ? 52 : 28;
  const gridSide = legendPos === 'left' ? '14%' : legendPos === 'right' ? '14%' : '2%';

  const axisNameStyle = { fontSize: 11, fontWeight: 500 as const, color: '#374151' };
  const axisLabelStyle = { fontSize: 10, color: '#4b5563' };

  return {
    ...COMMON_THEME,
    title: config.title
      ? {
          text: config.title,
          left: config.titlePosition || 'center',
          top: 10,
          textStyle: { fontSize: 16, fontWeight: 600 },
        }
      : undefined,
    legend: {
      show: true,
      ...buildLegendOption(legendPos),
    },
    grid: [
      { left: gridSide, right: '52%', top: gridTop, bottom: gridBottom, containLabel: true },
      { left: '52%', right: gridSide, top: gridTop, bottom: gridBottom, containLabel: true },
    ],
    xAxis: [
      {
        type: 'value',
        gridIndex: 0,
        inverse: true,
        min: 0,
        max: axisMax,
        name: xName || undefined,
        nameLocation: 'middle',
        nameGap: 24,
        nameTextStyle: axisNameStyle,
        axisLabel: {
          ...axisLabelStyle,
          formatter: (v: number) => String(Math.abs(Math.round(v))),
        },
        splitLine: { show: true, lineStyle: { color: '#e5e7eb', type: 'dashed' as const } },
        axisLine: { lineStyle: { color: '#9ca3af' } },
      },
      {
        type: 'value',
        gridIndex: 1,
        min: 0,
        max: axisMax,
        name: xName || undefined,
        nameLocation: 'middle',
        nameGap: 24,
        nameTextStyle: axisNameStyle,
        axisLabel: axisLabelStyle,
        splitLine: { show: true, lineStyle: { color: '#e5e7eb', type: 'dashed' as const } },
        axisLine: { lineStyle: { color: '#9ca3af' } },
      },
    ],
    yAxis: [
      {
        type: 'category',
        gridIndex: 0,
        data: ageGroups,
        position: 'right',
        name: yName || undefined,
        nameLocation: 'middle',
        nameGap: 36,
        nameTextStyle: axisNameStyle,
        axisLabel: { ...axisLabelStyle, fontSize: 11, align: 'left' as const },
        axisTick: { alignWithLabel: true },
        axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: ageGroups,
        position: 'left',
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        type: 'bar',
        data: left,
        name: 'Male',
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: { color: CHART_COLORS[0], borderRadius: [0, 4, 4, 0] },
      },
      {
        type: 'bar',
        data: right,
        name: 'Female',
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: { color: CHART_COLORS[4], borderRadius: [4, 0, 0, 4] },
      },
    ],
  };
}

function buildStreamgraphOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || [];
  const series = data.series || [];

  const themeRiverData = series.flatMap((s: any) =>
    (s.data || []).map((value: number, idx: number) => [categories[idx] || idx, value, s.name || `Series ${idx}`])
  );

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: { color: 'rgba(0,0,0,0.2)', width: 1, type: 'solid' }
      }
    },
    legend: {
      show: true,
      bottom: 0,
    },
    singleAxis: {
      type: 'time',
      top: 50,
      bottom: 50,
      axisTick: {},
      axisLabel: {},
      axisPointer: {
        animation: true,
        label: { show: true }
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', opacity: 0.2 }
      }
    },
    series: [{
      type: 'themeRiver',
      data: themeRiverData,
      label: { show: false },
      emphasis: {
        itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 0, 0, 0.8)' }
      },
    }],
  };
}

function buildHistogramOption(data: any, config: UniversalChartProps['config']) {
  const categories = data.categories || data.xAxis?.data || [];
  const values = data.values || [];
  const xName = config.xAxisName?.trim() || '';
  const yName = config.yAxisName?.trim() || '';

  return {
    ...COMMON_THEME,
    ...buildCommonOption(config),
    xAxis: {
      type: 'category',
      data: categories,
      name: xName || undefined,
      nameLocation: 'middle',
      nameGap: xName ? 36 : 28,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel, margin: 6 },
      axisLine: AXIS_LINE_STYLE,
      axisTick: AXIS_TICK_STYLE,
    },
    yAxis: {
      type: 'value',
      name: yName || undefined,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { fontSize: 11, color: C.axisName, fontWeight: 500 },
      axisLabel: { fontSize: 10, color: C.axisLabel },
      axisLine: { show: false },
      splitLine: AXIS_SPLIT_LINE,
    },
    series: [{
      type: 'bar',
      data: values,
      barCategoryGap: '8%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: grad(CHART_COLORS[0]),
      },
    }],
  };
}

const chartBuilders: Record<string, (data: any, config: UniversalChartProps['config']) => any> = {
  column: buildBarOption,
  stacked_bar: buildStackedHorizontalBarOption,
  horizontal_bar: buildHorizontalBarOption,
  line_multi: (data, config) => buildLineOption(data, config, { symbol: 'none' }),
  stacked_column: buildStackedColumnOption,
  line_dots: (data, config) => buildLineOption(data, config, { symbol: 'circle', symbolSize: 8 }),
  area: buildAreaOption,
  area_stacked: buildStackedAreaOption,
  streamgraph: buildStreamgraphOption,
  scatter: buildScatterOption,
  heatmap_grid: buildHeatmapOption,
  treemap: buildTreemapOption,
  waterfall: buildWaterfallOption,
  calendar_heatmap: buildCalendarHeatmapOption,
  population_pyramid: buildPopulationPyramidOption,
  pie: buildPieOption,
  donut: buildDonutOption,
  nightingale_rose: buildNightingaleRoseOption,
  radar: buildRadarOption,
  histogram: buildHistogramOption,
  bubble: buildBubbleOption,
  candlestick: buildCandlestickOption,
  gauge: buildGaugeOption,
};

function buildChartOption(chartType: string, data: any, config: UniversalChartProps['config']) {
  const builder = chartBuilders[chartType];
  if (!builder) {
    return {
      title: { text: 'Unsupported chart type' },
      series: [],
    };
  }
  return builder(data, config);
}

function UniversalChart({ chartType, data, config }: UniversalChartProps) {
  const option = buildChartOption(chartType, data, config);

  return (
    <div className="w-full h-full min-h-[300px]">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}

export default UniversalChart;
