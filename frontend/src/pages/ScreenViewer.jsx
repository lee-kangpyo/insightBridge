import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getScreen, getScreenSlots, getTemplateSlots } from '../services/adminApi';
import { getViewerMenu, getViewerScreen } from '../services/viewerApi';
import PageTitleSection from '../components/main/PageTitleSection';
import StatusChips from '../components/main/StatusChips';
import ScreenRenderer from '../components/admin/ScreenRenderer';
import { useAuthStore } from '../stores/authStore';
import { useUniversityContext } from '../hooks/useUniversityContext';
import { DEFAULT_BASE_YEAR, BASE_YEAR_OPTIONS } from '../constants/baseYear';

function mergeSlots(templateSlots, assignedSlots) {
  const assignedMap = new Map();
  for (const s of assignedSlots) {
    assignedMap.set(s.slot_id, s);
  }

  const templateSlotIds = new Set(templateSlots.map((ts) => ts.slot_id));

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
  const { scrId, menuId } = useParams();
  const user = useAuthStore((s) => s.user);
  const { statusChips } = useUniversityContext();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('SYS_ADM');

  const [screen, setScreen] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewInfo, setViewInfo] = useState(null);
  const [selectedBaseYear, setSelectedBaseYear] = useState(DEFAULT_BASE_YEAR);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setViewInfo(null);

        // menuId route: use viewer APIs
        if (menuId) {
          const menuInfo = await getViewerMenu(menuId);
          setViewInfo(menuInfo);

          const screenData = await getViewerScreen(menuInfo.screen_id);
          setScreen(screenData);

          const merged = mergeSlots(screenData.template_slots || [], screenData.assigned_slots || []);
          setSlots(merged);
          setLoading(false);
          return;
        }

        // scrId route: admin preview via existing admin APIs
        if (scrId) {
          const screenData = await getScreen(scrId);
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

          const merged = mergeSlots(templateSlots, assignedSlots);
          setSlots(merged);
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || '화면을 불러오지 못했습니다.');
        setLoading(false);
      }
    };
    fetchData();
  }, [scrId, menuId]);

  // scrId route: non-admin users are blocked
  if (scrId && !isAdmin) {
    return <Navigate to="/" replace />;
  }

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

  const title = viewInfo?.title || screen?.scr_nm || '화면 보기';
  const subtitle = viewInfo?.subtitle || (scrId ? `화면 ID: ${scrId?.slice(0, 8)}…` : null);

  return (
    <div className="relative max-w-[1600px] mx-auto px-8 py-6 overflow-hidden">
      {/* Glassmorphism depth: gradient orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-blue-900/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/3 h-[280px] w-[280px] rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative z-10">
        <PageTitleSection
          title={title}
          subtitle={subtitle}
          baseYear={viewInfo?.year_dependent ? selectedBaseYear : null}
          baseYearOptions={viewInfo?.year_dependent ? BASE_YEAR_OPTIONS : undefined}
          onBaseYearChange={viewInfo?.year_dependent ? setSelectedBaseYear : undefined}
        />

        {menuId && statusChips.length > 0 && (
          <StatusChips filters={statusChips} />
        )}

        <ScreenRenderer
          slots={slots}
          baseYear={viewInfo?.year_dependent ? selectedBaseYear : null}
          className="border-white/50 bg-white/35 shadow-2xl shadow-black/5 backdrop-blur-2xl"
          style={{
            gridTemplateRows: 'repeat(6, minmax(120px, 1fr))',
          }}
        />
      </div>
    </div>
  );
}
