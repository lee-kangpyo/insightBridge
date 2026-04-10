export default function SemesterFullTimeRatioChart({ semesterRatios, title, subtitle }) {
  const heading = title?.trim() ? title : '학기별 전임 강의담당 비율';
  const sub = subtitle?.trim() ? subtitle : '';

  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10">
      <div className="mb-8">
        <h3 className="text-lg font-headline font-bold text-primary">{heading}</h3>
        {sub ? <p className="mt-1 text-xs text-on-surface-variant">{sub}</p> : null}
      </div>
      <div className="space-y-10">
        {semesterRatios.map(({ semester, ratio, courses }) => (
          <div key={semester} className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>{semester}</span>
              <span className="text-primary font-bold">{ratio}%</span>
            </div>
            <div className="h-6 bg-surface-container rounded-sm overflow-hidden flex">
              <div
                className="bg-primary h-full flex items-center px-2 text-[10px] text-white font-bold"
                style={{ width: `${ratio}%` }}
              >
                {courses.toLocaleString()}강좌
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}