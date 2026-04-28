import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getScreen, getScreenSlots } from '../services/adminApi';
import SlotLayout from '../components/admin/SlotLayout/SlotLayout';

export default function ScreenViewer() {
  const { scrId } = useParams();
  const [screen, setScreen] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotAssignments, setSlotAssignments] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [screenData, slotsData] = await Promise.all([
          getScreen(scrId),
          getScreenSlots(scrId),
        ]);
        setScreen(screenData);
        setSlots(slotsData);
        const assignments = new Map();
        for (const s of slotsData) {
          if (s.item_id) {
            assignments.set(s.slot_id, {
              item_id: s.item_id,
              cnts_nm: s.item_nm || '아이템',
              cnts_tp: 'default',
            });
          }
        }
        setSlotAssignments(assignments);
      } catch (err) {
        setError(err.message || '화면을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scrId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-headline font-bold text-primary">
            {screen?.scr_nm || '화면 보기'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            ID: {scrId}
          </p>
        </div>
        <SlotLayout
          slots={slots.map((s, idx) => ({
            ...s,
            slot_id: s.slot_id ?? s.id ?? `slot_${idx}`,
            x_pos: s.x_pos ?? s.x ?? 0,
            y_pos: s.y_pos ?? s.y ?? 0,
            width: s.width ?? s.w ?? 1,
            height: s.height ?? s.h ?? 1,
          }))}
          slotAssignments={slotAssignments}
          onSlotClick={() => {}}
        />
      </div>
    </div>
  );
}
