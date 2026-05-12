import { MenuItem } from '../stores/authStore';

export const ADMIN_MENUS: MenuItem[] = [
  {
    menu_id: 900,
    menu_nm: '메뉴관리',
    path: '/admin/menus',
  },
  {
    menu_id: 920,
    menu_nm: '권한그룹관리',
    path: '/admin/groups',
  },
  {
    menu_id: 931,
    menu_nm: '권한별 메뉴 관리',
    path: '/admin/role-authority-menu',
  },
  {
    menu_id: 922,
    menu_nm: '사용자관리',
    path: '/admin/users',
  },
  {
    menu_id: 932,
    menu_nm: '권한 그룹별 사용자 관리',
    path: '/admin/role-users',
  },
  {
    menu_id: 950,
    menu_nm: '차트 갤러리',
    path: '/admin/chart-gallery',
  },
];