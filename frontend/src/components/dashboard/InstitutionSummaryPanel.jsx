export default function InstitutionSummaryPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-primary">
      <div className="mb-6 flex flex-col gap-1">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">기관 요약</h4>
        <p className="text-lg font-bold">건국대 벤치마킹</p>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">졸업률</span>
            <span className="text-xl font-extrabold text-primary">#14 / 100</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>서울 평균</span>
              <span>82.4%</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>건국대 수치</span>
              <span>88.1%</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-slate-200" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">취업률</span>
            <span className="text-xl font-extrabold text-primary">#38 / 100</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>국내 평균</span>
              <span>64.5%</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>건국대 수치</span>
              <span>69.2%</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-slate-200" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">장학금 점수</span>
            <span className="text-xl font-extrabold text-orange-600">#62 / 100</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>1티어 평균</span>
              <span>$7.2M</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>건국대 배정액</span>
              <span>$5.1M</span>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="mt-8 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        title="준비 중"
        onClick={(e) => e.preventDefault()}
      >
        성과 감사 보고서 다운로드
      </button>
    </div>
  );
}
