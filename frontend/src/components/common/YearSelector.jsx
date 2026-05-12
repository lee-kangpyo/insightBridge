import React from 'react';

export default function YearSelector({ selectedYear, onYearChange }) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="flex gap-1">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onYearChange(year)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            selectedYear === year
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          {year}년
        </button>
      ))}
    </div>
  );
}