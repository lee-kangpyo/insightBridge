import json
import uuid
from typing import Any, Optional

from app.database import fetch_df, get_pool
from app.services.mapping_validator import validate_mapping_json, MappingValidationError


async def create_item(
    item_nm: str,
    shape_cnts_id: Optional[int] = None,
    sql_cnts_id: Optional[int] = None,
    mapping_json: Optional[dict] = None,
) -> int:
    if mapping_json is not None:
        try:
            validate_mapping_json(mapping_json)
        except MappingValidationError as e:
            raise ValueError(f"invalid_mapping_json: {e}")
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO ts_scr_item (item_nm, shape_cnts_id, sql_cnts_id, mapping_json)
            VALUES ($1, $2, $3, $4)
            RETURNING item_id
            """,
            item_nm,
            shape_cnts_id,
            sql_cnts_id,
            json.dumps(mapping_json) if mapping_json else None,
        )
        return int(row["item_id"])


async def update_item(
    item_id: int,
    item_nm: Optional[str] = None,
    shape_cnts_id: Optional[int] = None,
    sql_cnts_id: Optional[int] = None,
    mapping_json: Optional[dict] = None,
) -> None:
    if mapping_json is not None:
        try:
            validate_mapping_json(mapping_json)
        except MappingValidationError as e:
            raise ValueError(f"invalid_mapping_json: {e}")
    
    fields: list[str] = []
    values: list[Any] = []
    idx = 1

    if item_nm is not None:
        fields.append(f"item_nm = ${idx}")
        values.append(item_nm)
        idx += 1
    if shape_cnts_id is not None:
        fields.append(f"shape_cnts_id = ${idx}")
        values.append(shape_cnts_id)
        idx += 1
    if sql_cnts_id is not None:
        fields.append(f"sql_cnts_id = ${idx}")
        values.append(sql_cnts_id)
        idx += 1
    if mapping_json is not None:
        fields.append(f"mapping_json = ${idx}")
        values.append(json.dumps(mapping_json))
        idx += 1

    if not fields:
        return

    fields.append(f"mod_dt = ${idx}")
    values.append("NOW()")
    idx += 1

    values.append(item_id)
    query = f"UPDATE ts_scr_item SET {', '.join(fields)} WHERE item_id = ${idx} AND del_fg = 'N'"
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = str(await conn.execute(query, *values))
        if result.strip() == "UPDATE 0":
            raise LookupError("item_not_found")


async def get_item(item_id: int) -> Optional[dict]:
    query = """
        SELECT item_id, item_nm, shape_cnts_id, sql_cnts_id, mapping_json, reg_dt, mod_dt
        FROM ts_scr_item
        WHERE item_id = $1 AND del_fg = 'N'
    """
    df = await fetch_df(query, (item_id,))
    if df.empty:
        return None
    row = df.to_dict(orient="records")[0]
    if row.get("mapping_json") is not None and isinstance(row["mapping_json"], str):
        row["mapping_json"] = json.loads(row["mapping_json"])
    return row


async def list_items() -> list[dict]:
    query = """
        SELECT item_id, item_nm, shape_cnts_id, sql_cnts_id, mapping_json, reg_dt, mod_dt
        FROM ts_scr_item
        WHERE del_fg = 'N'
        ORDER BY item_id
    """
    df = await fetch_df(query, ())
    if df.empty:
        return []
    rows = df.to_dict(orient="records")
    for r in rows:
        if r.get("mapping_json") is not None and isinstance(r["mapping_json"], str):
            r["mapping_json"] = json.loads(r["mapping_json"])
    return rows


async def delete_item(item_id: int) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = str(
            await conn.execute(
                "UPDATE ts_scr_item SET del_fg = 'Y' WHERE item_id = $1",
                item_id,
            )
        )
        if result.strip() == "UPDATE 0":
            raise LookupError("item_not_found")


async def save_screen_slots(scr_id: str, slots: list[dict]) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            for slot in slots:
                await conn.execute(
                    """
                    INSERT INTO ts_scr_slot_item (scr_id, slot_id, item_id)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (scr_id, slot_id) DO UPDATE SET
                        item_id = EXCLUDED.item_id,
                        mod_dt = NOW()
                    """,
                    scr_id,
                    slot["slot_id"],
                    slot.get("item_id"),
                )


async def get_screen_slots(scr_id: str) -> list[dict]:
    query = """
        SELECT s.scr_id, s.slot_id, s.item_id, i.item_nm
        FROM ts_scr_slot_item s
        LEFT JOIN ts_scr_item i ON s.item_id = i.item_id
        WHERE s.scr_id = $1
        ORDER BY s.slot_id
    """
    df = await fetch_df(query, (scr_id,))
    if df.empty:
        return []
    return df.to_dict(orient="records")


async def get_screen_with_template(scr_id: str) -> Optional[dict]:
    query = """
        SELECT scr_id, scr_nm, template_id
        FROM ts_scr_info
        WHERE scr_id = $1
    """
    df = await fetch_df(query, (scr_id,))
    if df.empty:
        return None
    return df.to_dict(orient="records")[0]


async def list_screens() -> list[dict]:
    query = """
        SELECT scr_id, scr_nm, menu_id
        FROM ts_scr_info
        WHERE del_fg = 'N'
        ORDER BY scr_nm, scr_id
    """
    df = await fetch_df(query, ())
    if df.empty:
        return []
    return df.to_dict(orient="records")

from app.utils.uuid_v7 import generate_uuid_v7

async def create_screen(scr_nm: str, template_id: int) -> str:
    """화면을 생성하고 UUID v7 스타일의 scr_id를 발급받는다."""
    scr_id = generate_uuid_v7()
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO ts_scr_info (scr_id, scr_nm, template_id, del_fg)
            VALUES ($1, $2, $3, 'N')
            """,
            scr_id,
            scr_nm,
            template_id,
        )
    return scr_id
