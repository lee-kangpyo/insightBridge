import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from '../MaterialIcon';
import { useNavMenuStore } from '../../stores/navMenuStore';

const SidebarMenuItem = React.memo(function SidebarMenuItem({ menu, level, activeMenuId, onSelect }) {
  const [expanded, setExpanded] = useState(level === 0);
  const children = menu.children || [];
  const hasChildren = children.length > 0;
  const hasPath = !!menu.menu_path;
  const isActive = activeMenuId === menu.menu_id;
  const isDisabled = String(menu.use_yn ?? 'Y').toUpperCase() === 'N';

  const handleClick = () => {
    if (isDisabled) return;
    if (hasPath) {
      onSelect(menu);
    } else if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  return (
    <div>
      <div
        className={[
          'group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150',
          isDisabled ? 'opacity-50 cursor-not-allowed' : '',
          isActive && hasPath ? 'bg-white shadow-sm' : 'hover:bg-white/60',
        ].join(' ')}
        onClick={handleClick}
        role={hasChildren && !isDisabled ? 'button' : undefined}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        {isActive && hasPath && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
            style={{ backgroundColor: '#002c5a' }}
          />
        )}
        {level > 1 && hasChildren && (
          <span
            className="material-symbols-outlined text-[16px] text-[#737781] transition-transform duration-150"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          >
            expand_more
          </span>
        )}
        {menu.screen_id && (
          <span className="material-symbols-outlined text-[14px] text-[#737781]">dashboard</span>
        )}
        <span
          className={[
            'text-[13px] font-medium flex-1 transition-colors duration-150',
            isActive && hasPath ? 'text-[#002c5a] font-semibold' : 'text-[#181c1e]',
            !isDisabled && 'group-hover:text-[#002c5a]',
          ].join(' ')}
        >
          {menu.menu_nm}
        </span>
        {menu.screen_id && (
          <span className="text-[10px] uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">슬롯</span>
        )}
        {isDisabled && (
          <span className="text-[10px] uppercase text-[#737781]">off</span>
        )}
        {hasChildren && !hasPath && !isDisabled && (
          <MaterialIcon
            name={expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            className="text-base text-[#737781]"
          />
        )}
      </div>
      {hasChildren && expanded && (
        <div
          className="mt-1 space-y-0.5"
          style={{ animation: 'expandIn 0.15s ease-out' }}
        >
          {children.map((child) => (
            <SidebarMenuItem
              key={child.menu_id}
              menu={child}
              level={level + 1}
              activeMenuId={activeMenuId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { navMenus, loading, fetchNavMenus } = useNavMenuStore();

  useEffect(() => {
    if (navMenus.length === 0) {
      fetchNavMenus();
    }
  }, [navMenus.length, fetchNavMenus]);

  const level1Menus = useMemo(
    () => navMenus.filter((m) => m.parent_menu_id === null),
    [navMenus]
  );

  const selectedLevel1 = useMemo(() => {
    return level1Menus.find((m) => m.menu_path && location.pathname.startsWith(m.menu_path));
  }, [level1Menus, location.pathname]);

  const sidebarMenus = useMemo(() => {
    if (!selectedLevel1?.children?.length) return [];

    function buildSubTree(nodes) {
      return nodes
        .filter((m) => String(m.del_fg ?? 'N').toUpperCase() !== 'Y')
        .filter((m) => {
          const level = Number(m.menu_level);
          return level >= 2 && level <= 4;
        })
        .map((child) => ({
          ...child,
          children: child.children ? buildSubTree(child.children) : []
        }));
    }

    return buildSubTree(selectedLevel1.children);
  }, [selectedLevel1]);

  const activeMenuId = useMemo(() => {
    if (!sidebarMenus.length) return null;
    const currentPath = location.pathname;
    const findActive = (menus) => {
      for (const menu of menus) {
        if (menu.menu_path && currentPath.startsWith(menu.menu_path)) {
          return menu.menu_id;
        }
        if (menu.children?.length) {
          const childActive = findActive(menu.children);
          if (childActive) return childActive;
        }
      }
      return null;
    };
    return findActive(sidebarMenus) || selectedLevel1?.menu_id || null;
  }, [sidebarMenus, location.pathname, selectedLevel1]);

  const handleSelect = useCallback((menu) => {
    if (menu.menu_path) {
      navigate(menu.menu_path);
    }
  }, [navigate]);

  const isEmpty = !loading && sidebarMenus.length === 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-slate-200/20 bg-[#f2f4f6] transition-transform duration-200 dark:bg-slate-950 max-md:shadow-xl ${
          open ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col gap-1 px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-white">SM</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black leading-tight text-[#002045] dark:text-blue-300">
                EZ Dashboard
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Academic Intel
              </span>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
              <MaterialIcon name="menu_book" className="text-2xl text-[#5a5f64] mb-3" />
              <p className="text-sm font-medium text-[#2d3133]">메뉴 없음</p>
              <p className="text-xs text-[#737781] mt-1">
                {selectedLevel1 ? '하위 메뉴가 없습니다' : '선택된 메뉴가 없습니다'}
              </p>
            </div>
          ) : (
            <div className="px-3 pb-4">
              {sidebarMenus.map((menu) => (
                <SidebarMenuItem
                  key={menu.menu_id}
                  menu={menu}
                  level={1}
                  activeMenuId={activeMenuId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </nav>

        <div className="mt-auto p-6">
          <button
            type="button"
            className="w-full rounded-md bg-gradient-to-r from-[#002045] to-[#1a365d] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            title="준비 중"
            onClick={() => {}}
          >
            연간 보고서 다운로드
          </button>
          <div className="mt-8 flex flex-col gap-2">
            <a
              className="flex items-center gap-3 text-xs text-slate-500 transition-colors hover:text-primary"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <MaterialIcon name="help" className="text-sm" />
              고객 센터
            </a>
            <a
              className="flex items-center gap-3 text-xs text-slate-500 transition-colors hover:text-primary"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <MaterialIcon name="shield" className="text-sm" />
              개인정보 보호정책
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}