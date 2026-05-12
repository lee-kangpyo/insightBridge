import { forwardRef } from 'react';

/** 사용자 관리(UserManagement) 검색줄을 기준으로 한 admin 공통 검색 UI */
const INPUT_CLASS =
  'w-full pl-9 pr-4 py-2.5 bg-surface-container-low border-b-2 border-transparent focus:border-secondary focus:bg-surface-container-lowest rounded-lg text-sm transition-all focus:ring-0 outline-none text-on-surface placeholder:text-outline';

const SUBMIT_PRIMARY =
  'shrink-0 bg-primary-container text-on-primary-container px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-colors disabled:opacity-50';

const AdminSearchBar = forwardRef(function AdminSearchBar(
  {
    value,
    onChange,
    onSubmit,
    placeholder = '검색...',
    submitLabel = '검색',
    showSubmitButton = true,
    submitLoading = false,
    disabled = false,
    className = '',
    inputWrapperClassName = '',
    onKeyDown,
    ...inputProps
  },
  ref
) {
  const handleKeyDown = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={`flex gap-2 items-stretch ${className}`.trim()}>
      <div className={`relative flex-1 min-w-0 ${inputWrapperClassName}`.trim()}>
        <span
          className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm"
          aria-hidden
        >
          search
        </span>
        <input
          ref={ref}
          type="text"
          className={INPUT_CLASS}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          {...inputProps}
        />
      </div>
      {showSubmitButton ? (
        <button
          type="button"
          className={SUBMIT_PRIMARY}
          onClick={() => onSubmit?.()}
          disabled={submitLoading || disabled}
        >
          {submitLoading ? '검색 중…' : submitLabel}
        </button>
      ) : null}
    </div>
  );
});

export default AdminSearchBar;
