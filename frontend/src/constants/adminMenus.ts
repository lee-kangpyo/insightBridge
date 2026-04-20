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
    menu_id: 901,
    menu_nm: '테스트',
    children: [
      {
        menu_id: 911,
        menu_nm: '역할별 메뉴관리',
        path: '/admin/role-menu',
      },
    ],
  },
];