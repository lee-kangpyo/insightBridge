import MaterialIcon from '../MaterialIcon';

function HeatmapCellStack({ children }) {
  return <div className="flex flex-col-reverse gap-1">{children}</div>;
}

function RankMarker({ rank }) {
  return (
    <div className="relative flex-1 rounded-sm bg-secondary/90">
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-sm border-2 border-primary bg-primary/10 shadow-[0_0_10px_rgba(0,32,69,0.3)]">
        <span className="text-[10px] font-black text-primary">#{rank}</span>
      </div>
    </div>
  );
}

export default function RankingHeatmapCard() {
  const noop = (e) => {
    e.preventDefault();
  };

  return (
    <div className="col-span-12 rounded-2xl bg-surface-container-lowest p-6 transition-all lg:col-span-9 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between lg:flex-row">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-primary">지표별 순위 분포</h3>
          <p className="text-sm text-slate-500">건국대학교의 성과 구간별 위치</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md p-2 transition-colors hover:bg-surface-container"
            title="다운로드 (준비 중)"
            onClick={noop}
          >
            <MaterialIcon name="download" className="text-slate-500" />
          </button>
          <button
            type="button"
            className="rounded-md p-2 transition-colors hover:bg-surface-container"
            title="전체 화면 (준비 중)"
            onClick={noop}
          >
            <MaterialIcon name="fullscreen" className="text-slate-500" />
          </button>
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <div className="grid min-w-[520px] grid-cols-[100px_1fr] gap-6">
          <div className="flex flex-col-reverse justify-between border-r border-slate-100 py-6 pr-2 text-right">
            {['91-100', '81-90', '71-80', '61-70', '51-60', '41-50', '31-40', '21-30', '11-20', '1-10'].map(
              (label) => (
                <span key={label} className="text-xs font-bold text-slate-400">
                  {label}
                </span>
              ),
            )}
            <span className="mt-2 text-[10px] font-black uppercase text-slate-300">순위 구간</span>
          </div>
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-4 gap-4 px-2">
              {['졸업률', '취업률', '장학금', '신입생 충원율'].map((label) => (
                <span key={label} className="text-center text-sm font-bold text-slate-700">
                  {label}
                </span>
              ))}
            </div>
            <div className="grid h-[400px] grid-cols-4 gap-4">
              <HeatmapCellStack>
                <div className="flex-1 rounded-sm bg-secondary/5" />
                <div className="flex-1 rounded-sm bg-secondary/10" />
                <div className="flex-1 rounded-sm bg-secondary/15" />
                <div className="flex-1 rounded-sm bg-secondary/20" />
                <div className="flex-1 rounded-sm bg-secondary/30" />
                <div className="flex-1 rounded-sm bg-secondary/40" />
                <div className="flex-1 rounded-sm bg-secondary/60" />
                <div className="flex-1 rounded-sm bg-secondary/80" />
                <RankMarker rank="14" />
                <div className="flex-1 rounded-sm bg-secondary" />
              </HeatmapCellStack>
              <HeatmapCellStack>
                <div className="flex-1 rounded-sm bg-secondary/5" />
                <div className="flex-1 rounded-sm bg-secondary/10" />
                <div className="flex-1 rounded-sm bg-secondary/15" />
                <div className="flex-1 rounded-sm bg-secondary/20" />
                <div className="flex-1 rounded-sm bg-secondary/30" />
                <div className="flex-1 rounded-sm bg-secondary/45" />
                <RankMarker rank="38" />
                <div className="flex-1 rounded-sm bg-secondary/80" />
                <div className="flex-1 rounded-sm bg-secondary/90" />
                <div className="flex-1 rounded-sm bg-secondary" />
              </HeatmapCellStack>
              <HeatmapCellStack>
                <div className="flex-1 rounded-sm bg-tertiary-container/5" />
                <div className="flex-1 rounded-sm bg-tertiary-container/10" />
                <div className="flex-1 rounded-sm bg-tertiary-container/20" />
                <RankMarker rank="62" />
                <div className="flex-1 rounded-sm bg-secondary/30" />
                <div className="flex-1 rounded-sm bg-secondary/50" />
                <div className="flex-1 rounded-sm bg-secondary/70" />
                <div className="flex-1 rounded-sm bg-secondary/80" />
                <div className="flex-1 rounded-sm bg-secondary/90" />
                <div className="flex-1 rounded-sm bg-secondary" />
              </HeatmapCellStack>
              <HeatmapCellStack>
                <div className="flex-1 rounded-sm bg-secondary/5" />
                <div className="flex-1 rounded-sm bg-secondary/10" />
                <div className="flex-1 rounded-sm bg-secondary/20" />
                <div className="flex-1 rounded-sm bg-secondary/40" />
                <div className="flex-1 rounded-sm bg-secondary/60" />
                <div className="flex-1 rounded-sm bg-secondary/80" />
                <RankMarker rank="18" />
                <div className="flex-1 rounded-sm bg-secondary" />
                <div className="flex-1 rounded-sm bg-secondary/90" />
                <div className="flex-1 rounded-sm bg-secondary/80" />
              </HeatmapCellStack>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-outline-variant/20 pt-8 lg:mt-12 lg:gap-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-secondary" />
          <span className="text-xs font-semibold text-slate-600">상위 티어 (1-30)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-tertiary-container" />
          <span className="text-xs font-semibold text-slate-600">성장 우선 순위 (61-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm border-2 border-primary bg-primary/10" />
          <span className="text-xs font-semibold text-slate-600">건국대학교 현재 위치</span>
        </div>
        <div className="w-full text-[10px] font-bold italic text-slate-400 lg:ml-auto lg:w-auto">
          *Y축은 순위 백분위 그룹을 나타냅니다 (예: 1-10은 1위에서 10위 사이의 대학을 포함합니다).
        </div>
      </div>
    </div>
  );
}
