import math
import pandas as pd
from app.database import fetch_df


def _menu_id_int(menu_id) -> int | None:
    if menu_id is None:
        return None
    try:
        return int(menu_id)
    except (TypeError, ValueError):
        return None


def _parent_menu_id_int(parent_raw) -> int | None:
    """None / 0 / '' / '0' → root; otherwise parse int parent id."""
    if parent_raw is None:
        return None
    if isinstance(parent_raw, str) and parent_raw.strip() in ("", "0"):
        return None
    if parent_raw == 0:
        return None
    try:
        v = int(parent_raw)
        return None if v == 0 else v
    except (TypeError, ValueError):
        return None


def _sort_key(menu: dict):
    so = menu.get("sort_order")
    try:
        return (0, int(so)) if so is not None else (0, 0)
    except (TypeError, ValueError):
        return (1, str(so or ""))


def treeify(flat_menus: list) -> list:
    if not flat_menus:
        return []

    menu_map: dict[int, dict] = {}
    for menu in flat_menus:
        mid = _menu_id_int(menu.get("menu_id"))
        if mid is None:
            continue
        menu_map[mid] = {**menu, "menu_id": mid, "children": []}

    roots: list[dict] = []
    for mid, menu in menu_map.items():
        parent_mid = _parent_menu_id_int(menu.get("parent_menu_id"))
        if parent_mid is None or parent_mid not in menu_map:
            roots.append(menu)
        else:
            menu_map[parent_mid]["children"].append(menu)

    for m in menu_map.values():
        m["children"].sort(key=_sort_key)
    roots.sort(key=_sort_key)
    return roots


def _sanitize_menu_record(record: dict) -> dict:
    result = {}
    for key, value in record.items():
        if isinstance(value, float) and math.isnan(value):
            result[key] = None
        else:
            result[key] = value
    return result


async def get_nav_menus_service(user_cd: int) -> dict:
    query = """
        SELECT DISTINCT m.menu_id, m.menu_cd, m.menu_nm, m.parent_menu_id,
                        m.menu_level, m.menu_path, m.screen_id, m.sort_order, m.use_yn, m.del_fg
        FROM ts_grp_user gu
        JOIN ts_grp_menu gm ON gu.grp_id = gm.grp_id
        JOIN ts_menu_info m ON gm.menu_id = m.menu_id
        WHERE gu.user_cd = $1 AND m.del_fg = 'N' AND m.use_yn = 'Y'
        ORDER BY m.sort_order NULLS LAST, m.menu_id
    """
    df = await fetch_df(query, (user_cd,))

    if df.empty:
        flat_menus = []
    else:
        flat_menus = [
            _sanitize_menu_record(row) for row in df.to_dict(orient="records")
        ]

    return {"menu_tree": treeify(flat_menus)}


async def get_user_menus(user_cd: int) -> dict:
    query = """
        SELECT DISTINCT m.menu_id, m.menu_nm, m.parent_menu_id, m.sort_order
        FROM ts_grp_user gu
        JOIN ts_grp_menu gm ON gu.grp_id = gm.grp_id
        JOIN ts_menu_info m ON gm.menu_id = m.menu_id
        WHERE gu.user_cd = $1 AND m.del_fg = 'N'
        ORDER BY m.sort_order
    """
    df = await fetch_df(query, (user_cd,))

    if df.empty:
        flat_menus = []
    else:
        flat_menus = [
            _sanitize_menu_record(row) for row in df.to_dict(orient="records")
        ]

    return {"menu_tree": treeify(flat_menus)}


async def verify_menu_access(menu_id: int, user_cd: int) -> dict:
    """
    Unified menu guard: checks menu status (active, not deleted)
    and user permission via grp_menu mapping.
    Returns the menu record if all checks pass.
    Raises LookupError if menu not found.
    Raises PermissionError if menu is deleted, inactive, or user has no permission.
    """
    query_menu = """
        SELECT menu_id, menu_cd, menu_nm, parent_menu_id, menu_level,
               menu_path, screen_id, sort_order, use_yn, del_fg, subtitle, reg_dt
        FROM ts_menu_info
        WHERE menu_id = $1
    """
    df = await fetch_df(query_menu, (menu_id,))
    if df.empty:
        raise LookupError("menu_not_found")

    menu = _sanitize_menu_record(df.to_dict(orient="records")[0])

    if menu.get("del_fg") == "Y":
        raise PermissionError("menu_deleted")

    if menu.get("use_yn") != "Y":
        raise PermissionError("menu_inactive")

    query_perm = """
        SELECT 1
        FROM ts_grp_user gu
        JOIN ts_grp_menu gm ON gu.grp_id = gm.grp_id
        WHERE gu.user_cd = $1 AND gm.menu_id = $2
        LIMIT 1
    """
    df_perm = await fetch_df(query_perm, (user_cd, menu_id))
    if df_perm.empty:
        raise PermissionError("menu_no_permission")

    return menu
