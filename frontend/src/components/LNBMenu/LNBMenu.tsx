import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import MenuItem from './MenuItem';
import { useUserMenus } from '../../hooks/useUserMenus';
import { ADMIN_MENUS } from '../../constants/adminMenus';
import MaterialIcon from '../MaterialIcon';

export default function LNBMenu() {
  const location = useLocation();
  const userMenus = useAuthStore((s) => s.userMenus);
  useUserMenus();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const menus = isAdminRoute ? ADMIN_MENUS : userMenus;

  const isEmpty = !menus || menus.length === 0;

  return (
    <nav className="h-full flex flex-col" style={{ backgroundColor: '#f1f4f7' }}>
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#002c5a]/10 rounded-full blur-2xl" />
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-[#e5e8eb]">
              <MaterialIcon name="menu_book" className="text-2xl text-[#5a5f64]" />
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-[#2d3133] mb-0.5">메뉴 없음</p>
            <p className="text-xs text-[#737781]">할당된 메뉴가 없습니다</p>
          </div>
          <div className="mt-4 pt-3 border-t border-dashed border-[#c3c6d2]/50 w-full text-center">
            <p className="text-[10px] text-[#737781]">관리자에게 메뉴 접근 권한을 요청하세요</p>
          </div>
        </div>
      ) : (
        <div className="py-6 px-3">
          {isAdminRoute && (
            <div className="mb-6 px-3">
              <h2 className="text-[10px] font-semibold tracking-widest text-[#424750] uppercase">
                System Admin
              </h2>
            </div>
          )}
          {menus.map((menu) => (
            <MenuItem key={menu.menu_id} menu={menu} isAdmin={isAdminRoute} />
          ))}
        </div>
      )}
    </nav>
  );
}