import { Link, useLocation } from 'react-router-dom';

const NAV_TABS = [
  { label: '일반현황', path: '/' },
  { label: '입시/충원', path: '/admission' },
  { label: '학생/진로', path: '/student-career' },
  { label: '교육/교원', path: '/education-faculty' },
  { label: '연구/산학/창업', path: '/research' },
  { label: '재정/장학', path: '/finance' },
  { label: '캠퍼스/복지', path: '/campus' },
  { label: '거버넌스', path: '/governance' },
];

export default function MainPageHeader() {
  const location = useLocation();

  return (
    <header className="bg-surface-container-low shadow-[0_8px_32px_rgba(24,28,30,0.04)] top-0 sticky z-40">
      <div className="flex justify-between items-center px-8 h-16 w-full max-w-[1920px] mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-bold text-primary font-headline">
            Scholar Metric Dashboard
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
          <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD38XLCAQXtpVoebDySSvznwMKB7WZBZAKTrStq7dmHHgvhvRYVq53KJ-l24TTDjY6PjBrXY6omSdU6PI5qwHci0w7CrizFryLvjWBjTu31QUdqcgCosrECBFJZBVlDXHWdeo7RZMNROpQeud2uubp29oBJmGHn9b2tnffh1yx7EmoZ2ntubrejLzliUeDA4hwL-Q2r4O9ppPkNwg77x2e3D4ZTaYXjDnjqml0rtOFGgm_yWD6vKPeB9NiqD-hlWTJXQnfPpxLn8fc"
              alt="User profile"
            />
          </div>
        </div>
      </div>
    </header>
  );
}