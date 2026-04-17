import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

function profileInitials(user) {
  if (!user) return '?';
  const name = user.univ_nm?.trim() || '';
  if (name.length >= 1) {
    return [...name][0];
  }
  const local = user.email?.split('@')[0]?.trim() || '';
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  if (local.length === 1) return local.toUpperCase();
  return '?';
}

const BASE_NAV_TABS = [
  { label: '종합현황', path: '/' },
  { label: '입시/충원', path: '/admission' },
  { label: '학생/진로', path: '/student-career' },
  { label: '교육/교원', path: '/education-faculty' },
  { label: '연구/산학/창업', path: '/research' },
  { label: '재정/등록금/학생지원', path: '/finance' },
  { label: '캠퍼스/복지/안전', path: '/campus' },
  { label: '거버넌스', path: '/governance' },
];

const isSysAdm = (user) => user?.roles?.includes('SYS_ADM');

const buildNavTabs = (user) => {
  const tabs = [...BASE_NAV_TABS];
  if (isSysAdm(user)) {
    tabs.push({ label: '시스템 관리', path: '/admin' });
  }
  return tabs;
};

export default function MainPageHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarUrl = user?.avatar_url || user?.photo_url;

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarUrl, user?.email]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-surface-container-low shadow-[0_8px_32px_rgba(24,28,30,0.04)] top-0 sticky z-40">
      <div className="flex justify-between items-center px-8 h-16 w-full max-w-[1920px] mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-bold text-primary font-headline">
            EZ Dashboard
          </Link>
          <nav
            className="hidden md:flex flex-wrap gap-1.5 items-center max-w-[min(100%,52rem)]"
            aria-label="주요 화면"
          >
            {buildNavTabs(user).map((tab) => {
              const isActive = tab.path === '/admin'
                ? location.pathname.startsWith('/admin')
                : location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={[
                    'font-label text-[11px] sm:text-xs font-semibold tracking-tight whitespace-nowrap',
                    'rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 border transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-low',
                    isActive
                      ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/15 font-bold'
                      : 'bg-surface-container-highest/80 text-on-surface-variant border-outline-variant/25 hover:bg-surface-container-high hover:text-primary hover:border-secondary/35 hover:shadow-sm',
                  ].join(' ')}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#5a5f64] p-2 hover:bg-slate-100/50 rounded-full transition-colors cursor-pointer">
            notifications
          </button>
          <button className="material-symbols-outlined text-[#5a5f64] p-2 hover:bg-slate-100/50 rounded-full transition-colors cursor-pointer">
            settings
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {user && (
              <span className="text-sm text-[#5a5f64] font-medium hidden sm:inline">
                {user.univ_nm}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="material-symbols-outlined text-[#5a5f64] p-2 hover:bg-slate-100/50 rounded-full transition-colors cursor-pointer"
              title="로그아웃"
            >
              logout
            </button>
            <div
              className="w-8 h-8 rounded-full bg-surface-container overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/80"
              title={user?.email || '프로필'}
              aria-label={
                avatarUrl && !avatarFailed
                  ? undefined
                  : user
                    ? `프로필, ${user.univ_nm || user.email}`
                    : '프로필'
              }
            >
              {avatarUrl && !avatarFailed ? (
                <img
                  className="w-full h-full object-cover"
                  src={avatarUrl}
                  alt={user ? `프로필, ${user.univ_nm || user.email}` : '프로필'}
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span className="text-[11px] font-semibold text-primary leading-none select-none" aria-hidden>
                  {profileInitials(user)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}