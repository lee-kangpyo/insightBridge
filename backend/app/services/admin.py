import math
from typing import Any, Optional

import pandas as pd
from app.database import fetch_df, get_pool
from app.services.menu import _sanitize_menu_record

_PATCH_UNSET = object()


async def get_all_role_user_mappings() -> list[dict]:
    query = """
        SELECT gu.user_cd, gu.grp_id, gu.reg_dt,
               u.user_nm, u.dept_nm, u.user_id,
               g.grp_nm, g.grp_cd
        FROM ts_grp_user gu
        JOIN ts_user_info u ON gu.user_cd = u.user_cd
        JOIN ts_grp_info g ON gu.grp_id = g.grp_id
        ORDER BY gu.user_cd, gu.grp_id
    """
    df = await fetch_df(query, ())
    return df.to_dict(orient="records") if not df.empty else []


async def get_all_grp_info() -> list[dict]:
    query = """
        SELECT grp_id, grp_cd, grp_nm, reg_dt, del_fg, univ_cd, description
        FROM ts_grp_info
        WHERE del_fg = 'N'
        ORDER BY grp_id
    """
    df = await fetch_df(query, ())
    return df.to_dict(orient="records") if not df.empty else []


async def get_all_user_info() -> list[dict]:
    query = """
        SELECT user_cd, user_id, user_nm, mobile1, mobile2, mobile3,
               office1, office2, office3, dept_nm, grade_nm, pos_nm, reg_dt, univ_cd
        FROM ts_user_info
        ORDER BY user_cd
    """
    df = await fetch_df(query, ())
    return df.to_dict(orient="records") if not df.empty else []


async def replace_user_groups(user_cd: int, grp_ids: list[int]) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute("DELETE FROM ts_grp_user WHERE user_cd = $1", user_cd)
            for grp_id in grp_ids:
                await conn.execute(
                    "INSERT INTO ts_grp_user (user_cd, grp_id, reg_dt) VALUES ($1, $2, NOW())",
                    user_cd,
                    grp_id,
                )


async def replace_group_users(grp_id: int, user_cds: list[int]) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute("DELETE FROM ts_grp_user WHERE grp_id = $1", grp_id)
            for user_cd in user_cds:
                await conn.execute(
                    "INSERT INTO ts_grp_user (user_cd, grp_id, reg_dt) VALUES ($1, $2, NOW())",
                    user_cd,
                    grp_id,
                )


async def search_users(search: str, limit: int = 50) -> list[dict]:
    query = """
        SELECT u.user_cd, u.user_id, u.user_nm, u.univ_cd,
               u.mobile1, u.mobile2, u.mobile3,
               u.office1, u.office2, u.office3,
               u.dept_nm, u.grade_nm, u.pos_nm, u.reg_dt,
               STRING_AGG(g.grp_nm, ', ') as grp_nm
        FROM ts_user_info u
        LEFT JOIN ts_grp_user gu ON u.user_cd = gu.user_cd
        LEFT JOIN ts_grp_info g ON gu.grp_id = g.grp_id
        WHERE u.user_id ILIKE $1 OR u.user_nm ILIKE $1
        GROUP BY u.user_cd, u.user_id, u.user_nm, u.univ_cd,
               u.mobile1, u.mobile2, u.mobile3,
               u.office1, u.office2, u.office3,
               u.dept_nm, u.grade_nm, u.pos_nm, u.reg_dt
        ORDER BY u.user_cd
        LIMIT $2
    """
    df = await fetch_df(query, (f"%{search}%", limit))
    return df.to_dict(orient="records") if not df.empty else []


async def update_user_role(user_cd: int, grp_id: int) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM ts_grp_user WHERE user_cd = $1", user_cd)
        await conn.execute(
            "INSERT INTO ts_grp_user (user_cd, grp_id, reg_dt) VALUES ($1, $2, NOW())",
            user_cd,
            grp_id,
        )


