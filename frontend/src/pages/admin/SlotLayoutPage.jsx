import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { ADMIN_PAGE_CONTAINER_CLASS } from '../../constants/adminLayout';
import { getTemplateById, getTemplateSlots } from '../../services/adminApi';
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

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const [templateData, slotsData] = await Promise.all([
          getTemplateById(templateId),
          getTemplateSlots(templateId),
        ]);
        setTemplate(templateData);
        setSlots(slotsData || []);
      } catch (error) {
        console.error('Failed to fetch template:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
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
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <PageHeader
        title="슬롯 레이아웃 구성"
        description={`템플릿: ${template?.name || templateId}`}
      />

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/admin/screen-config')}
          className="px-4 py-2 text-sm font-medium text-on-surface bg-surface-container rounded-lg border border-outline hover:bg-surface-container-high transition-colors"
        >
          ← 템플릿 목록으로
        </button>
        {hasChanges && (
          <span className="text-sm text-amber-600">
            변경사항이 있습니다. 저장되지 않은 변경사항은 페이지를 벗어나면 사라집니다.
          </span>
        )}
      </div>

      <SlotLayout
        slots={slots}
        slotAssignments={slotAssignments}
        onSlotClick={handleSlotClick}
      />

      {isModalOpen && selectedSlot && (
        <SlotConfigModal
          slot={selectedSlot}
          assignment={slotAssignments.get(selectedSlot.slot_id)}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
}
