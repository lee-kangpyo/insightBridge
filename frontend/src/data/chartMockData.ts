interface BarColumnData {
  categories: string[];
  values: number[];
}

interface StackedBarColumnData {
  categories: string[];
  series: { data: number[]; name: string }[];
}

interface LineAreaData {
  categories: string[];
  series: { data: number[]; name: string }[];
}

interface PieDonutRoseDataItem {
  name: string;
  value: number;
}

type ScatterBubbleData = [number, number, number][];

export type HeatmapGridRow = [number, number, number];

/** 배열 단독 또는 축 라벨을 포함한 객체 — 갤러리에서 축 이름·눈금이 보이도록 사용 */
export type HeatmapGridData =
  | HeatmapGridRow[]
  | {
      values: HeatmapGridRow[];
      xAxis?: { data: string[] };
      yAxis?: { data: string[] };
    };

interface RadarData {
  indicator: { name: string; max: number }[];
  series: number[];
}

type CandlestickData = [number, number, number, number][];

interface TreemapDataItem {
  name: string;
  value?: number;
  children?: TreemapDataItem[];
}

interface GaugeData {
  value: number;
}

type CalendarHeatmapData = [string, number][];

interface WaterfallData {
  categories: string[];
  positive: number[];
  negative: number[];
}

interface PopulationPyramidData {
  left: number[];
  right: number[];
  ageGroups: string[];
}

export const histogramData: BarColumnData = {
  categories: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'],
  values: [5, 8, 15, 25, 45, 60, 45, 25, 15, 8],
};

export const barColumnData: BarColumnData = {
  categories: ['A', 'B', 'C', 'D'],
  values: [10, 20, 30, 40],
};

export const stackedBarColumnData: StackedBarColumnData = {
  categories: ['A', 'B', 'C', 'D'],
  series: [
    { name: 'Series 1', data: [30, 40, 50, 60] },
    { name: 'Series 2', data: [20, 30, 40, 50] },
    { name: 'Series 3', data: [10, 20, 30, 40] },
  ],
};

export const lineAreaData: LineAreaData = {
  categories: ['1월', '2월', '3월', '4월'],
  series: [
    { name: '매출', data: [100, 120, 130, 150] },
    { name: '비용', data: [80, 90, 100, 110] },
    { name: '이익', data: [60, 70, 80, 95] },
  ],
};

export const streamgraphData: { categories: string[]; series: { name: string; data: number[] }[] } = {
  categories: ['2015/11/08', '2015/11/09', '2015/11/10', '2015/11/11', '2015/11/12', '2015/11/13', '2015/11/14', '2015/11/15', '2015/11/16', '2015/11/17', '2015/11/18', '2015/11/19', '2015/11/20', '2015/11/21', '2015/11/22', '2015/11/23', '2015/11/24', '2015/11/25', '2015/11/26', '2015/11/27', '2015/11/28'],
  series: [
    { name: 'DQ', data: [10, 15, 35, 38, 22, 16, 7, 2, 17, 33, 40, 32, 26, 35, 40, 32, 26, 22, 16, 22, 10] },
    { name: 'TY', data: [35, 36, 37, 22, 24, 26, 34, 21, 18, 45, 32, 35, 30, 28, 27, 26, 15, 30, 35, 42, 42] },
    { name: 'SS', data: [21, 25, 27, 23, 24, 21, 35, 39, 40, 36, 33, 43, 40, 34, 28, 26, 37, 41, 46, 47, 41] },
  ],
};

export const pieDonutRoseData: PieDonutRoseDataItem[] = [
  { name: 'A', value: 30 },
  { name: 'B', value: 50 },
  { name: 'C', value: 20 },
];

export const scatterBubbleData: ScatterBubbleData = [
  [10, 20, 15],
  [30, 40, 45],
  [50, 30, 25],
  [70, 80, 90],
  [90, 60, 55],
  [25, 55, 35],
  [60, 15, 70],
  [85, 35, 40],
  [40, 70, 30],
  [15, 45, 85],
];

export const heatmapGridData: HeatmapGridData = {
  xAxis: { data: ['월', '화', '수'] },
  yAxis: { data: ['오전', '점심', '저녁'] },
  values: [
    [0, 0, 5],
    [0, 1, 10],
    [0, 2, 15],
    [1, 0, 8],
    [1, 1, 12],
    [1, 2, 7],
    [2, 0, 3],
    [2, 1, 6],
    [2, 2, 9],
  ],
};

