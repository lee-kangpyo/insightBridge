import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PageHeader from "../../components/common/PageHeader";
import AdminSearchBar from "../../components/common/AdminSearchBar";
import { ADMIN_PAGE_CONTAINER_CLASS } from "../../constants/adminLayout";
import {
  getAdminMenuTree,
  createAdminMenu,
  createAdminMenuForScreen,
  patchAdminMenu,
  deleteAdminMenu,
  getAdminScreensList,
} from "../../services/adminApi";
import ScreenPreviewModal from "../../components/admin/ScreenPreviewModal";
import AddScreenMenuDialog from "../../components/admin/AddScreenMenuDialog";

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const tone =
    toast.type === "error"
      ? "bg-error text-on-error"
      : toast.type === "info"
        ? "bg-surface-container text-on-surface"
        : "bg-tertiary-fixed text-on-tertiary-fixed";
  const icon =
    toast.type === "error"
      ? "error"
      : toast.type === "info"
        ? "info"
        : "check_circle";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 ${tone} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]`}
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="font-medium">{toast.message}</span>
      <button
        type="button"
        className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-surface/30"
        onClick={onClose}
        aria-label="알림 닫기"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

function AddRootMenuDialog({
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

function menuIcon(node) {
  if (node.screen_id) return "dashboard";
  if (node.children && node.children.length > 0) return "folder";
  return "description";
}

function filterMenuTree(nodes, term) {
  if (!term || !term.trim()) return nodes;
  const q = term.trim().toLowerCase();
  const walk = (list) => {
    const out = [];
    for (const n of list) {
      const nm = (n.menu_nm || "").toLowerCase();
      const cd = (n.menu_cd || "").toLowerCase();
      const selfMatch = nm.includes(q) || cd.includes(q);
      const kids = n.children ? walk(n.children) : [];
      if (selfMatch || kids.length) {
        out.push({ ...n, children: kids });
      }
    }
    return out;
  };
  return walk(nodes);
}

function findNodeById(nodes, id) {
  for (const n of nodes) {
    if (n.menu_id === id) return n;
    if (n.children?.length) {
      const f = findNodeById(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

function MenuTreeNode({ node, level = 0, selectedId, onSelect, searchTerm }) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;
  const mid = node.menu_id;
  const isSelected = selectedId === mid;
  const isDeleted = node.del_fg === "Y";
  const isDisabled = String(node.use_yn ?? "Y").toUpperCase() === "N";
  const isHighlighted =
    searchTerm &&
    (node.menu_nm || "").toLowerCase().includes(searchTerm.toLowerCase());
  const icon = menuIcon(node);

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? "bg-primary-container/10 text-error"
            : isDeleted
              ? "opacity-40"
              : isDisabled
                ? "opacity-70"
                : isHighlighted
                  ? "bg-yellow-100 text-primary font-semibold"
                  : "hover:bg-surface-container text-on-surface"
        }`}
        style={{ paddingLeft: level > 0 ? `${level * 12 + 8}px` : "8px" }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <span
            className="material-symbols-outlined text-[18px] text-on-surface-variant cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? "arrow_drop_down" : "arrow_right"}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          {icon}
        </span>
        <span
          className={`font-medium text-sm ${isSelected ? "text-error font-semibold" : ""}`}
        >
          {node.menu_nm}
        </span>
        {node.screen_id ? (
          <span className="text-[10px] uppercase bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded ml-1">슬롯</span>
        ) : null}
        {isDeleted ? (
          <span className="text-[10px] uppercase text-outline ml-1">del</span>
        ) : isDisabled ? (
          <span className="text-[10px] uppercase text-outline ml-1">off</span>
        ) : null}
      </div>
      {hasChildren && expanded && (
        <div className="flex flex-col ml-6 pl-2 border-l border-outline-variant/30 gap-1">
          {node.children.map((child) => (
            <MenuTreeNode
              key={child.menu_id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuTree({
  roots,
  selectedId,
  onSelect,
  searchTerm,
  onSearchChange,
  onExpandAll,
  onAddRoot,
  onAddScreen,
  loading,
}) {
  return (
    <aside className="w-full lg:w-[350px] shrink-0 bg-surface-container-lowest rounded-lg p-6 flex flex-col gap-5 relative min-h-[600px] shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-headline font-semibold text-lg text-primary">
          시스템 계층 구조
        </h2>
        <button
          type="button"
          className="text-secondary hover:bg-secondary-fixed/50 p-1.5 rounded-full transition-colors"
          title="전체 펼치기"
          onClick={onExpandAll}
        >
          <span className="material-symbols-outlined text-[20px]">
            unfold_more
          </span>
        </button>
      </div>
      <AdminSearchBar
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="메뉴 항목 검색..."
        showSubmitButton={false}
      />
      <div className="overflow-y-auto no-scrollbar flex-1 min-h-0 -mx-2 px-2 flex flex-col gap-1 text-sm mt-2">
        {loading ? (
          <p className="text-on-surface-variant text-sm py-4">불러오는 중…</p>
        ) : roots.length === 0 ? (
          <p className="text-on-surface-variant text-sm py-4">
            표시할 메뉴가 없습니다.
          </p>
        ) : (
          roots.map((node) => (
            <MenuTreeNode
              key={node.menu_id}
              node={node}
              selectedId={selectedId}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))
        )}
      </div>
      <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-outline-variant/15">
        <button
          type="button"
          className="flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
          onClick={onAddRoot}
        >
          <span className="material-symbols-outlined text-[18px]">
            add_circle
          </span>
          최상위 메뉴 추가
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 text-sm font-medium text-tertiary hover:text-primary transition-colors"
          onClick={onAddScreen}
        >
          <span className="material-symbols-outlined text-[18px]">
            dashboard_customize
          </span>
          슬롯 화면 추가
        </button>
      </div>
    </aside>
  );
}

function MenuDetailForm({
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

function emptyForm() {
  return {
    menuCd: "",
    menuName: "",
    subtitle: "",
    menuUrl: "",
    component: "",
    menuLevel: "",
    sortOrder: "",
    parentMenuId: "",
    useYn: true,
  };
}

function nodeToForm(node) {
  return {
    menuCd: node.menu_cd ?? "",
    menuName: node.menu_nm ?? "",
    subtitle: node.subtitle ?? "",
    menuUrl: node.menu_path ?? "",
    component: node.screen_id ?? "",
    menuLevel: node.menu_level != null ? String(node.menu_level) : "",
    sortOrder: node.sort_order != null ? String(node.sort_order) : "",
    parentMenuId:
      node.parent_menu_id == null ||
      node.parent_menu_id === "" ||
      node.parent_menu_id === "0"
        ? ""
        : String(node.parent_menu_id),
    useYn: String(node.use_yn ?? "Y").toUpperCase() !== "N",
  };
}

export default function MenuManagement() {
  const [menuTree, setMenuTree] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [addRootOpen, setAddRootOpen] = useState(false);
  const [addRootForm, setAddRootForm] = useState({ menuCd: "", menuName: "" });
  const [addRootErrors, setAddRootErrors] = useState({
    menuCd: "",
    menuName: "",
  });
  const [addScreenOpen, setAddScreenOpen] = useState(false);
  const [screens, setScreens] = useState([]);
  const [addScreenLoading, setAddScreenLoading] = useState(false);
  const [addScreenError, setAddScreenError] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  const loadTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminMenuTree();
      const tree = data.menu_tree || [];
      setMenuTree(tree);
      setSelectedNode((prev) => {
        if (!prev) return null;
        return findNodeById(tree, prev.menu_id) ?? null;
      });
      return tree;
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "메뉴를 불러오지 못했습니다.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      setMenuTree([]);
      setSelectedNode(null);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    if (selectedNode) {
      setFormData(nodeToForm(selectedNode));
    }
  }, [selectedNode]);

  const displayRoots = useMemo(
    () => filterMenuTree(menuTree, searchTerm),
    [menuTree, searchTerm],
  );

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const parseOptionalInt = (v) => {
    if (v === "" || v == null) return null;
    const n = Number.parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = async () => {
    if (!selectedNode) return;
    if (!formData.menuCd?.trim() || !formData.menuName?.trim()) {
      showToast("메뉴코드와 메뉴명은 필수입니다.", "error");
      return;
    }
    const lvl = parseOptionalInt(formData.menuLevel);
    if (lvl !== null && (lvl < 1 || lvl > 4)) {
      showToast("메뉴 레벨은 1~4 사이여야 합니다.", "error");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await patchAdminMenu(selectedNode.menu_id, {
        menu_cd: formData.menuCd.trim(),
        menu_nm: formData.menuName.trim(),
        subtitle: formData.subtitle.trim() || null,
        menu_path: formData.menuUrl.trim() || null,
        screen_id: formData.component.trim() || null,
        menu_level: parseOptionalInt(formData.menuLevel),
        sort_order: parseOptionalInt(formData.sortOrder),
        parent_menu_id:
          formData.parentMenuId.trim() === ""
            ? null
            : formData.parentMenuId.trim(),
        use_yn: formData.useYn ? "Y" : "N",
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await loadTree();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "저장 실패";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNode) return;
    if (
      !window.confirm(
        `메뉴 "${selectedNode.menu_nm}" 을(를) 삭제(del_fg=Y)할까요?`,
      )
    )
      return;
    try {
      setSaving(true);
      setError(null);
      await deleteAdminMenu(selectedNode.menu_id);
      setSelectedNode(null);
      setFormData(emptyForm());
      await loadTree();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "삭제 실패";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const openAddRoot = () => {
    if (saving) return;
    setAddRootForm({ menuCd: "", menuName: "" });
    setAddRootErrors({ menuCd: "", menuName: "" });
    setAddRootOpen(true);
  };

  const closeAddRoot = () => {
    if (saving) return;
    setAddRootOpen(false);
  };

  const validateAddRoot = () => {
    const next = { menuCd: "", menuName: "" };
    if (!addRootForm.menuCd?.trim()) next.menuCd = "메뉴코드를 입력해주세요.";
    if (!addRootForm.menuName?.trim()) next.menuName = "메뉴명을 입력해주세요.";
    setAddRootErrors(next);
    return !next.menuCd && !next.menuName;
  };

  const handleSubmitAddRoot = async () => {
    if (!validateAddRoot()) {
      showToast("필수 입력값을 확인해주세요.", "error");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const menu_cd = addRootForm.menuCd.trim();
      const menu_nm = addRootForm.menuName.trim();
      const { menu_id } = await createAdminMenu({
        menu_cd,
        menu_nm,
        parent_menu_id: null,
      });
      const tree = await loadTree();
      const created = findNodeById(tree, menu_id);
      if (created) {
        setSelectedNode(created);
        setFormData(nodeToForm(created));
      }
      setAddRootOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      showToast(`추가되었습니다: ${menu_nm}`, "success");
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "추가 실패";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      showToast(
        typeof msg === "string" ? msg : "추가에 실패했습니다.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExpandAll = () => {
    /* 트리 펼침 상태는 노드 로컬 state — 전역 펼침은 후속 작업 */
  };

  const openAddScreen = async () => {
    if (saving) return;
    setAddScreenOpen(true);
    setAddScreenLoading(true);
    setAddScreenError(null);
    try {
      const data = await getAdminScreensList();
      setScreens(data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "화면 목록을 불러오지 못했습니다.";
      setAddScreenError(typeof msg === "string" ? msg : JSON.stringify(msg));
      setScreens([]);
    } finally {
      setAddScreenLoading(false);
    }
  };

  const closeAddScreen = () => {
    if (saving) return;
    setAddScreenOpen(false);
    setAddScreenError(null);
  };

  const handleSubmitAddScreen = async (scrId) => {
    if (!scrId) return;
    const screen = screens.find((s) => s.scr_id === scrId);
    if (!screen) return;
    try {
      setSaving(true);
      setError(null);
      const menu_cd = `SCR_${scrId.replace(/-/g, "_")}`;
      const menu_nm = screen.scr_nm || scrId;
      const { menu_id } = await createAdminMenuForScreen({
        menu_cd,
        menu_nm,
        screen_id: scrId,
      });
      const tree = await loadTree();
      const created = findNodeById(tree, menu_id);
      if (created) {
        setSelectedNode(created);
        setFormData(nodeToForm(created));
      }
      setAddScreenOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      showToast(`슬롯 화면 메뉴가 추가되었습니다: ${menu_nm}`, "success");
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "추가 실패";
      setAddScreenError(typeof msg === "string" ? msg : JSON.stringify(msg));
      showToast(
        typeof msg === "string" ? msg : "추가에 실패했습니다.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={ADMIN_PAGE_CONTAINER_CLASS}>
      <PageHeader
        title="메뉴 관리"
        description="시스템 탐색 계층 구조를 구성하고, 라우팅 경로를 정의하며, 교육기관 플랫폼 전체의 컴포넌트 가시성을 관리합니다."
      />
      {error && (
        <div className="p-4 bg-error/10 border border-error rounded-lg text-error text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        <MenuTree
          roots={displayRoots}
          selectedId={selectedNode?.menu_id}
          onSelect={handleNodeSelect}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onExpandAll={handleExpandAll}
          onAddRoot={openAddRoot}
          onAddScreen={openAddScreen}
          loading={loading}
        />
        <MenuDetailForm
          key={selectedNode?.menu_id ?? "none"}
          node={selectedNode}
          formData={formData}
          onChange={setFormData}
          onSave={handleSave}
          onDelete={handleDelete}
          saving={saving}
        />
      </div>
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-tertiary-fixed text-on-tertiary-fixed px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-[20px]">
            check_circle
          </span>
          <span className="font-medium">처리되었습니다.</span>
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
      <AddRootMenuDialog
        open={addRootOpen}
        value={addRootForm}
        errors={addRootErrors}
        saving={saving}
        onChange={(next) => {
          setAddRootForm(next);
          setAddRootErrors((prev) => ({
            menuCd: prev.menuCd && next.menuCd.trim() ? "" : prev.menuCd,
            menuName:
              prev.menuName && next.menuName.trim() ? "" : prev.menuName,
          }));
        }}
        onClose={closeAddRoot}
        onSubmit={handleSubmitAddRoot}
      />
      <AddScreenMenuDialog
        open={addScreenOpen}
        screens={screens}
        loading={addScreenLoading}
        saving={saving}
        error={addScreenError}
        onClose={closeAddScreen}
        onSubmit={handleSubmitAddScreen}
      />
    </div>
  );
}
