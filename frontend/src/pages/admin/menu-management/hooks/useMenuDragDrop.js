import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  findNodeById,
  getDescendantIds,
  moveNodeInTree,
} from "../utils/menuTree";
import useTreeScrollRestore from "./useTreeScrollRestore";

export default function useMenuDragDrop({ menuTree, loading, onMoveAttempt }) {
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);

  const pointerYRef = useRef(0);
  const overIdRef = useRef(null);
  const dropPositionRef = useRef(null);
  const descendantIdsRef = useRef(new Set());
  const overRectRef = useRef(null);

  const scrollRef = useRef(null);

  const { saveScrollPosition } = useTreeScrollRestore({
    scrollRef,
    loading,
    menuTree,
  });

  const [invalidTargetIds, setInvalidTargetIds] = useState(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const computeDropPosition = useCallback((clientY, rect) => {
    if (!rect) return null;
    const relY = clientY - rect.top;
    const height = rect.height;
    if (relY < height * 0.25) return "before";
    if (relY > height * 0.75) return "after";
    return "inside";
  }, []);

  const handleDragStart = useCallback(
    ({ active }) => {
      setActiveId(active.id);
      const node = menuTree
        ? findNodeById(menuTree, active.id)
        : null;
      if (node) {
        descendantIdsRef.current = getDescendantIds(node);
        const ids = new Set(descendantIdsRef.current);
        ids.add(active.id);
        setInvalidTargetIds(ids);
      }
    },
    [menuTree],
  );

  const handleDragOver = useCallback(
    ({ over }) => {
      if (over) {
        overIdRef.current = over.id;
        setOverId(over.id);
        const rect = over.rect;
        overRectRef.current = rect;
        const pos = computeDropPosition(pointerYRef.current, rect);
        if (pos !== dropPositionRef.current) {
          dropPositionRef.current = pos;
          setDropPosition(pos);
        }
      } else {
        overIdRef.current = null;
        setOverId(null);
        setDropPosition(null);
        dropPositionRef.current = null;
        overRectRef.current = null;
      }
    },
    [computeDropPosition],
  );

  useEffect(() => {
    if (!activeId) return;
    const handlePointerMove = (e) => {
      pointerYRef.current = e.clientY;
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [activeId]);

  const resetDragState = useCallback(() => {
    setActiveId(null);
    setOverId(null);
    setDropPosition(null);
    setInvalidTargetIds(new Set());
    overIdRef.current = null;
    dropPositionRef.current = null;
    descendantIdsRef.current = new Set();
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      const draggedId = active.id;
      const targetId = over?.id ?? null;
      const position = dropPositionRef.current;
      const descendants = new Set(descendantIdsRef.current);

      saveScrollPosition();
      resetDragState();

      if (!targetId || !position) return;
      if (draggedId === targetId) return;
      if (descendants.has(targetId)) return;

      const result = moveNodeInTree(menuTree, draggedId, targetId, position);
      if (!result.didMove) return;

      const hintExpandId = position === "inside" ? targetId : undefined;

      onMoveAttempt({
        draggedId,
        targetId,
        position,
        optimisticTree: result.tree,
        hintExpandId,
      });
    },
    [menuTree, onMoveAttempt, resetDragState, saveScrollPosition],
  );

  const handleDragCancel = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  const dragProps = useMemo(
    () => ({
      activeId,
      overId,
      dropPosition,
      invalidTargetIds,
      sensors,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
      onDragCancel: handleDragCancel,
    }),
    [
      activeId,
      overId,
      dropPosition,
      invalidTargetIds,
      sensors,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
      handleDragCancel,
    ],
  );

  return {
    activeId,
    overId,
    dropPosition,
    invalidTargetIds,
    sensors,
    dragProps,
    scrollRef,
  };
}
