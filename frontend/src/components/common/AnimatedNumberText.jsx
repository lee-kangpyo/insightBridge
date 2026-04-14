import { useEffect, useMemo, useRef, useState } from "react";

function parseNumberText(input) {
  const text = input == null ? "" : String(input);
  // 첫 번째 숫자 덩어리만 애니메이션 (예: "18,450천원", "61.1%", "-0.5%p")
  const match = text.match(/-?\d[\d,]*\.?\d*/);
  if (!match) return null;

  const numberPart = match[0];
  const startIndex = match.index ?? 0;
  const prefix = text.slice(0, startIndex);
  const suffix = text.slice(startIndex + numberPart.length);

  const end = Number(numberPart.replace(/,/g, ""));
  if (!Number.isFinite(end)) return null;

  const decimals = (numberPart.split(".")[1] || "").length;
  const separator = numberPart.includes(",") ? "," : "";

  return { prefix, suffix, end, decimals, separator };
}

function formatNumber(value, { decimals, separator }) {
  const fixed = Number(value).toFixed(decimals);
  if (!separator) return fixed;

  const [intPart, fracPart] = fixed.split(".");
  const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return fracPart != null ? `${withComma}.${fracPart}` : withComma;
}

export default function AnimatedNumberText({
  text,
  duration = 900,
  start = 0,
}) {
  const parsed = useMemo(() => parseNumberText(text), [text]);
  const rafIdRef = useRef(null);
  const runIdRef = useRef(0);
  const [display, setDisplay] = useState(() => {
    if (!parsed) return text;
    return formatNumber(start, parsed);
  });

  useEffect(() => {
    if (!parsed) {
      setDisplay(text);
      return undefined;
    }

    const { end } = parsed;
    const from = Number(start) || 0;
    const to = Number(end);
    if (!Number.isFinite(to)) {
      setDisplay(text);
      return undefined;
    }

    if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);

    runIdRef.current += 1;
    const myRunId = runIdRef.current;

    let startTime = null;

    const tick = (time) => {
      if (myRunId !== runIdRef.current) return;
      if (startTime == null) startTime = time;

      const progress = time - startTime;
      const percent = Math.min(progress / duration, 1);

      const next = from + (to - from) * percent;
      setDisplay(formatNumber(next, parsed));

      if (percent < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      runIdRef.current += 1;
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [parsed, start, text, duration]);

  return (
    <>
      {parsed?.prefix ?? ""}
      <span>{display}</span>
      {parsed?.suffix ?? ""}
    </>
  );
}

