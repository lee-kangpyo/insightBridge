import api from './api';

/**
 * Viewer API: for authenticated users to access menu-based screen viewing.
 * These endpoints enforce menu-level permissions.
 */

export const getViewerMenu = async (menuId) => {
  const response = await api.get(`/api/viewer/menus/${menuId}`);
  return response.data;
};

export const getViewerScreen = async (screenId) => {
  const response = await api.get(`/api/viewer/screens/${screenId}`);
  return response.data;
};
