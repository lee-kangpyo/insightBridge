import { useState, useMemo } from 'react';
import ChartTypeFilter, { ChartFilterType } from '../../components/charts/ChartTypeFilter';
import ChartGalleryChartTile from '../../components/charts/ChartGalleryChartTile';
import ChartConfigModal from '../../components/charts/ChartConfigModal';
import { chartMetadata } from '../../components/charts/chartMetadata';
import { ChartConfig, chartConfigs } from '../../configs/charts/index';
import chartMockData, {
  BarColumnData,
  StackedBarColumnData,
  LineAreaData,
  PieDonutRoseDataItem,
  ScatterBubbleData,
  HeatmapGridData,
  RadarData,
  CandlestickData,
  TreemapDataItem,
  GaugeData,
  CalendarHeatmapData,
  WaterfallData,
  PopulationPyramidData,
} from '../../data/chartMockData';
import { streamgraphData } from '../../data/chartMockData';

type ChartMockDataKey = 'barColumn' | 'stackedBarColumn' | 'lineArea' | 'streamgraph' | 'pieDonutRose' | 'scatterBubble' | 'heatmapGrid' | 'radar' | 'candlestick' | 'treemap' | 'gauge' | 'calendarHeatmap' | 'waterfall' | 'populationPyramid' | 'histogram';

type ChartMockDataValue =
  | BarColumnData
  | StackedBarColumnData
  | LineAreaData
  | typeof streamgraphData
  | PieDonutRoseDataItem[]
  | ScatterBubbleData
  | HeatmapGridData
  | RadarData
  | CandlestickData
  | TreemapDataItem[]
  | GaugeData
  | CalendarHeatmapData
  | WaterfallData
  | PopulationPyramidData
  | BarColumnData;

type ChartMockData = Record<ChartMockDataKey, ChartMockDataValue>;

const typeToDataKey: Record<string, ChartMockDataKey | undefined> = {
  column: 'barColumn',
  stacked_bar: 'stackedBarColumn',
  horizontal_bar: 'barColumn',
  line_multi: 'lineArea',
  stacked_column: 'stackedBarColumn',
  line_dots: 'lineArea',
  area: 'lineArea',
  area_stacked: 'lineArea',
  streamgraph: 'streamgraph',
  scatter: 'scatterBubble',
  bubble: 'scatterBubble',
  heatmap_grid: 'heatmapGrid',
  treemap: 'treemap',
  waterfall: 'waterfall',
  calendar_heatmap: 'calendarHeatmap',
  population_pyramid: 'populationPyramid',
  pie: 'pieDonutRose',
  donut: 'pieDonutRose',
  nightingale_rose: 'pieDonutRose',
  radar: 'radar',
  histogram: 'histogram',
};

export interface ChartGalleryChartConfig {
  chartType: string;
  title: string;
  xAxisName: string;
  yAxisName: string;
  titlePosition: 'left' | 'center' | 'right';
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
}

export default function ChartGallery() {
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localChartConfigs, setLocalChartConfigs] = useState<ChartConfig[]>(
    chartConfigs.map((c) => ({ ...c }))
  );
  const [filterState, setFilterState] = useState<ChartFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const chartsWithData = useMemo(() => {
    return chartMetadata.map((metadata) => {
      const config = localChartConfigs.find((c) => c.chartType === metadata.type);
      const dataKey = typeToDataKey[metadata.type];
      const data = dataKey ? chartMockData[dataKey] : {};
      return {
        ...metadata,
        config: config
          ? {
              title: config.title,
              xAxisName: config.xAxisName,
              yAxisName: config.yAxisName,
              titlePosition: config.titlePosition,
              legendPosition: config.legendPosition,
            }
          : {},
        data,
      };
    });
  }, [localChartConfigs]);

  const filteredCharts = useMemo(() => {
    return chartsWithData.filter((chart) => {
      const matchesFilter = filterState === 'all' || chart.category === filterState;
      const matchesSearch =
        searchTerm === '' ||
        chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chart.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [chartsWithData, filterState, searchTerm]);

  const selectedChart = useMemo(() => {
    if (!selectedChartId) return null;
    return chartsWithData.find((c) => c.type === selectedChartId);
  }, [selectedChartId, chartsWithData]);

  const selectedChartConfig = useMemo((): ChartGalleryChartConfig | null => {
    if (!selectedChart) return null;
    return {
      chartType: selectedChart.type,
      title: selectedChart.config.title || '',
      xAxisName: selectedChart.config.xAxisName || '',
      yAxisName: selectedChart.config.yAxisName || '',
      titlePosition: selectedChart.config.titlePosition || 'center',
      legendPosition: selectedChart.config.legendPosition || 'bottom',
    };
  }, [selectedChart]);

  const handleChartClick = (chartId: string) => {
    setSelectedChartId(chartId);
    setIsModalOpen(true);
  };

  const handleSave = (config: ChartGalleryChartConfig) => {
    setLocalChartConfigs((prev) =>
      prev.map((c) =>
        c.chartType === config.chartType
          ? {
              ...c,
              title: config.title,
              xAxisName: config.xAxisName,
              yAxisName: config.yAxisName,
              titlePosition: config.titlePosition,
              legendPosition: config.legendPosition,
            }
          : c
      )
    );
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedChartId(null);
  };

  return (
    <div className="relative w-full min-h-full overflow-hidden">
      {/* Glassmorphism depth: gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-sky-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-900/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[320px] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 right-1/4 h-[200px] w-[200px] rounded-full bg-sky-300/20 blur-2xl" />

      <div className="relative z-10 max-w-[1600px] mx-auto w-full flex flex-col gap-6 min-h-0">
        <div>
          <h1 className="font-headline text-2xl font-semibold text-on-surface">차트 갤러리</h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <ChartTypeFilter selectedFilter={filterState} onFilterChange={setFilterState} />
          <input
            type="text"
            placeholder="차트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 backdrop-blur-sm focus:border-secondary/50 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-secondary/20 md:w-64 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCharts.map((chart, index) => (
            <ChartGalleryChartTile
              key={chart.type}
              chartId={chart.type}
              chartType={chart.type}
              title={chart.name}
              data={chart.data}
              config={chart.config}
              onChartClick={handleChartClick}
              animationDelay={index * 40}
            />
          ))}
        </div>

        {filteredCharts.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl opacity-40">search_off</span>
            <span className="text-sm">검색 결과가 없습니다.</span>
          </div>
        )}

        {selectedChartConfig && (
          <ChartConfigModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            chartConfig={selectedChartConfig}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
