import { useState, useEffect } from 'react';
import { getRoles, getMenus, toggleRoleMenu } from '../../services/adminApi';

export default function RoleMenuMatrix() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [roleMenuMap, setRoleMenuMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRoleId = (role) => {
    // Backend expects integer `role_id`. Do NOT fall back to role code like "EMP".
    const candidate = role?.grp_id ?? role?.role_id ?? role?.roleId ?? role?.id;
    if (candidate === null || candidate === undefined || candidate === '') return undefined;
    const asNumber = typeof candidate === 'number' ? candidate : Number(candidate);
    return Number.isFinite(asNumber) ? asNumber : undefined;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, menusData] = await Promise.all([
        getRoles(),
        getMenus(),
      ]);
      setRoles(rolesData);
      setMenus(menusData);
      const initialMap = {};
      menusData.forEach(menu => {
        initialMap[menu.menu_id] = {};
        rolesData.forEach(role => {
          const roleId = getRoleId(role);
          if (roleId === undefined) return;
          initialMap[menu.menu_id][roleId] = menu.role_ids?.includes(roleId) || false;
        });
      });
      setRoleMenuMap(initialMap);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (menuId, roleId, currentValue) => {
    const newValue = !currentValue;
    setRoleMenuMap(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [roleId]: newValue,
      },
    }));
    try {
      await toggleRoleMenu(menuId, roleId, newValue);
    } catch (err) {
      setRoleMenuMap(prev => ({
        ...prev,
        [menuId]: {
          ...prev[menuId],
          [roleId]: currentValue,
        },
      }));
      setError(err.message || 'Failed to update permission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-on-surface">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-headline text-2xl font-bold text-on-surface mb-6">
            역할-메뉴 권한 매트릭스
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-error/10 border border-error rounded-lg text-error">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-surface-variant rounded-lg overflow-hidden shadow">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-3 text-left font-semibold min-w-[200px]">Menu</th>
                  {roles.map(role => {
                    const roleId = getRoleId(role);
                    return (
                      <th key={roleId ?? role?.grp_nm ?? role?.name ?? JSON.stringify(role)} className="px-4 py-3 text-center font-semibold min-w-[120px]">
                        {role?.grp_nm || role?.name || role?.grp_cd || (roleId !== undefined ? `Role ${roleId}` : 'Role')}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {menus.map((menu, index) => (
                  <tr
                    key={menu.menu_id}
                    className={`border-t border-outline ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-variant/50'}`}
                  >
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {menu.menu_nm}
                      <span className="block text-sm text-slate-500">{menu.menu_path}</span>
                    </td>
                    {roles.map(role => {
                      const roleId = getRoleId(role);
                      const checked = roleId !== undefined ? (roleMenuMap[menu.menu_id]?.[roleId] || false) : false;
                      return (
                        <td key={roleId ?? role?.grp_nm ?? role?.name ?? JSON.stringify(role)} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (roleId === undefined) {
                                setError('역할 ID(role_id)가 정수로 제공되지 않아 요청을 보낼 수 없습니다. (grp_id/role_id/id 같은 숫자 필드 필요)');
                                return;
                              }
                              handleToggle(menu.menu_id, roleId, checked);
                            }}
                            className="w-5 h-5 rounded border-outline text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-slate-500">
            총 {menus.length}개 메뉴 × {roles.length}개 역할 = {menus.length * roles.length}개 권한 설정
          </div>
        </div>
    </div>
  );
}
