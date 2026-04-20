import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader';
import AdminTable from '../../components/common/AdminTable';
import {
  getAdminGroups,
  createAdminGroup,
  patchAdminGroup,
  deleteAdminGroup,
} from '../../services/adminApi';

const listColumns = [
  { key: 'grp_code', label: '그룹코드', sortable: true },
  { key: 'grp_nm', label: '그룹명', sortable: true },
  {
    key: 'description',
    label: '설명',
    sortable: false,
    render: (val) => (
      <span className="line-clamp-2 text-on-surface-variant max-w-[200px] inline-block align-top" title={val || ''}>
        {val || '—'}
      </span>
    ),
  },
];

function formatRegDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

function mapGroupFromApi(row) {
  const isDeleted = String(row.del_fg ?? 'N').toUpperCase() === 'Y';
  const useYn = String(row.use_yn ?? 'Y').toUpperCase() !== 'N';
  return {
    id: Number(row.grp_id),
    grp_code: row.grp_cd,
    grp_nm: row.grp_nm,
    description: row.description ?? '',
    reg_date: formatRegDate(row.reg_dt),
    use_yn: useYn,
    reg_dt: row.reg_dt,
    del_fg: String(row.del_fg ?? 'N').toUpperCase(),
    is_deleted: isDeleted,
    use_yn_raw: row.use_yn,
  };
}

function GroupListTable({ groups, selectedGroup, isCreating, onSelect, onNew }) {
  return (
    <div className="flex flex-col bg-surface-container-low rounded-lg p-6 min-w-[350px] h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-headline font-bold text-primary">권한 그룹 목록</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-label text-outline uppercase tracking-wider bg-surface-container px-2 py-1 rounded-full">
            Total {groups.length}
          </span>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-medium hover:bg-secondary-fixed transition-colors"
            onClick={onNew}
          >
            새 그룹
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <AdminTable
          columns={listColumns}
          data={groups}
          onSelect={onSelect}
          searchPlaceholder="그룹명 또는 코드 검색..."
          selectedId={isCreating ? null : selectedGroup?.id}
          showRowNumber={true}
        />
      </div>
    </div>
  );
}