async def get_all_menus(include_deleted: bool = False) -> list[dict]:
    where = "" if include_deleted else "WHERE del_fg = 'N'"
    query = f"""
        SELECT menu_id, menu_cd, menu_nm, parent_menu_id,
               menu_level, menu_path, screen_id, sort_order, use_yn, del_fg, reg_dt
        FROM ts_menu_info
        {where}
        ORDER BY sort_order NULLS LAST, menu_id
    """
    df = await fetch_df(query, ())
    if df.empty:
        return []
    return [_sanitize_menu_record(row) for row in df.to_dict(orient="records")]


def _norm_parent_for_db(parent_menu_id: Any) -> Optional[str]:
    if parent_menu_id is None or parent_menu_id == "":
        return None
    if parent_menu_id in (0, "0"):
        return None
    return str(parent_menu_id)


async def create_menu(
    menu_cd: str,
    menu_nm: str,
    parent_menu_id: Any = None,
    menu_level: Optional[int] = None,
    menu_path: Optional[str] = None,
    screen_id: Optional[str] = None,
    sort_order: Optional[int] = None,
) -> int:
    pool = await get_pool()
    parent = _norm_parent_for_db(parent_menu_id)
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO ts_menu_info (
                menu_cd, menu_nm, parent_menu_id, menu_level,
                menu_path, screen_id, sort_order, use_yn, del_fg
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'Y', 'N')
            RETURNING menu_id
            """,
            menu_cd.strip(),
            menu_nm.strip(),
            parent,
            menu_level,
            menu_path.strip() if menu_path else None,
            screen_id.strip() if screen_id else None,
            sort_order,
        )
        return int(row["menu_id"])


async def patch_menu(menu_id: int, updates: dict[str, Any]) -> None:
    """Partial update; keys must be DB column names."""
    fields: list[str] = []
    values: list[Any] = []
    idx = 1

    def add(field: str, val: Any):
        nonlocal idx
        fields.append(f"{field} = ${idx}")
        values.append(val)
        idx += 1

    if "menu_cd" in updates and updates["menu_cd"] is not None:
        add("menu_cd", str(updates["menu_cd"]).strip())
    if "menu_nm" in updates and updates["menu_nm"] is not None:
        add("menu_nm", str(updates["menu_nm"]).strip())
    if "parent_menu_id" in updates:
        add("parent_menu_id", _norm_parent_for_db(updates.get("parent_menu_id")))
    if "menu_level" in updates:
        add("menu_level", updates["menu_level"])
    if "menu_path" in updates:
        mp = updates["menu_path"]
        if mp is None or (isinstance(mp, str) and not mp.strip()):
            add("menu_path", None)
        else:
            add("menu_path", mp.strip() if isinstance(mp, str) else mp)
    if "screen_id" in updates:
        sid = updates["screen_id"]
        if sid is None or (isinstance(sid, str) and not sid.strip()):
            add("screen_id", None)
        else:
            add("screen_id", sid.strip() if isinstance(sid, str) else sid)
    if "sort_order" in updates:
        add("sort_order", updates["sort_order"])
    if "use_yn" in updates and updates["use_yn"] is not None:
        yn = str(updates["use_yn"]).strip().upper()
        if yn not in ("Y", "N"):
            raise ValueError("invalid_use_yn")
        add("use_yn", yn)
    if "del_fg" in updates and updates["del_fg"] is not None:
        add("del_fg", str(updates["del_fg"]).strip())

    if not fields:
        return

    values.append(menu_id)
    query = f"UPDATE ts_menu_info SET {', '.join(fields)} WHERE menu_id = ${idx}"
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(query, *values)


async def soft_delete_menu(menu_id: int) -> None:
    await patch_menu(menu_id, {"del_fg": "Y"})


async def toggle_role_menu(menu_id: int, grp_id: int, enabled: bool) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        if enabled:
            await conn.execute(
                """INSERT INTO ts_grp_menu (grp_id, menu_id, reg_dt)
                   VALUES ($1, $2, NOW())
                   ON CONFLICT (grp_id, menu_id) DO NOTHING""",
                grp_id,
                menu_id,
            )
        else:
            await conn.execute(
                "DELETE FROM ts_grp_menu WHERE grp_id = $1 AND menu_id = $2",
                grp_id,
                menu_id,
            )


async def update_user_info(user_cd: int, updates: dict[str, Any]) -> None:
    """Partial update of user information; keys must be DB column names."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        fields: list[str] = []
        values: list[Any] = []
        idx = 1

        if "user_nm" in updates and updates["user_nm"] is not None:
            fields.append(f"user_nm = ${idx}")
            values.append(str(updates["user_nm"]).strip())
            idx += 1
        if "univ_cd" in updates and updates["univ_cd"] is not None:
            fields.append(f"univ_cd = ${idx}")
            values.append(str(updates["univ_cd"]).strip())
            idx += 1
        if "dept_nm" in updates and updates["dept_nm"] is not None:
            fields.append(f"dept_nm = ${idx}")
            values.append(str(updates["dept_nm"]).strip())
            idx += 1
        if "grade_nm" in updates and updates["grade_nm"] is not None:
            fields.append(f"grade_nm = ${idx}")
            values.append(str(updates["grade_nm"]).strip())
            idx += 1
        if "pos_nm" in updates and updates["pos_nm"] is not None:
            fields.append(f"pos_nm = ${idx}")
            values.append(str(updates["pos_nm"]).strip())
            idx += 1
        if "mobile1" in updates and updates["mobile1"] is not None:
            fields.append(f"mobile1 = ${idx}")
            values.append(str(updates["mobile1"]).strip())
            idx += 1
        if "mobile2" in updates and updates["mobile2"] is not None:
            fields.append(f"mobile2 = ${idx}")
            values.append(str(updates["mobile2"]).strip())
            idx += 1
        if "mobile3" in updates and updates["mobile3"] is not None:
            fields.append(f"mobile3 = ${idx}")
            values.append(str(updates["mobile3"]).strip())
            idx += 1
        if "office1" in updates and updates["office1"] is not None:
            fields.append(f"office1 = ${idx}")
            values.append(str(updates["office1"]).strip())
            idx += 1
        if "office2" in updates and updates["office2"] is not None:
            fields.append(f"office2 = ${idx}")
            values.append(str(updates["office2"]).strip())
            idx += 1
        if "office3" in updates and updates["office3"] is not None:
            fields.append(f"office3 = ${idx}")
            values.append(str(updates["office3"]).strip())
            idx += 1
        if "mobile_co_cd" in updates and updates["mobile_co_cd"] is not None:
            fields.append(f"mobile_co_cd = ${idx}")
            values.append(str(updates["mobile_co_cd"]).strip())
            idx += 1

        if not fields:
            return

        values.append(user_cd)
        query = f"UPDATE ts_user_info SET {', '.join(fields)} WHERE user_cd = ${idx}"
        await conn.execute(query, *values)


