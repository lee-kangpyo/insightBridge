export default function ProgressBar({ currentStep = 1, totalSteps = 3 }) {
  const steps = [
    { num: 1, label: '정보 입력' },
    { num: 2, label: '본인 인증' },
    { num: 3, label: '완료' },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-4 left-0 right-0 h-1 bg-surface-variant rounded-full" />
        <div
          className="absolute top-4 left-0 h-1 bg-primary-container rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
        {steps.map((step) => {
          const isCompleted = step.num < currentStep;
          const isCurrent = step.num === currentStep;
          return (
            <div key={step.num} className="relative flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary-container text-white'
                    : isCurrent
                    ? 'bg-primary-container text-white shadow-lg shadow-primary-container/30'
                    : 'bg-surface-variant text-on-surface-variant'
                }`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`absolute top-10 text-xs font-medium whitespace-nowrap ${
                  isCurrent ? 'text-primary-container font-bold' : 'text-on-surface-variant'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
