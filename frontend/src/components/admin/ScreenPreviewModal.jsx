import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import ScreenRenderer from './ScreenRenderer';
import { getScreen, getScreenSlots, getTemplateSlots } from '../../services/adminApi';

function mergeSlots(templateSlots, assignedSlots) {
  const assignedMap = new Map();
  for (const s of assignedSlots) {
    assignedMap.set(s.slot_id, s);
  }

  return templateSlots.map((ts, idx) => {
    const assigned = assignedMap.get(ts.slot_id);
    return {
      ...ts,
      slot_id: ts.slot_id ?? ts.id ?? `slot_${idx}`,
      x_pos: ts.x_pos ?? ts.x ?? 0,
      y_pos: ts.y_pos ?? ts.y ?? 0,
      width: ts.width ?? ts.w ?? 1,
      height: ts.height ?? ts.h ?? 1,
      item_id: assigned?.item_id ?? null,
      item_nm: assigned?.item_nm ?? null,
    };
  });
}

export default function ScreenPreviewModal({ isOpen, onClose, scrId }) {
  const [screen, setScreen] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !scrId) return;

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const screenData = await getScreen(scrId);
        if (cancelled) return;
        setScreen(screenData);

        if (!screenData?.template_id) {
          setSlots([]);
          setLoading(false);
          return;
        }

        const [templateSlots, assignedSlots] = await Promise.all([
          getTemplateSlots(screenData.template_id),
          getScreenSlots(scrId),
        ]);

        if (cancelled) return;
        const merged = mergeSlots(templateSlots, assignedSlots);
        setSlots(merged);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || '화면을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, scrId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={screen?.scr_nm || '화면 미리보기'}
      description={scrId ? `화면 ID: ${scrId}` : undefined}
      variant="form"
      size="full"
      showCloseButton
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 text-error">
          {error}
        </div>
      ) : (
        <ScreenRenderer slots={slots} />
      )}
    </Modal>
  );
}
