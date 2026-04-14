import { BentoGrid, BentoGridSkeleton } from './BentoGrid';

export function CandidateTabs({
  candidates = [],
  bestIndex = -1,
  activeTab = 0,
  onTabChange,
  isStreaming = false,
}) {
  if (candidates.length === 0 && isStreaming) {
    return <BentoGridSkeleton />;
  }

  if (candidates.length === 0) {
    return null;
  }

  const activeCandidate = candidates[activeTab] ?? candidates[0];

  return (
    <div>
      {candidates.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          {candidates.map((c, i) => (
            <button
              key={i}
              onClick={() => onTabChange?.(i)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border
                ${
                  activeTab === i
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline hover:border-primary hover:text-on-surface'
                }`}
            >
              방법 {i + 1}
              {!isStreaming && i === bestIndex && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-on-primary/20 font-semibold">
                  AI 추천
                </span>
              )}
              {isStreaming && i === candidates.length - 1 && (
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              )}
            </button>
          ))}
          {isStreaming && (
            <span className="text-xs text-on-surface-variant animate-pulse ml-1">
              분석 중...
            </span>
          )}
        </div>
      )}

      <BentoGrid
        sql={activeCandidate.sql}
        data={activeCandidate.data}
        chartConfig={activeCandidate.chart_config}
      />
    </div>
  );
}

export default CandidateTabs;
