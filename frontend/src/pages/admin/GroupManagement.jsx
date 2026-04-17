import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import AdminTable from '../../components/common/AdminTable';
import { loadMenuData } from '../../components/common/MenuDataLoader';

const mockGroupData = [
  { id: 1, grp_code: 'ADM', grp_nm: '입학관리자', description: '입학/선발 지표 조회 및 점검 권한', use_yn: true, permissions: ['admission', 'overview(read)'], reg_date: '2026-04-15 14:40:00' },
  { id: 2, grp_code: 'IR_ANALYST', grp_nm: '지표분석자', description: 'IR 지표 분석 및 리포트 권한', use_yn: true, permissions: ['overview(read)'], reg_date: '2026-04-10 09:00:00' },
  { id: 3, grp_code: 'FIN_CTRL', grp_nm: '재정통제자', description: '재정 현황 조회 및 통제 권한', use_yn: true, permissions: ['finance(read)'], reg_date: '2026-04-08 11:20:00' },
  { id: 4, grp_code: 'STD_SUPPORT', grp_nm: '학생지원담당', description: '학생 지원 업무 권한', use_yn: false, permissions: ['student(read)'], reg_date: '2026-03-20 16:30:00' },
  { id: 5, grp_code: 'SUPER_ADMIN', grp_nm: '시스템총괄', description: '시스템 전체 관리자 권한', use_yn: true, permissions: ['admin', 'admission', 'overview(read)', 'finance(read)', 'student(read)'], reg_date: '2026-01-01 00:00:00' },
];

const listColumns = [
  { key: 'grp_code', label: '그룹코드', sortable: true },
  { key: 'grp_nm', label: '그룹명', sortable: true },
];

function GroupListTable({ groups, selectedGroup, onSelect }) {
  return (
    <div className="flex flex-col bg-surface-container-low rounded-lg p-6 min-w-[350px] h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-headline font-bold text-primary">권한 그룹 목록</h2>
        <span className="text-xs font-label text-outline uppercase tracking-wider bg-surface-container px-2 py-1 rounded-full">
          Total {groups.length}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <AdminTable
          columns={listColumns}
          data={groups}
          onSelect={onSelect}
          searchPlaceholder="그룹명 또는 코드 검색..."
          selectedId={selectedGroup?.id}
          showRowNumber={true}
        />
      </div>
    </div>
  );
}

