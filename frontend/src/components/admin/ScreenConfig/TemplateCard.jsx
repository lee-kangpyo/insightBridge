export default function TemplateCard({ template, isSelected, onClick, onDelete, showDelete }) {
  const parseSlots = (slotsData) => {
    let parsed = [];
    if (typeof slotsData === 'string') {
      try {
        parsed = JSON.parse(slotsData);
      } catch {
        parsed = [];
      }
    } else {
      parsed = slotsData || [];
    }
    return parsed.map((slot, idx) => ({
      ...slot,
      slot_id: slot.slot_id ?? slot.id ?? `slot_${idx}`,
      x_pos: slot.x_pos ?? slot.x ?? 0,
      y_pos: slot.y_pos ?? slot.y ?? 0,
      width: slot.width ?? slot.w ?? 1,
      height: slot.height ?? slot.h ?? 1,
    }));
  };

  const slots = parseSlots(template.slots);

  const gridCols = 12;
  const gridRows = 6;
  const cellSize = 28;

  const getSlotStyle = (slot) => {
    const left = slot.x_pos * cellSize;
    const top = slot.y_pos * cellSize;
    const width = slot.width * cellSize;
    const height = slot.height * cellSize;
    return { left, top, width, height };
  };

  const accentColor = isSelected ? '#0ea5e9' : '#64748b';
  const accentBg = isSelected ? 'rgba(14, 165, 233, 0.12)' : 'rgba(100, 116, 139, 0.08)';
  const borderColor = isSelected ? '#0ea5e9' : 'rgba(148, 163, 184, 0.4)';

  return (
    <div
      className={`group relative cursor-pointer transition-all duration-200 ${
        isSelected ? 'scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <div
        className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
          isSelected
            ? 'ring-2 shadow-xl shadow-sky-500/10'
            : 'hover:shadow-lg hover:shadow-slate-500/5'
        }`}
        style={{ borderColor: isSelected ? '#0ea5e9' : 'transparent' }}
      >
        <div className="px-5 pt-5 pb-4 bg-white dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 leading-snug truncate">
                {template.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {slots.length} zones · {gridCols}×{gridRows} grid
                {typeof template.reference_count === 'number' && template.reference_count > 0 && (
                  <span className="ml-2 text-red-500">({template.reference_count}개 사용중)</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(showDelete && typeof onDelete === 'function') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-red-500 hover:bg-red-600 transition-colors"
                  title="삭제"
                >
                  ×
                </button>
              )}
              <div
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: accentColor }}
              >
                {template.template_id}
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-slate-50 dark:bg-slate-800/50 px-5 py-4">
          <div className="relative w-full aspect-[12/6] rounded-lg overflow-hidden bg-white/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-700/30">
            <svg
              viewBox={`0 0 ${gridCols * cellSize} ${gridRows * cellSize}`}
              className="absolute inset-0 w-full h-full"
            >
              <defs>
                <pattern
                  id={`smallGrid-${template.template_id}`}
                  width={cellSize}
                  height={cellSize}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    width={cellSize}
                    height={cellSize}
                    fill="none"
                    stroke={isSelected ? 'rgba(14, 165, 233, 0.15)' : 'rgba(148, 163, 184, 0.2)'}
                    strokeWidth={0.5}
                  />
                </pattern>
              </defs>

              <rect
                width={gridCols * cellSize}
                height={gridRows * cellSize}
                fill={isSelected ? 'rgba(14, 165, 233, 0.03)' : 'transparent'}
              />
              <rect
                width={gridCols * cellSize}
                height={gridRows * cellSize}
                fill={`url(#smallGrid-${template.template_id})`}
              />

              {slots.map((slot, index) => {
                const { left, top, width, height } = getSlotStyle(slot);
                return (
                  <g key={slot.slot_id}>
                    <rect
                      x={left + 2}
                      y={top + 2}
                      width={width - 4}
                      height={height - 4}
                      fill={accentBg}
                      stroke={borderColor}
                      strokeWidth={isSelected ? 2 : 1.5}
                      strokeDasharray="4 3"
                      rx={3}
                      className="transition-all duration-200"
                    />
                    {width >= 32 && height >= 24 && (
                      <text
                        x={left + width / 2}
                        y={top + height / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={7}
                        fontWeight={600}
                        fill={accentColor}
                        className="pointer-events-none select-none font-mono"
                      >
                        {String(slot.slot_id).replace('slot_', '')}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            <div className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm">
              <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300">
                {gridCols}C
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Layout Blueprint
              </span>
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isSelected ? '선택됨' : '선택하기'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
