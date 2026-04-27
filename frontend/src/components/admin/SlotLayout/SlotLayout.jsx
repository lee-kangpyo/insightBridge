import React from 'react';
import { CONTENT_TYPE_MAP } from '../../../constants/contentTypes';

const GRID_COLS = 12;
const GRID_ROWS = 6;
const CELL_SIZE = 80;

export default function SlotLayout({ slots, slotAssignments, onSlotClick }) {
  const svgWidth = GRID_COLS * CELL_SIZE;
  const svgHeight = GRID_ROWS * CELL_SIZE;

  // 콘텐츠 타입별 컬러 팔레트 (머티리얼 디자인 기반 고도화)
  const colorPalette = {
    chart: { bg: '#E3F2FD', stroke: '#1E88E5', text: '#1565C0', glow: 'rgba(30, 136, 229, 0.3)' },
    grid: { bg: '#E8F5E9', stroke: '#43A047', text: '#2E7D32', glow: 'rgba(67, 160, 71, 0.3)' },
    card: { bg: '#FFF8E1', stroke: '#FFB300', text: '#FF8F00', glow: 'rgba(255, 179, 0, 0.3)' },
    sql: { bg: '#F5F5F5', stroke: '#757575', text: '#424242', glow: 'rgba(117, 117, 117, 0.3)' },
    default: { bg: 'transparent', stroke: 'rgba(0,0,0,0.1)', text: '#757575', glow: 'rgba(0,0,0,0.05)' }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 p-8 shadow-2xl transition-all duration-500">
      <div className="flex justify-center overflow-auto py-4">
        <div className="relative group">
          {/* Canvas Shadow & Border Decoration */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="relative bg-white border border-outline/20 rounded-lg shadow-inner overflow-visible"
          >
            <defs>
              {/* Dot Matrix Pattern */}
              <pattern
                id="dotGrid"
                width={CELL_SIZE}
                height={CELL_SIZE}
                patternUnits="userSpaceOnUse"
              >
                <circle cx={2} cy={2} r={1.5} fill="currentColor" fillOpacity={0.15} />
              </pattern>

              {/* Slot Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Dot Grid */}
            <rect width={svgWidth} height={svgHeight} fill="url(#dotGrid)" />

            {/* Slots */}
            {slots.map((slot, index) => {
              const slotId = slot.slot_id || slot.id || `slot_${index}`;
              const assignment = slotAssignments.get(slotId);
              const x = (slot.x_pos ?? 0) * CELL_SIZE;
              const y = (slot.y_pos ?? 0) * CELL_SIZE;
              const width = (slot.width ?? 1) * CELL_SIZE;
              const height = (slot.height ?? 1) * CELL_SIZE;
              
              const type = assignment?.cnts_tp || 'default';
              const palette = colorPalette[type] || colorPalette.default;

              return (
                <g
                  key={slotId}
                  onClick={() => onSlotClick({ ...slot, slot_id: slotId })}
                  className="group/slot cursor-pointer select-none animate-in fade-in zoom-in-95 duration-500"
                  style={{ 
                    animationDelay: `${index * 20}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {/* Slot Background Rect */}
                  <rect
                    x={x + 6}
                    y={y + 6}
                    width={width - 12}
                    height={height - 12}
                    rx={12}
                    fill={palette.bg}
                    stroke={palette.stroke}
                    strokeWidth={assignment ? 2 : 1.5}
                    strokeDasharray={assignment ? "0" : "6,4"}
                    className="transition-all duration-300 ease-out group-hover/slot:filter-[url(#glow)]"
                    style={{
                      transitionProperty: 'all',
                      filter: 'none',
                    }}
                  />

                  {/* Hover Highlight Overlay (Pseudo-glow) */}
                  <rect
                    x={x + 4}
                    y={y + 4}
                    width={width - 8}
                    height={height - 8}
                    rx={14}
                    fill="transparent"
                    stroke={palette.stroke}
                    strokeWidth={0}
                    className="transition-all duration-300 opacity-0 group-hover/slot:opacity-100 group-hover/slot:stroke-[3px] group-hover/slot:scale-[1.02]"
                    style={{ transformOrigin: `${x + width/2}px ${y + height/2}px` }}
                  />
                  
                  {assignment ? (
                    <foreignObject
                      x={x + 10}
                      y={y + 10}
                      width={width - 20}
                      height={height - 20}
                      style={{ pointerEvents: 'none' }}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        <span 
                          className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60"
                          style={{ color: palette.text }}
                        >
                          {CONTENT_TYPE_MAP[type]?.label || type}
                        </span>
                        <span 
                          className="text-xs font-semibold leading-tight line-clamp-2"
                          style={{ color: palette.text }}
                        >
                          {assignment.cnts_nm}
                        </span>
                      </div>
                    </foreignObject>
                  ) : (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={palette.text}
                      className="text-[11px] font-medium opacity-40 group-hover/slot:opacity-100 transition-opacity duration-300"
                      style={{ pointerEvents: 'none' }}
                    >
                      + 슬롯 추가
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-6">
        {Object.entries(CONTENT_TYPE_MAP).map(([key, config]) => (
          <div key={key} className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-full border border-outline/5 shadow-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colorPalette[key]?.stroke || '#ccc' }} 
            />
            <span className="text-xs font-medium text-on-surface-variant">{config.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-full border border-outline/5 shadow-sm">
          <div className="w-3 h-3 rounded-full border border-dashed border-outline" />
          <span className="text-xs font-medium text-on-surface-variant">미할당 슬롯</span>
        </div>
      </div>
    </div>
  );
}
