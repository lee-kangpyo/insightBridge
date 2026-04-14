import ReactECharts from 'echarts-for-react';

/**
 * Returns the first column whose values are all numeric (number or numeric string).
 */
function findFirstNumericColumn(data, columns) {
  for (const col of columns) {
    const vals = data.map((r) => r[col]);
    if (vals.every((v) => v !== null && v !== undefined && !isNaN(Number(v)))) {
      return col;
    }
  }
  return columns[columns.length - 1]; // absolute last resort
}

/**
 * Builds an ECharts option object from chart_config + data.
 * - chart_config.y can be a single column name OR comma-separated list for multi-series.
 * - Falls back to first-numeric column if config is missing / column not found.
 */
function buildChartOption(data, chartConfig) {
  const columns = Object.keys(data[0]);

  // --- Resolve axis column names ---
  let xKey = columns[0];
  let chartType = 'bar';
  let title = '';
  let yKeys = [findFirstNumericColumn(data, columns.slice(1))]; // default: first numeric col

  if (chartConfig && typeof chartConfig === 'object' && chartConfig.type) {
    chartType = chartConfig.type;
    if (chartConfig.title) title = chartConfig.title;

    // x
    if (chartConfig.x && columns.includes(chartConfig.x)) xKey = chartConfig.x;

    // y — supports comma-separated multi-series: "enrolled_students,dropout_total"
    if (chartConfig.y) {
      const requested = String(chartConfig.y)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => columns.includes(s));
      if (requested.length > 0) yKeys = requested;
    }
  }

  // --- PIE chart (single series only) ---
  if (chartType === 'pie') {
    const yKey = yKeys[0];
    return {
      title: { text: title, left: 'center' },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: data.map((row) => ({ name: row[xKey], value: Number(row[yKey]) })),
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' },
          },
        },
      ],
    };
  }

  // --- LINE / BAR / HEATMAP (multi-series supported) ---
  const seriesType = ['line', 'bar', 'heatmap'].includes(chartType) ? chartType : 'bar';

  // If two series with very different scales, use dual Y axis
  const useDualAxis = yKeys.length === 2 && (() => {
    const vals0 = data.map((r) => Number(r[yKeys[0]])).filter((v) => !isNaN(v));
    const vals1 = data.map((r) => Number(r[yKeys[1]])).filter((v) => !isNaN(v));
    const max0 = Math.max(...vals0);
    const max1 = Math.max(...vals1);
    return max0 > 0 && max1 > 0 && (max0 / max1 > 10 || max1 / max0 > 10);
  })();

  const series = yKeys.map((yKey, i) => ({
    name: yKey,
    type: seriesType,
    yAxisIndex: useDualAxis ? i : 0,
    data: data.map((row) => Number(row[yKey])),
    smooth: seriesType === 'line',
  }));

  const yAxisDef = useDualAxis
    ? [
        { type: 'value', name: yKeys[0], position: 'left' },
        { type: 'value', name: yKeys[1], position: 'right' },
      ]
    : [{ type: 'value' }];

  return {
    title: { text: title },
    tooltip: { trigger: 'axis' },
    legend: yKeys.length > 1 ? { data: yKeys } : undefined,
    xAxis: {
      type: 'category',
      data: data.map((row) => row[xKey]),
      axisLabel: { rotate: data.length > 12 ? 30 : 0 },
    },
    yAxis: yAxisDef,
    series,
  };
}

function ChartRenderer({ data, chartConfig }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: '20px' }}>데이터가 없습니다</div>;
  }

  let option;
  try {
    option = buildChartOption(data, chartConfig);
  } catch {
    // Absolute last-resort fallback
    const columns = Object.keys(data[0]);
    option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.map((row) => row[columns[0]]) },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: data.map((row) => row[columns[1]]) }],
    };
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactECharts option={option} style={{ height: '100%' }} />
    </div>
  );
}

export default ChartRenderer;
