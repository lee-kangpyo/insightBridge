import * as React from "react";
export type ChartFilterType =
  | "all"
  | "bar"
  | "line"
  | "pie"
  | "scatter"
  | "heatmap"
  | "special";

interface ChartTypeFilterProps {
  selectedFilter: ChartFilterType;
  onFilterChange: (filter: ChartFilterType) => void;
}

const FILTERS: { type: ChartFilterType; label: string }[] = [
  { type: "all", label: "전체" },
  { type: "bar", label: "Bar" },
  { type: "line", label: "Line" },
  { type: "pie", label: "Pie" },
  { type: "scatter", label: "Scatter" },
  { type: "heatmap", label: "Heatmap" },
  { type: "special", label: "기타" },
];

const baseBtn =
  "rounded-xl px-3 py-1.5 text-sm font-semibold backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

export default function ChartTypeFilter({
  selectedFilter,
  onFilterChange,
}: ChartTypeFilterProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="toolbar"
      aria-label="차트 종류 필터"
    >
      {FILTERS.map(({ type, label }) => {
        const isActive = selectedFilter === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onFilterChange(type)}
            aria-pressed={isActive}
            className={
              isActive
                ? `${baseBtn} bg-secondary/85 text-white border border-secondary/40 shadow-md shadow-sky-500/20`
                : `${baseBtn} border border-white/60 bg-white/50 text-on-surface hover:bg-white/72 hover:border-white/80 shadow-sm`
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
