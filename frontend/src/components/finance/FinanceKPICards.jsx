/**
 * GET /api/theme/detail-grid 의 items를 대시보드에서 매핑한 shape를 표시합니다.
 * 카드: { id, label, value, unit?, year?, regionalAvg, nationalAvg, accentColorHex?, auxLabel?, auxText? }
 */
export default function FinanceKPICards({ kpiCards }) {
  if (!kpiCards?.length) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiCards.map((card) => (
        <div
          key={card.id}
          className="bg-surface-container-lowest rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-shadow duration-300 relative"
        >
          <div
            className="w-1.5 shrink-0 bg-primary"
            style={
              card.accentColorHex ? { backgroundColor: card.accentColorHex } : undefined
            }
            aria-hidden
          />
          <div className="p-5 flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-1">
              <span className="text-xs font-bold text-primary uppercase tracking-tight">
                {card.label}
              </span>
              {card.year != null && card.year !== '' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-label shrink-0 bg-primary-fixed text-on-primary-fixed">
                  {card.year}
                </span>
              ) : null}
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span
                className="text-3xl font-extrabold text-secondary font-headline tracking-tighter"
                style={card.accentColorHex ? { color: card.accentColorHex } : undefined}
              >
                {card.value}
              </span>
              {card.unit ? (
                <span className="text-sm font-semibold text-on-surface-variant">{card.unit}</span>
              ) : null}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-medium">
                <span className="text-on-surface-variant">권역 평균</span>
                <span className="text-primary font-semibold">{card.regionalAvg}</span>
              </div>
              <div className="flex justify-between text-[10px] font-medium">
                <span className="text-on-surface-variant">국가 평균</span>
                <span className="text-primary font-semibold">{card.nationalAvg}</span>
              </div>
            </div>
            {card.auxText ? (
              <p className="text-[10px] text-on-surface-variant mt-3 leading-snug">
                {card.auxLabel ? `${card.auxLabel}: ` : ''}
                {card.auxText}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </section>
  );
}