function GroupDetailForm({ group, formData, onChange, onSave, onDelete }) {
  if (!group) {
    return (
      <div className="flex-1 bg-surface-container-lowest rounded-lg flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.02)]">
        <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-primary to-primary-container" />
        <div className="p-8 flex items-center justify-center h-full">
          <p className="text-on-surface-variant">왼쪽에서 권한 그룹을 선택하세요</p>
        </div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-headline font-bold text-primary mb-1">권한 그룹 상세</h2>
            <p className="text-sm text-outline-variant">선택된 권한 그룹의 세부 정보 및 설정</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-label tracking-wider flex items-center gap-1 font-medium ${
              formData.use_yn ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-outline'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: formData.use_yn ? 'var(--on-tertiary-fixed)' : 'var(--outline)' }} />
              {formData.use_yn ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2">
          <div className="bg-surface-container-lowest border-l-4 border-primary shadow-sm rounded-r-lg p-4">
            <p className="text-xs font-label text-outline uppercase tracking-wider mb-1">No</p>
            <p className="text-base font-semibold text-on-surface">{group.id}</p>
          </div>
          <div className="bg-surface-container-lowest border-l-4 border-primary shadow-sm rounded-r-lg p-4">
            <p className="text-xs font-label text-outline uppercase tracking-wider mb-1">Registration Date</p>
            <p className="text-base font-semibold text-on-surface">{group.reg_date}</p>
          </div>
        </div>
        <div className="space-y-6 flex-1">
          <h3 className="text-lg font-headline font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">tune</span>
            Group Configuration
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant">Group Name (그룹명)</label>
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-base text-on-surface border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all"
                type="text"
                value={formData.grp_nm}
                onChange={(e) => onChange({ ...formData, grp_nm: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant">Group Code (그룹코드)</label>
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-base text-on-surface font-mono border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all"
                type="text"
                value={formData.grp_code}
                onChange={(e) => onChange({ ...formData, grp_code: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface-variant">Description (설명)</label>
            <textarea
              className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-base text-on-surface resize-none border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all"
              rows="3"
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
            <div>
              <p className="text-sm font-medium text-on-surface">사용여부 (System Status)</p>
              <p className="text-xs text-outline-variant">시스템 내 해당 그룹의 활성화 상태</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.use_yn}
                onChange={(e) => onChange({ ...formData, use_yn: e.target.checked })}
              />
              <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
            </label>
          </div>
          <div className="space-y-3 pt-2 border-t border-outline-variant/10">
            <label className="block text-sm font-medium text-on-surface-variant mb-2">Permission Scope (권한 범위)</label>
            <div className="flex flex-wrap gap-2">
              {formData.permissions.map((perm, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-primary-fixed text-primary-container rounded-lg text-sm font-medium border border-primary-fixed-dim/30 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  {perm}
                  <button
                    className="ml-1 hover:text-error transition-colors"
                    onClick={() => onChange({ ...formData, permissions: formData.permissions.filter((_, i) => i !== idx) })}
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
              <span
                className="px-3 py-1.5 bg-surface-container text-outline-variant rounded-lg text-sm font-medium border border-outline-variant/20 hover:bg-surface-container-high cursor-pointer transition-colors flex items-center gap-1 border-dashed"
                onClick={() => {
                  const newPerm = prompt('권한 태그를 입력하세요:');
                  if (newPerm && newPerm.trim()) {
                    onChange({ ...formData, permissions: [...formData.permissions, newPerm.trim()] });
                  }
                }}
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Permission
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-end gap-3">
          <button
            className="px-6 py-2.5 rounded-lg text-error font-medium text-sm border border-error/30 hover:bg-error-container transition-colors focus:outline-none focus:ring-2 focus:ring-error/20"
            onClick={onDelete}
          >
            삭제 (Delete)
          </button>
          <button
            className="px-8 py-2.5 rounded-lg bg-primary text-on-primary font-medium text-sm hover:bg-primary-container transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center gap-2"
            onClick={onSave}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            저장 (Save)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GroupManagement() {
  const [groups, setGroups] = useState(mockGroupData);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoadSuccess, setShowLoadSuccess] = useState(false);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setFormData({ ...group });
  };

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  const handleSave = () => {
    if (!formData.grp_nm || !formData.grp_nm.trim()) {
      alert('그룹명을 입력해주세요.');
      return;
    }
    if (!formData.grp_code || !formData.grp_code.trim()) {
      alert('그룹코드를 입력해주세요.');
      return;
    }
    console.log('저장할 데이터:', JSON.stringify({ ...formData, savedAt: new Date().toISOString() }, null, 2));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDelete = () => {
    if (window.confirm(`"${selectedGroup?.grp_nm}" 그룹을 삭제하시겠습니까?`)) {
      console.log('삭제할 그룹:', JSON.stringify(selectedGroup, null, 2));
      setGroups(groups.filter(g => g.id !== selectedGroup.id));
      setSelectedGroup(null);
      setFormData(null);
    }
  };

  const handleLoadPermissions = async () => {
    try {
      const menuData = await loadMenuData();
      console.log('권한 불러오기 결과:', JSON.stringify(menuData, null, 2));
      setShowLoadSuccess(true);
      setTimeout(() => setShowLoadSuccess(false), 3000);
    } catch (error) {
      console.error('권한 불러오기 실패:', error);
      alert('권한 데이터를 불러오는 데 실패했습니다.');
    }
  };

  return (
    <div className="px-10 pb-12 max-w-[1600px] mx-auto flex flex-col gap-8">
      <PageHeader
        title="권한 그룹 관리"
        description="시스템 권한 그룹을 생성하고, 권한 범위를 설정하며, 사용자별 접근 권한을 관리합니다."
      />
      <div className="flex flex-col lg:flex-row gap-6 w-full flex-1 min-h-0">
        <div className="w-full lg:w-1/3 flex flex-col">
          <GroupListTable
            groups={groups}
            selectedGroup={selectedGroup}
            onSelect={handleSelectGroup}
          />
        </div>
        <div className="w-full lg:w-2/3 flex flex-col">
          <GroupDetailForm
            group={selectedGroup}
            formData={formData}
            onChange={handleFormChange}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          className="px-6 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container font-medium text-sm hover:bg-secondary-fixed transition-colors shadow-sm flex items-center gap-2"
          onClick={handleLoadPermissions}
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          권한 불러오기
        </button>
      </div>
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-tertiary-fixed text-on-tertiary-fixed px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-medium">변경사항이 저장되었습니다.</span>
        </div>
      )}
      {showLoadSuccess && (
        <div className="fixed bottom-6 right-6 bg-secondary-fixed text-on-secondary-fixed px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-[20px]">download</span>
          <span className="font-medium">권한 데이터를 불러왔습니다. 콘솔을 확인하세요.</span>
        </div>
      )}
    </div>
  );
}
