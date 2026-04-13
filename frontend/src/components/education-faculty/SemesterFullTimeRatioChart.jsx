import { AnimatedPercentBarFill } from '../common/AnimatedPercentBarFill';

export default function SemesterFullTimeRatioChart({ semesterRatios, title, subtitle }) {
  const heading = title?.trim() ? title : '학기별 전임 강의담당 비율';
  const sub = subtitle?.trim() ? subtitle : '';

  if (!Array.isArray(semesterRatios) || semesterRatios.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10">
      <div className="mb-8">
        <h3 className="text-lg font-headline font-bold text-primary">{heading}</h3>
        {sub ? <p className="mt-1 text-xs text-on-surface-variant">{sub}</p> : null}
      </div>
      <div className="space-y-10">
        {semesterRatios.map(({ semester, ratio, courses, colorHex }) => (
          <div key={semester} className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>{semester}</span>
              <span className="text-primary font-bold">{ratio}%</span>
            </div>
            <div className="flex h-6 overflow-hidden rounded-sm bg-surface-container">
              <AnimatedPercentBarFill
                percent={ratio}
                className="flex h-full min-w-0 shrink-0 items-center overflow-hidden bg-primary px-2 text-[10px] font-bold text-white"
                style={colorHex ? { backgroundColor: colorHex } : undefined}
              >
                {Number(courses).toLocaleString()}강좌
              </AnimatedPercentBarFill>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}