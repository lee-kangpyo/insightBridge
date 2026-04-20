import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { getUsers } from '../../services/adminApi';

const PHONE_EMPTY = { p1: '', p2: '', p3: '' };

function parsePhone(value) {
  if (!value) return PHONE_EMPTY;
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) {
    return { p1: cleaned.slice(0, 3), p2: cleaned.slice(3, 7), p3: cleaned.slice(7) };
  }
  if (cleaned.length === 10) {
    return { p1: cleaned.slice(0, 3), p2: cleaned.slice(3, 6), p3: cleaned.slice(6) };
  }
  return PHONE_EMPTY;
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const PAGE_SIZE = 5;

  const loadUsers = async () => {
    try {
      const data = await getUsers(searchTerm);
      setUsers(data);
      setSelectedUser(null);
      setFormData(null);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        user_nm: selectedUser.user_nm || '',
        univ_cd: selectedUser.univ_cd || '',
        dept_nm: selectedUser.dept_nm || '',
        grade_nm: selectedUser.grade_nm || '',
        pos_nm: selectedUser.pos_nm || '',
        mobile: parsePhone(`${selectedUser.mobile1 || ''}${selectedUser.mobile2 || ''}${selectedUser.mobile3 || ''}`),
        office: parsePhone(`${selectedUser.office1 || ''}${selectedUser.office2 || ''}${selectedUser.office3 || ''}`),
      });
    }
  }, [selectedUser]);

  const totalUsers = users.length;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalUsers);
  const paginatedUsers = users.slice(startIdx, endIdx);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRowClick = (user, idx) => {
    const globalIdx = startIdx + idx;
    setSelectedUser(user);
    setCurrentPage(Math.floor(globalIdx / PAGE_SIZE) + 1);
  };

  const handleSave = () => {
    if (!selectedUser || !formData) return;
    const submitData = {
      user_cd: selectedUser.user_cd,
      user_id: selectedUser.user_id,
      user_nm: formData.user_nm,
      univ_cd: formData.univ_cd,
      dept_nm: formData.dept_nm,
      grade_nm: formData.grade_nm,
      pos_nm: formData.pos_nm,
      mobile1: formData.mobile.p1,
      mobile2: formData.mobile.p2,
      mobile3: formData.mobile.p3,
      office1: formData.office.p1,
      office2: formData.office.p2,
      office3: formData.office.p3,
    };
    console.log('저장:', JSON.stringify(submitData, null, 2));
    setUsers(users.map(u => u.user_cd === selectedUser.user_cd ? { ...u, ...submitData } : u));
    setSelectedUser(prev => ({ ...prev, ...submitData }));
    showToast('변경사항이 저장되었습니다.');
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    const deleteData = {
      user_cd: selectedUser.user_cd,
      user_nm: selectedUser.user_nm,
      deletedAt: new Date().toISOString(),
    };
    console.log('삭제:', JSON.stringify(deleteData, null, 2));
    setUsers(users.filter(u => u.user_cd !== selectedUser.user_cd));
    setSelectedUser(null);
    setFormData(null);
    setShowDeleteConfirm(false);
    showToast('사용자가 삭제되었습니다.', 'error');
  };

  const handlePhoneChange = (field, subField, value) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 4);
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [subField]: cleaned },
    }));
  };

  if (!paginatedUsers.length && users.length === 0) {
    return (
      <div className="px-10 pb-12 max-w-7xl mx-auto flex flex-col gap-8">
        <PageHeader title="사용자 관리" description="시스템 사용자 목록 및 상세 정보를 관리합니다." />
        <div className="flex items-center justify-center h-64 text-on-surface-variant">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="px-10 pb-12 max-w-7xl mx-auto flex flex-col gap-8">
      <PageHeader title="사용자 관리" description="시스템 사용자 목록 및 상세 정보를 관리합니다." />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-lg p-6 relative z-10 shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
            <h2 className="text-lg font-headline font-semibold text-primary mb-4">사용자 검색</h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                <input
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface placeholder:text-outline"
                  placeholder="이름 또는 이메일로 검색"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                />
              </div>
              <button
                className="bg-primary-container text-on-primary-container px-4 py-2 rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                onClick={loadUsers}
              >
                검색
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-lg overflow-hidden relative z-10 shadow-[0_8px_32px_rgba(24,28,30,0.04)] flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-container-highest text-on-surface-variant font-medium">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16">No</th>
                    <th className="px-6 py-4 font-semibold">ID (Email)</th>
                    <th className="px-6 py-4 font-semibold">Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                  {paginatedUsers.map((user, idx) => {
                    const globalIdx = startIdx + idx;
                    const isSelected = selectedUser?.user_cd === user.user_cd;
                    return (
                      <tr
                        key={user.user_cd}
                        className={`hover:bg-surface-container-low/50 transition-colors cursor-pointer relative ${isSelected ? 'bg-secondary-fixed/30' : ''}`}
                        onClick={() => handleRowClick(user, idx)}
                      >
                        <td className="px-6 py-4">{globalIdx + 1}</td>
                        <td className={`px-6 py-4 font-medium ${isSelected ? 'text-secondary' : ''}`}>{user.user_id}</td>
                        <td className="px-6 py-4">{user.user_nm}</td>
                        {isSelected && <td className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-outline-variant/10 flex justify-between items-center text-xs text-on-surface-variant">
              <span>Showing {startIdx + 1} to {endIdx} of {totalUsers} users</span>
              <div className="flex gap-1">
                <button
                  className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container-low disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`w-8 h-8 rounded flex items-center justify-center ${page === currentPage ? 'bg-secondary-fixed text-on-secondary-fixed font-medium' : 'hover:bg-surface-container-low'}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container-low disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest rounded-lg p-8 relative z-10 shadow-[0_8px_32px_rgba(24,28,30,0.04)] h-full flex flex-col">
            {!selectedUser ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-on-surface-variant">좌측 목록에서 사용자를 선택하세요</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-4">
                  <h2 className="text-xl font-headline font-bold text-primary">사용자 상세 정보</h2>
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 rounded-md text-sm font-medium text-error hover:bg-error-container hover:text-on-error-container transition-colors"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      삭제
                    </button>
                    <button
                      className="px-4 py-2 rounded-md text-sm font-medium bg-primary-container text-on-primary-container hover:bg-primary hover:text-white transition-colors"
                      onClick={handleSave}
                    >
                      저장
                    </button>
                  </div>
                </div>
                <form className="space-y-6 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">No</label>
                      <input
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b-2 border-transparent rounded-t-md text-sm text-outline outline-none cursor-not-allowed"
                        readOnly
                        type="text"
                        value={selectedUser.user_cd}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">ID (Email)</label>
                      <input
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b-2 border-transparent rounded-t-md text-sm text-outline outline-none cursor-not-allowed"
                        readOnly
                        type="text"
                        value={selectedUser.user_id}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">이름 (Name)</label>
                      <input
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface"
                        type="text"
                        value={formData?.user_nm || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, user_nm: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">대학 코드 (Univ Code)</label>
                      <input
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface"
                        type="text"
                        value={formData?.univ_cd || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, univ_cd: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">부서명 (Department)</label>
                      <input
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface"
                        type="text"
                        value={formData?.dept_nm || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, dept_nm: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">직급 (Position)</label>
                      <input
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface"
                        type="text"
                        value={formData?.grade_nm || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, grade_nm: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">직책 (Job Title)</label>
                      <input
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface"
                        type="text"
                        value={formData?.pos_nm || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, pos_nm: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">휴대전화 (Mobile)</label>
                      <div className="flex items-center gap-2">
                        <input
                          className="w-16 px-3 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface text-center"
                          type="tel"
                          maxLength={4}
                          value={formData?.mobile.p1 || ''}
                          onChange={(e) => handlePhoneChange('mobile', 'p1', e.target.value)}
                        />
                        <span className="text-on-surface-variant">-</span>
                        <input
                          className="w-16 px-3 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface text-center"
                          type="tel"
                          maxLength={4}
                          value={formData?.mobile.p2 || ''}
                          onChange={(e) => handlePhoneChange('mobile', 'p2', e.target.value)}
                        />
                        <span className="text-on-surface-variant">-</span>
                        <input
                          className="w-16 px-3 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface text-center"
                          type="tel"
                          maxLength={4}
                          value={formData?.mobile.p3 || ''}
                          onChange={(e) => handlePhoneChange('mobile', 'p3', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">사무실 번호 (Office)</label>
                      <div className="flex items-center gap-2">
                        <input
                          className="w-16 px-3 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface text-center"
                          type="tel"
                          maxLength={4}
                          value={formData?.office.p1 || ''}
                          onChange={(e) => handlePhoneChange('office', 'p1', e.target.value)}
                        />
                        <span className="text-on-surface-variant">-</span>
                        <input
                          className="w-16 px-3 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface text-center"
                          type="tel"
                          maxLength={4}
                          value={formData?.office.p2 || ''}
                          onChange={(e) => handlePhoneChange('office', 'p2', e.target.value)}
                        />
                        <span className="text-on-surface-variant">-</span>
                        <input
                          className="w-16 px-3 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-t-md text-sm transition-all focus:ring-0 outline-none text-on-surface text-center"
                          type="tel"
                          maxLength={4}
                          value={formData?.office.p3 || ''}
                          onChange={(e) => handlePhoneChange('office', 'p3', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-on-surface-variant uppercase tracking-wider">등록일 (Reg Date)</label>
                      <input
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b-2 border-transparent rounded-t-md text-sm text-outline outline-none cursor-not-allowed"
                        readOnly
                        type="text"
                        value={selectedUser.reg_dt || '-'}
                      />
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className={`fixed bottom-6 right-6 ${toastType === 'error' ? 'bg-error text-on-error' : 'bg-tertiary-fixed text-on-tertiary-fixed'} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]`}>
          <span className="material-symbols-outlined text-[20px]">{toastType === 'error' ? 'error' : 'check_circle'}</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-headline font-bold text-primary mb-4">삭제 확인</h3>
            <p className="text-on-surface mb-6">"{selectedUser?.user_nm}" 사용자를 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border border-outline text-on-surface text-sm font-medium hover:bg-surface-container-low transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </button>
              <button
                className="px-4 py-2 rounded-md bg-error text-on-error text-sm font-medium hover:bg-error-container transition-colors"
                onClick={handleDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}