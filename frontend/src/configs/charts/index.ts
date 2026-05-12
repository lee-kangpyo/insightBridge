export interface DefaultSeriesConfig {
  type?: string;
  stack?: string;
  smooth?: boolean;
  areaStyle?: { color?: string; opacity?: number } | null;
  symbol?: string;
  symbolSize?: number;
}

export interface ChartConfig {
  chartType: string;
  title: string;
  xAxisName: string;
  yAxisName: string;
  titlePosition: 'left' | 'center' | 'right';
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  defaultSeriesConfig: DefaultSeriesConfig;
}

export const chartConfigs: ChartConfig[] = [
  {
    chartType: 'column',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'bar' },
  },
  {
    chartType: 'stacked_bar',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'bar', stack: 'total' },
  },
  {
    chartType: 'horizontal_bar',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'bar' },
  },
  {
    chartType: 'line_multi',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'line', smooth: true },
  },
  {
    chartType: 'stacked_column',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'bar', stack: 'total' },
  },
  {
    chartType: 'line_dots',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'line', smooth: true, symbol: 'circle', symbolSize: 8 },
  },
  {
    chartType: 'area',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'line', smooth: true, areaStyle: {} },
  },
  {
    chartType: 'area_stacked',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'line', smooth: true, stack: 'total', areaStyle: {} },
  },
  {
    chartType: 'streamgraph',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'line', smooth: true, stack: 'total', areaStyle: {} },
  },
  {
    chartType: 'scatter',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'scatter' },
  },
  {
    chartType: 'heatmap_grid',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'right',
    defaultSeriesConfig: { type: 'heatmap' },
  },
  {
    chartType: 'treemap',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'treemap' },
  },
  {
    chartType: 'waterfall',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'bar' },
  },
  {
    chartType: 'calendar_heatmap',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'right',
    defaultSeriesConfig: { type: 'heatmap' },
  },
  {
    chartType: 'population_pyramid',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'bar' },
  },
  {
    chartType: 'pie',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'right',
    defaultSeriesConfig: { type: 'pie' },
  },
  {
    chartType: 'donut',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'right',
    defaultSeriesConfig: { type: 'pie' },
  },
  {
    chartType: 'nightingale_rose',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'right',
    defaultSeriesConfig: { type: 'pie' },
  },
  {
    chartType: 'radar',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'radar' },
  },
  {
    chartType: 'histogram',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'bar' },
  },
  {
    chartType: 'bubble',
    title: '',
    xAxisName: '',
    yAxisName: '',
    titlePosition: 'center',
    legendPosition: 'bottom',
    defaultSeriesConfig: { type: 'scatter', symbolSize: 20 },
  },
];

export const getChartConfig = (chartType: string): ChartConfig | undefined => {
  return chartConfigs.find(config => config.chartType === chartType);
};
