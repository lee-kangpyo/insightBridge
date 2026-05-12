import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { ADMIN_PAGE_CONTAINER_CLASS } from '../../constants/adminLayout';
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
      <div className={ADMIN_PAGE_CONTAINER_CLASS}>
        <div className="flex items-center justify-center h-64 text-on-surface-variant">
          불러오는 중…
        </div>
      </div>
    );
  }

  return (
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <PageHeader
        title="역할-메뉴 권한 매트릭스"
        description={`총 ${menus.length}개 메뉴 × ${roles.length}개 역할 — 체크박스를 클릭해 권한을 즉시 저장합니다.`}
      />

      {error && (
        <div className="p-4 bg-error/10 border border-error rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-container-highest">
                <th className="px-4 py-3 text-left font-semibold text-on-surface-variant min-w-[200px] sticky left-0 bg-surface-container-highest z-10">
                  메뉴
                </th>
                {roles.map((role, roleIndex) => {
                  const roleId = getRoleId(role);
                  const columnKey =
                    roleId !== undefined ? `role-${roleId}` : `role-col-${roleIndex}`;
                  return (
                    <th
                      key={columnKey}
                      className="px-4 py-3 text-center font-semibold text-on-surface-variant min-w-[120px]"
                    >
                      <div className="text-xs font-medium text-on-surface uppercase tracking-wider">
                        {role?.grp_nm || role?.name || role?.grp_cd || (roleId !== undefined ? `Role ${roleId}` : 'Role')}
                      </div>
                      {role?.grp_cd && role?.grp_nm && (
                        <div className="text-[10px] text-on-surface-variant font-normal normal-case tracking-normal mt-0.5">
                          {role.grp_cd}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {menus.map((menu) => (
                <tr
                  key={menu.menu_id}
                  className="hover:bg-surface-container-low/50 transition-colors"
                >
                  <td className="px-4 py-3 sticky left-0 bg-surface-container-lowest">
                    <div className="font-medium text-on-surface">{menu.menu_nm}</div>
                    <div className="text-xs text-on-surface-variant font-mono mt-0.5">{menu.menu_path}</div>
                  </td>
                  {roles.map((role, roleIndex) => {
                    const roleId = getRoleId(role);
                    const checked = roleId !== undefined ? (roleMenuMap[menu.menu_id]?.[roleId] || false) : false;
                    const columnKey =
                      roleId !== undefined ? `role-${roleId}` : `role-col-${roleIndex}`;
                    return (
                      <td
                        key={columnKey}
                        className="px-4 py-3 text-center"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (roleId === undefined) {
                              setError('역할 ID(role_id)가 정수로 제공되지 않아 요청을 보낼 수 없습니다.');
                              return;
                            }
                            handleToggle(menu.menu_id, roleId, checked);
                          }}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-pointer accent-primary"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-outline-variant/10 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">
            총 {menus.length}개 메뉴 × {roles.length}개 역할 = {menus.length * roles.length}개 권한 설정
          </span>
        </div>
      </div>
    </div>
  );
}
