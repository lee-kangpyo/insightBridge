import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { ADMIN_PAGE_CONTAINER_CLASS } from '../../constants/adminLayout';
import { deleteItem, getItems, handleApiError } from '../../services/adminApi';
import Modal from '../../components/common/Modal';
import ScreenItemFormModal from '../../components/admin/items/ScreenItemFormModal';
import Phase1ItemPreview from '../../components/admin/items/Phase1ItemPreview';
import YearDependentBadge from '../../components/common/YearDependentBadge';

function mappingSummary(mapping) {
  if (!mapping || typeof mapping !== 'object') return '—';
  const t = mapping.type;
  if (t) return String(t);
  return '—';
}

export default function ItemsManagement() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await getItems();
      const rows = Array.isArray(list) ? list : [];
      console.groupCollapsed?.('[admin/items] ItemsManagement.reload');
      console.log('list(from getItems)=', list);
      console.log('rows(normalized)=', rows);
      console.log('rows[0]=', rows?.[0]);
      console.groupEnd?.();
      setItems(rows);
      if (rows.length === 0) {
        setSelectedId(null);
      } else {
        setSelectedId((prev) => {
          if (prev != null && rows.some((r) => r.item_id === prev)) return prev;
          return rows[0].item_id;
        });
      }
    } catch (e) {
      setLoadError(handleApiError(e, '목록을 불러오지 못했습니다.'));
      setItems([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const selected = items.find((r) => r.item_id === selectedId) || null;

  return (
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <PageHeader
        title="아이템 관리"
        description="화면 슬롯에 연결할 콘텐츠 형태·SQL·맵핑을 묶은 아이템을 등록하고 수정합니다."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/screen-config')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-outline bg-surface-container-low hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined text-lg">dashboard_customize</span>
              화면 구성
            </button>
            <button
              type="button"
              onClick={() => {
                setFormMode('create');
                setEditId(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              아이템 등록
            </button>
          </div>
        }
      />

      <main className="w-full max-w-[1600px] mx-auto pb-12">
        {loadError && (
          <div className="mb-4 p-3 rounded-lg bg-error-container text-error text-sm">{loadError}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-outline/20 bg-surface-container-lowest overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr className="border-b border-outline/20 bg-surface-container text-on-surface-variant text-left">
                      <th className="py-3 px-4 font-semibold w-24">ID</th>
                      <th className="py-3 px-4 font-semibold min-w-[260px]">이름</th>
                      <th className="py-3 px-4 font-semibold w-24 whitespace-nowrap">형태 ID</th>
                      <th className="py-3 px-4 font-semibold w-24 whitespace-nowrap">SQL ID</th>
                      <th className="py-3 px-4 font-semibold w-24 whitespace-nowrap">맵핑</th>
                      <th className="py-3 px-4 font-semibold w-32 text-right whitespace-nowrap">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                          불러오는 중...
                        </td>
                      </tr>
                    )}
                    {!loading && items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                          등록된 아이템이 없습니다. &quot;아이템 등록&quot;으로 추가하세요.
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      items.map((row) => (
                        <tr
                          key={row.item_id}
                          onClick={() => setSelectedId(row.item_id)}
                          className={`border-b border-outline/10 cursor-pointer transition-colors ${
                            selectedId === row.item_id
                              ? 'bg-primary-container/40'
                              : 'hover:bg-surface-container-high/60'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono text-on-surface-variant">{row.item_id}</td>
                          <td className="py-3 px-4 font-medium text-on-surface min-w-[260px] break-words">
                            {row.item_nm}
                          </td>
                          <td className="py-3 px-4 text-on-surface-variant font-mono text-xs whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {row.shape_cnts_id ?? '—'}
                              {row.year_dependent && <YearDependentBadge compact />}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-on-surface-variant font-mono text-xs whitespace-nowrap">
                            {row.sql_cnts_id ?? '—'}
                          </td>
                          <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                            {mappingSummary(row.mapping_json)}
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setFormMode('edit');
                                setEditId(row.item_id);
                                setFormOpen(true);
                              }}
                              className="mr-2 text-primary text-xs font-semibold hover:underline"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(row);
                                setDeleteOpen(true);
                              }}
                              className="text-error text-xs font-semibold hover:underline"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            {!selected || loading ? (
              <div className="rounded-2xl border border-outline/20 bg-surface-container-lowest shadow-sm p-10 text-center text-on-surface-variant">
                {loading ? '불러오는 중...' : '아이템을 선택하세요.'}
              </div>
            ) : (
              <Phase1ItemPreview item={selected} />
            )}
          </div>
        </div>
      </main>

      <ScreenItemFormModal
        isOpen={formOpen}
        mode={formMode}
        editItemId={formMode === 'edit' ? editId : null}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
        }}
        onSaved={reload}
      />

      <Modal
        isOpen={deleteOpen}
        title="아이템 삭제"
        description={
          deleteTarget?.item_nm
            ? `“${deleteTarget.item_nm}”을(를) 삭제할까요?`
            : '선택한 아이템을 삭제할까요?'
        }
        variant="dialog"
        onClose={() => {
          if (deleting) return;
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (deleting) return;
                setDeleteOpen(false);
                setDeleteTarget(null);
              }}
              className="rounded-md border border-outline bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-high"
            >
              취소
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                const id = deleteTarget?.item_id;
                if (id == null) return;
                setDeleting(true);
                try {
                  await deleteItem(id);
                  setDeleteOpen(false);
                  setDeleteTarget(null);
                  await reload();
                } catch (err) {
                  console.error(err);
                } finally {
                  setDeleting(false);
                }
              }}
              className="rounded-md bg-error px-4 py-2 text-sm font-semibold text-on-error shadow-sm hover:brightness-95 disabled:opacity-60"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        }
      >
        <div className="text-sm text-on-surface-variant">삭제된 아이템은 목록에서 제외됩니다. (논리삭제)</div>
      </Modal>
    </div>
  );
}