function GroupDetailForm({ group, isCreating, formData, onChange, onSave, onDelete }) {
  if (!group && !isCreating) {
    return (
      <div className="flex-1 bg-surface-container-lowest rounded-lg flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.02)]">
        <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-primary to-primary-container" />
        <div className="p-8 flex items-center justify-center h-full">
          <p className="text-on-surface-variant">왼쪽에서 권한 그룹을 선택하거나 &quot;새 그룹&quot;을 누르세요</p>
        </div>
      </div>
    );
  }

  const displayId = isCreating ? '-' : group?.id;
  const displayReg = isCreating ? '-' : (formData?.reg_date ?? '-');
  const isDeleted = !isCreating && String(formData?.del_fg ?? 'N').toUpperCase() === 'Y';

  return (
    <div className="flex-1 bg-surface-container-lowest rounded-lg flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.02)]">
      <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-primary to-primary-container" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-fixed/20 to-transparent rounded-bl-full pointer-events-none opacity-50" />
      <div className="flex items-center text-xs font-label text-outline mb-4 space-x-2 p-8 pb-0">
        <span>시스템관리</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span>권한관리</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-secondary font-medium">권한그룹관리</span>
      </div>
      <div className="p-8 flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-end border-b border-outline-variant/10 pb-6">
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-1">
              {isCreating ? '새 권한 그룹' : '권한 그룹 상세'}
            </h2>
            <p className="text-sm text-outline-variant">
              {isCreating
                ? '그룹코드·그룹명을 입력한 뒤 저장하면 DB(ts_grp_info)에 등록됩니다.'
                : '선택된 권한 그룹 정보를 수정합니다. 삭제는 논리삭제(del_fg)로 처리됩니다.'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isCreating && isDeleted && (
              <span className="px-3 py-1 rounded-full text-xs font-label tracking-wider flex items-center gap-1 font-medium bg-error-container text-on-error-container">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--on-error-container)' }} />
                Deleted
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-label tracking-wider flex items-center gap-1 font-medium ${
                formData.use_yn ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-outline'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: formData.use_yn ? 'var(--on-tertiary-fixed)' : 'var(--outline)' }}
              />
              {formData.use_yn ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2">
          <div className="bg-surface-container-lowest border-l-4 border-primary shadow-sm rounded-r-lg p-4">
            <p className="text-xs font-label text-outline uppercase tracking-wider mb-1">No (grp_id)</p>
            <p className="text-base font-semibold text-on-surface">{displayId}</p>
          </div>
          <div className="bg-surface-container-lowest border-l-4 border-primary shadow-sm rounded-r-lg p-4">
            <p className="text-xs font-label text-outline uppercase tracking-wider mb-1">등록일시</p>
            <p className="text-base font-semibold text-on-surface">{displayReg}</p>
          </div>
        </div>
        <div className="space-y-6 flex-1">
          <h3 className="text-lg font-headline font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">tune</span>
            그룹 설정
          </h3>
          <p className="text-sm text-on-surface-variant -mt-2">
            메뉴 단위 접근 권한은 <strong className="text-on-surface">역할–메뉴</strong> 관리(ts_grp_menu)에서 연결합니다.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant">그룹명</label>
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-base text-on-surface border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all"
                type="text"
                value={formData.grp_nm}
                disabled={isDeleted}
                onChange={(e) => onChange({ ...formData, grp_nm: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant">그룹코드</label>
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-base text-on-surface font-mono border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all"
                type="text"
                value={formData.grp_code}
                disabled={isDeleted}
                onChange={(e) => onChange({ ...formData, grp_code: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface-variant">설명 (description)</label>
            <textarea
              className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-base text-on-surface resize-none border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all"
              rows={3}
              value={formData.description ?? ''}
              disabled={isDeleted}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              placeholder="그룹 용도·권한 범위 등 상세 설명"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
            <div>
              <p className="text-sm font-medium text-on-surface">사용 여부</p>
              <p className="text-xs text-outline-variant">비활성 시 use_yn = N (삭제는 del_fg = Y)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.use_yn}
                disabled={isDeleted}
                onChange={(e) => onChange({ ...formData, use_yn: e.target.checked })}
              />
              <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
            </label>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-end gap-3">
          {!isCreating && (
            <button
              type="button"
              className={`px-6 py-2.5 rounded-lg text-error font-medium text-sm border border-error/30 transition-colors focus:outline-none focus:ring-2 focus:ring-error/20 ${
                isDeleted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-error-container'
              }`}
              onClick={onDelete}
              disabled={isDeleted}
            >
              삭제 (논리)
            </button>
          )}
          <button
            type="button"
            className={`px-8 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 flex items-center gap-2 ${
              isDeleted
                ? 'bg-surface-container text-outline opacity-50 cursor-not-allowed focus:ring-outline/20'
                : 'bg-primary text-on-primary hover:bg-primary-container focus:ring-primary/50'
            }`}
            onClick={onSave}
            disabled={isDeleted}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupManagement() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const rows = await getAdminGroups();
      const mapped = Array.isArray(rows) ? rows.map(mapGroupFromApi) : [];
      setGroups(mapped);
      return mapped;
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        '그룹 목록을 불러오지 못했습니다.';
      setLoadError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setGroups([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleSelectGroup = (group) => {
    setIsCreating(false);
    setSelectedGroup(group);
    setFormData({ ...group });
  };

  const handleNewGroup = () => {
    setSelectedGroup(null);
    setIsCreating(true);
    setFormData({
      id: null,
      grp_code: '',
      grp_nm: '',
      description: '',
      reg_date: '-',
      use_yn: true,
      reg_dt: null,
    });
  };

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  const handleSave = async () => {
    if (!isCreating && String(formData?.del_fg ?? 'N').toUpperCase() === 'Y') {
      alert('삭제된(del_fg=Y) 그룹은 수정할 수 없습니다.');
      return;
    }
    if (!formData.grp_nm?.trim()) {
      alert('그룹명을 입력해주세요.');
      return;
    }
    if (!formData.grp_code?.trim()) {
      alert('그룹코드를 입력해주세요.');
      return;
    }
    try {
      if (isCreating) {
        const { grp_id } = await createAdminGroup({
          grp_cd: formData.grp_code.trim(),
          grp_nm: formData.grp_nm.trim(),
          description: formData.description?.trim() || null,
        });
        const mapped = await loadGroups();
        const created = mapped.find((g) => g.id === Number(grp_id));
        setIsCreating(false);
        if (created) {
          setSelectedGroup(created);
          setFormData({ ...created });
        }
      } else if (selectedGroup) {
        await patchAdminGroup(selectedGroup.id, {
          grp_cd: formData.grp_code.trim(),
          grp_nm: formData.grp_nm.trim(),
          description: formData.description?.trim() || null,
          use_yn: formData.use_yn,
        });
        const mapped = await loadGroups();
        const updated = mapped.find((g) => g.id === selectedGroup.id);
        if (updated) {
          setSelectedGroup(updated);
          setFormData({ ...updated });
        }
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : err.message || '저장에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;
    if (!window.confirm(`"${selectedGroup.grp_nm}" 그룹을 논리삭제하시겠습니까?`)) return;
    try {
      await deleteAdminGroup(selectedGroup.id);
      setSelectedGroup(null);
      setFormData(null);
      await loadGroups();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : err.message || '삭제에 실패했습니다.');
    }
  };

  return (
    <div className="px-10 pb-12 max-w-[1600px] mx-auto flex flex-col gap-8">
      <PageHeader
        title="권한 그룹 관리"
        description="시스템 권한 그룹을 생성하고, 권한 범위를 설정하며, 사용자별 접근 권한을 관리합니다."
      />
      {loadError && (
        <div className="rounded-lg border border-error/40 bg-error-container/30 text-on-error-container px-4 py-3 text-sm">
          {loadError}
        </div>
      )}
      {loading && !groups.length ? (
        <p className="text-on-surface-variant text-sm">불러오는 중…</p>
      ) : null}
      <div className="flex flex-col lg:flex-row gap-6 w-full flex-1 min-h-0">
        <div className="w-full lg:w-1/3 flex flex-col">
          <GroupListTable
            groups={groups}
            selectedGroup={selectedGroup}
            isCreating={isCreating}
            onSelect={handleSelectGroup}
            onNew={handleNewGroup}
          />
        </div>
        <div className="w-full lg:w-2/3 flex flex-col">
          <GroupDetailForm
            group={selectedGroup}
            isCreating={isCreating}
            formData={formData}
            onChange={handleFormChange}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      </div>
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-tertiary-fixed text-on-tertiary-fixed px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-medium">처리되었습니다.</span>
        </div>
      )}
    </div>
  );
}
