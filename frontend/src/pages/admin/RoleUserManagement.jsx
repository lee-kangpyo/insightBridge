import { useState, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';

const mockRoles = [
  { grp_id: 1, grp_cd: 'ADM', grp_nm: '시스템관리자' },
  { grp_id: 2, grp_cd: 'MGR', grp_nm: '운영관리자' },
  { grp_id: 3, grp_cd: 'USR', grp_nm: '일반사용자' },
  { grp_id: 4, grp_cd: 'STD', grp_nm: '학생' },
  { grp_id: 5, grp_cd: 'INS', grp_nm: '교수' },
];

const mockUsers = [
  { user_id: 101, user_nm: '김철수', user_email: 'cheolsu@example.com', dept_nm: '컴퓨터공학과' },
  { user_id: 102, user_nm: '이영희', user_email: 'younghee@example.com', dept_nm: '경영학과' },
  { user_id: 103, user_nm: '박지민', user_email: 'jimin@example.com', dept_nm: '컴퓨터공학과' },
  { user_id: 104, user_nm: '최민수', user_email: 'minsu@example.com', dept_nm: '전자공학과' },
  { user_id: 105, user_nm: '정수진', user_email: 'sujin@example.com', dept_nm: '수학과' },
  { user_id: 106, user_nm: '강동원', user_email: 'dongwon@example.com', dept_nm: '물리학과' },
  { user_id: 107, user_nm: '손예진', user_email: 'yejin@example.com', dept_nm: '화학과' },
  { user_id: 108, user_nm: '유아인', user_email: 'ain@example.com', dept_nm: '생물학과' },
];

const mockAssigned = {
  1: [101, 102, 103],
  2: [104, 105],
  3: [106, 107, 108],
  4: [],
  5: [101],
};

function RoleUserManagement() {
  const [viewMode, setViewMode] = useState('USER');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [assignedIds, setAssignedIds] = useState([]);
  const [selectedAssignedIds, setSelectedAssignedIds] = useState([]);
  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [initialAssignedIds, setInitialAssignedIds] = useState([]);
  const [showToast, setShowToast] = useState(false);

  const leftPanelData = useMemo(() => {
    return viewMode === 'USER' ? mockUsers : mockRoles;
  }, [viewMode]);

  const rightPanelData = useMemo(() => {
    return viewMode === 'USER' ? mockRoles : mockUsers;
  }, [viewMode]);

  const assignedItems = useMemo(() => {
    return rightPanelData.filter((item) => {
      const id = viewMode === 'USER' ? item.grp_id : item.user_id;
      return assignedIds.includes(id);
    });
  }, [rightPanelData, assignedIds, viewMode]);

  const availableItems = useMemo(() => {
    return rightPanelData.filter((item) => {
      const id = viewMode === 'USER' ? item.grp_id : item.user_id;
      return !assignedIds.includes(id);
    });
  }, [rightPanelData, assignedIds, viewMode]);

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    setSelectedItemId(null);
    setSelectedAssignedIds([]);
    setSelectedAvailableIds([]);
  };

  const handleAddItems = () => {
    if (selectedAvailableIds.length === 0) return;
    setAssignedIds((prev) => [...prev, ...selectedAvailableIds]);
    setSelectedAvailableIds([]);
  };

  const handleRemoveItems = () => {
    if (selectedAssignedIds.length === 0) return;
    setAssignedIds((prev) => prev.filter((id) => !selectedAssignedIds.includes(id)));
    setSelectedAssignedIds([]);
  };

  const handleSave = () => {
    const saveData = {
      viewMode,
      [viewMode === 'USER' ? 'user_id' : 'grp_id']: selectedItemId,
      assignedIds,
      savedAt: new Date().toISOString(),
    };
    console.log('저장할 데이터:', JSON.stringify(saveData, null, 2));
    setInitialAssignedIds([...assignedIds]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('변경사항을 초기화하시겠습니까?')) {
      setAssignedIds([...initialAssignedIds]);
      setSelectedAssignedIds([]);
      setSelectedAvailableIds([]);
    }
  };

  const isDirty = JSON.stringify(assignedIds.sort()) !== JSON.stringify(initialAssignedIds.sort());

  return (
    <div className="px-10 pb-12 max-w-[1920px] mx-auto flex flex-col gap-8">
      <PageHeader
        title="권한 그룹별 사용자 관리"
        description="권한 그룹에 사용자를 배정하고 관리합니다."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-surface-container-lowest rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'USER'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
                onClick={() => handleViewModeChange('USER')}
              >
                사용자 기준
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'GROUP'
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
                onClick={() => handleViewModeChange('GROUP')}
              >
                권한그룹 기준
              </button>
            </div>
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
              disabled={!selectedItemId || !isDirty}
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
            <h3 className="font-headline font-semibold text-lg text-primary mb-3">
              {viewMode === 'USER' ? '사용자 목록' : '권한 그룹'}
            </h3>
          </div>
          <div className="overflow-y-auto no-scrollbar max-h-[500px] flex flex-col gap-1">
            {leftPanelData.map((item, index) => {
              const id = viewMode === 'USER' ? item.user_id : item.grp_id;
              const displayName = viewMode === 'USER' ? item.user_nm : item.grp_nm;
              const subText = viewMode === 'USER' ? item.dept_nm : item.grp_cd;
              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                    selectedItemId === id
                      ? 'bg-primary-container/20 text-primary font-semibold'
                      : 'hover:bg-surface-container text-on-surface'
                  }`}
                  onClick={() => setSelectedItemId(id)}
                >
                  <span className="text-xs text-on-surface-variant w-6">{index + 1}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{displayName}</span>
                    <span className="text-xs text-on-surface-variant">{subText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex gap-4 items-start">
          <div className="flex-1 bg-surface-container-lowest rounded-lg p-6 flex flex-col gap-4 min-h-[600px]">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-semibold text-lg text-primary">
                {viewMode === 'USER' ? '배정된 권한 그룹' : '배정된 사용자'}
              </h3>
              <span className="text-sm text-on-surface-variant">총 {assignedItems.length}건</span>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1">
              {selectedItemId ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant w-10">
                        <input
                          type="checkbox"
                          checked={assignedItems.length > 0 && selectedAssignedIds.length === assignedItems.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssignedIds(assignedItems.map((item) => viewMode === 'USER' ? item.grp_id : item.user_id));
                            } else {
                              setSelectedAssignedIds([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant w-12">No</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">
                        {viewMode === 'USER' ? '그룹명' : '사용자명'}
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">
                        {viewMode === 'USER' ? '그룹코드' : '소속'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedItems.map((item, index) => {
                      const id = viewMode === 'USER' ? item.grp_id : item.user_id;
                      const displayName = viewMode === 'USER' ? item.grp_nm : item.user_nm;
                      const subText = viewMode === 'USER' ? item.grp_cd : item.dept_nm;
                      return (
                        <tr
                          key={id}
                          className={`border-b border-outline-variant/50 hover:bg-surface-container ${
                            selectedAssignedIds.includes(id) ? 'bg-primary-container/10' : ''
                          }`}
                        >
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={selectedAssignedIds.includes(id)}
                              onChange={() => {
                                setSelectedAssignedIds((prev) =>
                                  prev.includes(id)
                                    ? prev.filter((i) => i !== id)
                                    : [...prev, id]
                                );
                              }}
                              className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="py-2 px-3 text-sm text-on-surface-variant">{index + 1}</td>
                          <td className="py-2 px-3 text-sm font-medium text-on-surface">{displayName}</td>
                          <td className="py-2 px-3 text-sm text-on-surface-variant font-mono">{subText}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-48 text-on-surface-variant text-sm">
                  {viewMode === 'USER' ? '사용자를 선택하세요' : '권한 그룹을 선택하세요'}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-center">
            <button
              className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleAddItems}
              disabled={selectedAvailableIds.length === 0 || !selectedItemId}
              title="추가"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              className="w-12 h-12 rounded-full bg-error text-on-error flex items-center justify-center hover:bg-error-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleRemoveItems}
              disabled={selectedAssignedIds.length === 0 || !selectedItemId}
              title="제거"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>

          <div className="flex-1 bg-surface-container-lowest rounded-lg p-6 flex flex-col gap-4 min-h-[600px]">
            <div className="flex justify-between items-center">
              <h3 className="font-headline font-semibold text-lg text-primary">
                {viewMode === 'USER' ? '전체 권한 그룹' : '전체 사용자'}
              </h3>
              <span className="text-sm text-on-surface-variant">총 {availableItems.length}건</span>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1">
              {selectedItemId ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant w-10">
                        <input
                          type="checkbox"
                          checked={availableItems.length > 0 && selectedAvailableIds.length === availableItems.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAvailableIds(availableItems.map((item) => viewMode === 'USER' ? item.grp_id : item.user_id));
                            } else {
                              setSelectedAvailableIds([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant w-12">No</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">
                        {viewMode === 'USER' ? '그룹명' : '사용자명'}
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-on-surface-variant">
                        {viewMode === 'USER' ? '그룹코드' : '소속'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableItems.map((item, index) => {
                      const id = viewMode === 'USER' ? item.grp_id : item.user_id;
                      const displayName = viewMode === 'USER' ? item.grp_nm : item.user_nm;
                      const subText = viewMode === 'USER' ? item.grp_cd : item.dept_nm;
                      return (
                        <tr
                          key={id}
                          className={`border-b border-outline-variant/50 hover:bg-surface-container ${
                            selectedAvailableIds.includes(id) ? 'bg-primary-container/10' : ''
                          }`}
                        >
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={selectedAvailableIds.includes(id)}
                              onChange={() => {
                                setSelectedAvailableIds((prev) =>
                                  prev.includes(id)
                                    ? prev.filter((i) => i !== id)
                                    : [...prev, id]
                                );
                              }}
                              className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="py-2 px-3 text-sm text-on-surface-variant">{index + 1}</td>
                          <td className="py-2 px-3 text-sm font-medium text-on-surface">{displayName}</td>
                          <td className="py-2 px-3 text-sm text-on-surface-variant font-mono">{subText}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-48 text-on-surface-variant text-sm">
                  {viewMode === 'USER' ? '사용자를 선택하세요' : '권한 그룹을 선택하세요'}
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

export default RoleUserManagement;