export const radarData: RadarData = {
  indicator: [
    { name: '영업', max: 100 },
    { name: '마케팅', max: 100 },
    { name: '개발', max: 100 },
    { name: '디자인', max: 100 },
    { name: '고객지원', max: 100 },
    { name: '재무', max: 100 },
  ],
  series: [
    { name: '2024년', data: [85, 72, 90, 68, 78, 82] },
    { name: '2025년', data: [92, 88, 95, 75, 85, 90] },
  ],
};

export const candlestickData: CandlestickData = [
  [20, 30, 15, 35],
  [25, 35, 20, 40],
  [30, 38, 28, 42],
  [35, 42, 30, 48],
];

export const treemapData: TreemapDataItem[] = [
  { name: '음악', value: 120, children: [
    { name: 'K-POP', value: 45 },
    { name: 'POP', value: 35 },
    { name: 'Hip-Hop', value: 25 },
    { name: '클래식', value: 15 },
  ]},
  { name: '영화', value: 95, children: [
    { name: '액션', value: 30 },
    { name: '코미디', value: 25 },
    { name: '드라마', value: 22 },
    { name: 'SF', value: 18 },
  ]},
  { name: '게임', value: 80, children: [
    { name: 'RPG', value: 28 },
    { name: 'FPS', value: 22 },
    { name: '전략', value: 18 },
    { name: '스포츠', value: 12 },
  ]},
  { name: '도서', value: 55, children: [
    { name: '소설', value: 20 },
    { name: '논픽션', value: 18 },
    { name: '만화', value: 12 },
    { name: '시', value: 5 },
  ]},
  { name: '스포츠', value: 40, children: [
    { name: '축구', value: 15 },
    { name: '야구', value: 12 },
    { name: '농구', value: 8 },
    { name: '배드민턴', value: 5 },
  ]},
];

export const gaugeData: GaugeData = { value: 80 };

export const calendarHeatmapData: CalendarHeatmapData = [
  ['2024-01-01', 12], ['2024-01-02', 8], ['2024-01-03', 15], ['2024-01-04', 22], ['2024-01-05', 18],
  ['2024-01-06', 5], ['2024-01-07', 10], ['2024-01-08', 14], ['2024-01-09', 20], ['2024-01-10', 16],
  ['2024-01-11', 8], ['2024-01-12', 5], ['2024-01-13', 12], ['2024-01-14', 18], ['2024-01-15', 25],
  ['2024-01-16', 30], ['2024-01-17', 22], ['2024-01-18', 15], ['2024-01-19', 10], ['2024-01-20', 8],
  ['2024-01-21', 14], ['2024-01-22', 20], ['2024-01-23', 18], ['2024-01-24', 12], ['2024-01-25', 15],
  ['2024-01-26', 22], ['2024-01-27', 28], ['2024-01-28', 25], ['2024-01-29', 18], ['2024-01-30', 14],
  ['2024-01-31', 10],
];

export const waterfallData: WaterfallData = {
  categories: ['매출', '비용', '광고', '인건비', '기타', '이익'],
  positive: [500, 200, 80, 0, 50, 330],
  negative: [0, -150, -30, -200, -70, 0],
};

export const populationPyramidData: PopulationPyramidData = {
  left: [30, 25, 20, 15, 10],
  right: [28, 22, 18, 12, 8],
  ageGroups: ['0-9', '10-19', '20-29', '30-39', '40-49'],
};

interface ChartMockData {
  barColumn: BarColumnData;
  stackedBarColumn: StackedBarColumnData;
  lineArea: LineAreaData;
  streamgraph: { categories: string[]; series: { name: string; data: number[] }[] };
  pieDonutRose: PieDonutRoseDataItem[];
  scatterBubble: ScatterBubbleData;
  heatmapGrid: HeatmapGridData;
  radar: RadarData;
  candlestick: CandlestickData;
  treemap: TreemapDataItem[];
  gauge: GaugeData;
  calendarHeatmap: CalendarHeatmapData;
  waterfall: WaterfallData;
  populationPyramid: PopulationPyramidData;
  histogram: BarColumnData;
}

const chartMockData: ChartMockData = {
  barColumn: barColumnData,
  stackedBarColumn: stackedBarColumnData,
  lineArea: lineAreaData,
  streamgraph: streamgraphData,
  pieDonutRose: pieDonutRoseData,
  scatterBubble: scatterBubbleData,
  heatmapGrid: heatmapGridData,
  radar: radarData,
  candlestick: candlestickData,
  treemap: treemapData,
  gauge: gaugeData,
  calendarHeatmap: calendarHeatmapData,
  waterfall: waterfallData,
  populationPyramid: populationPyramidData,
  histogram: histogramData,
};

export default chartMockData;