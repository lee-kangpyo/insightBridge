import ReactECharts from 'echarts-for-react';

function pivotData(data, xKey, yKey, groupKey) {
  if (!data || data.length === 0) return { xValues: [], groups: [], series: {} };

  const xValues = [...new Set(data.map(r => String(r[xKey])))].sort();
  const groups = groupKey ? [...new Set(data.map(r => String(r[groupKey])))].sort() : [null];

  const series = {};
  for (const g of groups) {
    series[g] = xValues.map(xv => {
      const match = data.find(r => String(r[xKey]) === xv && (g === null ? true : String(r[groupKey]) === g));
      return match !== undefined ? Number(match[yKey]) : null;
    });
  }

  return { xValues, groups, series };
}

function findNumericColumns(data) {
  if (!data || data.length === 0) return [];
  const columns = Object.keys(data[0]);
  return columns.filter(col => {
    const vals = data.map(r => r[col]);
    return vals.some(v => v !== null && v !== undefined && !isNaN(Number(v)));
  });
}

function resolveChartConfig(data, chartConfig) {
  if (!data || data.length === 0) return chartConfig || { type: 'bar' };
  const columns = Object.keys(data[0]);

  if (!chartConfig || typeof chartConfig !== 'object') {
    const numericCols = findNumericColumns(data);
    return {
      type: numericCols.length > 1 ? 'bar' : 'pie',
      x: columns[0],
      y: numericCols[0] || columns[1],
    };
  }

  const result = { ...chartConfig };

  if (!result.x || !columns.includes(result.x)) {
    result.x = columns[0];
  }

  if (!result.y || (typeof result.y === 'string' && !columns.some(c => c.toLowerCase().includes(result.y.toLowerCase())))) {
    const numericCols = findNumericColumns(data);
    const validY = numericCols.filter(c => c !== result.x);
    result.y = validY[0] || columns[1];
  }

  const supportedTypes = ['line', 'bar', 'pie', 'heatmap', 'area', 'stacked_bar', 'scatter', 'donut', 'treemap'];
  if (!result.type || !supportedTypes.includes(result.type)) {
    result.type = 'bar';
  }

  result.groupKey = result.group;

  return result;
}

const CHART_COLORS = [
  '#60a5fa',
  '#34d399',
  '#f472b6',
  '#fb923c',
  '#a78bfa',
  '#38bdf8',
  '#fbbf24',
  '#4ade80',
];

const AXIS_LABEL_COLOR = '#475569';
const GRID_LINE = 'rgba(219,228,240,0.5)';
const AXIS_LINE_COLOR = '#dbe4f0';

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(255,255,255,0.94)',
  borderColor: 'rgba(219,228,240,0.7)',
  borderWidth: 1,
  borderRadius: 12,
  padding: [10, 14],
  textStyle: { color: '#0f172a', fontSize: 12 },
  extraCssText: 'box-shadow:0 12px 32px rgba(2,132,199,0.12);backdrop-filter:blur(12px);',
};

const COMMON_THEME = {
  color: CHART_COLORS,
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross', crossStyle: { color: '#94a3b8', opacity: 0.5 }, lineStyle: { color: AXIS_LINE_COLOR, type: 'dashed' } },
    ...TOOLTIP_STYLE,
  },
  animation: true,
  animationDuration: 700,
  animationEasing: 'cubicOut',
};

const AXIS_X = (xValues) => ({
  type: 'category',
  data: xValues,
  axisLabel: { rotate: xValues.length > 8 ? 30 : 0, color: AXIS_LABEL_COLOR, fontSize: 10 },
  axisLine: { lineStyle: { color: AXIS_LINE_COLOR } },
  axisTick: { lineStyle: { color: AXIS_LINE_COLOR } },
  boundaryGap: true,
});

const AXIS_Y = {
  type: 'value',
  axisLabel: { color: AXIS_LABEL_COLOR, fontSize: 10 },
  axisLine: { show: false },
  splitLine: { lineStyle: { color: GRID_LINE, type: 'dashed' } },
};

const LEGEND_BASE = {
  icon: 'roundRect',
  textStyle: { color: AXIS_LABEL_COLOR, fontSize: 11 },
  itemWidth: 12,
  itemHeight: 8,
  bottom: 0,
};

function gradColor(hex) {
  return {
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [{ offset: 0, color: `${hex}cc` }, { offset: 1, color: `${hex}22` }],
  };
}

