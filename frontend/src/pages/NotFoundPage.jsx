import { Link } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <nav className="sticky top-0 z-50 mx-auto flex w-full max-w-full items-center justify-between border-b border-outline-variant/30 bg-[#f7f9fb] px-6 py-4 dark:bg-slate-950 md:px-8">
        <div className="text-xl font-bold tracking-tight text-[#002045] dark:text-blue-100">
          Scholar Metric
        </div>
        <div className="hidden items-center space-x-8 md:flex">
          <a
            className="font-medium text-slate-600 transition-colors duration-200 hover:text-[#002045] dark:text-slate-400 dark:hover:text-blue-300"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Dashboard
          </a>
          <a
            className="font-medium text-slate-600 transition-colors duration-200 hover:text-[#002045] dark:text-slate-400 dark:hover:text-blue-300"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Rankings
          </a>
          <a
            className="font-medium text-slate-600 transition-colors duration-200 hover:text-[#002045] dark:text-slate-400 dark:hover:text-blue-300"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Institutions
          </a>
          <a
            className="font-medium text-slate-600 transition-colors duration-200 hover:text-[#002045] dark:text-slate-400 dark:hover:text-blue-300"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Reports
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-[#002045] transition-transform duration-150 ease-in-out hover:scale-95 dark:text-blue-400"
            title="알림"
            onClick={(e) => e.preventDefault()}
          >
            <MaterialIcon name="notifications" />
          </button>
          <button
            type="button"
            className="text-[#002045] transition-transform duration-150 ease-in-out hover:scale-95 dark:text-blue-400"
            title="계정"
            onClick={(e) => e.preventDefault()}
          >
            <MaterialIcon name="account_circle" />
          </button>
        </div>
      </nav>
      <main className="flex flex-grow items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-12">
            <div className="relative inline-block">
              <span className="pointer-events-none select-none font-headline text-9xl font-extrabold text-primary/10 md:text-[12rem]">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-headline text-6xl font-extrabold text-primary md:text-8xl">
                  404
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="font-label text-sm font-bold uppercase tracking-widest text-secondary">
              Page Not Found
            </h2>
            <h1 className="font-headline text-3xl font-extrabold leading-tight text-primary md:text-5xl">
              요청하신 페이지를 찾을 수 없습니다.
            </h1>
            <p className="mx-auto max-w-lg text-lg leading-relaxed text-slate-600">
              찾으시는 페이지가 삭제되었거나 주소가 변경되었습니다.
              <br />
              아래 버튼을 클릭하여 메인으로 돌아가주세요.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-sm transition-all hover:bg-primary-container"
              >
                <MaterialIcon name="home" className="text-base" />
                메인으로 이동
              </Link>
              <Link
                to="/support"
                className="flex items-center justify-center gap-2 rounded-lg bg-surface-container px-8 py-3 font-semibold text-primary transition-all hover:bg-surface-container-high"
              >
                <MaterialIcon name="support_agent" className="text-base" />
                지원팀 문의
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="flex w-full flex-col items-center justify-between border-t border-outline-variant/30 bg-surface px-8 py-8 md:flex-row md:px-12">
        <div className="mb-4 text-lg font-bold text-[#002045] md:mb-0">Scholar Metric</div>
        <div className="mb-4 flex flex-wrap justify-center gap-8 md:mb-0">
          <a
            className="text-xs uppercase tracking-widest text-slate-500 transition-colors hover:text-secondary"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-xs uppercase tracking-widest text-slate-500 transition-colors hover:text-secondary"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-xs uppercase tracking-widest text-slate-500 transition-colors hover:text-secondary"
            href="#"
          >
            Documentation
          </a>
        </div>
        <div className="text-xs uppercase tracking-widest text-slate-400">
          © 2024 Scholar Metric Intelligence.
        </div>
      </footer>
    </div>
  );
}
