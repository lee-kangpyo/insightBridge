import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { ADMIN_PAGE_CONTAINER_CLASS } from '../../constants/adminLayout';
import { getTemplateById, getTemplateSlots, getItems, getScreenSlots, saveScreenSlots, createScreen } from '../../services/adminApi';
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
  const [items, setItems] = useState([]);
  
  // 화면 생성 관련 상태
  const [scrId, setScrId] = useState(null);
  const [scrNm, setScrNm] = useState('');
  const [isScreenCreated, setIsScreenCreated] = useState(false);
  const [isCreatingScreen, setIsCreatingScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templateData, allItems] = await Promise.all([
          getTemplateById(templateId),
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
      } catch (error) {
        console.error('Failed to fetch template:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [templateId]);

  const handleCreateScreen = useCallback(async () => {
    if (!scrNm.trim()) {
      alert('화면 이름을 입력해주세요.');
      return;
    }
    setIsCreatingScreen(true);
    try {
      const result = await createScreen({
        scr_nm: scrNm,
        template_id: parseInt(templateId, 10),
      });
      setScrId(result.scr_id);
      setIsScreenCreated(true);
    } catch (error) {
      console.error('Failed to create screen:', error);
      alert('화면 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreatingScreen(false);
    }
  }, [scrNm, templateId]);

  const handleSlotClick = useCallback((slot) => {
    if (!isScreenCreated) {
      alert('화면을 먼저 생성해주세요.');
      return;
    }
    setSelectedSlot(slot);
    setIsModalOpen(true);
  }, [isScreenCreated]);

  const handleModalSave = useCallback(async (slotId, assignment) => {
    if (!scrId) {
      alert('화면 ID가 없습니다. 화면을 먼저 생성해주세요.');
      return;
    }
    
    try {
      // 즉시 DB 반영 (Decision 7)
      await saveScreenSlots(scrId, [
        { slot_id: slotId, item_id: assignment?.item_id || null }
      ]);
      
      setSlotAssignments((prev) => {
        const next = new Map(prev);
        if (assignment) {
          next.set(slotId, assignment);
        } else {
          next.delete(slotId);
        }
        return next;
      });
      setIsModalOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Failed to save slot:', error);
      alert('슬롯 저장 중 오류가 발생했습니다.');
    }
  }, [scrId]);

  const handleModalCancel = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  }, []);

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
        </div>
      </div>

      {/* 화면 생성 UI (Decision 6) */}
      {!isScreenCreated && (
        <div className="mb-6 p-6 bg-surface-container rounded-xl border border-outline/20">
          <h3 className="font-semibold text-on-surface mb-3">화면 생성</h3>
          <p className="text-sm text-on-surface-variant mb-4">
            슬롯을 설정하기 전에 화면을 먼저 생성해야 합니다.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={scrNm}
              onChange={(e) => setScrNm(e.target.value)}
              placeholder="화면 이름을 입력하세요"
              className="flex-1 px-4 py-2.5 text-sm bg-surface rounded-lg border border-outline focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleCreateScreen}
              disabled={isCreatingScreen || !scrNm.trim()}
              className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all duration-300 disabled:opacity-50"
            >
              {isCreatingScreen ? '생성 중...' : '화면 생성'}
            </button>
          </div>
        </div>
      )}

      {isScreenCreated && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-primary-container border border-primary/20 rounded-xl text-primary text-xs font-medium">
          <span className="flex h-2 w-2 rounded-full bg-primary"></span>
          화면: {scrNm} (ID: {scrId}) — 슬롯을 클릭하여 아이템을 설정하세요.
        </div>
      )}

      {/* Workspace Area */}
      <div className={`relative flex-1 min-h-[600px] rounded-3xl p-12 overflow-hidden shadow-2xl border border-white/5 transition-colors duration-500 ${isScreenCreated ? 'bg-[#0f172a]' : 'bg-surface-container'}`}>
        {/* Workspace Background Decor */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>

        <div className="relative h-full flex items-center justify-center">
          <div className={`scale-90 xl:scale-100 transition-all duration-500 ${!isScreenCreated ? 'opacity-50 pointer-events-none' : ''}`}>
            <SlotLayout
              slots={slots}
              slotAssignments={slotAssignments}
              onSlotClick={handleSlotClick}
            />
          </div>
          
          {!isScreenCreated && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-surface/90 backdrop-blur-sm rounded-xl px-6 py-4 border border-outline/20 text-center">
                <p className="text-on-surface-variant text-sm">화면을 생성하면 슬롯 편집이 활성화됩니다.</p>
              </div>
            </div>
          )}
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
