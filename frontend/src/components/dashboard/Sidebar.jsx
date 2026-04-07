import MaterialIcon from '../MaterialIcon';

export default function Sidebar({ open, onClose }) {
  const handleAnnualReport = () => {
    /* MVP stub */
  };

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
                Scholar Metric
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Academic Intel
              </span>
            </div>
          </div>
        </div>
        <nav className="mt-4 flex-1">
          <div className="flex flex-col">
            <a
              className="flex items-center gap-4 rounded-r-full bg-[#002045] px-6 py-3 text-sm font-medium text-white shadow-sm transition-transform duration-200"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <MaterialIcon name="dashboard" />
              <span>개요</span>
            </a>
            <a
              className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-slate-600 transition-transform duration-200 hover:translate-x-1 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <MaterialIcon name="payments" />
              <span>재정</span>
            </a>
            <a
              className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-slate-600 transition-transform duration-200 hover:translate-x-1 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <MaterialIcon name="group" />
              <span>등록</span>
            </a>
            <a
              className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-slate-600 transition-transform duration-200 hover:translate-x-1 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <MaterialIcon name="school" />
              <span>학생 성공</span>
            </a>
            <a
              className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-slate-600 transition-transform duration-200 hover:translate-x-1 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <MaterialIcon name="psychology" />
              <span>교수진</span>
            </a>
          </div>
        </nav>
        <div className="mt-auto p-6">
          <button
            type="button"
            className="w-full rounded-md bg-gradient-to-r from-[#002045] to-[#1a365d] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            title="준비 중"
            onClick={handleAnnualReport}
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
