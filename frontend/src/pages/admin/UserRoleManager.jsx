import { useState } from "react";
import api from "../../services/api";

export default function UserRoleManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const searchUsers = async () => {
    try {
      const res = await api.get(`/api/admin/users?search=${searchTerm}`);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("사용자 검색 실패:", err);
    }
  };

  const updateUserRole = async (userCd, newGrpId) => {
    try {
      await api.patch(`/api/admin/users/${userCd}/role`, { grp_id: newGrpId });
      setUsers(users.map(u => u.user_cd === userCd ? { ...u, grp_id: newGrpId } : u));
    } catch (err) {
      console.error("역할 변경 실패:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">사용자 역할 관리</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="사용자 이름 또는 이메일 검색"
          className="border p-2 rounded"
        />
        <button onClick={searchUsers} className="bg-blue-500 text-white px-4 py-2 rounded">
          검색
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">사용자</th>
            <th className="border p-2">이메일</th>
            <th className="border p-2">현재 역할</th>
            <th className="border p-2">변경</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.user_cd}>
              <td className="border p-2">{user.user_nm}</td>
              <td className="border p-2">{user.user_id}</td>
              <td className="border p-2">{user.grp_nm || "-"}</td>
              <td className="border p-2">
                <select
                  value={user.grp_id || ""}
                  onChange={e => updateUserRole(user.user_cd, Number(e.target.value))}
                  className="border p-1 rounded"
                >
                  <option value="">선택</option>
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
  );
}