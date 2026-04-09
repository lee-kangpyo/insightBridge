export default function AdmissionKPICards({ kpiCards }) {
  if (!kpiCards?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 max-w-[1600px] mx-auto">
      {kpiCards.map((card) => (
        <div
          key={card.id}
          className="bg-surface-container-lowest p-6 rounded-lg shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-b-2 border-transparent hover:border-secondary transition-all"
        >
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            {card.label}
          </p>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-extrabold text-primary font-headline tracking-tighter">
              {card.value}
            </span>
            <span className="text-sm font-semibold text-slate-400">{card.unit}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium">
              <span className="text-slate-400">권역 평균</span>
              <span className="text-primary">{card.regionalAvg}</span>
            </div>
            <div className="flex justify-between text-[10px] font-medium">
              <span className="text-slate-400">국가 평균</span>
              <span className="text-primary">{card.nationalAvg}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}