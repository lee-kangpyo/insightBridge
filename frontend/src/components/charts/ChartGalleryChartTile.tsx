import React from 'react';
import UniversalChart from './UniversalChart';

export interface ChartGalleryChartTileProps {
  chartId: string;
  chartType: string;
  title: string;
  data: any;
  config: {
    title?: string;
    xAxisName?: string;
    yAxisName?: string;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    titlePosition?: 'left' | 'center' | 'right';
  };
  onChartClick?: (chartId: string) => void;
  isLoading?: boolean;
  animationDelay?: number;
}

function ChartGalleryChartTile({
  chartId,
  chartType,
  title,
  data,
  config,
  onChartClick,
  isLoading,
  animationDelay = 0,
}: ChartGalleryChartTileProps) {
  const handleClick = () => {
    onChartClick?.(chartId);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/50 bg-white/50 backdrop-blur-xl p-4 flex flex-col shadow-lg shadow-black/5">
        <div className="h-5 bg-white/70 rounded-lg animate-pulse mb-3 w-2/3" />
        <div className="flex-1 min-h-[300px] bg-white/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="animate-chart-tile-in rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-4 flex flex-col cursor-pointer shadow-lg shadow-black/5 hover:bg-white/70 hover:shadow-xl hover:shadow-sky-500/10 hover:border-white/70 transition-all duration-300"
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={handleClick}
    >
      <div className="text-sm font-semibold text-on-surface mb-3 truncate">
        {title}
      </div>
      <div className="flex-1 min-h-[300px]">
        <UniversalChart chartType={chartType} data={data} config={config} />
      </div>
    </div>
  );
}

export default ChartGalleryChartTile;
