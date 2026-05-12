import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { ADMIN_PAGE_CONTAINER_CLASS } from '../../constants/adminLayout';
import {
  getAdminScreensList,
  deleteScreen,
  patchScreen,
} from '../../services/adminApi';
import ScreenPreviewModal from '../../components/admin/ScreenPreviewModal';
import Modal from '../../components/common/Modal';

function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  const tone =
    type === 'error'
      ? 'bg-error text-on-error'
      : 'bg-tertiary-fixed text-on-tertiary-fixed';
  const icon = type === 'error' ? 'error' : 'check_circle';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 ${tone} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]`}
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="font-medium">{message}</span>
      <button
        type="button"
        className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/10"
        onClick={onClose}
        aria-label="알림 닫기"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

export default function ScreenManagementPage() {
  const navigate = useNavigate();
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewScrId, setPreviewScrId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchScreens = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminScreensList();
      setScreens(data);
    } catch (err) {
      console.error('Failed to fetch screens:', err);
      showToast('화면 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchScreens();
  }, [fetchScreens]);

  const filteredScreens = useMemo(() => {
    if (!searchTerm.trim()) return screens;
    const q = searchTerm.trim().toLowerCase();
    return screens.filter(
      (s) =>
        (s.scr_nm || '').toLowerCase().includes(q) ||
        (s.template_nm || '').toLowerCase().includes(q) ||
        (s.linked_menus || []).some((m) => (m || '').toLowerCase().includes(q)) ||
        String(s.linked_menu_cnt ?? 0).includes(q)
    );
  }, [screens, searchTerm]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteLoading(true);
    setDeleteTarget(null);
    setScreens((prev) => prev.filter((s) => s.scr_id !== target.scr_id));
    try {
      await deleteScreen(target.scr_id);
      showToast(`"${target.scr_nm}" 화면이 삭제되었습니다.`);
    } catch (err) {
      console.error('Failed to delete screen:', err);
      showToast('화면 삭제 중 오류가 발생했습니다.', 'error');
      setScreens((prev) => {
        if (prev.some((s) => s.scr_id === target.scr_id)) return prev;
        return [...prev, target];
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStartEdit = (screen) => {
    setEditingId(screen.scr_id);
    setEditName(screen.scr_nm || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    const originalScreen = screens.find((s) => s.scr_id === editingId);
    const originalName = originalScreen?.scr_nm || '';
    setEditLoading(true);
    setScreens((prev) =>
      prev.map((s) =>
        s.scr_id === editingId ? { ...s, scr_nm: editName.trim() } : s
      )
    );
    try {
      await patchScreen(editingId, { scr_nm: editName.trim() });
      showToast('화면 이름이 수정되었습니다.');
    } catch (err) {
      console.error('Failed to patch screen:', err);
      showToast('화면 이름 수정 중 오류가 발생했습니다.', 'error');
      setScreens((prev) =>
        prev.map((s) =>
          s.scr_id === editingId ? { ...s, scr_nm: originalName } : s
        )
      );
    } finally {
      setEditLoading(false);
      setEditingId(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <PageHeader
          title="화면 관리"
          description="등록된 모든 화면을 조회하고 미리보기, 수정, 삭제할 수 있습니다."
          className="flex-1"
        />
        <button
          onClick={() => navigate('/admin/screen-config/new')}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-on-primary bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          새 화면 만들기
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="화면 이름, 템플릿, 메뉴로 검색..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface rounded-xl border border-outline focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Screen List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredScreens.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-3 opacity-40">
            dashboard
          </span>
          <p className="text-sm">
            {searchTerm.trim()
              ? '검색 결과가 없습니다.'
              : '등록된 화면이 없습니다. 새 화면을 만들어보세요.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredScreens.map((screen, idx) => (
            <div
              key={screen.scr_id}
              className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                {editingId === screen.scr_id ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                      className="flex-1 max-w-sm px-3 py-1.5 text-sm bg-surface rounded-lg border border-outline focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={editLoading || !editName.trim()}
                      className="px-3 py-1.5 text-xs font-semibold text-on-primary bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      {editLoading ? '저장 중…' : '저장'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-xs font-medium text-on-surface bg-surface-container rounded-lg border border-outline hover:bg-surface-container-high transition-colors"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-on-surface text-base mb-1 truncate">
                      {screen.scr_nm}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">grid_view</span>
                        {screen.template_nm || '템플릿 미지정'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">menu</span>
                        연동 메뉴: {screen.linked_menu_cnt ?? 0}개
                      </span>
                      {screen.linked_menus && screen.linked_menus.length > 0 && (
                        <span className="flex items-center gap-1 max-w-xs truncate" title={screen.linked_menus.join(', ')}>
                          <span className="material-symbols-outlined text-[14px]">list</span>
                          {screen.linked_menus.join(', ')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">widgets</span>
                        사용 슬롯: {screen.used_slot_cnt ?? 0}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              {editingId !== screen.scr_id && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewScrId(screen.scr_id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-secondary bg-secondary-container/30 rounded-lg hover:bg-secondary-container/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    미리보기
                  </button>
                  <button
                    onClick={() => handleStartEdit(screen)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-primary bg-primary-container/30 rounded-lg hover:bg-primary-container/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    이름 수정
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/admin/screen-config/edit/${screen.scr_id}`)
                    }
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-on-surface bg-surface-container rounded-lg border border-outline hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    슬롯 편집
                  </button>
                  <button
                    onClick={() => setDeleteTarget(screen)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-error bg-error-container/20 rounded-lg hover:bg-error-container/40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <ScreenPreviewModal
        isOpen={!!previewScrId}
        onClose={() => setPreviewScrId(null)}
        scrId={previewScrId}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="화면 삭제"
        description={`"${deleteTarget?.scr_nm}" 화면을 삭제하시겠습니까? 연동된 ${deleteTarget?.linked_menu_cnt ?? 0}개 메뉴가 함께 소프트 삭제되고 권한 매핑이 정리됩니다. 슬롯 설정은 유지됩니다. 이 작업은 되돌릴 수 없습니다.`}
        variant="dialog"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm font-medium text-on-surface bg-surface-container rounded-lg border border-outline hover:bg-surface-container-high transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm font-bold text-on-error bg-error rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? '삭제 중…' : '삭제'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-on-surface-variant">
          삭제 대상: <strong className="text-on-surface">{deleteTarget?.scr_nm}</strong>
        </p>
        <p className="text-sm text-on-surface-variant mt-1">
          화면 ID: <code className="text-primary font-mono">{deleteTarget?.scr_id}</code>
        </p>
      </Modal>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
