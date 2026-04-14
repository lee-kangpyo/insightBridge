import { AnimatedPercentBarFill } from "../common/AnimatedPercentBarFill";
import EmptyState from "../common/EmptyState";
import {
  formatBarRatioNumPercent,
  parseBarRatioDisplayTextPercent,
} from "../../utils/parseBarRatioDisplayTextPercent";

export default function OpportunityBalanceChart({ title, subtitle, opportunityBalance }) {
  const rows = Array.isArray(opportunityBalance) ? opportunityBalance : [];

  return (
    <div className="bg-surface-container-low p-8 rounded-lg">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="font-headline text-lg font-bold text-primary">
            {title || "기회균형 선발 구성"}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-on-surface-variant">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex bg-white rounded-lg p-1">
          <button className="px-3 py-1 text-[10px] font-bold bg-secondary text-white rounded-md">
            구성비
          </button>
          <button className="px-3 py-1 text-[10px] font-bold text-slate-400 rounded-md">
            인원수
          </button>
        </div>
      </div>
      {rows.length ? (
        <div className="flex flex-col h-[200px] justify-between">
          {rows.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-600 w-24">{item.category}</span>
              <div className="flex-1 h-8 bg-surface-container rounded-lg overflow-hidden flex flex-row min-w-0">
                <AnimatedPercentBarFill
                  percent={parseBarRatioDisplayTextPercent(item.bar_ratio_display_text)}
                  className="h-full shrink-0 bg-primary"
                />
                <div className="h-full min-w-0 flex-1 bg-secondary opacity-20" />
              </div>
              <span className="text-xs font-bold text-primary min-w-[3rem] text-right">
                {formatBarRatioNumPercent(item.bar_ratio_num)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="미공시"
          description="기회균형 선발 구성 데이터가 미공시입니다."
          minHeight={240}
          icon="view_timeline"
        />
      )}
    </div>
  );
}
