import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  getAdminMenuTree,
  createAdminMenu,
  patchAdminMenu,
  deleteAdminMenu,
} from "../../services/adminApi";

function menuIcon(node) {
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
  const isInactive = node.del_fg === "Y";
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
            : isInactive
              ? "opacity-50"
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
        {isInactive && (
          <span className="text-[10px] uppercase text-outline ml-1">del</span>
        )}
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
  loading,
}) {
  return (
    <aside className="w-full lg:w-[350px] shrink-0 bg-surface-container-lowest rounded-lg p-6 flex flex-col gap-5 relative group">
      <div className="absolute inset-0 rounded-lg shadow-[0_8px_32px_rgba(24,28,30,0.04)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            className="w-full bg-surface-container-low text-sm text-on-surface py-2 pl-9 pr-3 rounded-md border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all placeholder:text-on-surface-variant/70"
            placeholder="메뉴 항목 검색..."
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="bg-secondary text-on-secondary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-container transition-colors"
          onClick={() => onSearchChange(searchTerm)}
        >
          검색
        </button>
      </div>
      <div className="overflow-y-auto no-scrollbar max-h-[600px] -mx-2 px-2 flex flex-col gap-1 text-sm mt-2">
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
      <button
        type="button"
        className="mt-auto pt-4 flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors border-t border-outline-variant/15"
        onClick={onAddRoot}
      >
        <span className="material-symbols-outlined text-[18px]">
          add_circle
        </span>
        최상위 메뉴 추가
      </button>
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
  if (!node) {
    return (
      <div className="flex-1 bg-surface-container-lowest rounded-lg flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.02)]">
        <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-primary to-primary-container" />
        <div className="p-8 flex items-center justify-center h-full">
          <p className="text-on-surface-variant">왼쪽에서 메뉴를 선택하세요</p>
        </div>
      </div>
    );
  }

  const active = node.del_fg !== "Y";

  return (
    <div className="flex-1 bg-surface-container-lowest rounded-lg flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.02)]">
      <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-primary to-primary-container" />
      <div className="p-8 flex flex-col gap-6 h-full overflow-y-auto">
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
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
            <h3 className="text-xl font-headline font-semibold text-primary">
              Node Configuration
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                active
                  ? "bg-tertiary-fixed text-on-tertiary-fixed"
                  : "bg-surface-container text-outline"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {active ? "check_circle" : "block"}
              </span>
              {active ? "ACTIVE" : "DELETED"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface-variant">
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
              <label className="text-sm font-medium text-on-surface-variant">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface-variant">
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
              <label className="text-sm font-medium text-on-surface-variant">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface-variant">
                레벨 (menu_level)
              </label>
              <input
                className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm"
                type="number"
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
              className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm"
              type="text"
              value={formData.menuUrl}
              onChange={(e) =>
                onChange({ ...formData, menuUrl: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">
              화면 / 컴포넌트 (screen_id)
            </label>
            <input
              className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm"
              type="text"
              value={formData.component}
              onChange={(e) =>
                onChange({ ...formData, component: e.target.value })
              }
            />
          </div>
          <div className="bg-surface-container-low rounded-lg p-5 flex flex-wrap gap-x-12 gap-y-6 items-center">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm font-medium text-on-surface">
                  사용여부 (del_fg)
                </div>
                <div className="text-xs text-on-surface-variant">
                  N=사용, Y=삭제(숨김)
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
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-2">
            <button
              type="button"
              className="px-6 py-2.5 rounded-md border border-error/50 text-error font-medium hover:bg-error/5 transition-colors text-sm"
              onClick={onDelete}
              disabled={saving}
            >
              삭제 (soft)
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
    useYn: node.del_fg !== "Y",
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
      alert("메뉴코드와 메뉴명은 필수입니다.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await patchAdminMenu(selectedNode.menu_id, {
        menu_cd: formData.menuCd.trim(),
        menu_nm: formData.menuName.trim(),
        menu_path: formData.menuUrl.trim() || null,
        screen_id: formData.component.trim() || null,
        menu_level: parseOptionalInt(formData.menuLevel),
        sort_order: parseOptionalInt(formData.sortOrder),
        parent_menu_id:
          formData.parentMenuId.trim() === ""
            ? null
            : formData.parentMenuId.trim(),
        del_fg: formData.useYn ? "N" : "Y",
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
        `메뉴 "${selectedNode.menu_nm}" 을(를) 비활성화(del_fg=Y)할까요?`,
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

  const handleAddRoot = async () => {
    const menu_cd = window.prompt("새 메뉴 코드(menu_cd)", "");
    if (menu_cd === null) return;
    const menu_nm = window.prompt("새 메뉴명(menu_nm)", "");
    if (menu_nm === null) return;
    if (!menu_cd.trim() || !menu_nm.trim()) {
      alert("메뉴코드와 메뉴명은 필수입니다.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const { menu_id } = await createAdminMenu({
        menu_cd: menu_cd.trim(),
        menu_nm: menu_nm.trim(),
        parent_menu_id: null,
      });
      const tree = await loadTree();
      const created = findNodeById(tree, menu_id);
      if (created) {
        setSelectedNode(created);
        setFormData(nodeToForm(created));
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "추가 실패";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleExpandAll = () => {
    /* 트리 펼침 상태는 노드 로컬 state — 전역 펼침은 후속 작업 */
  };

  return (
    <div className="px-10 pb-12 max-w-[1600px] mx-auto flex flex-col gap-8">
      <PageHeader
        title="메뉴 관리"
        description="시스템 탐색 계층 구조를 구성하고, 라우팅 경로를 정의하며, 교육기관 플랫폼 전체의 컴포넌트 가시성을 관리합니다."
      />
      {error && (
        <div className="p-4 bg-error/10 border border-error rounded-lg text-error text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <MenuTree
          roots={displayRoots}
          selectedId={selectedNode?.menu_id}
          onSelect={handleNodeSelect}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onExpandAll={handleExpandAll}
          onAddRoot={handleAddRoot}
          loading={loading}
        />
        <MenuDetailForm
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
    </div>
  );
}