async def delete_user(user_cd: int) -> None:
    """Delete user and associated records from related tables."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute("DELETE FROM ts_grp_user WHERE user_cd = $1", user_cd)
            await conn.execute("DELETE FROM ts_user_info WHERE user_cd = $1", user_cd)


async def reset_user_password(user_cd: int, new_password: str) -> None:
    """Reset user password to a new password."""
    from app.services.auth import get_password_hash

    pool = await get_pool()
    async with pool.acquire() as conn:
        hashed_pw = get_password_hash(new_password)
        await conn.execute(
            "UPDATE ts_user_info SET user_pw = $1 WHERE user_cd = $2",
            hashed_pw,
            user_cd,
        )


async def get_role_menu_map() -> dict[int, list[int]]:
    """
    Returns {menu_id: [grp_id, ...]} for SYS_ADM screens.
    """
    query = """
        SELECT menu_id, ARRAY_AGG(grp_id ORDER BY grp_id) AS role_ids
        FROM ts_grp_menu
        GROUP BY menu_id
    """
    df = await fetch_df(query, ())
    if df.empty:
        return {}
    out: dict[int, list[int]] = {}
    for row in df.to_dict(orient="records"):
        try:
            menu_id = int(row.get("menu_id"))
        except (TypeError, ValueError):
            continue
        role_ids = row.get("role_ids") or []
        # asyncpg returns list already; normalize to int list defensively
        cleaned: list[int] = []
        for rid in role_ids:
            try:
                cleaned.append(int(rid))
            except (TypeError, ValueError):
                continue
        out[menu_id] = cleaned
    return out

async def list_groups_admin() -> list[dict]:
    query = """
        SELECT grp_id, grp_cd, grp_nm, reg_dt, use_yn, del_fg, description
        FROM ts_grp_info
        WHERE del_fg = 'N'
        ORDER BY grp_id
    """
    df = await fetch_df(query, ())
    if df.empty:
        return []
    rows = df.to_dict(orient="records")
    for r in rows:
        v = r.get("description")
        if isinstance(v, float) and math.isnan(v):
            r["description"] = None
    return rows


async def _active_grp_cd_exists(grp_cd: str, exclude_grp_id: Optional[int] = None) -> bool:
    if exclude_grp_id is None:
        query = "SELECT 1 FROM ts_grp_info WHERE del_fg = 'N' AND grp_cd = $1"
        params: tuple[Any, ...] = (grp_cd.strip(),)
    else:
        query = "SELECT 1 FROM ts_grp_info WHERE del_fg = 'N' AND grp_cd = $1 AND grp_id <> $2"
        params = (grp_cd.strip(), exclude_grp_id)
    df = await fetch_df(query, params)
    return not df.empty


async def create_group(
    grp_cd: str,
    grp_nm: str,
    description: Optional[str] = None,
) -> int:
    cd = grp_cd.strip()
    nm = grp_nm.strip()
    desc = None
    if description is not None and str(description).strip():
        desc = str(description).strip()
    if await _active_grp_cd_exists(cd):
        raise ValueError("duplicate_grp_cd")
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO ts_grp_info (grp_cd, grp_nm, use_yn, del_fg, description)
            VALUES ($1, $2, 'Y', 'N', $3)
            RETURNING grp_id
            """,
            cd,
            nm,
            desc,
        )
        return int(row["grp_id"])


