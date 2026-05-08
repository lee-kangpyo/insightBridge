export function emptyForm() {
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

export function nodeToForm(node) {
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

export function parseOptionalInt(v) {
  if (v === "" || v == null) return null;
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}
