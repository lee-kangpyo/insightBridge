import { MenuItem } from '../stores/authStore';

export const ADMIN_MENUS: MenuItem[] = [
  {
    menu_id: 900,
    menu_nm: '메뉴관리',
    path: '/admin/menus',
  },
  {
    menu_id: 901,
    menu_nm: '테스트',
    children: [
      {
        menu_id: 911,
        menu_nm: '역할별 메뉴관리',
        path: '/admin/role-menu',
      },
      {
        menu_id: 921,
        menu_nm: '사용자 권한 관리',
        path: '/admin/users',
      },
    ],
  },
];