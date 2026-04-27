import React from 'react';
import { CONTENT_TYPE_MAP } from '../../../constants/contentTypes';

const GRID_COLS = 12;
const GRID_ROWS = 6;
const CELL_SIZE = 40;

export default function SlotLayout({ slots, slotAssignments, onSlotClick }) {
  const svgWidth = GRID_COLS * CELL_SIZE;
  const svgHeight = GRID_ROWS * CELL_SIZE;

  return (
    <div className="bg-surface-container-low rounded-xl border border-outline/20 p-6">
      <div className="flex justify-center">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="border border-outline/30 rounded"
        >
          {/* Grid lines */}
          {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * CELL_SIZE}
              y1={0}
              x2={i * CELL_SIZE}
              y2={svgHeight}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * CELL_SIZE}
              x2={svgWidth}
              y2={i * CELL_SIZE}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          ))}

          {/* Slots */}
          {slots.map((slot, index) => {
            const slotId = slot.slot_id || slot.id || `slot_${index}`;
            const assignment = slotAssignments.get(slotId);
            const x = (slot.x || 0) * CELL_SIZE;
            const y = (slot.y || 0) * CELL_SIZE;
            const width = (slot.w || 1) * CELL_SIZE;
            const height = (slot.h || 1) * CELL_SIZE;

            return (
              <g
                key={slotId}
                onClick={() => onSlotClick({ ...slot, slot_id: slotId })}
                className="cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={width - 2}
                  height={height - 2}
                  rx={4}
                  fill={assignment ? CONTENT_TYPE_MAP[assignment.cnts_tp]?.bgColor || '#e0e3e6' : 'transparent'}
                  stroke={assignment ? CONTENT_TYPE_MAP[assignment.cnts_tp]?.textColor || '#424750' : 'currentColor'}
                  strokeWidth={assignment ? 2 : 1}
                  strokeDasharray={assignment ? undefined : '4,4'}
                  className={`transition-all duration-200 ${
                    !assignment ? 'hover:stroke-primary hover:stroke-2' : ''
                  }`}
                />
                
                {assignment && (
                  <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={CONTENT_TYPE_MAP[assignment.cnts_tp]?.textColor || '#424750'}
                    fontSize={12}
                    fontWeight={500}
                    style={{ pointerEvents: 'none' }}
                  >
                    {assignment.cnts_nm}
                  </text>
                )}

                {!assignment && (
                  <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="currentColor"
                    fontSize={11}
                    opacity={0.5}
                    style={{ pointerEvents: 'none' }}
                  >
                    + 할당
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex gap-4 text-sm text-on-surface-variant">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-dashed border-outline rounded" />
          <span>빈 슬롯</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-container rounded border border-primary" />
          <span>할당됨</span>
        </div>
      </div>
    </div>
  );
}
