import { create } from 'zustand';
import { getNavMenus } from '../services/api';

export type NavMenuItem = {
  menu_id: number;
  parent_menu_id: number | null;
  menu_nm: string;
  menu_path?: string;
  children?: NavMenuItem[];
  [key: string]: unknown;
};

type NavMenuState = {
  navMenus: NavMenuItem[];
  loading: boolean;
  error: boolean;
};

type NavMenuActions = {
  fetchNavMenus: () => Promise<void>;
};

export const useNavMenuStore = create<NavMenuState & NavMenuActions>((set) => ({
  navMenus: [],
  loading: false,
  error: false,

  async fetchNavMenus() {
    set({ loading: true, error: false });
    try {
      const data = await getNavMenus();
      set({ navMenus: Array.isArray(data) ? data : [], loading: false });
    } catch {
      set({ loading: false, error: true });
    }
  },
}));