import pandas as pd
from app.database import fetch_df, get_pool


async def search_users(search: str, limit: int = 50) -> list[dict]:
    query = """
        SELECT u.user_cd, u.user_id, u.user_nm,
               g.grp_id, g.grp_nm
        FROM ts_user_info u
        LEFT JOIN ts_grp_user gu ON u.user_cd = gu.user_cd
        LEFT JOIN ts_grp_info g ON gu.grp_id = g.grp_id
        WHERE u.user_id ILIKE $1 OR u.user_nm ILIKE $1
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


async def get_all_menus() -> list[dict]:
    query = """
        SELECT menu_id, menu_cd, menu_nm, parent_menu_id,
               menu_level, menu_path, sort_order
        FROM ts_menu_info
        WHERE del_fg = 'N'
        ORDER BY sort_order
    """
    df = await fetch_df(query, ())
    return df.to_dict(orient="records") if not df.empty else []


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
