import MaterialIcon from '../MaterialIcon';

export default function StrategicInsightsCard() {
  return (
    <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-high/50 p-6">
      <div className="mb-4 flex items-center gap-3">
        <MaterialIcon name="auto_awesome" className="text-secondary" />
        <h4 className="text-sm font-bold text-primary">전략적 인사이트</h4>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">
        건국대학교(Konkuk University)는 <strong>졸업률</strong> 및 <strong>신입생 충원율</strong>에서 상위
        20% 이내의 강력한 위치를 유지하고 있습니다. 그러나 <strong>장학금</strong> 지원은 61-70 구간에
        머물러 있어, 기관 재투자를 위한 전략적 기회로 작용할 수 있습니다.
      </p>
    </div>
  );
}
