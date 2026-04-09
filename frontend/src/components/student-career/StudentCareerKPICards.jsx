export default function StudentCareerKPICards({ kpiCards }) {
  if (!kpiCards?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {kpiCards.map((card) => (
        <div
          key={card.id}
          className="bg-surface-container-lowest p-5 rounded-lg border border-transparent hover:border-outline-variant/15 transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-wider">
              {card.label}
            </span>
            <span className="px-2 py-0.5 bg-secondary-fixed/70 text-on-secondary-fixed text-[10px] font-semibold rounded-full">
              {card.year}
            </span>
          </div>
          <div className={`text-3xl font-semibold mb-3 ${card.color === 'secondary' ? 'text-secondary' : 'text-primary'}`}>
            {card.value}<span className="text-base font-medium ml-0.5">{card.unit}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">권역평균</span>
              <span className="font-medium text-slate-600">{card.regionalAvg}{card.unit}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">전국평균</span>
              <span className="font-medium text-slate-600">{card.nationalAvg}{card.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
