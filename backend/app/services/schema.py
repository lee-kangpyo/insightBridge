import logging
from typing import Any
from ..database import get_pool

logger = logging.getLogger(__name__)


async def get_tables() -> list[dict[str, Any]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT 
                c.relname AS table_name,
                obj_description(c.oid) AS comment
            FROM pg_class c
            WHERE c.relkind = 'r' 
              AND c.relnamespace = 'public'::regnamespace
            ORDER BY c.relname
        """)
        return [
            {"table_name": row["table_name"], "comment": row["comment"] or ""}
            for row in rows
        ]


async def get_columns(table_name: str) -> list[dict[str, Any]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT 
                a.attname AS column_name,
                format_type(a.atttypid, a.atttypmod) AS data_type,
                col_description(a.attrelid, a.attnum) AS comment
            FROM pg_attribute a
            WHERE a.attrelid = $1::regclass
              AND a.attnum > 0
            ORDER BY a.attnum
        """,
            table_name,
        )

        if not rows:
            return []

        return [
            {
                "column_name": row["column_name"],
                "data_type": row["data_type"],
                "comment": row["comment"] or "",
            }
            for row in rows
        ]


async def get_full_schema() -> list[dict[str, Any]]:
    """public 테이블 전체 + 각 테이블 컬럼 메타."""
    tables_meta = await get_tables()
    out: list[dict[str, Any]] = []
    for t in tables_meta:
        name = t["table_name"]
        cols = await get_columns(name)
        out.append(
            {
                "table_name": name,
                "comment": t.get("comment") or "",
                "columns": cols,
            }
        )
    return out


def format_schema_for_prompt(rows: list[dict[str, Any]]) -> str:
    """시스템 프롬프트용 텍스트 (테이블·컬럼·코멘트)."""
    lines: list[str] = []
    for t in rows:
        lines.append(f"### {t['table_name']}")
        if t.get("comment"):
            lines.append(f"(테이블 설명) {t['comment']}")
        lines.append("컬럼:")
        for c in t.get("columns") or []:
            cmt = (c.get("comment") or "").strip()
            cmt_part = f" — {cmt}" if cmt else ""
            lines.append(
                f"  - {c['column_name']} ({c['data_type']}){cmt_part}"
            )
        lines.append("")
    return "\n".join(lines).strip()
