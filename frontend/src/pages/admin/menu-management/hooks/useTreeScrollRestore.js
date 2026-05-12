import { useRef, useLayoutEffect, useEffect } from "react";

export default function useTreeScrollRestore({ scrollRef, loading, menuTree }) {
  const pendingScrollTopRef = useRef(null);
  const restoreKeyRef = useRef(0);
  const raf1Ref = useRef(null);
  const raf2Ref = useRef(null);
  const hasMountedRef = useRef(false);

  const saveScrollPosition = () => {
    const el = scrollRef.current;
    if (el) {
      pendingScrollTopRef.current = el.scrollTop;
      restoreKeyRef.current += 1;
    }
  };

  useLayoutEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (loading) return;
    const scrollContainer = scrollRef.current;
    const saved = pendingScrollTopRef.current;
    if (!scrollContainer || saved == null) return;

    if (raf1Ref.current) {
      cancelAnimationFrame(raf1Ref.current);
      raf1Ref.current = null;
    }
    if (raf2Ref.current) {
      cancelAnimationFrame(raf2Ref.current);
      raf2Ref.current = null;
    }

    const restoreKey = restoreKeyRef.current;
    raf1Ref.current = requestAnimationFrame(() => {
      if (restoreKeyRef.current !== restoreKey) return;
      scrollContainer.scrollTop = saved;
      raf2Ref.current = requestAnimationFrame(() => {
        if (restoreKeyRef.current !== restoreKey) return;
        scrollContainer.scrollTop = saved;
        pendingScrollTopRef.current = null;
      });
    });
  }, [loading, menuTree, scrollRef]);

  useEffect(() => {
    return () => {
      if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
      if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);
    };
  }, []);

  return { saveScrollPosition };
}
