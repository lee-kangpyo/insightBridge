import ChartRenderer from '../ChartRenderer';

export function ChartTile({ data, chartConfig, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-surface-container-low rounded-xl p-5 h-[400px]">
        <div className="w-20 h-4 bg-surface-container-high rounded animate-pulse mb-4" />
        <div className="w-full h-[320px] bg-surface-container-high rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-5">
      <span className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider block mb-4">
        Chart
      </span>
      <div className="h-[320px]">
        <ChartRenderer data={data} chartConfig={chartConfig} />
      </div>
    </div>
  );
}

export default ChartTile;