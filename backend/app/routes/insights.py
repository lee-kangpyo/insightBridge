from __future__ import annotations

from fastapi import APIRouter, Query
from typing import Optional

from ..database import get_pool
from ..schemas import InsightBlock, InsightCoreResponse, InsightLine


router = APIRouter()


def _join_nonempty(lines: list[str]) -> Optional[str]:
    parts = [s.strip() for s in lines if (s or "").strip()]
    if not parts:
        return None
    return "\n".join(parts)


@router.get("/api/insights/core", response_model=InsightCoreResponse)
async def get_insights_core(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    screen_code: str = "overview",
    screen_ver: str = "v0.1",
    schl_nm: str = Query(..., min_length=1),
):
    # 요청하신 block_code 규약
    wanted = ("HEADER_CONTEXT", "SAMPLE_INSIGHT", "SUMMARY_JUDGMENT")

    sql_blocks = """
    SELECT
      block_code,
      block_area_name,
      block_title,
      display_order
    FROM public.tq_overview_text_block
    WHERE screen_code=$1
      AND screen_ver=$2
      AND schl_nm=$3
      AND screen_base_year=$4
      AND block_code = ANY($5::text[])
    ORDER BY display_order, block_code
    """

    sql_lines = """
    SELECT
      block_code,
      line_no,
      line_role,
      line_text
    FROM public.tq_overview_text_line
    WHERE screen_code=$1
      AND screen_ver=$2
      AND schl_nm=$3
      AND screen_base_year=$4
      AND block_code = ANY($5::text[])
    ORDER BY block_code, line_no
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        blocks_rows = await conn.fetch(sql_blocks, screen_code, screen_ver, schl_nm, screen_base_year, list(wanted))
        lines_rows = await conn.fetch(sql_lines, screen_code, screen_ver, schl_nm, screen_base_year, list(wanted))

    block_meta: dict[str, dict[str, object]] = {}
    for b in blocks_rows:
        code = (b["block_code"] or "").strip()
        block_meta[code] = {
            "areaName": (b["block_area_name"] or "").strip(),
            "title": (b["block_title"] or "").strip(),
            "displayOrder": int(b["display_order"]),
        }

    lines_by_code: dict[str, list[InsightLine]] = {}
    for r in lines_rows:
        code = (r["block_code"] or "").strip()
        lines_by_code.setdefault(code, []).append(
            InsightLine(
                no=int(r["line_no"]),
                role=(r["line_role"] or "").strip(),
                text=(r["line_text"] or "").strip(),
            )
        )

    blocks: list[InsightBlock] = []
    for code, meta in sorted(
        block_meta.items(),
        key=lambda kv: (int(kv[1].get("displayOrder") or 0), kv[0]),
    ):
        blocks.append(
            InsightBlock(
                code=code,
                areaName=str(meta.get("areaName") or ""),
                title=str(meta.get("title") or ""),
                displayOrder=int(meta.get("displayOrder") or 0),
                lines=lines_by_code.get(code, []),
            )
        )

    # 파생 필드: HEADER_CONTEXT / SUMMARY_JUDGMENT
    header_context = _join_nonempty([ln.text for ln in lines_by_code.get("HEADER_CONTEXT", [])])
    summary_judgment = _join_nonempty([ln.text for ln in lines_by_code.get("SUMMARY_JUDGMENT", [])])

    # 파생 필드: SAMPLE_INSIGHT -> strengths/risks/actions
    sample_lines = lines_by_code.get("SAMPLE_INSIGHT", [])
    strengths_lines: list[str] = []
    risks_lines: list[str] = []
    actions: list[str] = []

    for ln in sample_lines:
        role = (ln.role or "").strip().lower()
        txt = (ln.text or "").strip()
        if not txt:
            continue
        if role in ("strength", "strengths"):
            strengths_lines.append(txt)
        elif role in ("risk", "risks"):
            risks_lines.append(txt)
        elif role in ("action", "actions"):
            actions.append(txt)
        else:
            # role이 없는 데이터는 strengths로 흡수(패널이 최소한 렌더되도록)
            strengths_lines.append(txt)

    strengths = _join_nonempty(strengths_lines)
    risks = _join_nonempty(risks_lines)

    # 타이틀은 SAMPLE_INSIGHT 블록 타이틀 우선
    title = (block_meta.get("SAMPLE_INSIGHT", {}) or {}).get("title")  # type: ignore[assignment]
    title = (str(title or "")).strip() or "핵심 인사이트"

    return InsightCoreResponse(
        title=title,
        strengths=strengths,
        risks=risks,
        actions=actions,
        headerContext=header_context,
        summaryJudgment=summary_judgment,
        blocks=blocks,
    )

