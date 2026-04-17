import { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { getRoles, getMenus, toggleRoleMenu } from '../../services/adminApi';

export default function RoleMenuMatrix() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [roleMenuMap, setRoleMenuMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          initialMap[menu.menu_id][role.grp_id] = menu.role_ids?.includes(role.grp_id) || false;
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
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-on-surface">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
                  {roles.map(role => (
                    <th key={role.grp_id} className="px-4 py-3 text-center font-semibold min-w-[120px]">
                      {role.grp_nm || `Role ${role.grp_id}`}
                    </th>
                  ))}
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
                    {roles.map(role => (
                      <td key={role.grp_id} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={roleMenuMap[menu.menu_id]?.[role.grp_id] || false}
                          onChange={() => handleToggle(menu.menu_id, role.grp_id, roleMenuMap[menu.menu_id]?.[role.grp_id])}
                          className="w-5 h-5 rounded border-outline text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>
                    ))}
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
    </MainLayout>
  );
}
