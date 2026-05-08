import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PageHeader from "../../components/common/PageHeader";
import {
  getAdminMenuTree,
  createAdminMenu,
  createAdminMenuForScreen,
  patchAdminMenu,
  deleteAdminMenu,
  getAdminScreensList,
  moveAdminMenu,
} from "../../services/adminApi";
import ScreenPreviewModal from "../../components/admin/ScreenPreviewModal";
import AddScreenMenuDialog from "../../components/admin/AddScreenMenuDialog";

import Toast from "./menu-management/components/Toast";
import AddRootMenuDialog from "./menu-management/components/AddRootMenuDialog";
import MenuTreePanel from "./menu-management/components/MenuTreePanel";
import MenuDetailForm from "./menu-management/components/MenuDetailForm";
import useMenuDragDrop from "./menu-management/hooks/useMenuDragDrop";
import {
  filterMenuTree,
  findNodeById,
  findParentChain,
  collectAllIds,
} from "./menu-management/utils/menuTree";
import { emptyForm, nodeToForm, parseOptionalInt } from "./menu-management/utils/menuForm";
import { ADMIN_PAGE_CONTAINER_CLASS } from "../../constants/adminLayout";

export default function MenuManagement() {
  const [menuTree, setMenuTree] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
  const [expandedIds, setExpandedIds] = useState(new Set());

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  const loadTree = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const data = await getAdminMenuTree();
      const tree = data.menu_tree || [];
      setMenuTree(tree);
      setExpandedIds((prev) => {
        if (prev.size === 0 && tree.length > 0) {
          return new Set(tree.map((n) => n.menu_id));
        }
        return prev;
      });
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
      if (!silent) {
        setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        setMenuTree([]);
        setSelectedNode(null);
      }
      return [];
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree({ silent: false });
  }, [loadTree]);

  useEffect(() => {
    if (selectedNode) {
      setFormData(nodeToForm(selectedNode));
    }
  }, [selectedNode]);

  const toggleExpand = useCallback((menuId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  }, []);

  const handleMoveAttempt = useCallback(
    async ({ draggedId, targetId, position, optimisticTree, hintExpandId }) => {
      const prevTree = menuTree;
      const prevExpanded = expandedIds;
      const prevSelectedId = selectedNode?.menu_id ?? null;

      setMenuTree(optimisticTree);
      setSelectedNode((prev) => {
        if (!prev) return prev;
        return findNodeById(optimisticTree, prev.menu_id) ?? null;
      });
      if (hintExpandId != null) {
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.add(hintExpandId);
          return next;
        });
      }

      try {
        await moveAdminMenu(draggedId, targetId, position);
        const tree = await loadTree({ silent: true });
        const chain = findParentChain(tree, draggedId);
        if (chain) {
          setExpandedIds((prev) => {
            const next = new Set(prev);
            for (const id of chain) next.add(id);
            return next;
          });
        }
      } catch (err) {
        setMenuTree(prevTree);
        setExpandedIds(prevExpanded);
        if (prevSelectedId != null) {
          setSelectedNode(findNodeById(prevTree, prevSelectedId));
        } else {
          setSelectedNode(null);
        }
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail;
        const rawMsg = err?.message;
        let msg = "메뉴 이동에 실패했습니다.";
        if (typeof detail === "string" && detail.trim()) {
          msg = detail;
        } else if (status === 401) {
          msg = "로그인이 만료되었습니다. 다시 로그인해주세요.";
        } else if (status === 403) {
          msg = "권한이 없어 메뉴를 이동할 수 없습니다.";
        } else if (status === 404) {
          msg = "이동 대상 메뉴를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.";
        } else if (status === 409) {
          msg = "순환 참조가 발생할 수 있어 이동이 차단되었습니다.";
        } else if (status === 502 || status === 503 || status === 504) {
          msg = "서버 연결에 실패했습니다(백엔드/프록시). 잠시 후 다시 시도해주세요.";
        } else if (
          typeof rawMsg === "string" &&
          (rawMsg.includes("Network Error") || rawMsg.includes("ECONN"))
        ) {
          msg = "네트워크 오류로 메뉴 이동에 실패했습니다. 서버 상태를 확인해주세요.";
        } else if (typeof rawMsg === "string" && rawMsg.trim()) {
          msg = rawMsg;
        }
        showToast(msg, "error");
      }
    },
    [menuTree, expandedIds, selectedNode, loadTree, showToast],
  );

  const {
    dragProps,
    scrollRef,
  } = useMenuDragDrop({ menuTree, loading, onMoveAttempt: handleMoveAttempt });

  const displayRoots = useMemo(
    () => filterMenuTree(menuTree, searchTerm),
    [menuTree, searchTerm],
  );

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
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
      showToast("저장되었습니다.", "success");
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
      showToast("삭제되었습니다.", "success");
      await loadTree();
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
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.add(menu_id);
        return next;
      });
      const created = findNodeById(tree, menu_id);
      if (created) {
        setSelectedNode(created);
        setFormData(nodeToForm(created));
      }
      setAddRootOpen(false);
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

  const handleExpandAll = useCallback(() => {
    setExpandedIds(collectAllIds(menuTree));
  }, [menuTree]);

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
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.add(menu_id);
        return next;
      });
      const created = findNodeById(tree, menu_id);
      if (created) {
        setSelectedNode(created);
        setFormData(nodeToForm(created));
      }
      setAddScreenOpen(false);
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
        <MenuTreePanel
          roots={displayRoots}
          selectedId={selectedNode?.menu_id}
          onSelect={handleNodeSelect}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onExpandAll={handleExpandAll}
          onAddRoot={openAddRoot}
          onAddScreen={openAddScreen}
          loading={loading}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          menuTree={menuTree}
          scrollRef={scrollRef}
          {...dragProps}
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
