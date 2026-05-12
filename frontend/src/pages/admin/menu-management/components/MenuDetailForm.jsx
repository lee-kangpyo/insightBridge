import { useState, useEffect } from "react";

export default function MenuDetailForm({
  node,
  formData,
  onChange,
  onSave,
  onDelete,
  saving,
}) {
  const [levelHelpOpen, setLevelHelpOpen] = useState(false);

  useEffect(() => {
    if (!levelHelpOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setLevelHelpOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [levelHelpOpen]);

  if (!node) {
    return (
      <div className="flex-1 bg-surface-container-lowest rounded-lg flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.04)] min-h-[600px]">
        <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-primary to-primary-container" />
        <div className="p-8 flex items-center justify-center h-full">
          <p className="text-on-surface-variant">왼쪽에서 메뉴를 선택하세요</p>
        </div>
      </div>
    );
  }

  const isDeleted = node.del_fg === "Y";
  const savedEnabled = String(node.use_yn ?? "Y").toUpperCase() !== "N";
  const isEnabled = Boolean(formData.useYn);
  const isUseYnDirty = savedEnabled !== isEnabled;
  const isSlotScreen = !!node.screen_id;

  return (
    <div className="flex-1 bg-surface-container-lowest rounded-lg flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.04)] min-h-0">
      <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-primary to-primary-container" />
      <div className="p-8 flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-label text-xs tracking-wider text-error uppercase mb-1 block">
              선택 메뉴 상세
            </span>
            <h2 className="font-headline font-bold text-2xl text-primary flex items-center gap-3">
              <span className="text-error font-medium text-lg">
                {formData.menuName || node.menu_nm}
              </span>
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
              Menu ID
            </span>
            <span className="text-xl font-semibold text-primary">
              {node.menu_id}
            </span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
              Parent ID
            </span>
            <span className="text-xl font-semibold text-secondary">
              {node.parent_menu_id == null || node.parent_menu_id === ""
                ? "—"
                : String(node.parent_menu_id)}
            </span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
              Menu Level
            </span>
            <span className="text-xl font-semibold text-secondary">
              {node.menu_level != null ? node.menu_level : "—"}
            </span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
              Sort Order
            </span>
            <span className="text-xl font-semibold text-secondary">
              {node.sort_order != null ? node.sort_order : "—"}
            </span>
          </div>
        </div>
        <div className="border border-outline-variant/50 rounded-xl p-6 flex flex-col gap-8 bg-surface-container-lowest shadow-sm">
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
            <h3 className="text-lg font-headline font-semibold text-primary">
              Node Configuration
            </h3>
            <div className="flex items-center gap-2">
              {isSlotScreen && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">dashboard</span>
                  슬롯
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  isDeleted
                    ? "bg-surface-container text-outline"
                    : "bg-tertiary-fixed text-on-tertiary-fixed"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isDeleted ? "block" : "check_circle"}
                </span>
                {isDeleted ? "DELETED" : "ACTIVE"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                메뉴코드 (menu_cd)
              </label>
              <input
                className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm"
                type="text"
                value={formData.menuCd}
                onChange={(e) =>
                  onChange({ ...formData, menuCd: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                메뉴명 (menu_nm)
              </label>
              <input
                className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-medium"
                type="text"
                value={formData.menuName}
                onChange={(e) =>
                  onChange({ ...formData, menuName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              서브 제목 (subtitle)
            </label>
            <input
              className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface"
              type="text"
              placeholder="화면 상단에 표시될 부제목을 입력하세요"
              value={formData.subtitle}
              onChange={(e) =>
                onChange({ ...formData, subtitle: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                상위 메뉴 ID (parent_menu_id)
              </label>
              <input
                className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm"
                type="text"
                placeholder="비우면 최상위"
                value={formData.parentMenuId}
                onChange={(e) =>
                  onChange({ ...formData, parentMenuId: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                정렬 (sort_order)
              </label>
              <input
                className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  onChange({ ...formData, sortOrder: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
              <div className="flex items-center gap-1">
                <label
                  htmlFor="menu-level-input"
                  className="text-xs font-medium text-on-surface-variant uppercase tracking-wider"
                >
                  레벨 (menu_level)
                </label>
                <button
                  type="button"
                  id="menu-level-help-trigger"
                  aria-expanded={levelHelpOpen}
                  aria-controls="menu-level-help-panel"
                  className="-m-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
                  onClick={() => setLevelHelpOpen((o) => !o)}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    aria-hidden
                  >
                    info
                  </span>
                  <span className="sr-only">
                    왼쪽 메뉴 들여쓰기 안내 {levelHelpOpen ? "접기" : "펼치기"}
                  </span>
                </button>
              </div>
              {levelHelpOpen ? (
                <div
                  id="menu-level-help-panel"
                  role="region"
                  aria-labelledby="menu-level-help-trigger"
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low/90 px-3 py-2 text-[11px] leading-relaxed text-on-surface-variant sm:px-4 sm:py-2.5 sm:text-xs"
                >
                  <span className="font-medium text-on-surface">
                    메인 화면 왼쪽 메뉴
                  </span>
                  <span className="text-on-surface-variant/80"> — </span>
                  숫자는 메뉴 깊이를 나타냅니다. 1·2단계는 같은 줄에서 시작하고,
                  3단계부터는 한 단계 깊어질 때마다 안쪽으로 한 칸씩 더 들여
                  보입니다. (맨 아래 하위 메뉴일수록 더 안쪽)
                </div>
              ) : null}
              <input
                id="menu-level-input"
                className="w-full max-w-[8rem] border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm"
                type="number"
                min="1"
                max="4"
                inputMode="numeric"
                aria-describedby={
                  levelHelpOpen ? "menu-level-help-panel" : undefined
                }
                value={formData.menuLevel}
                onChange={(e) =>
                  onChange({ ...formData, menuLevel: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">
              URL / 라우트 (menu_path)
            </label>
            <input
              className={`border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm ${
                isSlotScreen ? "opacity-60 cursor-not-allowed" : ""
              }`}
              type="text"
              value={formData.menuUrl}
              onChange={(e) =>
                onChange({ ...formData, menuUrl: e.target.value })
              }
              disabled={isSlotScreen}
              readOnly={isSlotScreen}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">
              화면 / 컴포넌트 (screen_id)
            </label>
            <input
              className={`border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm ${
                isSlotScreen ? "opacity-60 cursor-not-allowed" : ""
              }`}
              type="text"
              value={formData.component}
              onChange={(e) =>
                onChange({ ...formData, component: e.target.value })
              }
              disabled={isSlotScreen}
              readOnly={isSlotScreen}
            />
            {isSlotScreen && node.screen_id && (
              <a
                href={`/admin/screen-config/edit/${node.screen_id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-primary transition-colors mt-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                레이아웃 편집기 열기
              </a>
            )}
          </div>
          <div className="bg-surface-container-low rounded-lg p-5 flex flex-wrap gap-x-12 gap-y-6 items-center">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm font-medium text-on-surface">
                  사용여부 (use_yn)
                </div>
                <div className="text-xs text-on-surface-variant">
                  Y=사용, N=미사용 (목록에는 모두 표시)
                </div>
              </div>
              <button
                type="button"
                className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none ${
                  formData.useYn ? "bg-primary" : "bg-outline"
                }`}
                onClick={() =>
                  onChange({ ...formData, useYn: !formData.useYn })
                }
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-on-primary rounded-full transition-transform ${
                    formData.useYn ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  isEnabled
                    ? "bg-tertiary-fixed text-on-tertiary-fixed"
                    : "bg-surface-container text-outline"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isEnabled ? "toggle_on" : "toggle_off"}
                </span>
                {isEnabled ? "ENABLED" : "DISABLED"}
              </span>
              {isUseYnDirty && (
                <span className="text-xs text-on-surface-variant">
                  (미저장)
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">
              비고
            </label>
            <p className="text-xs text-on-surface-variant">
              `disp_yn`, `auth_check` 등은 현재 `ts_menu_info` 스키마에 없어
              저장되지 않습니다. 문서 `docs/admin-menu-management.md` 참고.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10 mt-2">
            <button
              type="button"
              className="px-6 py-2.5 rounded-md border border-error/50 text-error font-medium hover:bg-error/5 transition-colors text-sm"
              onClick={onDelete}
              disabled={saving}
            >
              삭제
            </button>
            <button
              type="button"
              className="px-6 py-2.5 rounded-md bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
              onClick={onSave}
              disabled={saving}
            >
              <span className="material-symbols-outlined text-[18px]">
                save
              </span>
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
        <div className="mt-auto flex flex-col text-sm text-on-surface-variant border border-outline-variant/50 bg-surface-container-lowest rounded-md p-4 gap-1">
          <div>
            등록일시(reg_dt): {node.reg_dt != null ? String(node.reg_dt) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
