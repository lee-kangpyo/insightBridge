import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MaterialIcon from '../MaterialIcon';

export default function MenuItem({ menu, isAdmin = false, onSelect }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const menuPath = menu.menu_path || menu.path;
  const children = menu.children || [];
  const hasChildren = children.length > 0;
  const hasPath = !!menuPath || !!menu.screen_id;
  const linkTo = menu.screen_id ? `/view/screen/${menu.screen_id}` : menuPath;
  const isActive = hasPath && location.pathname === menuPath;

  useEffect(() => {
    if (hasChildren && hasPath) {
      const isParentOfActive = children.some(
        (child) => location.pathname === (child.menu_path || child.path)
      );
      if (isParentOfActive && !expanded) {
        setExpanded(true);
      }
    }
  }, [location.pathname, hasChildren, hasPath, children, expanded]);

  const handleClick = () => {
    if (hasPath) {
      onSelect?.(menu);
    }
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  const childItems = hasChildren && expanded && (
    <div
      className="mt-1 space-y-0.5"
      style={{ animation: 'expandIn 0.15s ease-out' }}
    >
      {children.map((child) => (
        <MenuItem key={child.menu_id} menu={child} isAdmin={isAdmin} onSelect={onSelect} />
      ))}
    </div>
  );

  // DB menu_level: 1=루트 … 동적 `pl-${n}`는 Tailwind JIT에 잡히지 않을 수 있고,
  // 레벨3→pl-3은 px-3(12px)과 같아 들여쓰기가 안 보이기도 함 → px 기준 추가만큼만 왼쪽 패딩.
  const lvl = Number(menu.menu_level);
  const menuLevel = Number.isFinite(lvl) ? lvl : 0;
  const extraIndentPx = menuLevel > 2 ? (menuLevel - 2) * 10 : 0;

  const content = (
    <div
      onClick={handleClick}
      className={[
        'group relative flex items-center gap-2.5 py-2 pr-3 rounded-lg cursor-pointer transition-all duration-150',
        isActive && hasPath
          ? 'bg-white shadow-sm'
          : 'hover:bg-white/60',
      ].join(' ')}
      style={{ paddingLeft: `${12 + extraIndentPx}px` }}
      role={hasChildren ? 'button' : undefined}
      aria-expanded={hasChildren ? expanded : undefined}
    >
      {isActive && hasPath && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
          style={{ backgroundColor: '#002c5a' }}
        />
      )}
      {menu.screen_id && (
        <span className="material-symbols-outlined text-[14px] text-[#737781]">dashboard</span>
      )}
      <span
        className={[
          'text-[13px] font-medium flex-1 transition-colors duration-150',
          isActive && hasPath
            ? 'text-[#002c5a] font-semibold'
            : isAdmin
              ? 'text-[#2d3133]'
              : 'text-[#181c1e]',
          !isActive && 'group-hover:text-[#002c5a]',
        ].join(' ')}
      >
        {menu.menu_nm}
      </span>
      {menu.screen_id && (
        <span className="text-[10px] uppercase bg-blue-100 text-blue-700 px-1 py-0.5 rounded">슬롯</span>
      )}
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
        to={linkTo}
        className="block"
        onClick={() => onSelect?.(menu)}
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