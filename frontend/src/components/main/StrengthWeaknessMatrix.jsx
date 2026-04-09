const pointColors = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  error: 'bg-error',
  'primary-container': 'bg-primary-container',
};

export default function StrengthWeaknessMatrix({ matrix }) {
  if (!matrix) return null;

  return (
    <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">scatter_plot</span>
          <span>{matrix?.title}</span>
          <span className="text-[11px] font-extrabold text-error">
            (DB: public.tq_overview_matrix_point)
          </span>
        </h3>
        <div className="flex gap-4 text-[10px] font-bold text-outline">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary"></span> 지역 대비
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-outline"></span> 전국 대비
          </div>
        </div>
      </div>
      <div className="relative h-[400px] border-l border-b border-outline-variant/30 flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-outline-variant/50 -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-dashed border-outline-variant/50 -translate-x-1/2"></div>
        </div>
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="bg-tertiary-fixed/10 flex items-start p-4">
            <span className="text-[10px] font-black text-tertiary/40">집중 홍보 구간 (지역/전국 우위)</span>
          </div>
          <div className="bg-secondary-fixed/10 flex items-start p-4 justify-end">
            <span className="text-[10px] font-black text-secondary/40">지역 약세 보완</span>
          </div>
          <div className="bg-error-container/5 flex items-end p-4">
            <span className="text-[10px] font-black text-error/40">전국 열세 개선</span>
          </div>
          <div className="bg-surface-container/30 flex items-end p-4 justify-end">
            <span className="text-[10px] font-black text-on-surface-variant/40">지역 대비 우위</span>
          </div>
        </div>
        <div className="absolute -left-12 top-1/2 -rotate-90 text-[10px] font-bold text-outline uppercase tracking-widest">
          {matrix?.yAxisLabel}
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-outline uppercase tracking-widest">
          {matrix?.xAxisLabel}
        </div>
        {matrix.points?.map((point) => (
          <div
            key={point.id}
            className="absolute group cursor-pointer"
            style={{ top: `${point.y}%`, left: `${point.x}%` }}
          >
            <div
              className={`w-4 h-4 ${point.colorHex ? '' : pointColors[point.color]} rounded-full border-2 border-white shadow-lg`}
              style={point.colorHex ? { backgroundColor: point.colorHex } : undefined}
            ></div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {point.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}