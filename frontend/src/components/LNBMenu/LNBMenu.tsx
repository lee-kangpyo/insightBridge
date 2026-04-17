import { useAuthStore } from '../../stores/authStore';
import MenuItem from './MenuItem';
import { useUserMenus } from '../../hooks/useUserMenus';

export default function LNBMenu() {
  const userMenus = useAuthStore((s) => s.userMenus);
  useUserMenus();

  return (
    <nav className="w-56 min-w-56 bg-surface border-r border-outline-variant h-full overflow-y-auto">
      <div className="py-4">
        {userMenus.map((menu) => (
          <MenuItem key={menu.menu_id} menu={menu} />
        ))}
      </div>
    </nav>
  );
}