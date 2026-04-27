import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { ADMIN_PAGE_CONTAINER_CLASS } from '../../constants/adminLayout';
import { getTemplateById, getTemplateSlots, getItems, getScreenSlots, saveScreenSlots } from '../../services/adminApi';
import SlotLayout from '../../components/admin/SlotLayout/SlotLayout';
import SlotConfigModal from '../../components/admin/SlotLayout/SlotConfigModal';

export default function SlotLayoutPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotAssignments, setSlotAssignments] = useState(new Map());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templateData, assignedSlots, allItems] = await Promise.all([
          getTemplateById(templateId),
          getTemplateSlots(templateId),
          getItems(),
        ]);

        setTemplate(templateData);
        setItems(allItems);

        // Normalize blueprint slots
        const blueprintSlots = (templateData.slots || []).map((s, idx) => ({
          ...s,
          slot_id: s.slot_id ?? s.id ?? `slot_${idx}`,
          x_pos: s.x_pos ?? s.x ?? 0,
          y_pos: s.y_pos ?? s.y ?? 0,
          width: s.width ?? s.w ?? 1,
          height: s.height ?? s.h ?? 1,
        }));
        setSlots(blueprintSlots);

        // Populate assignments from template slots (legacy) or screen slots
        const assignments = new Map();
        (assignedSlots || []).forEach((s) => {
          if (s.item_id) {
            const item = allItems.find((i) => i.item_id === s.item_id);
            assignments.set(s.slot_id, {
              item_id: s.item_id,
              item_nm: item?.item_nm || s.scr_nm || s.item_id,
              cnts_tp: item?.mapping_json?.type || 'default',
            });
          }
        });
        setSlotAssignments(assignments);
      } catch (error) {
        console.error('Failed to fetch template:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [templateId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const handleSlotClick = useCallback((slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  }, []);

  const handleModalSave = useCallback((slotId, assignment) => {
    setSlotAssignments((prev) => {
      const next = new Map(prev);
      if (assignment) {
        next.set(slotId, assignment);
      } else {
        next.delete(slotId);
      }
      return next;
    });
    setHasChanges(true);
    setIsModalOpen(false);
    setSelectedSlot(null);
  }, []);

  const handleModalCancel = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const slotsToSave = Array.from(slotAssignments.entries()).map(([slotId, assignment]) => ({
        slot_id: slotId,
        item_id: assignment?.item_id || null,
      }));
      
      // Note: We need a screen ID to save. For now, we'll use templateId as a fallback
      // In a real scenario, you'd have a screen selected
      await saveScreenSlots(templateId, slotsToSave);
      setHasChanges(false);
      alert('저장되었습니다.');
    } catch (error) {
      console.error('Failed to save slots:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  }, [slotAssignments, templateId]);

  if (loading) {
    return (
      <div className={ADMIN_PAGE_CONTAINER_CLASS}>
        <div className="flex items-center justify-center h-48">
          <span className="text-on-surface-variant">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${ADMIN_PAGE_CONTAINER_CLASS} animate-in fade-in duration-700`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader
          title="슬롯 레이아웃 구성"
          description={`템플릿: ${template?.name || templateId}`}
          className="flex-1"
        />
        
        <div className="flex items-center gap-3 pb-2">
          <button
            onClick={() => navigate('/admin/screen-config')}
            className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-on-surface bg-white rounded-xl border border-outline/20 shadow-sm hover:bg-surface-container-low hover:border-primary/30 transition-all duration-300"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
            템플릿 목록
          </button>
          
          <button
            className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
            disabled={!hasChanges}
            onClick={handleSave}
          >
            변경사항 저장
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium animate-bounce-subtle">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          저장되지 않은 변경사항이 있습니다.
        </div>
      )}

      {/* Workspace Area */}
      <div className="relative flex-1 min-h-[600px] bg-[#0f172a] rounded-3xl p-12 overflow-hidden shadow-2xl border border-white/5">
        {/* Workspace Background Decor */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>

        <div className="relative h-full flex items-center justify-center">
          <div className="scale-90 xl:scale-100 transition-transform duration-500">
            <SlotLayout
              slots={slots}
              slotAssignments={slotAssignments}
              onSlotClick={handleSlotClick}
            />
          </div>
        </div>
        
        {/* Canvas Controls Placeholder */}
        <div className="absolute bottom-8 right-8 flex gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-widest">
            Canvas 12x6
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-widest">
            Zoom 100%
          </div>
        </div>
      </div>

      {isModalOpen && selectedSlot && (
        <SlotConfigModal
          slot={selectedSlot}
          assignment={slotAssignments.get(selectedSlot.slot_id)}
          items={items}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
}
