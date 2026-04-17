import { useState, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';

const mockRoles = [
  { grp_id: 1, grp_cd: 'ADM', grp_nm: '시스템관리자' },
  { grp_id: 2, grp_cd: 'MGR', grp_nm: '운영관리자' },
  { grp_id: 3, grp_cd: 'USR', grp_nm: '일반사용자' },
  { grp_id: 4, grp_cd: 'STD', grp_nm: '학생' },
  { grp_id: 5, grp_cd: 'INS', grp_nm: '교수' },
];

const mockMenus = [
  { menu_id: 1, menu_nm: '개요', menu_path: '/dashboard' },
  { menu_id: 2, menu_nm: '재정', menu_path: '/finance' },
  { menu_id: 3, menu_nm: '학생 현황', menu_path: '/student-career' },
  { menu_id: 4, menu_nm: '교수진', menu_path: '/education-faculty' },
  { menu_id: 5, menu_nm: '연구', menu_path: '/research' },
  { menu_id: 6, menu_nm: '입학', menu_path: '/admission' },
  { menu_id: 7, menu_nm: '캄퍼스', menu_path: '/campus' },
  { menu_id: 8, menu_nm: '지자체구', menu_path: '/governance' },
];

const mockAssignedMenus = {
  1: [1, 2, 3, 4, 5, 6, 7, 8],
  2: [1, 2, 3, 6],
  3: [1, 3],
  4: [1, 3],
  5: [1, 3, 4, 5],
};

function RoleAuthorityMenu() {
  const [roles] = useState(mockRoles);
  const [allMenus] = useState(mockMenus);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [assignedMenuIds, setAssignedMenuIds] = useState([]);
  const [initialAssignedMenuIds, setInitialAssignedMenuIds] = useState([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [selectedAssignedMenuIds, setSelectedAssignedMenuIds] = useState([]);
  const [selectedAvailableMenuIds, setSelectedAvailableMenuIds] = useState([]);
  const [showToast, setShowToast] = useState(false);

  const selectedRole = useMemo(
    () => roles.find((r) => r.grp_id === selectedRoleId),
    [roles, selectedRoleId]
  );

  const assignedMenus = useMemo(
    () => allMenus.filter((m) => assignedMenuIds.includes(m.menu_id)),
    [allMenus, assignedMenuIds]
  );

  const availableMenus = useMemo(
    () => allMenus.filter((m) => !assignedMenuIds.includes(m.menu_id)),
    [allMenus, assignedMenuIds]
  );

  const filteredRoles = useMemo(
    () =>
      roles.filter(
        (r) =>
          r.grp_nm.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
          r.grp_cd.toLowerCase().includes(roleSearchTerm.toLowerCase())
      ),
    [roles, roleSearchTerm]
  );

  const filteredAvailableMenus = useMemo(
    () =>
      availableMenus.filter(
        (m) =>
          m.menu_nm.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
          m.menu_path.toLowerCase().includes(menuSearchTerm.toLowerCase())
      ),
    [availableMenus, menuSearchTerm]
  );

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
    const menus = mockAssignedMenus[roleId] || [];
    setAssignedMenuIds([...menus]);
    setInitialAssignedMenuIds([...menus]);
    setSelectedAssignedMenuIds([]);
    setSelectedAvailableMenuIds([]);
  };

  const handleAddMenus = () => {
    if (selectedAvailableMenuIds.length === 0) return;
    setAssignedMenuIds((prev) => [...prev, ...selectedAvailableMenuIds]);
    setSelectedAvailableMenuIds([]);
  };

  const handleRemoveMenus = () => {
    if (selectedAssignedMenuIds.length === 0) return;
    setAssignedMenuIds((prev) => prev.filter((id) => !selectedAssignedMenuIds.includes(id)));
    setSelectedAssignedMenuIds([]);
  };

  const handleSave = () => {
    const saveData = {
      grp_id: selectedRoleId,
      menu_ids: assignedMenuIds,
      savedAt: new Date().toISOString(),
    };
    console.log('저장할 데이터:', JSON.stringify(saveData, null, 2));
    setInitialAssignedMenuIds([...assignedMenuIds]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('변경사항을 초기화하시겠습니까?')) {
      setAssignedMenuIds([...initialAssignedMenuIds]);
      setSelectedAssignedMenuIds([]);
      setSelectedAvailableMenuIds([]);
    }
  };

  const isDirty = JSON.stringify(assignedMenuIds.sort()) !== JSON.stringify(initialAssignedMenuIds.sort());

  return (
    <div className="px-10 pb-12 max-w-[1920px] mx-auto flex flex-col gap-8">
      <PageHeader
        title="권한별 메뉴 관리"
        description="권한 그룹별로 접근 가능한 메뉴를 배정하고 관리합니다."
        actions={
          <div className="flex gap-3">
            <button
              className="px-6 py-2.5 rounded-md border border-outline text-on-surface font-medium hover:bg-surface-container transition-colors text-sm"
              onClick={handleReset}
              disabled={!isDirty}
            >
              초기화
            </button>
            <button
              className="px-6 py-2.5 rounded-md bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors text-sm flex items-center gap-2"
              onClick={handleSave}
              disabled={!selectedRoleId || !isDirty}
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              저장
            </button>
          </div>
        }
      />

      <div className="flex gap-6 items-start">
        <div className="w-72 shrink-0 bg-surface-container-lowest rounded-lg p-6 flex flex-col gap-4">
          <div>
            <h3 className="font-headline font-semibold text-lg text-primary mb-3">권한 그룹</h3>
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                className="w-full bg-surface-container-low text-sm text-on-surface py-2 pl-9 pr-3 rounded-md border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all placeholder:text-on-surface-variant/70"
                placeholder="검색..."
                type="text"
                value={roleSearchTerm}
                onChange={(e) => setRoleSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto no-scrollbar max-h-[500px] flex flex-col gap-1">
            {filteredRoles.map((role, index) => (
              <div
                key={role.grp_id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                  selectedRoleId === role.grp_id
                    ? 'bg-primary-container/20 text-primary font-semibold'
                    : 'hover:bg-surface-container text-on-surface'
                }`}
                onClick={() => handleRoleSelect(role.grp_id)}
              >
                <span className="text-xs text-on-surface-variant w-6">{index + 1}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{role.grp_cd}</span>
                  <span className="text-xs text-on-surface-variant">{role.grp_nm}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex gap-4 items-start">
          <div className="flex-1 bg-surface-container-lowest rounded-lg p-6 flex flex-col gap-4 min-h-[600px]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-headline font-semibold text-lg text-primary">배정된 메뉴</h3>
                {selectedRole && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-on-surface">{selectedRole.grp_nm}</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                      선택됨
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm text-on-surface-variant">총 {assignedMenus.length}건</span>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1">
              {selectedRoleId ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant w-10">
                        <input
                          type="checkbox"
                          checked={assignedMenus.length > 0 && selectedAssignedMenuIds.length === assignedMenus.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssignedMenuIds(assignedMenus.map((m) => m.menu_id));
                            } else {
                              setSelectedAssignedMenuIds([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant w-12">No</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">메뉴명</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">메뉴경로</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedMenus.map((menu, index) => (
                      <tr
                        key={menu.menu_id}
                        className={`border-b border-outline-variant/50 hover:bg-surface-container ${
                          selectedAssignedMenuIds.includes(menu.menu_id) ? 'bg-primary-container/10' : ''
                        }`}
                      >
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={selectedAssignedMenuIds.includes(menu.menu_id)}
                            onChange={() => {
                              setSelectedAssignedMenuIds((prev) =>
                                prev.includes(menu.menu_id)
                                  ? prev.filter((id) => id !== menu.menu_id)
                                  : [...prev, menu.menu_id]
                              );
                            }}
                            className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="py-2 px-3 text-sm text-on-surface-variant">{index + 1}</td>
                        <td className="py-2 px-3 text-sm font-medium text-on-surface">{menu.menu_nm}</td>
                        <td className="py-2 px-3 text-sm text-on-surface-variant font-mono">{menu.menu_path}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-48 text-on-surface-variant text-sm">
                  권한 그룹을 선택하세요
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-center">
            <button
              className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleAddMenus}
              disabled={selectedAvailableMenuIds.length === 0 || !selectedRoleId}
              title="추가"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              className="w-12 h-12 rounded-full bg-error text-on-error flex items-center justify-center hover:bg-error-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleRemoveMenus}
              disabled={selectedAssignedMenuIds.length === 0 || !selectedRoleId}
              title="제거"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>

          <div className="flex-1 bg-surface-container-lowest rounded-lg p-6 flex flex-col gap-4 min-h-[600px]">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-semibold text-lg text-primary">전체 시스템 메뉴</h3>
              <span className="text-sm text-on-surface-variant">총 {filteredAvailableMenus.length}건</span>
            </div>
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                className="w-full bg-surface-container-low text-sm text-on-surface py-2 pl-9 pr-3 rounded-md border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all placeholder:text-on-surface-variant/70"
                placeholder="검색..."
                type="text"
                value={menuSearchTerm}
                onChange={(e) => setMenuSearchTerm(e.target.value)}
              />
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1">
              {selectedRoleId ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant w-10">
                        <input
                          type="checkbox"
                          checked={filteredAvailableMenus.length > 0 && selectedAvailableMenuIds.length === filteredAvailableMenus.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAvailableMenuIds(filteredAvailableMenus.map((m) => m.menu_id));
                            } else {
                              setSelectedAvailableMenuIds([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant w-12">No</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">메뉴명</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">메뉴경로</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAvailableMenus.map((menu, index) => (
                      <tr
                        key={menu.menu_id}
                        className={`border-b border-outline-variant/50 hover:bg-surface-container ${
                          selectedAvailableMenuIds.includes(menu.menu_id) ? 'bg-primary-container/10' : ''
                        }`}
                      >
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={selectedAvailableMenuIds.includes(menu.menu_id)}
                            onChange={() => {
                              setSelectedAvailableMenuIds((prev) =>
                                prev.includes(menu.menu_id)
                                  ? prev.filter((id) => id !== menu.menu_id)
                                  : [...prev, menu.menu_id]
                              );
                            }}
                            className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="py-2 px-3 text-sm text-on-surface-variant">{index + 1}</td>
                        <td className="py-2 px-3 text-sm font-medium text-on-surface">{menu.menu_nm}</td>
                        <td className="py-2 px-3 text-sm text-on-surface-variant font-mono">{menu.menu_path}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-48 text-on-surface-variant text-sm">
                  권한 그룹을 선택하세요
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-tertiary-fixed text-on-tertiary-fixed px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-medium">변경사항이 저장되었습니다.</span>
        </div>
      )}
    </div>
  );
}

export default RoleAuthorityMenu;