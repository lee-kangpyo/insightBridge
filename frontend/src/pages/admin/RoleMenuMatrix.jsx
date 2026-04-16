import { useState, useEffect } from 'react';
import { getRoles, getMenus, toggleRoleMenu } from '../services/adminApi';

const HARDCODED_MENUS = [
  { id: 1, name: 'Dashboard', path: '/dashboard' },
  { id: 2, name: 'Main', path: '/main' },
  { id: 3, name: 'Admission', path: '/admission' },
  { id: 4, name: 'Student Career', path: '/student-career' },
  { id: 5, name: 'Education Faculty', path: '/education-faculty' },
  { id: 6, name: 'Research', path: '/research' },
  { id: 7, name: 'Finance', path: '/finance' },
  { id: 8, name: 'Governance', path: '/governance' },
  { id: 9, name: 'Campus', path: '/campus' },
  { id: 10, name: 'Query', path: '/insights' },
  { id: 11, name: 'Support', path: '/support' },
];

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
        getMenus().catch(() => HARDCODED_MENUS),
      ]);
      setRoles(rolesData);
      setMenus(menusData.length > 0 ? menusData : HARDCODED_MENUS);
      const initialMap = {};
      menusData.forEach(menu => {
        initialMap[menu.id] = {};
        rolesData.forEach(role => {
          initialMap[menu.id][role.id] = menu.role_ids?.includes(role.id) || false;
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-on-surface">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-6 py-8">
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
                  <th key={role.id} className="px-4 py-3 text-center font-semibold min-w-[120px]">
                    {role.name || role.group_name || `Role ${role.id}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {menus.map((menu, index) => (
                <tr
                  key={menu.id}
                  className={`border-t border-outline ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-variant/50'}`}
                >
                  <td className="px-4 py-3 font-medium text-on-surface">
                    {menu.name}
                    <span className="block text-sm text-slate-500">{menu.path}</span>
                  </td>
                  {roles.map(role => (
                    <td key={role.id} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={roleMenuMap[menu.id]?.[role.id] || false}
                        onChange={() => handleToggle(menu.id, role.id, roleMenuMap[menu.id]?.[role.id])}
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
  );
}
