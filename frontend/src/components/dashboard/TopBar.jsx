import { useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from '../MaterialIcon';
import { useNavMenuStore } from '../../stores/navMenuStore';

export default function TopBar({ onMenuClick }) {
  const scrollRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { navMenus, loading, fetchNavMenus } = useNavMenuStore();

  useEffect(() => {
    if (navMenus.length === 0) {
      fetchNavMenus();
    }
  }, [navMenus.length, fetchNavMenus]);

  const level1Menus = useMemo(
    () => navMenus.filter((menu) => menu.parent_menu_id === null),
    [navMenus]
  );

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleTabClick = (menu) => {
    if (menu.menu_path) {
      navigate(menu.menu_path);
    }
  };

  const activeMenu = useMemo(
    () => level1Menus.find((menu) => menu.menu_path && location.pathname.startsWith(menu.menu_path)),
    [level1Menus, location.pathname]
  );

  return (
    <header className="z-30 flex h-16 w-full items-center justify-between gap-4 bg-white px-4 shadow-sm border-b border-outline-variant/10 dark:bg-slate-900 md:px-8">
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-slate-200/50 md:hidden"
          aria-label="메뉴 열기"
          onClick={onMenuClick}
        >
          <MaterialIcon name="menu" className="text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]">insights</span>
          </div>
          <h1 className="hidden truncate text-lg font-black tracking-tight text-[#002045] dark:text-blue-100 sm:block">
            InsightBridge
          </h1>
        </div>
      </div>

      <div className="relative flex flex-1 items-center min-w-0 max-w-4xl h-full border-x border-outline-variant/10 px-2 group">
        <button
          onClick={() => scroll('left')}
          className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm border border-outline-variant/20 transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100 dark:bg-slate-800/90"
          aria-label="이전 탭"
        >
          <MaterialIcon name="chevron_left" className="text-slate-600 text-[20px]" />
        </button>

        <nav
          ref={scrollRef}
          className="flex flex-1 items-center gap-1 overflow-x-hidden scroll-smooth px-2 h-full"
        >
          {loading ? (
            <div className="flex items-center justify-center w-full">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : level1Menus.length === 0 ? (
            <span className="text-xs text-slate-400 px-4">메뉴가 없습니다</span>
          ) : (
            level1Menus.map((menu) => (
              <button
                key={menu.menu_id}
                onClick={() => handleTabClick(menu)}
                className={`whitespace-nowrap px-4 h-full text-xs font-bold transition-all border-b-2 ${
                  activeMenu?.menu_id === menu.menu_id
                    ? 'text-primary border-primary bg-primary/5'
                    : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {menu.menu_nm}
              </button>
            ))
          )}
        </nav>

        <button
          onClick={() => scroll('right')}
          className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm border border-outline-variant/20 transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100 dark:bg-slate-800/90"
          aria-label="다음 탭"
        >
          <MaterialIcon name="chevron_right" className="text-slate-600 text-[20px]" />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-4">
        <div className="hidden items-center gap-1 lg:flex">
          <button
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-slate-200/50"
            title="알림"
          >
            <MaterialIcon name="notifications" className="text-slate-600" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-slate-200/50"
            title="설정"
          >
            <MaterialIcon name="settings" className="text-slate-600" />
          </button>
        </div>
        <div className="hidden h-8 w-px bg-outline-variant/30 md:block" />
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#002045] text-xs font-bold text-white ring-2 ring-primary/10 cursor-pointer transition-transform hover:scale-105"
          title="사용자 프로필"
        >
          KU
        </div>
      </div>
    </header>
  );
}
