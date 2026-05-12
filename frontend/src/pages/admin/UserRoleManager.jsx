import { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import AdminSearchBar from "../../components/common/AdminSearchBar";
import { ADMIN_PAGE_CONTAINER_CLASS } from "../../constants/adminLayout";
import api from "../../services/api";
import { getAdminGroups } from "../../services/adminApi";

export default function UserRoleManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await getAdminGroups();
        setRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("역할 목록 로드 실패:", err);
      }
    };
    loadRoles();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      showToast("검색어를 입력해 주세요.", "info");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/users?search=${searchTerm}`);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("사용자 검색 실패:", err);
      showToast("사용자 검색에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userCd, newGrpId) => {
    try {
      await api.patch(`/api/admin/users/${userCd}/role`, { grp_id: newGrpId });
      setUsers(users.map(u => u.user_cd === userCd ? { ...u, grp_id: newGrpId } : u));
      showToast("역할이 변경되었습니다.");
    } catch (err) {
      console.error("역할 변경 실패:", err);
      showToast("역할 변경에 실패했습니다.", "error");
    }
  };

  return (
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <PageHeader
        title="사용자 역할 관리"
        description="사용자를 검색하여 권한 그룹을 직접 변경합니다."
      />

      <div className="bg-surface-container-lowest rounded-lg p-6 shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
        <h2 className="text-lg font-headline font-semibold text-primary mb-4">사용자 검색</h2>
        <AdminSearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSubmit={searchUsers}
          placeholder="이름 또는 이메일로 검색"
          submitLoading={loading}
          inputWrapperClassName="max-w-md"
        />
      </div>

      {users.length > 0 && (
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <h2 className="text-lg font-headline font-semibold text-primary">검색 결과</h2>
            <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-full uppercase tracking-wider">
              Total {users.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-highest text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold w-16">No</th>
                  <th className="px-4 py-3 font-semibold">이름</th>
                  <th className="px-4 py-3 font-semibold">이메일</th>
                  <th className="px-4 py-3 font-semibold">소속</th>
                  <th className="px-4 py-3 font-semibold">현재 역할</th>
                  <th className="px-4 py-3 font-semibold w-52">역할 변경</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                {users.map((user, idx) => (
                  <tr key={user.user_cd} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{user.user_nm}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{user.user_id}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{user.dept_nm || "—"}</td>
                    <td className="px-4 py-3">
                      {user.grp_nm ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {user.grp_nm}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.grp_id || ""}
                        onChange={e => updateUserRole(user.user_cd, Number(e.target.value))}
                        className="w-full px-3 py-2 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-lg text-sm transition-all focus:ring-0 outline-none text-on-surface"
                      >
                        <option value="">선택안함</option>
                        {roles.map(r => (
                          <option key={r.grp_id} value={r.grp_id}>{r.grp_nm}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="bg-surface-container-lowest rounded-lg p-16 shadow-[0_8px_32px_rgba(24,28,30,0.04)] flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">manage_accounts</span>
          <p className="text-on-surface-variant text-sm">이름 또는 이메일로 사용자를 검색하세요</p>
        </div>
      )}

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
