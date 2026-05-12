import { useEffect, useState } from 'react';
import { ADMIN_PAGE_CONTAINER_CLASS } from '../../constants/adminLayout';
import PageHeader from '../../components/common/PageHeader';
import GeneralInfoSection from '../../components/content-creation/GeneralInfoSection';
import ChartSettings from '../../components/content-creation/ChartSettings';
import GridSettings from '../../components/content-creation/GridSettings';
import CardSettings from '../../components/content-creation/CardSettings';
import { DEFAULT_CARD_ITEM } from '../../constants/cardFormatting';
import SqlSettings from '../../components/content-creation/SqlSettings';
import ContentsTable from '../../components/content-list/ContentsTable';
import ContentsDetail from '../../components/content-list/ContentsDetail';
import ContentsCreateModal from '../../components/content-creation/ContentsCreateModal';
import ContentsEditModal from '../../components/content-creation/ContentsEditModal';
import Modal from '../../components/common/Modal';
import { createAdminContents, deleteAdminContents, getAdminContentsList } from '../../services/adminApi';
import { validateContentsBeforeSave } from '../../utils/contentsValidation';

const SHOW_DEV_QUICK_ACTIONS =
  import.meta.env.DEV && (import.meta.env.VITE_ADMIN_CONTENTS_DEV_QUICK_ACTIONS ?? 'true') !== 'false';

function toDatetimeLocalValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}`
  );
}

function getInitialGeneralInfo() {
  const now = toDatetimeLocalValue();
  return {
    contentId: '',
    contentName: '',
    creator: '',
    createdAt: now,
    isDeleted: 'N',
    generatedAt: now,
    memo: '',
  };
}

export function ContentsCreate() {
  const [generalInfo, setGeneralInfo] = useState(getInitialGeneralInfo);
  const [contentType, setContentType] = useState('chart');
  const [chartData, setChartData] = useState({ chartTitle: '', chartTitlePosition: 'top', chartType: 'bar', xAxis: '', yAxis: '', legendPosition: 'right' });
  const [gridData, setGridData] = useState({ sectionTitle: '', columns: [] });
  const [cardData, setCardData] = useState({ cardTitle: '', titlePosition: 'left-top', items: [{ ...DEFAULT_CARD_ITEM }] });
  const [sqlData, setSqlData] = useState({ sql: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    const payload = {
      contentName: generalInfo.contentName,
      creator: generalInfo.creator,
      memo: generalInfo.memo,
      contentType,
      data:
        (contentType === 'chart' && chartData) ||
        (contentType === 'grid' && gridData) ||
        (contentType === 'card' && cardData) ||
        (contentType === 'sql' && sqlData) ||
        {},
    };

    const v = validateContentsBeforeSave({ generalInfo, contentType, data: payload.data });
    setShowValidation(true);
    setFieldErrors(v.errors);
    if (!v.ok) {
      showToast(v.message, 'error');
      return;
    }

    setSaving(true);
    try {
      await createAdminContents(payload);
      showToast('저장되었습니다.');
      handleCancel();
    } catch (err) {
      console.error('컨텐츠 저장 실패:', err);
      const msg = err?.response?.data?.detail || '저장에 실패했습니다.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setGeneralInfo(getInitialGeneralInfo());
    setContentType('chart');
    setChartData({ chartTitle: '', chartTitlePosition: 'top', chartType: 'bar', xAxis: '', yAxis: '', legendPosition: 'right' });
    setGridData({ sectionTitle: '', columns: [] });
    setCardData({ cardTitle: '', titlePosition: 'left-top', items: [{ ...DEFAULT_CARD_ITEM }] });
    setSqlData({ sql: '' });
    setShowValidation(false);
    setFieldErrors(null);
  };

  return (
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <PageHeader
        title="컨텐츠 생성"
        description="AI 쿼리와 차트·테이블·카드 설정을 조합하여 새로운 컨텐츠를 만듭니다."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2.5 text-on-surface-variant font-medium rounded-lg hover:bg-surface-container-high transition-all"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-lg">check</span>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        }
      />
      <main className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 pb-12">
        <GeneralInfoSection
          value={generalInfo}
          onChange={setGeneralInfo}
          contentType={contentType}
          onContentTypeChange={setContentType}
          errors={fieldErrors}
          showErrors={showValidation}
        />
        <ChartSettings value={chartData} onChange={setChartData} visible={contentType === 'chart'} errors={{ ...(fieldErrors?.chartFields || {}), ...(fieldErrors?.chart || {}) }} showErrors={showValidation} />
        <GridSettings value={gridData} onChange={setGridData} visible={contentType === 'grid'} errors={{ ...(fieldErrors?.gridFields || {}), ...(fieldErrors?.grid || {}) }} showErrors={showValidation} />
        <CardSettings value={cardData} onChange={setCardData} visible={contentType === 'card'} errors={{ ...(fieldErrors?.cardFields || {}), ...(fieldErrors?.card || {}) }} showErrors={showValidation} />
        <SqlSettings value={sqlData} onChange={setSqlData} visible={contentType === 'sql'} errors={fieldErrors?.sql} showErrors={showValidation} />
      </main>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out] ${
            toast.type === 'error'
              ? 'bg-error text-on-error'
              : toast.type === 'info'
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-tertiary-fixed text-on-tertiary-fixed'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export function ContentsList() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [cloneTarget, setCloneTarget] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async (nextSelectedId = null) => {
      setLoading(true);
      try {
        const list = await getAdminContentsList({ include_deleted: false });
        setContents(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length > 0) {
          const fallbackId = list[0].contentId;
          const candidate = nextSelectedId || selectedId || fallbackId;
          const exists = list.some((c) => c.contentId === candidate);
          setSelectedId(exists ? candidate : fallbackId);
        } else {
          setSelectedId(null);
        }
      } catch (err) {
        console.error('컨텐츠 목록 로드 실패:', err);
        setContents([]);
        setSelectedId(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedContent = contents.find((c) => c.contentId === selectedId) || null;

  return (
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <PageHeader
        title="컨텐츠 목록"
        description="생성된 AI 쿼리, 차트·테이블·카드 설정을 확인하고 관리합니다."
        actions={
          <div className="flex items-center gap-3">
            {SHOW_DEV_QUICK_ACTIONS && (
              <>
                <button
                  type="button"
                  disabled={!selectedContent}
                  onClick={() => {
                    if (!selectedContent) return;
                    setEditTarget(selectedContent);
                    setIsEditOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  수정
                </button>
                <button
                  type="button"
                  disabled={!selectedContent}
                  onClick={() => {
                    if (!selectedContent) return;
                    setCloneTarget(selectedContent);
                    setIsCloneOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                  복제
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              컨텐츠 생성
            </button>
          </div>
        }
      />
      <main className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 items-start">
        {/* 좌측: 목록 테이블 (7/12) */}
        <div className="lg:col-span-7">
          <ContentsTable
            contents={contents}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        {/* 우측: 상세 패널 (5/12) */}
        <div className="lg:col-span-5">
          <ContentsDetail
            content={loading ? null : selectedContent}
            onEdit={(c) => {
              if (!c) return;
              setEditTarget(c);
              setIsEditOpen(true);
            }}
            onDelete={(c) => {
              if (!c) return;
              setDeleteTarget(c);
              setIsDeleteOpen(true);
            }}
          />
        </div>
      </main>

      <ContentsCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={async () => {
          try {
            const list = await getAdminContentsList({ include_deleted: false });
            setContents(Array.isArray(list) ? list : []);
            if (Array.isArray(list) && list.length > 0) {
              setSelectedId(list[0].contentId);
            }
          } catch (err) {
            console.error('컨텐츠 목록 재조회 실패:', err);
          }
        }}
      />
      <ContentsCreateModal
        isOpen={isCloneOpen}
        mode="clone"
        initialContent={cloneTarget}
        onClose={() => {
          setIsCloneOpen(false);
          setCloneTarget(null);
        }}
        onSaved={async () => {
          try {
            const list = await getAdminContentsList({ include_deleted: false });
            setContents(Array.isArray(list) ? list : []);
            if (Array.isArray(list) && list.length > 0) {
              setSelectedId(list[0].contentId);
            }
          } catch (err) {
            console.error('컨텐츠 목록 재조회 실패:', err);
          }
        }}
      />

      <ContentsEditModal
        isOpen={isEditOpen}
        content={editTarget}
        onClose={() => {
          setIsEditOpen(false);
          setEditTarget(null);
        }}
        onSaved={async () => {
          try {
            const list = await getAdminContentsList({ include_deleted: false });
            setContents(Array.isArray(list) ? list : []);
            if (editTarget?.contentId && Array.isArray(list)) {
              const exists = list.some((c) => c.contentId === editTarget.contentId);
              if (exists) setSelectedId(editTarget.contentId);
            }
          } catch (err) {
            console.error('컨텐츠 목록 재조회 실패:', err);
          }
        }}
      />

      <Modal
        isOpen={isDeleteOpen}
        title="컨텐츠 삭제"
        description={deleteTarget?.contentName ? `“${deleteTarget.contentName}”을(를) 삭제할까요?` : '선택된 컨텐츠를 삭제할까요?'}
        variant="dialog"
        onClose={() => {
          if (deleting) return;
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (deleting) return;
                setIsDeleteOpen(false);
                setDeleteTarget(null);
              }}
              className="rounded-md border border-outline bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              취소
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                const id = deleteTarget?.cnts_id;
                if (id === null || id === undefined) return;
                setDeleting(true);
                try {
                  await deleteAdminContents(id);
                  setIsDeleteOpen(false);
                  setDeleteTarget(null);
                  const list = await getAdminContentsList({ include_deleted: false });
                  setContents(Array.isArray(list) ? list : []);
                  if (Array.isArray(list) && list.length > 0) {
                    setSelectedId(list[0].contentId);
                  } else {
                    setSelectedId(null);
                  }
                } catch (err) {
                  console.error('컨텐츠 삭제 실패:', err);
                } finally {
                  setDeleting(false);
                }
              }}
              className="rounded-md bg-error px-4 py-2 text-sm font-semibold text-on-error shadow-sm hover:brightness-95 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        }
      >
        <div className="text-sm text-on-surface-variant">
          삭제된 컨텐츠는 목록에서 숨김 처리됩니다. (논리삭제)
        </div>
      </Modal>
    </div>
  );
}