import json
import logging
from pathlib import Path
from typing import Any
from ..database import get_pool

logger = logging.getLogger(__name__)

_metadata_cache = None

def load_metadata() -> dict:
    global _metadata_cache
    if _metadata_cache is not None:
        return _metadata_cache
        
    meta_path = Path(__file__).parent.parent.parent / "schema_metadata.json"
    if meta_path.exists():
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                _metadata_cache = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load schema_metadata.json: {e}")
            _metadata_cache = {"relations": [], "samples": {}}
    else:
        _metadata_cache = {"relations": [], "samples": {}}
        
    return _metadata_cache

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
    meta = load_metadata()
    relations = meta.get("relations", [])
    samples = meta.get("samples", {})
    
    # 테이블별 관계 매핑 최적화
    rel_groups_by_table = {}
    for r in relations:
        src = r["source_table"]
        tgt = r["target_table"]
        src_col = r["source_column"]
        
        rel_groups_by_table.setdefault(src, {}).setdefault(src_col, set()).add(tgt)
        rel_groups_by_table.setdefault(tgt, {}).setdefault(src_col, set()).add(src)

    lines: list[str] = []
    for t in rows:
        tname = t['table_name']
        lines.append(f"### {tname}")
        if t.get("comment"):
            lines.append(f"(테이블 설명) {t['comment']}")
            
        if tname in rel_groups_by_table:
            rel_lines = []
            for col, tgts in rel_groups_by_table[tname].items():
                tgt_list = list(tgts)
                if len(tgt_list) > 3:
                    rel_lines.append(f"ON {col} -> {len(tgt_list)} tables (e.g. {tgt_list[0]}, {tgt_list[1]})")
                else:
                    rel_lines.append(f"ON {col} -> {', '.join(tgt_list)}")
            lines.append(f"관계: " + "; ".join(rel_lines))
            
        lines.append("컬럼:")
        for c in t.get("columns") or []:
            cname = c['column_name']
            cmt = (c.get("comment") or "").strip()
            
            sample_key = f"{tname}.{cname}"
            if sample_key in samples:
                sample_vals = samples[sample_key]
                sample_str = f" [샘플: {', '.join(sample_vals)}]"
                cmt += sample_str
                
            cmt_part = f" — {cmt}" if cmt else ""
            lines.append(
                f"  - {cname} ({c['data_type']}){cmt_part}"
            )
        lines.append("")
    return "\n".join(lines).strip()
