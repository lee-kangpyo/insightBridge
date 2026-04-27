export default function ChartSettings({ value, onChange, visible, errors, showErrors }) {
  const handleChange = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue });
  };

  if (!visible) return null;

  const chartTypeError = showErrors ? errors?.chartType : '';
  const xAxisError = showErrors ? errors?.xAxis : '';
  const yAxisError = showErrors ? errors?.yAxis : '';
  const chartTitleError = showErrors ? errors?.chartTitle : '';
  const chartTitlePositionError = showErrors ? errors?.chartTitlePosition : '';
  const legendPositionError = showErrors ? errors?.legendPosition : '';

  const chartTypes = [
    { value: 'bar', label: '세로 막대형', icon: 'bar_chart' },
    { value: 'stacked_bar', label: '누적 막대형', icon: 'stacked_bar_chart' },
    { value: 'line', label: '꺾은선형', icon: 'show_chart' },
    { value: 'pie', label: '원형 (파이)', icon: 'pie_chart' },
    { value: 'scatter', label: '산점도', icon: 'scatter_plot' },
  ];

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
        <span className="material-symbols-outlined text-secondary">bar_chart</span>
        <h2 className="font-headline text-xl font-bold text-primary">차트 설정</h2>
      </div>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="ds-label">차트 제목</label>
            <input
              className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
              type="text"
              value={value.chartTitle || ''}
              onChange={(e) => handleChange('chartTitle', e.target.value)}
              placeholder="차트 제목을 입력하세요"
            />
            {chartTitleError ? (
              <p className="mt-1 text-xs text-error">{chartTitleError}</p>
            ) : null}
          </div>
          <div className="flex flex-col">
            <label className="ds-label">차트 제목 위치</label>
            <select
              className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all cursor-pointer appearance-none"
              value={value.chartTitlePosition || 'top'}
              onChange={(e) => handleChange('chartTitlePosition', e.target.value)}
            >
              <option value="top">상단</option>
              <option value="bottom">하단</option>
              <option value="left">좌측</option>
              <option value="right">우측</option>
            </select>
            {chartTitlePositionError ? (
              <p className="mt-1 text-xs text-error">{chartTitlePositionError}</p>
            ) : null}
          </div>
        </div>
        <div>
          <label className="ds-label mb-3 block">차트 유형</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {chartTypes.map((type) => (
              <div
                key={type.value}
                className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-transform hover:scale-[0.98] ${
                  value.chartType === type.value
                    ? 'bg-primary-fixed rounded-lg border border-primary-container/20'
                    : 'bg-surface-container-low hover:bg-surface-container'
                }`}
                onClick={() => handleChange('chartType', type.value)}
              >
                <span className={`material-symbols-outlined text-3xl mb-2 ${
                  value.chartType === type.value ? 'text-on-primary-fixed' : 'text-on-surface-variant'
                }`}>
                  {type.icon}
                </span>
                <span className={`font-label text-xs ${
                  value.chartType === type.value ? 'font-semibold text-on-primary-fixed' : 'text-on-surface-variant'
                }`}>
                  {type.label}
                </span>
              </div>
            ))}
          </div>
          {chartTypeError ? (
            <p className="mt-2 text-xs text-error">{chartTypeError}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label className="ds-label">X축 컬럼명</label>
            <input
              className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
              type="text"
              value={value.xAxis || ''}
              onChange={(e) => handleChange('xAxis', e.target.value)}
              placeholder="X축 컬럼명"
            />
            {xAxisError ? (
              <p className="mt-1 text-xs text-error">{xAxisError}</p>
            ) : null}
          </div>
          <div className="flex flex-col">
            <label className="ds-label">Y축 컬럼명</label>
            <input
              className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
              type="text"
              value={value.yAxis || ''}
              onChange={(e) => handleChange('yAxis', e.target.value)}
              placeholder="Y축 컬럼명"
            />
            {yAxisError ? (
              <p className="mt-1 text-xs text-error">{yAxisError}</p>
            ) : null}
          </div>
          <div className="flex flex-col">
            <label className="ds-label">범례 위치</label>
            <select
              className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all cursor-pointer appearance-none"
              value={value.legendPosition || 'right'}
              onChange={(e) => handleChange('legendPosition', e.target.value)}
            >
              <option value="top">상단</option>
              <option value="right">우측</option>
              <option value="bottom">하단</option>
              <option value="hidden">숨김</option>
            </select>
            {legendPositionError ? (
              <p className="mt-1 text-xs text-error">{legendPositionError}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}