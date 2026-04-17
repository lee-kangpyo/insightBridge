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

const COMMON_THEME = {
  tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
  animation: true,
  animationDuration: 300,
};

function buildBarOption(data, config) {
  const { xValues, groups, series } = config.groupKey
    ? pivotData(data, config.x, config.y, config.groupKey)
    : { xValues: data.map(r => r[config.x]), groups: [null], series: { [null]: data.map(r => Number(r[config.y])) } };

  const seriesData = groups.map(g => ({
    name: g,
    type: 'bar',
    data: series[g],
  }));

  return {
    ...COMMON_THEME,
    title: { text: config.title || '', left: 'center' },
    legend: { data: groups.filter(g => g !== null), bottom: 0 },
    xAxis: { type: 'category', data: xValues, axisLabel: { rotate: xValues.length > 8 ? 30 : 0 } },
    yAxis: { type: 'value' },
    series: seriesData,
  };
}

function buildLineOption(data, config) {
  const { xValues, groups, series } = config.groupKey
    ? pivotData(data, config.x, config.y, config.groupKey)
    : { xValues: data.map(r => r[config.x]), groups: [null], series: { [null]: data.map(r => Number(r[config.y])) } };

  const seriesData = groups.map(g => ({
    name: g,
    type: 'line',
    data: series[g],
    smooth: true,
  }));

  return {
    ...COMMON_THEME,
    title: { text: config.title || '', left: 'center' },
    legend: { data: groups.filter(g => g !== null), bottom: 0 },
    xAxis: { type: 'category', data: xValues, axisLabel: { rotate: xValues.length > 8 ? 30 : 0 } },
    yAxis: { type: 'value' },
    series: seriesData,
  };
}

function buildPieOption(data, config) {
  const yKey = config.y;
  return {
    ...COMMON_THEME,
    title: { text: config.title || '', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: data.map(row => ({ name: row[config.x], value: Number(row[yKey]) })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  };
}

function buildAreaOption(data, config) {
  const { xValues, groups, series } = config.groupKey
    ? pivotData(data, config.x, config.y, config.groupKey)
    : { xValues: data.map(r => r[config.x]), groups: [null], series: { [null]: data.map(r => Number(r[config.y])) } };

  const seriesData = groups.map(g => ({
    name: g,
    type: 'line',
    data: series[g],
    smooth: true,
    areaStyle: {},
  }));

  return {
    ...COMMON_THEME,
    title: { text: config.title || '', left: 'center' },
    legend: { data: groups.filter(g => g !== null), bottom: 0 },
    xAxis: { type: 'category', data: xValues, axisLabel: { rotate: xValues.length > 8 ? 30 : 0 } },
    yAxis: { type: 'value' },
    series: seriesData,
  };
}

function buildStackedBarOption(data, config) {
  const { xValues, groups, series } = config.groupKey
    ? pivotData(data, config.x, config.y, config.groupKey)
    : { xValues: data.map(r => r[config.x]), groups: [null], series: { [null]: data.map(r => Number(r[config.y])) } };

  const seriesData = groups.map(g => ({
    name: g,
    type: 'bar',
    stack: 'total',
    data: series[g],
  }));

  return {
    ...COMMON_THEME,
    title: { text: config.title || '', left: 'center' },
    legend: { data: groups.filter(g => g !== null), bottom: 0 },
    xAxis: { type: 'category', data: xValues, axisLabel: { rotate: xValues.length > 8 ? 30 : 0 } },
    yAxis: { type: 'value' },
    series: seriesData,
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
    title: { text: config.title || '', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: data.map(row => ({ name: row[config.x], value: Number(row[yKey]) })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
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