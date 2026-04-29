import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getScreen, getScreenSlots, getTemplateSlots } from '../services/adminApi';
import PageTitleSection from '../components/main/PageTitleSection';
import ScreenRenderer from '../components/admin/ScreenRenderer';

function mergeSlots(templateSlots, assignedSlots) {
  const assignedMap = new Map();
  for (const s of assignedSlots) {
    assignedMap.set(s.slot_id, s);
  }

  const templateSlotIds = new Set(templateSlots.map((ts) => ts.slot_id));

  // 템플릿에 없는 할당 정보 경고
  for (const s of assignedSlots) {
    if (!templateSlotIds.has(s.slot_id)) {
      console.warn(
        `[ScreenViewer] 할당된 slot_id "${s.slot_id}"가 템플릿에 없습니다.`
      );
    }
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

export default function ScreenViewer() {
  const { scrId } = useParams();
  const [screen, setScreen] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1단계: 화면 정보 조회 → template_id 획득
        const screenData = await getScreen(scrId);
        setScreen(screenData);

        // template_id가 없으면 빈 슬롯 처리
        if (!screenData?.template_id) {
          setSlots([]);
          setLoading(false);
          return;
        }

        // 2단계: 템플릿 슬롯 + 할당 정보 병렬 호출
        const [templateSlots, assignedSlots] = await Promise.all([
          getTemplateSlots(screenData.template_id),
          getScreenSlots(scrId),
        ]);

        // 3단계: 병합
        const merged = mergeSlots(templateSlots, assignedSlots);
        setSlots(merged);
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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-error">
        {error}
      </div>
    );
  }

  return (
    <div className="relative max-w-[1600px] mx-auto px-8 py-6 overflow-hidden">
      {/* Glassmorphism depth: gradient orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-blue-900/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/3 h-[280px] w-[280px] rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative z-10">
        <PageTitleSection
          title={screen?.scr_nm || '화면 보기'}
          subtitle={`화면 ID: ${scrId?.slice(0, 8)}…`}
        />

        <div
          className="grid gap-4 rounded-2xl border border-white/50 bg-white/35 p-6 shadow-2xl shadow-black/5 backdrop-blur-2xl"
          style={{
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'repeat(6, minmax(120px, 1fr))',
          }}
        >
          {slots.map((slot) =>
            slot.item_id ? (
              <div
                key={slot.slot_id}
                className="rounded-xl border border-white/55 bg-white/60 shadow-md shadow-black/5 backdrop-blur-xl overflow-hidden min-h-[120px]"
                style={slotToGridStyle(slot)}
              >
                <SlotItemRenderer itemId={slot.item_id} />
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
