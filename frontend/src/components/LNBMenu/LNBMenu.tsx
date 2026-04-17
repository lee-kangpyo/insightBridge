import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import MenuItem from './MenuItem';
import { useUserMenus } from '../../hooks/useUserMenus';
import { ADMIN_MENUS } from '../../constants/adminMenus';

export default function LNBMenu() {
  const location = useLocation();
  const userMenus = useAuthStore((s) => s.userMenus);
  useUserMenus();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const menus = isAdminRoute ? ADMIN_MENUS : userMenus;

  return (
    <nav className="h-full overflow-y-auto" style={{ backgroundColor: '#f1f4f7' }}>
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
    </nav>
  );
}