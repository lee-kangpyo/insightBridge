import ThemeBarRatioFill from '../common/ThemeBarRatioFill';
import EmptyState from "../common/EmptyState";
import { formatBarRatioNumPercent } from '../../utils/parseBarRatioDisplayTextPercent';

export default function SemesterFullTimeRatioChart({ semesterRatios, title, subtitle }) {
  const heading = title?.trim() ? title : '학기별 전임 강의담당 비율';
  const sub = subtitle?.trim() ? subtitle : '';

  const rows = Array.isArray(semesterRatios) ? semesterRatios : [];

  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10">
      <div className="mb-8">
        <h3 className="text-lg font-headline font-bold text-primary">{heading}</h3>
        {sub ? <p className="mt-1 text-xs text-on-surface-variant">{sub}</p> : null}
      </div>
      {rows.length ? (
        <div className="space-y-10">
          {rows.map(
            ({ semester, ratio, barPercent, bar_ratio_display_text, courses, colorHex }) => (
              <div key={semester} className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>{semester}</span>
                  <span className="text-primary font-bold">
                    {formatBarRatioNumPercent(ratio)}
                  </span>
                </div>
                <ThemeBarRatioFill
                  percent={barPercent}
                  barRatioDisplayText={bar_ratio_display_text}
                  trackClassName="bg-surface-container"
                  fillStyle={colorHex ? { backgroundColor: colorHex } : undefined}
                  fillClassName={colorHex ? '' : 'bg-primary'}
                />
                {Number(courses) > 0 ? (
                  <p className="text-[10px] text-on-surface-variant">{Number(courses).toLocaleString()}강좌</p>
                ) : null}
              </div>
            ),
          )}
        </div>
      ) : (
        <EmptyState
          title="미공시"
          description="학기별 전임 강의담당 비율 데이터가 미공시입니다."
          minHeight={260}
          icon="bar_chart"
        />
      )}
    </div>
  );
}
