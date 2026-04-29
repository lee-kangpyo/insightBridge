import { useState, useCallback, useRef, useEffect } from 'react';

const GRID_COLS = 12;
const GRID_ROWS = 6;
const CELL_SIZE = 48;
const MIN_W = 3;
const MIN_H = 2;

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function slotToRect(slot) {
  return { x: slot.x, y: slot.y, w: slot.w, h: slot.h };
}

function getNextSlotId(slots) {
  const nums = slots
    .map((s) => {
      const m = String(s.id).match(/slot_(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `slot_${max + 1}`;
}

export default function TemplateEditorModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [slots, setSlots] = useState([]);
  const [mode, setMode] = useState('edit'); // 'edit' | 'select'
  const [selectedIds, setSelectedIds] = useState([]);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSlots([]);
      setMode('edit');
      setSelectedIds([]);
      setDragState(null);
      setResizeState(null);
    }
  }, [isOpen]);

  const getGridPos = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = (GRID_COLS * CELL_SIZE) / rect.width;
    const scaleY = (GRID_ROWS * CELL_SIZE) / rect.height;
    const gx = Math.floor((clientX - rect.left) * scaleX / CELL_SIZE);
    const gy = Math.floor((clientY - rect.top) * scaleY / CELL_SIZE);
    return {
      x: Math.max(0, Math.min(GRID_COLS - 1, gx)),
      y: Math.max(0, Math.min(GRID_ROWS - 1, gy)),
    };
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      if (mode !== 'edit' || e.button !== 0) return;
      // Ignore if clicking on a slot or handle
      if (e.target.closest('[data-slot]') || e.target.closest('[data-handle]')) return;
      const pos = getGridPos(e.clientX, e.clientY);
      setDragState({ start: pos, current: pos });
    },
    [mode, getGridPos]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (dragState) {
        const pos = getGridPos(e.clientX, e.clientY);
        setDragState((prev) => ({ ...prev, current: pos }));
      }
      if (resizeState) {
        const pos = getGridPos(e.clientX, e.clientY);
        setResizeState((prev) => ({ ...prev, current: pos }));
      }
    },
    [dragState, resizeState, getGridPos]
  );

  const handleMouseUp = useCallback(() => {
    if (dragState) {
      const { start, current } = dragState;
      const x = Math.min(start.x, current.x);
      const y = Math.min(start.y, current.y);
      const w = Math.abs(current.x - start.x) + 1;
      const h = Math.abs(current.y - start.y) + 1;
      if (w >= MIN_W && h >= MIN_H) {
        const newRect = { x, y, w, h };
        const hasOverlap = slots.some((s) => rectsOverlap(newRect, slotToRect(s)));
        if (!hasOverlap) {
          setSlots((prev) => [
            ...prev,
            { id: getNextSlotId(prev), x, y, w, h },
          ]);
        }
      }
      setDragState(null);
    }
    if (resizeState) {
      const { slotId, startSlot, current } = resizeState;
      const newW = Math.max(MIN_W, current.x - startSlot.x + 1);
      const newH = Math.max(MIN_H, current.y - startSlot.y + 1);
      const newRect = { x: startSlot.x, y: startSlot.y, w: newW, h: newH };
      const hasOverlap = slots.some(
        (s) => s.id !== slotId && rectsOverlap(newRect, slotToRect(s))
      );
      if (!hasOverlap) {
        setSlots((prev) =>
          prev.map((s) => (s.id === slotId ? { ...s, w: newW, h: newH } : s))
        );
      }
      setResizeState(null);
    }
  }, [dragState, resizeState, slots]);

  useEffect(() => {
    if (dragState || resizeState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, resizeState, handleMouseMove, handleMouseUp]);

  const handleSlotMouseDown = useCallback(
    (e, slot) => {
      if (mode === 'select') {
        e.stopPropagation();
        setSelectedIds((prev) => {
          if (prev.includes(slot.id)) {
            return prev.filter((id) => id !== slot.id);
          }
          if (prev.length >= 2) {
            return [...prev.slice(1), slot.id];
          }
          return [...prev, slot.id];
        });
        return;
      }
      if (mode === 'edit' && e.button === 0) {
        e.stopPropagation();
        setDragState({ type: 'move', slotId: slot.id, startPos: getGridPos(e.clientX, e.clientY), slot });
      }
    },
    [mode, getGridPos]
  );

  const handleSlotMouseMove = useCallback(
    (e) => {
      if (!dragState || dragState.type !== 'move') return;

      const pos = getGridPos(e.clientX, e.clientY);
      
      // Use functional update to ensure we use the freshest dragState
      setDragState((prev) => {
        if (!prev || prev.type !== 'move') return prev;

        const dx = pos.x - prev.startPos.x;
        const dy = pos.y - prev.startPos.y;
        
        // Calculate potential new position
        const newX = Math.max(0, Math.min(GRID_COLS - prev.slot.w, prev.slot.x + dx));
        const newY = Math.max(0, Math.min(GRID_ROWS - prev.slot.h, prev.slot.y + dy));
        
        if (newX === prev.slot.x && newY === prev.slot.y) return prev;

        const newRect = { x: newX, y: newY, w: prev.slot.w, h: prev.slot.h };

        // We still need to check overlap with current slots.
        // To do this perfectly without stale 'slots', we'd need more complex logic,
        // but using functional update for slots separately is a good middle ground.
        let overlapped = false;
        setSlots((currentSlots) => {
          overlapped = currentSlots.some(
            (s) => s.id !== prev.slotId && rectsOverlap(newRect, slotToRect(s))
          );
          if (overlapped) return currentSlots;
          return currentSlots.map((s) => (s.id === prev.slotId ? { ...s, x: newX, y: newY } : s));
        });

        if (overlapped) return prev;

        return { ...prev, startPos: pos, slot: { ...prev.slot, x: newX, y: newY } };
      });
    },
    [dragState, getGridPos]
  );

  const handleSlotMouseUp = useCallback(() => {
    if (dragState?.type === 'move') {
      setDragState(null);
    }
  }, [dragState]);

  useEffect(() => {
    if (dragState?.type === 'move') {
      window.addEventListener('mousemove', handleSlotMouseMove);
      window.addEventListener('mouseup', handleSlotMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleSlotMouseMove);
        window.removeEventListener('mouseup', handleSlotMouseUp);
      };
    }
  }, [dragState, handleSlotMouseMove, handleSlotMouseUp]);

  const handleResizeMouseDown = useCallback(
    (e, slot) => {
      e.stopPropagation();
      e.preventDefault();
      setResizeState({ slotId: slot.id, startSlot: { ...slot }, current: { x: slot.x + slot.w - 1, y: slot.y + slot.h - 1 } });
    },
    []
  );

  const handleDeleteSlot = useCallback((slotId) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    setSelectedIds((prev) => prev.filter((id) => id !== slotId));
  }, []);

  const handleSwapIds = useCallback(() => {
    if (selectedIds.length !== 2) return;
    const [idA, idB] = selectedIds;
    setSlots((prev) => {
      const slotA = prev.find((s) => s.id === idA);
      const slotB = prev.find((s) => s.id === idB);
      if (!slotA || !slotB) return prev;
      return prev.map((s) => {
        if (s.id === idA) return { ...s, id: idB };
        if (s.id === idB) return { ...s, id: idA };
        return s;
      });
    });
    setSelectedIds([]);
  }, [selectedIds]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Delete' && mode === 'edit') {
        // Delete selected slots (if any are highlighted from a previous selection)
        // In edit mode we don't really have persistent selection, but if user had selected in select mode then switched...
      }
    },
    [mode]
  );

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      alert('템플릿 이름을 입력해주세요');
      return;
    }
    if (slots.length === 0) {
      alert('최소 하나 이상의 슬롯을 생성해주세요');
      return;
    }
    const payload = {
      name: name.trim(),
      slots: slots.map((s) => ({ id: s.id, x: s.x, y: s.y, w: s.w, h: s.h })),
    };
    onSave(payload);
  }, [name, slots, onSave]);

  const dragRect = (() => {
    if (!dragState || dragState.type === 'move') return null;
    const { start, current } = dragState;
    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const w = Math.abs(current.x - start.x) + 1;
    const h = Math.abs(current.y - start.y) + 1;
    return { x, y, w, h };
  })();

  const isDragValid = dragRect && dragRect.w >= MIN_W && dragRect.h >= MIN_H;
  const dragOverlap = dragRect
    ? slots.some((s) => rectsOverlap(dragRect, slotToRect(s)))
    : false;

  const resizeRect = (() => {
    if (!resizeState) return null;
    const { startSlot, current } = resizeState;
    const w = Math.max(MIN_W, current.x - startSlot.x + 1);
    const h = Math.max(MIN_H, current.y - startSlot.y + 1);
    return { x: startSlot.x, y: startSlot.y, w, h };
  })();

  const resizeOverlap = resizeRect
    ? slots.some(
        (s) => s.id !== resizeState.slotId && rectsOverlap(resizeRect, slotToRect(s))
      )
    : false;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              템플릿 추가
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              템플릿 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="템플릿 이름을 입력하세요"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">모드:</span>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => { setMode('edit'); setSelectedIds([]); }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === 'edit'
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                편집
              </button>
              <button
                onClick={() => { setMode('select'); setDragState(null); }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === 'select'
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                선택
              </button>
            </div>
            {mode === 'select' && (
              <button
                onClick={handleSwapIds}
                disabled={selectedIds.length !== 2}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  selectedIds.length === 2
                    ? 'bg-sky-500 text-white hover:bg-sky-600'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                ID 교환 ({selectedIds.length}/2)
              </button>
            )}
            {mode === 'edit' && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                그리드를 드래그하여 슬롯 생성 · 슬롯을 드래그하여 이동
              </span>
            )}
          </div>

          {/* Grid */}
          <div className="flex justify-center">
            <div className="relative select-none">
              <svg
                ref={svgRef}
                width={GRID_COLS * CELL_SIZE}
                height={GRID_ROWS * CELL_SIZE}
                viewBox={`0 0 ${GRID_COLS * CELL_SIZE} ${GRID_ROWS * CELL_SIZE}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-crosshair"
                onMouseDown={handleMouseDown}
              >
                <defs>
                  <pattern
                    id="editorGrid"
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill="none"
                      stroke="rgba(148,163,184,0.25)"
                      strokeWidth={0.5}
                    />
                  </pattern>
                </defs>
                <rect
                  width={GRID_COLS * CELL_SIZE}
                  height={GRID_ROWS * CELL_SIZE}
                  fill="url(#editorGrid)"
                />

                {/* Drag preview */}
                {dragRect && (
                  <rect
                    x={dragRect.x * CELL_SIZE + 2}
                    y={dragRect.y * CELL_SIZE + 2}
                    width={dragRect.w * CELL_SIZE - 4}
                    height={dragRect.h * CELL_SIZE - 4}
                    fill={isDragValid && !dragOverlap ? 'rgba(14,165,233,0.15)' : 'rgba(239,68,68,0.15)'}
                    stroke={isDragValid && !dragOverlap ? '#0ea5e9' : '#ef4444'}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    rx={4}
                  />
                )}

                {/* Resize preview */}
                {resizeRect && (
                  <rect
                    x={resizeRect.x * CELL_SIZE + 2}
                    y={resizeRect.y * CELL_SIZE + 2}
                    width={resizeRect.w * CELL_SIZE - 4}
                    height={resizeRect.h * CELL_SIZE - 4}
                    fill={!resizeOverlap ? 'rgba(14,165,233,0.15)' : 'rgba(239,68,68,0.15)'}
                    stroke={!resizeOverlap ? '#0ea5e9' : '#ef4444'}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    rx={4}
                  />
                )}

                {/* Slots */}
                {slots.map((slot) => {
                  const isSelected = selectedIds.includes(slot.id);
                  return (
                    <g
                      key={slot.id}
                      data-slot={slot.id}
                      onMouseDown={(e) => handleSlotMouseDown(e, slot)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={slot.x * CELL_SIZE + 3}
                        y={slot.y * CELL_SIZE + 3}
                        width={slot.w * CELL_SIZE - 6}
                        height={slot.h * CELL_SIZE - 6}
                        fill={isSelected ? 'rgba(14,165,233,0.2)' : 'rgba(100,116,139,0.12)'}
                        stroke={isSelected ? '#0ea5e9' : '#64748b'}
                        strokeWidth={isSelected ? 2 : 1.5}
                        rx={4}
                      />
                      <text
                        x={slot.x * CELL_SIZE + (slot.w * CELL_SIZE) / 2}
                        y={slot.y * CELL_SIZE + (slot.h * CELL_SIZE) / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight={600}
                        fill={isSelected ? '#0ea5e9' : '#64748b'}
                        className="pointer-events-none select-none font-mono"
                      >
                        {String(slot.id).replace('slot_', '')}
                      </text>

                      {/* Delete button */}
                      {mode === 'edit' && (
                        <g
                          onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={slot.x * CELL_SIZE + slot.w * CELL_SIZE - 10}
                            cy={slot.y * CELL_SIZE + 10}
                            r={7}
                            fill="#ef4444"
                            opacity={0.9}
                          />
                          <text
                            x={slot.x * CELL_SIZE + slot.w * CELL_SIZE - 10}
                            y={slot.y * CELL_SIZE + 10}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={8}
                            fill="white"
                            className="pointer-events-none select-none"
                          >
                            ×
                          </text>
                        </g>
                      )}

                      {/* Resize handle */}
                      {mode === 'edit' && (
                        <rect
                          data-handle={slot.id}
                          x={slot.x * CELL_SIZE + slot.w * CELL_SIZE - 12}
                          y={slot.y * CELL_SIZE + slot.h * CELL_SIZE - 12}
                          width={10}
                          height={10}
                          fill="#0ea5e9"
                          rx={2}
                          className="cursor-nwse-resize"
                          onMouseDown={(e) => handleResizeMouseDown(e, slot)}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Slot list / info */}
          {slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    selectedIds.includes(slot.id)
                      ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-900/20 dark:border-sky-700 dark:text-sky-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {slot.id} ({slot.w}×{slot.h})
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
