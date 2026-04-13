import { useEffect, useState } from "react";

export function clampPct(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

const DEFAULT_TRANSITION = "transition-[width] duration-[1.4s] ease-out";

/**
 * 가로 막대 채움을 0% → target% 로 애니메이션.
 * @param {object} props
 * @param {string|number} props.percent
 * @param {string} [props.className]
 * @param {React.CSSProperties} [props.style] — width 는 애니메이션 값으로 덮어씀
 * @param {React.ReactNode} [props.children]
 */
export function AnimatedPercentBarFill({
  percent,
  className = "",
  style,
  children,
}) {
  const target = clampPct(percent);
  const [w, setW] = useState(0);

  useEffect(() => {
    setW(0);
    let innerId;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => setW(target));
    });
    return () => {
      cancelAnimationFrame(outerId);
      if (innerId != null) cancelAnimationFrame(innerId);
    };
  }, [percent, target]);

  return (
    <div
      className={`${DEFAULT_TRANSITION} ${className}`.trim()}
      style={{ ...style, width: `${w}%` }}
    >
      {children}
    </div>
  );
}
