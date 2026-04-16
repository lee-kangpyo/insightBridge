import { useAuth } from '../../contexts/AuthContext';
import MenuItem from './MenuItem';

export default function LNBMenu() {
  const { userMenus } = useAuth();

  return (
    <nav className="w-56 bg-surface border-r border-outline-variant h-full overflow-y-auto">
      <div className="py-4">
        {userMenus.map((menu) => (
          <MenuItem key={menu.menu_id} menu={menu} />
        ))}
      </div>
    </nav>
  );
}