import { AnimatedPercentBarFill } from './AnimatedPercentBarFill';

/**
 * 막대 너비는 percent, 막대 위(채움 안) 문구는 bar_ratio_display_text 원문 그대로.
 */
export default function ThemeBarRatioFill({
  percent,
  barRatioDisplayText,
  trackClassName = 'bg-surface-variant',
  fillClassName = '',
  fillStyle,
}) {
  const label =
    typeof barRatioDisplayText === 'string' && barRatioDisplayText.trim()
      ? barRatioDisplayText.trim()
      : '';

  return (
    <div className={`h-6 w-full overflow-hidden rounded-full ${trackClassName}`.trim()}>
      <AnimatedPercentBarFill
        percent={percent}
        className={`flex h-full min-w-0 shrink-0 items-center justify-end gap-1 truncate rounded-full px-2 text-[10px] font-bold leading-none text-white ${fillClassName}`.trim()}
        style={fillStyle}
      >
        {label ? <span className="min-w-0 truncate drop-shadow-sm">{label}</span> : null}
      </AnimatedPercentBarFill>
    </div>
  );
}
