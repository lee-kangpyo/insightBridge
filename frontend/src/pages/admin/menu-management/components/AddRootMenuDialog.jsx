import { useEffect } from "react";

export default function AddRootMenuDialog({
  open,
  value,
  errors,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onSubmit]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-surface/60 backdrop-blur-[2px]"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative mx-auto mt-[10vh] w-[min(560px,calc(100%-2rem))] rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary-container" />
        <div className="p-6 sm:p-7 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium tracking-wider text-on-surface-variant uppercase">
                Root Node
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-headline font-bold text-primary">
                최상위 메뉴 추가
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                메뉴코드/메뉴명은 필수입니다.{" "}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={onClose}
              aria-label="닫기"
              disabled={saving}
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                메뉴코드 (menu_cd)
              </label>
              <input
                className={`border-0 border-b focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm ${
                  errors.menuCd
                    ? "border-error focus:border-error"
                    : "border-outline focus:border-primary"
                }`}
                type="text"
                value={value.menuCd}
                onChange={(e) => onChange({ ...value, menuCd: e.target.value })}
                autoFocus
                placeholder="예) ADM_MENUS"
              />
              {errors.menuCd ? (
                <div className="text-xs text-error">{errors.menuCd}</div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                메뉴명 (menu_nm)
              </label>
              <input
                className={`border-0 border-b focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-medium ${
                  errors.menuName
                    ? "border-error focus:border-error"
                    : "border-outline focus:border-primary"
                }`}
                type="text"
                value={value.menuName}
                onChange={(e) =>
                  onChange({ ...value, menuName: e.target.value })
                }
                placeholder="예) 메뉴관리"
              />
              {errors.menuName ? (
                <div className="text-xs text-error">{errors.menuName}</div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
            <button
              type="button"
              className="h-11 px-4 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-medium"
              onClick={onClose}
              disabled={saving}
            >
              취소
            </button>
            <button
              type="button"
              className={`h-11 px-5 rounded-lg text-on-primary font-semibold transition-colors inline-flex items-center justify-center gap-2 ${
                saving
                  ? "bg-primary/60 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
              }`}
              onClick={onSubmit}
              disabled={saving}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {saving ? "추가 중…" : "추가"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
