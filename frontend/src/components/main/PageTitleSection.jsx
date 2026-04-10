export default function PageTitleSection({ title, subtitle, baseYear, showPdfButton, onPdfClick }) {
  return (
    <div className="mb-8 flex justify-between items-end">
      <div>
        {subtitle && (
          <p className="text-secondary font-bold text-xs tracking-widest uppercase mb-1">
            {subtitle}
          </p>
        )}
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">
          {title || '제목'}
        </h1>
      </div>
      <div className="flex gap-3">
        {baseYear && (
          <div className="bg-surface-container-low px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            기준연도: {baseYear}
          </div>
        )}
        {showPdfButton && (
          <button
            onClick={onPdfClick}
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            PDF 리포트
          </button>
        )}
      </div>
    </div>
  );
}