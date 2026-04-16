import math
import pandas as pd
from app.database import fetch_df


def treeify(flat_menus: list) -> list:
    if not flat_menus:
        return []

    menu_map: dict = {}
    for menu in flat_menus:
        menu_map[menu["menu_id"]] = {**menu, "children": []}

    roots = []
    for menu_id, menu in menu_map.items():
        parent_id = menu.get("parent_menu_id")
        if parent_id is None or parent_id == 0:
            roots.append(menu)
        elif parent_id in menu_map:
            menu_map[parent_id]["children"].append(menu)

    return roots


def _sanitize_menu_record(record: dict) -> dict:
    result = {}
    for key, value in record.items():
        if isinstance(value, float) and math.isnan(value):
            result[key] = None
        else:
            result[key] = value
    return result


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
