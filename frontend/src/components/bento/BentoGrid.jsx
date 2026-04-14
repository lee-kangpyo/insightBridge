import SqlTile from './SqlTile';
import DataTableTile from './DataTableTile';
import ChartTile from './ChartTile';
import { EmptyStateTile, EmptyStateSkeleton } from './EmptyStateTile';

export function BentoGrid({ sql, data, chartConfig, isLoading }) {
  const isEmpty = !isLoading && (!data || data.length === 0);

  if (isEmpty) {
    return (
      <div className="col-span-full">
        <EmptyStateTile
          message="표시할 데이터가 없습니다"
          subtext="다른 키워드로 시도해 보시거나 쿼리를 확인해 주세요"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-5">
        <SqlTile sql={sql} isLoading={isLoading} />
      </div>

      <div className="md:col-span-7">
        <DataTableTile data={data} isLoading={isLoading} />
      </div>

      <div className="md:col-span-12">
        <ChartTile data={data} chartConfig={chartConfig} isLoading={isLoading} />
      </div>
    </div>
  );
}

export function BentoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-5">
        <SqlTile isLoading={true} />
      </div>
      <div className="md:col-span-7">
        <DataTableTile isLoading={true} />
      </div>
      <div className="md:col-span-12">
        <ChartTile isLoading={true} />
      </div>
    </div>
  );
}

export default BentoGrid;