import React from 'react';
import CalendarIcon from './icons/CalendarIcon';

export default function YearDependentBadge({ compact = false }) {
  return (
    <span 
      className={`bg-amber-100 text-amber-700 font-bold rounded-md flex items-center justify-center gap-1 ${
        compact ? 'w-7 h-7' : 'px-2 py-1 text-[10px]'
      }`}
      title={compact ? "연도별 데이터" : undefined}
    >
      <CalendarIcon />
      {!compact && "연도별 데이터"}
    </span>
  );
}