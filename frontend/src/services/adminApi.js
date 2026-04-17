import api from './api';

export const getRoles = async () => {
  const response = await api.get('/api/auth/groups');
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
