import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import MenuItem from './MenuItem';
import { useNavMenuStore } from '../../stores/navMenuStore';
import MaterialIcon from '../MaterialIcon';

/** pathname에 맞는 1레벨 메뉴 (여러 개 매칭 시 가장 긴 menu_path — /admin vs / 등 충돌 방지) */
/** pathname이나 screen_id가 일치하는 메뉴 항목을 찾고 그 조상(Level 1)을 반환 */
function findLevel1ForCurrentState(level1Menus, pathname, scrId) {
  const walk = (nodes) => {
    for (const node of nodes) {
      // 1. screen_id 매칭 (슬롯 화면)
      if (scrId && node.screen_id === scrId) return true;
      // 2. 경로 매칭 (일반 메뉴)
      if (node.menu_path && pathname.startsWith(node.menu_path)) return true;
      // 3. 하위 검색
      if (node.children?.length && walk(node.children)) return true;
    }
    return false;
  };

  for (const root of level1Menus) {
    if (walk([root])) return root;
  }
  return null;
}

function LnbMenuEmptyState({ title, hint }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-3 py-8">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-[#002c5a]/10 blur-2xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#e5e8eb] bg-white shadow-md">
          <MaterialIcon name="menu_book" className="text-2xl text-[#5a5f64]" />
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="mb-0.5 text-sm font-medium text-[#2d3133]">{title}</p>
        <p className="text-xs text-[#737781]">{hint}</p>
      </div>
    </div>
  );
}

export default function LNBMenu() {
  const location = useLocation();
  const { navMenus, loading, fetchNavMenus } = useNavMenuStore();

  useEffect(() => {
    if (navMenus.length === 0) {
      fetchNavMenus();
    }
  }, [navMenus.length, fetchNavMenus]);

  const level1Menus = useMemo(
    () => navMenus.filter(menu => menu.parent_menu_id === null),
    [navMenus]
  );

  const selectedLevel1 = useMemo(() => {
    const screenMatch = location.pathname.match(/\/view\/screen\/([^/]+)/);
    const currentScrId = screenMatch ? screenMatch[1] : null;
    
    return findLevel1ForCurrentState(level1Menus, location.pathname, currentScrId);
  }, [level1Menus, location.pathname]);

  const visibleChildren = useMemo(() => {
    const raw = selectedLevel1?.children ?? [];
    return raw.filter((m) => String(m.del_fg ?? 'N').toUpperCase() !== 'Y');
  }, [selectedLevel1]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const noMenusAtAll = !loading && navMenus.length === 0;

  return (
    <nav className="flex h-full min-h-0 flex-col" style={{ backgroundColor: '#f1f4f7' }}>
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : noMenusAtAll ? (
        <LnbMenuEmptyState title="메뉴 없음" hint="할당된 메뉴가 없습니다" />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
          {isAdminRoute && (
            <div className="mb-4 px-3">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#424750]">
                System Admin
              </h2>
            </div>
          )}
          {visibleChildren.length > 0 ? (
            <div className="min-h-0 flex-1">
              <div className="mb-2 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#424750]">
                  {selectedLevel1.menu_nm}
                </span>
              </div>
              <div className="space-y-0.5">
                {visibleChildren.map((menu) => (
                  <MenuItem key={menu.menu_id} menu={menu} isAdmin={isAdminRoute} />
                ))}
              </div>
            </div>
          ) : (
            <LnbMenuEmptyState
              title="메뉴 없음"
              hint={
                selectedLevel1
                  ? '하위 메뉴가 없습니다'
                  : '현재 화면에 표시할 메뉴가 없습니다'
              }
            />
          )}
        </div>
      )}
    </nav>
  );
}