async def patch_group(
    grp_id: int,
    grp_cd: Optional[str] = None,
    grp_nm: Optional[str] = None,
    use_yn: Optional[str] = None,
    del_fg: Optional[str] = None,
    description: Any = _PATCH_UNSET,
) -> None:
    fields: list[str] = []
    values: list[Any] = []
    idx = 1

    def add(field: str, val: Any):
        nonlocal idx
        fields.append(f"{field} = ${idx}")
        values.append(val)
        idx += 1

    if grp_cd is not None:
        cd = grp_cd.strip()
        if await _active_grp_cd_exists(cd, exclude_grp_id=grp_id):
            raise ValueError("duplicate_grp_cd")
        add("grp_cd", cd)
    if grp_nm is not None:
        add("grp_nm", str(grp_nm).strip())
    if use_yn is not None:
        yn = str(use_yn).strip().upper()
        if yn not in ("Y", "N"):
            raise ValueError("invalid_use_yn")
        add("use_yn", yn)
    if del_fg is not None:
        fg = str(del_fg).strip().upper()
        if fg not in ("Y", "N"):
            raise ValueError("invalid_del_fg")
        add("del_fg", fg)
    if description is not _PATCH_UNSET:
        if description is None or (isinstance(description, str) and not str(description).strip()):
            add("description", None)
        else:
            add("description", str(description).strip())

    if not fields:
        return

    values.append(grp_id)
    query = f"UPDATE ts_grp_info SET {', '.join(fields)} WHERE grp_id = ${idx}"
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = str(await conn.execute(query, *values))
        if result.strip() == "UPDATE 0":
            raise LookupError("group_not_found")


async def soft_delete_group(grp_id: int) -> None:
    await patch_group(grp_id, del_fg="Y")
