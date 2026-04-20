import api from './api';

export const getUsers = async (search = '') => {
  const response = await api.get(`/api/admin/users?search=${encodeURIComponent(search)}`);
  return response.data.users || [];
};

export const getRoles = async () => {
  const response = await api.get('/api/auth/groups');
  return response.data;
};

/** SYS_ADM: ts_grp_info 전체(비활성 포함) */
export const getAdminGroups = async () => {
  const response = await api.get('/api/admin/groups');
  return response.data;
};

export const createAdminGroup = async (payload) => {
  const response = await api.post('/api/admin/groups', payload);
  return response.data;
};

export const patchAdminGroup = async (grpId, payload) => {
  const response = await api.patch(`/api/admin/groups/${grpId}`, payload);
  return response.data;
};

export const deleteAdminGroup = async (grpId) => {
  const response = await api.delete(`/api/admin/groups/${grpId}`);
  return response.data;
};

export const getMenus = async () => {
  const response = await api.get('/api/menus');
  return response.data;
};

export const toggleRoleMenu = async (menuId, roleId, enabled) => {
  if (menuId === null || menuId === undefined) {
    throw new Error('toggleRoleMenu: menuId is required');
  }
  if (roleId === null || roleId === undefined || roleId === '') {
    throw new Error('toggleRoleMenu: roleId is required');
  }
  const response = await api.patch('/api/admin/role-menu', {
    menu_id: menuId,
    role_id: roleId,
    enabled,
  });
  return response.data;
};

/** SYS_ADM 전용: 메뉴 트리 + 플랫 목록 */
export const getAdminMenuTree = async () => {
  const response = await api.get('/api/admin/menus/tree');
  return response.data;
};

export const createAdminMenu = async (payload) => {
  const response = await api.post('/api/admin/menus', payload);
  return response.data;
};

export const patchAdminMenu = async (menuId, payload) => {
  const response = await api.patch(`/api/admin/menus/${menuId}`, payload);
  return response.data;
};

export const deleteAdminMenu = async (menuId) => {
  const response = await api.delete(`/api/admin/menus/${menuId}`);
  return response.data;
};
