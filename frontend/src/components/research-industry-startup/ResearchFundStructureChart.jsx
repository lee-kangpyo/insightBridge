const sourceColors = {
  '교내': 'bg-primary',
  '중앙정부': 'bg-secondary',
  '지자체/민간': 'bg-secondary-container',
  '외국': 'bg-outline',
};

export default function ResearchFundStructureChart({ fundStructure }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold font-headline text-primary">연구비 재원 구조 (최근 3개년 추이)</h3>
        <div className="flex gap-4 text-xs font-medium">
          {Object.keys(sourceColors).map((source) => (
            <div key={source} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full ${sourceColors[source]}`}></span>
              {source}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-8">
        {fundStructure.map((yearData, index) => (
          <div key={yearData.year} className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span>{yearData.year}년도 집행 현황</span>
              <span className={index === 0 ? 'text-primary' : 'text-on-surface-variant'}>{yearData.total}</span>
            </div>
            <div className={`h-12 flex rounded-full overflow-hidden shadow-inner ${index === 0 ? '' : 'opacity-60'}`}>
              {yearData.sources.map((source) => (
                <div
                  key={source.name}
                  className={`${sourceColors[source.name]}`}
                  style={{ width: `${source.percentage}%` }}
                  title={`${source.name}: ${source.percentage}%`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}