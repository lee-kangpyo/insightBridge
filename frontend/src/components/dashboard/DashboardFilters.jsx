export default function DashboardFilters() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-surface-container-low p-2">
      <div className="group relative w-full min-w-[200px] sm:w-auto">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary">
          search
        </span>
        <input
          className="w-full rounded-lg border-none bg-surface-container-lowest py-2 pl-10 pr-4 text-sm font-semibold transition-all focus:ring-2 focus:ring-primary/20 sm:w-72"
          readOnly
          type="text"
          value="건국대학교 (Konkuk University)"
          aria-label="기관 (읽기 전용)"
        />
      </div>
      <select
        className="rounded-lg border-none bg-surface-container-lowest px-4 py-2 pr-10 text-sm transition-all focus:ring-2 focus:ring-primary/20"
        defaultValue="rank"
        aria-label="지표 선택"
      >
        <option value="rank">순위 지표</option>
        <option value="domestic">국내 백분위</option>
        <option value="regional">지역 백분위</option>
        <option value="global">글로벌 벤치마킹</option>
      </select>
      <div className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-3 py-2">
        <label className="group flex cursor-pointer items-center gap-2">
          <input
            defaultChecked
            className="h-4 w-4 rounded border-outline-variant/30 text-secondary focus:ring-secondary"
            type="checkbox"
          />
          <span className="text-xs font-semibold text-slate-600 transition-colors group-hover:text-primary">
            국내 순위
          </span>
        </label>
        <div className="mx-1 h-4 w-px bg-outline-variant/50" />
        <label className="group flex cursor-pointer items-center gap-2">
          <input
            defaultChecked
            className="h-4 w-4 rounded border-outline-variant/30 text-secondary focus:ring-secondary"
            type="checkbox"
          />
          <span className="text-xs font-semibold text-slate-600 transition-colors group-hover:text-primary">
            지역별 보기
          </span>
        </label>
      </div>
    </div>
  );
}