function buildBarOption(data, config) {
  const { xValues, groups, series } = config.groupKey
    ? pivotData(data, config.x, config.y, config.groupKey)
    : { xValues: data.map(r => r[config.x]), groups: [null], series: { [null]: data.map(r => Number(r[config.y])) } };

  return {
    ...COMMON_THEME,
    title: config.title ? { text: config.title, left: 'center', textStyle: { fontSize: 13, fontWeight: 700, color: '#0f172a' } } : undefined,
    legend: { ...LEGEND_BASE, data: groups.filter(g => g !== null) },
    xAxis: AXIS_X(xValues),
    yAxis: AXIS_Y,
    series: groups.map((g, i) => ({
      name: g,
      type: 'bar',
      data: series[g],
      barMaxWidth: 36,
      itemStyle: { borderRadius: [5, 5, 0, 0], color: gradColor(CHART_COLORS[i % CHART_COLORS.length]) },
    })),
  };
}

function buildLineOption(data, config) {
  const { xValues, groups, series } = config.groupKey
    ? pivotData(data, config.x, config.y, config.groupKey)
    : { xValues: data.map(r => r[config.x]), groups: [null], series: { [null]: data.map(r => Number(r[config.y])) } };

  return {
    ...COMMON_THEME,
    title: config.title ? { text: config.title, left: 'center', textStyle: { fontSize: 13, fontWeight: 700, color: '#0f172a' } } : undefined,
    legend: { ...LEGEND_BASE, data: groups.filter(g => g !== null) },
    xAxis: { ...AXIS_X(xValues), boundaryGap: false },
    yAxis: AXIS_Y,
    series: groups.map((g, i) => ({
      name: g,
      type: 'line',
      data: series[g],
      smooth: true,
      lineStyle: { width: 2.5, color: CHART_COLORS[i % CHART_COLORS.length] },
      itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length], borderWidth: 2, borderColor: '#fff' },
      symbolSize: 5,
    })),
  };
}

function buildPieOption(data, config) {
  const yKey = config.y;
  return {
    ...COMMON_THEME,
    title: config.title ? { text: config.title, left: 'center', textStyle: { fontSize: 13, fontWeight: 700, color: '#0f172a' } } : undefined,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', ...TOOLTIP_STYLE },
    legend: { ...LEGEND_BASE, orient: 'vertical', left: 'left', bottom: 'auto', top: 'middle' },
    series: [{
      type: 'pie',
      radius: ['0%', '60%'],
      data: data.map(row => ({ name: row[config.x], value: Number(row[yKey]) })),
      label: { fontSize: 11, color: AXIS_LABEL_COLOR },
      itemStyle: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)' },
      emphasis: { itemStyle: { shadowBlur: 16, shadowColor: 'rgba(96,165,250,0.3)' } },
    }],
  };
}

function buildAreaOption(data, config) {
  const { xValues, groups, series } = config.groupKey
    ? pivotData(data, config.x, config.y, config.groupKey)
    : { xValues: data.map(r => r[config.x]), groups: [null], series: { [null]: data.map(r => Number(r[config.y])) } };

  return {
    ...COMMON_THEME,
    title: config.title ? { text: config.title, left: 'center', textStyle: { fontSize: 13, fontWeight: 700, color: '#0f172a' } } : undefined,
    legend: { ...LEGEND_BASE, data: groups.filter(g => g !== null) },
    xAxis: { ...AXIS_X(xValues), boundaryGap: false },
    yAxis: AXIS_Y,
    series: groups.map((g, i) => ({
      name: g,
      type: 'line',
      data: series[g],
      smooth: true,
      lineStyle: { width: 2.5, color: CHART_COLORS[i % CHART_COLORS.length] },
      itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: `${CHART_COLORS[i % CHART_COLORS.length]}44` }, { offset: 1, color: `${CHART_COLORS[i % CHART_COLORS.length]}06` }] },
      },
      symbolSize: 5,
    })),
  };
}

function buildStackedBarOption(data, config) {
  const { xValues, groups, series } = config.groupKey
    ? pivotData(data, config.x, config.y, config.groupKey)
    : { xValues: data.map(r => r[config.x]), groups: [null], series: { [null]: data.map(r => Number(r[config.y])) } };

  return {
    ...COMMON_THEME,
    title: config.title ? { text: config.title, left: 'center', textStyle: { fontSize: 13, fontWeight: 700, color: '#0f172a' } } : undefined,
    legend: { ...LEGEND_BASE, data: groups.filter(g => g !== null) },
    xAxis: AXIS_X(xValues),
    yAxis: AXIS_Y,
    series: groups.map((g, i) => ({
      name: g,
      type: 'bar',
      stack: 'total',
      data: series[g],
      barMaxWidth: 40,
      itemStyle: {
        color: CHART_COLORS[i % CHART_COLORS.length],
        borderRadius: i === groups.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0],
      },
    })),
  };
}

