import MaterialIcon from '../MaterialIcon';

export default function TopBar({ onMenuClick }) {
  return (
    <header className="z-30 flex w-full items-center justify-between bg-slate-50 px-4 py-4 dark:bg-slate-900 md:px-8">
      <div className="flex min-w-0 items-center gap-4 md:gap-12">
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-slate-200/50 md:hidden"
          aria-label="메뉴 열기"
          onClick={onMenuClick}
        >
          <MaterialIcon name="menu" className="text-slate-600" />
        </button>
        <h1 className="truncate text-lg font-bold tracking-tight text-[#002045] dark:text-blue-100 md:text-xl">
          Scholar Metric
        </h1>
        <nav className="hidden h-full items-center gap-8 md:flex">
          <a
            className="border-b-2 border-[#002045] pb-1 text-sm font-bold text-[#002045] dark:border-blue-400 dark:text-white"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            대시보드
          </a>
          <a
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            분석
          </a>
          <a
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            보고서
          </a>
          <a
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            비교
          </a>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-3 md:gap-6">
        <div className="flex items-center gap-1 md:gap-3">
          <button
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-slate-200/50"
            title="알림"
            onClick={(e) => e.preventDefault()}
          >
            <MaterialIcon name="notifications" className="text-slate-600" />
          </button>
          <button
            type="button"
            className="hidden rounded-full p-2 transition-colors hover:bg-slate-200/50 sm:block"
            title="설정"
            onClick={(e) => e.preventDefault()}
          >
            <MaterialIcon name="settings" className="text-slate-600" />
          </button>
        </div>
        <div className="hidden h-8 w-px bg-outline-variant/30 md:block" />
        <button
          type="button"
          className="hidden rounded-lg px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-container-high md:block"
          onClick={(e) => e.preventDefault()}
        >
          기관 로그인
        </button>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-white ring-2 ring-primary/10"
          title="프로필 (플레이스홀더)"
          role="img"
          aria-label="사용자 아바타 플레이스홀더"
        >
          KU
        </div>
      </div>
    </header>
  );
}
