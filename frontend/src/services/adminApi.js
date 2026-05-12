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

export const getAdminRoleMenuMap = async () => {
  const response = await api.get('/api/admin/role-menu-map');
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

export const createAdminMenuForScreen = async (payload) => {
  const response = await api.post('/api/admin/menus/for-screen', payload);
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

export const moveAdminMenu = async (menuId, targetId, position) => {
  const response = await api.post('/api/admin/menus/move', {
    menu_id: menuId,
    target_id: targetId,
    position,
  });
  return response.data;
};

export const updateUser = async (userCd, data) => {
  const response = await api.patch(`/api/admin/users/${userCd}`, data);
  return response.data;
};

export const deleteUser = async (userCd) => {
  const response = await api.delete(`/api/admin/users/${userCd}`);
  return response.data;
};

export const resetUserPassword = async (userCd, newPassword) => {
  const response = await api.post(`/api/admin/users/${userCd}/reset-password`, {
    new_password: newPassword,
  });
  return response.data;
};

export const getTemplateList = async () => {
  const response = await api.get('/api/admin/screen-templates');
  return response.data;
};

export const getTemplatesByDefault = async (isDefault) => {
  const response = await api.get('/api/admin/screen-templates', {
    params: { is_default: isDefault ? 'Y' : 'N' },
  });
  return response.data;
};

export const createTemplate = async (payload) => {
  const response = await api.post('/api/admin/screen-templates', payload);
  return response.data;
};

export const deleteTemplate = async (templateId) => {
  const response = await api.delete(`/api/admin/screen-templates/${templateId}`);
  return response.data;
};

export const getTemplateReferenceCount = async (templateId) => {
  const response = await api.get(`/api/admin/screen-templates/${templateId}/reference-count`);
  return response.data;
};

export const getTemplateSlots = async (templateId) => {
  const response = await api.get(`/api/admin/screen-templates/${templateId}/slots`);
  const slotsData = response.data || [];
  return slotsData.map((slot, idx) => ({
    ...slot,
    slot_id: slot.slot_id ?? slot.id ?? `slot_${idx}`,
    x_pos: slot.x_pos ?? slot.x ?? 0,
    y_pos: slot.y_pos ?? slot.y ?? 0,
    width: slot.width ?? slot.w ?? 1,
    height: slot.height ?? slot.h ?? 1,
  }));
};

export const getTemplateById = async (templateId) => {
  const response = await api.get(`/api/admin/screen-templates/${templateId}`);
  return response.data;
};

export const getContentsByType = async (type) => {
  const response = await api.get('/api/admin/contents', {
    params: { cnts_tp: type },
  });
  return response.data.contents || [];
};

export const getSqlContents = async () => {
  const response = await api.get('/api/admin/contents', {
    params: { cnts_tp: 'sql' },
  });
  return response.data.contents || [];
};

export const executeSqlPreview = async (cntsId, baseYear) => {
  const params = {};
  if (baseYear != null) params.base_year = baseYear;
  const response = await api.get(`/api/admin/contents/${cntsId}/preview`, { params });
  return response.data;
};

/** 저장 전 SQL 문자열로 미리보기 (관리자) */
export const previewAdminContentsSql = async (sql) => {
  const response = await api.post('/api/admin/contents/preview-sql', { sql });
  return response.data;
};

export const handleApiError = (error, fallbackMessage = '오류가 발생했습니다.') => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return fallbackMessage;
};

// --- Contents (Admin) ---

export const createAdminContents = async (payload) => {
  const response = await api.post('/api/admin/contents', payload);
  return response.data;
};

export const getAdminContentsList = async (params = {}) => {
  const response = await api.get('/api/admin/contents', { params });
  return response.data.contents || [];
};

export const getAdminContentsDetail = async (cntsId) => {
  const response = await api.get(`/api/admin/contents/${cntsId}`);
  return response.data.content;
};

export const patchAdminContents = async (cntsId, payload) => {
  const response = await api.patch(`/api/admin/contents/${cntsId}`, payload);
  return response.data;
};

export const deleteAdminContents = async (cntsId) => {
  const response = await api.delete(`/api/admin/contents/${cntsId}`);
  return response.data;
};

// --- Screen Items ---

export const getItems = async () => {
  const response = await api.get('/api/admin/items');
  console.groupCollapsed?.('[admin/items] GET /api/admin/items');
  console.log('raw response.data =', response?.data);
  console.log('response.data.items =', response?.data?.items);
  console.groupEnd?.();
  return response.data.items || [];
};

export const getItem = async (itemId) => {
  const response = await api.get(`/api/admin/items/${itemId}`);
  return response.data.item;
};

export const createItem = async (payload) => {
  const response = await api.post('/api/admin/items', payload);
  return response.data;
};

export const updateItem = async (itemId, payload) => {
  const response = await api.patch(`/api/admin/items/${itemId}`, payload);
  return response.data;
};

export const deleteItem = async (itemId) => {
  const response = await api.delete(`/api/admin/items/${itemId}`);
  return response.data;
};

// --- Screen Slots ---

export const getScreenSlots = async (scrId) => {
  const response = await api.get(`/api/admin/screens/${scrId}/slots`);
  return response.data.slots || [];
};

export const saveScreenSlots = async (scrId, slots) => {
  const response = await api.put(`/api/admin/screens/${scrId}/slots`, slots);
  return response.data;
};

export const getScreen = async (scrId) => {
  const response = await api.get(`/api/admin/screens/${scrId}`);
  return response.data.screen;
};

export const createScreen = async (payload) => {
  const response = await api.post('/api/admin/screens', payload);
  return response.data;
};

export const getAdminScreensList = async () => {
  const response = await api.get('/api/admin/screens/list');
  return response.data.screens || [];
};

export const deleteScreen = async (scrId) => {
  const response = await api.delete(`/api/admin/screens/${scrId}`);
  return response.data;
};

export const patchScreen = async (scrId, payload) => {
  const response = await api.patch(`/api/admin/screens/${scrId}`, payload);
  return response.data;
};

// --- Viewer API ---

export const getItemRender = async (itemId, ctx) => {
  const params = {};
  if (ctx && ctx.base_year != null) {
    params['ctx[base_year]'] = ctx.base_year;
  }
  const response = await api.get(`/api/items/${itemId}/render`, { params });
  return response.data;
};