function buildScatterOption(data, config) {
  const xKey = config.x;
  const yKey = config.y;
  const groups = config.groupKey ? [...new Set(data.map(r => String(r[config.groupKey])))] : [null];

  const seriesData = groups.map(g => {
    const filtered = g === null ? data : data.filter(r => String(r[config.groupKey]) === g);
    return {
      name: g,
      type: 'scatter',
      data: filtered.map(r => [Number(r[xKey]), Number(r[yKey])]),
    };
  });

  return {
    ...COMMON_THEME,
    title: { text: config.title || '', left: 'center' },
    legend: { data: groups.filter(g => g !== null), bottom: 0 },
    xAxis: { type: 'value', name: xKey },
    yAxis: { type: 'value', name: yKey },
    series: seriesData,
  };
}

function buildDonutOption(data, config) {
  const yKey = config.y;
  return {
    ...COMMON_THEME,
    title: config.title ? { text: config.title, left: 'center', textStyle: { fontSize: 13, fontWeight: 700, color: '#0f172a' } } : undefined,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', ...TOOLTIP_STYLE },
    legend: { ...LEGEND_BASE, orient: 'vertical', left: 'left', bottom: 'auto', top: 'middle' },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      data: data.map(row => ({ name: row[config.x], value: Number(row[yKey]) })),
      label: { fontSize: 11, color: AXIS_LABEL_COLOR },
      itemStyle: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.95)' },
      emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(96,165,250,0.35)' } },
    }],
  };
}

function buildTreemapOption(data, config) {
  const xKey = config.x;
  const yKey = config.y;
  const treeData = data.map(row => ({
    name: String(row[xKey]),
    value: Number(row[yKey]) || 0,
  }));

  return {
    ...COMMON_THEME,
    title: { text: config.title || '', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [{
      type: 'treemap',
      data: treeData,
      label: { show: true, formatter: '{b}' },
    }],
  };
}

function buildHeatmapOption(data, config) {
  const xKey = config.x;
  const groupKey = config.groupKey;
  const yKey = config.y;

  const xValues = [...new Set(data.map(r => String(r[xKey])))].sort();
  const yValues = groupKey
    ? [...new Set(data.map(r => String(r[groupKey])))].sort()
    : [...new Set(data.filter(r => r[yKey] !== undefined && r[yKey] !== null).map(r => String(r[yKey])))].sort();

  const dataPoints = data.map(r => [
    xValues.indexOf(String(r[xKey])),
    yValues.indexOf(String(groupKey ? r[groupKey] : r[yKey])),
    Number(r[yKey]) || 0,
  ]);

  return {
    ...COMMON_THEME,
    title: { text: config.title || '', left: 'center' },
    tooltip: { position: 'top' },
    xAxis: { type: 'category', data: xValues, axisLabel: { rotate: xValues.length > 8 ? 30 : 0 } },
    yAxis: { type: 'category', data: yValues },
    visualMap: { min: 0, max: Math.max(...dataPoints.map(d => d[2])), calculable: true, orient: 'vertical', right: 0, bottom: 100 },
    series: [{ type: 'heatmap', data: dataPoints, label: { show: true } }],
  };
}

const chartBuilders = {
  bar: buildBarOption,
  line: buildLineOption,
  pie: buildPieOption,
  area: buildAreaOption,
  stacked_bar: buildStackedBarOption,
  scatter: buildScatterOption,
  donut: buildDonutOption,
  treemap: buildTreemapOption,
  heatmap: buildHeatmapOption,
};

function buildChartOption(data, chartConfig) {
  if (!data || data.length === 0) {
    return { title: { text: '데이터 없음' } };
  }

  const config = resolveChartConfig(data, chartConfig);
  const type = config.type || 'bar';

  const builder = chartBuilders[type];
  if (builder) {
    try {
      return builder(data, config);
    } catch (e) {
      console.warn('Chart builder error:', e);
    }
  }

  return buildBarOption(data, config);
}

function ChartRenderer({ data, chartConfig }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: '20px' }}>데이터가 없습니다</div>;
  }

  let option;
  try {
    option = buildChartOption(data, chartConfig);
  } catch {
    const columns = Object.keys(data[0]);
    option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.map(r => r[columns[0]]) },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: data.map(r => r[columns[1]]) }],
    };
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default ChartRenderer;