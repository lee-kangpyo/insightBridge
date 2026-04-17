import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MaterialIcon from '../MaterialIcon';

export default function MenuItem({ menu, isAdmin = false }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [wasJustToggled, setWasJustToggled] = useState(false);
  const hasChildren = menu.children && menu.children.length > 0;
  const hasPath = !!menu.path;
  const isActive = hasPath && location.pathname === menu.path;

  useEffect(() => {
    if (hasChildren && hasPath) {
      const isParentOfActive = menu.children?.some(
        (child) => location.pathname === child.path
      );
      if (isParentOfActive && !expanded) {
        setExpanded(true);
        setWasJustToggled(true);
      }
    }
  }, [location.pathname, hasChildren, hasPath, menu.children, expanded]);

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
      setWasJustToggled(false);
    }
  };

  const childItems = hasChildren && expanded && (
    <div
      className="mt-1 space-y-0.5"
      style={{ animation: 'expandIn 0.15s ease-out' }}
    >
      {menu.children.map((child) => (
        <MenuItem key={child.menu_id} menu={child} isAdmin={isAdmin} />
      ))}
    </div>
  );

  const content = (
    <div
      onClick={handleClick}
      className={[
        'group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150',
        isActive && hasPath
          ? 'bg-white shadow-sm'
          : 'hover:bg-white/60',
      ].join(' ')}
      role={hasChildren ? 'button' : undefined}
      aria-expanded={hasChildren ? expanded : undefined}
    >
      {isActive && hasPath && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
          style={{ backgroundColor: '#002c5a' }}
        />
      )}
      <span
        className={[
          'text-[13px] font-medium flex-1 transition-colors duration-150',
          isActive && hasPath
            ? 'text-[#002c5a] font-semibold'
            : isAdmin
              ? 'text-[#2d3133]'
              : 'text-[#181c1e]',
          !isActive && !isActive && 'group-hover:text-[#002c5a]',
        ].join(' ')}
      >
        {menu.menu_nm}
      </span>
      {hasChildren && (
        <MaterialIcon
          name={expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          className={[
            'text-base transition-all duration-150',
            isActive && hasPath ? 'text-[#002c5a]' : 'text-[#737781]',
          ].join(' ')}
        />
      )}
    </div>
  );

  if (hasPath && !hasChildren) {
    return (
      <Link
        to={menu.path}
        className="block"
        onClick={() => setWasJustToggled(false)}
      >
        {content}
      </Link>
    );
  }

  if (hasPath && hasChildren) {
    return (
      <div>
        {content}
        {childItems}
      </div>
    );
  }

  return (
    <div>
      {content}
      {childItems}
    </div>
  );
}