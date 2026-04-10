/**
 * GET /api/theme/detail-grid 의 items를 대시보드에서 매핑한 shape를 표시합니다.
 * 카드: { id, label, value, unit?, regionalAvg, nationalAvg, accentColorHex?, auxLabel?, auxText? }
 */
export default function ResearchIndustryStartupKPICards({ kpiCards }) {
  if (!kpiCards?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {kpiCards.map((card) => (
        <div
          key={card.id}
          className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border-b-2 border-transparent hover:border-secondary transition-all"
          style={
            card.accentColorHex
              ? { borderBottomColor: card.accentColorHex }
              : undefined
          }
        >
          <p className="text-[0.6875rem] font-label text-secondary mb-2 uppercase tracking-tight">
            {card.label}
          </p>
          <div className="flex items-baseline gap-1 mb-3">
            <span
              className="text-3xl font-bold font-headline text-primary tracking-tighter"
              style={card.accentColorHex ? { color: card.accentColorHex } : undefined}
            >
              {card.value}
            </span>
            {card.unit ? (
              <span className="text-xs text-on-surface-variant font-semibold">{card.unit}</span>
            ) : null}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium">
              <span className="text-outline">권역 평균</span>
              <span className="text-primary">{card.regionalAvg}</span>
            </div>
            <div className="flex justify-between text-[10px] font-medium">
              <span className="text-outline">국가 평균</span>
              <span className="text-primary">{card.nationalAvg}</span>
            </div>
          </div>
          {card.auxText ? (
            <p className="text-[10px] text-outline mt-3 leading-snug">
              {card.auxLabel ? `${card.auxLabel}: ` : ''}
              {card.auxText}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
