import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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

const NAV_TABS = [
  { label: '종합현황', path: '/' },
  { label: '입시/충원', path: '/admission' },
  { label: '학생/진로', path: '/student-career' },
  { label: '교육/교원', path: '/education-faculty' },
  { label: '연구/산학/창업', path: '/research' },
  { label: '재정/등록금/학생지원', path: '/finance' },
  { label: '캠퍼스/복지/안전', path: '/campus' },
  { label: '거버넌스', path: '/governance' },
];

export default function MainPageHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
          <nav className="hidden md:flex gap-6 items-end h-full pt-2">
            {NAV_TABS.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.label}
                  to={tab.path}
                  className={`font-label text-sm tracking-tight pb-2 transition-colors ${
                    isActive
                      ? 'text-secondary border-b-2 border-secondary font-bold'
                      : 'text-[#5a5f64] hover:text-primary'
                  }`}
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