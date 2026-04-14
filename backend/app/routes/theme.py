from fastapi import APIRouter, Query

from ..database import get_pool
from ..schemas import (
    ThemeDetailGridAux,
    ThemeDetailGridItem,
    ThemeDetailGridResponse,
    ThemeDetailGridSource,
    ThemeChartBlock,
    ThemeChartBlocksResponse,
    ThemeChartItem,
    ThemeKpiCardAux,
    ThemeKpiCardItem,
    ThemeKpiCardSource,
    ThemeKpiCardsResponse,
    ThemeSourceRefItem,
    ThemeSourceRefsResponse,
    ThemeTextBlock,
    ThemeTextBlocksResponse,
    ThemeTextLine,
)

router = APIRouter()


@router.get("/api/theme/kpi-cards", response_model=ThemeKpiCardsResponse)
async def get_theme_kpi_cards(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    schl_nm: str = Query(..., min_length=1),
    screen_code: str = "admission_fill",
    screen_ver: str = "v0.1",
):
    sql = """
    SELECT
      metric_code,
      metric_name,
      metric_year,
      display_order,
      comparison_direction_code,
      my_value_display,
      region_avg_display,
      national_avg_display,
      aux_label,
      aux_display_text,
      accent_color_hex,
      source_table_name,
      source_column_expr
    FROM public.tq_screen_metric_card
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
    ORDER BY display_order, metric_code
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, screen_code, screen_ver, screen_base_year, schl_nm)

    if not rows:
        return ThemeKpiCardsResponse(title="입시/충원 핵심 지표", items=[])

    items: list[ThemeKpiCardItem] = []
    for r in rows:
        items.append(
            ThemeKpiCardItem(
                metricCode=r["metric_code"],
                title=r["metric_name"],
                year=int(r["metric_year"]),
                myValue=r["my_value_display"],
                regionAvg=r["region_avg_display"],
                nationalAvg=r["national_avg_display"],
                comparisonDirectionCode=r["comparison_direction_code"],
                aux=ThemeKpiCardAux(label=r["aux_label"], text=r["aux_display_text"]),
                accentColorHex=r["accent_color_hex"],
                source=ThemeKpiCardSource(
                    tableName=r["source_table_name"],
                    columnExpr=r["source_column_expr"],
                ),
            )
        )

    return ThemeKpiCardsResponse(title="입시/충원 핵심 지표", items=items)


@router.get("/api/theme/detail-grid", response_model=ThemeDetailGridResponse)
async def get_theme_detail_grid(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    schl_nm: str = Query(..., min_length=1),
    screen_code: str = "admission_fill",
    screen_ver: str = "v0.1",
):
    sql = """
    SELECT
      metric_code,
      metric_name,
      metric_year,
      display_order,
      comparison_direction_code,
      my_value_display,
      region_avg_display,
      national_avg_display,
      aux_label,
      aux_display_text,
      accent_color_hex,
      source_table_name,
      source_column_expr
    FROM public.tq_screen_detail_grid
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
    ORDER BY display_order, metric_code
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, screen_code, screen_ver, screen_base_year, schl_nm)

    if not rows:
        return ThemeDetailGridResponse(title="핵심 지표 상세 그리드", items=[])

    items: list[ThemeDetailGridItem] = []
    for r in rows:
        items.append(
            ThemeDetailGridItem(
                metricCode=r["metric_code"],
                metricName=r["metric_name"],
                metricYear=int(r["metric_year"]),
                displayOrder=int(r["display_order"]),
                myValueDisplay=r["my_value_display"],
                regionAvgDisplay=r["region_avg_display"],
                nationalAvgDisplay=r["national_avg_display"],
                comparisonDirectionCode=r["comparison_direction_code"],
                aux=ThemeDetailGridAux(label=r["aux_label"], text=r["aux_display_text"]),
                accentColorHex=r["accent_color_hex"],
                source=ThemeDetailGridSource(
                    tableName=r["source_table_name"],
                    columnExpr=r["source_column_expr"],
                ),
            )
        )

    return ThemeDetailGridResponse(title="핵심 지표 상세 그리드", items=items)


@router.get("/api/theme/chart-blocks", response_model=ThemeChartBlocksResponse)
async def get_theme_chart_blocks(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    schl_nm: str = Query(..., min_length=1),
    screen_code: str = "admission_fill",
    screen_ver: str = "v0.1",
):
    blocks_sql = """
    SELECT
      block_code,
      block_title,
      block_subtitle,
      block_style,
      display_order
    FROM public.tq_screen_chart_block
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
    ORDER BY display_order, block_code
    """

    items_sql = """
    SELECT
      block_code,
      item_order,
      item_label,
      item_value_num,
      item_display_text,
      item_note_text,
      item_color_hex,
      bar_ratio_num,
      bar_ratio_display_text
    FROM public.tq_screen_chart_item
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
    ORDER BY block_code, item_order
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        block_rows = await conn.fetch(blocks_sql, screen_code, screen_ver, screen_base_year, schl_nm)
        item_rows = await conn.fetch(items_sql, screen_code, screen_ver, screen_base_year, schl_nm)

    if not block_rows:
        return ThemeChartBlocksResponse(blocks=[])

    items_by_block: dict[str, list[ThemeChartItem]] = {}
    for r in item_rows:
        block_code = r["block_code"]
        brt = r.get("bar_ratio_display_text")
        brt_s = str(brt).strip() if brt is not None else ""
        brn = r.get("bar_ratio_num")
        items_by_block.setdefault(block_code, []).append(
            ThemeChartItem(
                order=int(r["item_order"]),
                label=r["item_label"],
                valueNum=float(r["item_value_num"]) if r["item_value_num"] is not None else None,
                displayText=r["item_display_text"],
                noteText=r["item_note_text"],
                colorHex=r["item_color_hex"],
                bar_ratio_num=float(brn) if brn is not None else None,
                bar_ratio_display_text=brt_s if brt_s else None,
            )
        )

    blocks: list[ThemeChartBlock] = []
    for b in block_rows:
        block_code = b["block_code"]
        blocks.append(
            ThemeChartBlock(
                blockCode=block_code,
                title=b["block_title"],
                subtitle=b["block_subtitle"],
                style=b["block_style"],
                displayOrder=int(b["display_order"]),
                items=items_by_block.get(block_code, []),
            )
        )

    return ThemeChartBlocksResponse(blocks=blocks)


@router.get("/api/theme/text-blocks", response_model=ThemeTextBlocksResponse)
async def get_theme_text_blocks(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    schl_nm: str = Query(..., min_length=1),
    screen_code: str = "admission_fill",
    screen_ver: str = "v0.1",
):
    blocks_sql = """
    SELECT
      block_code,
      block_area_name,
      block_title,
      display_order
    FROM public.tq_screen_text_block
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
    ORDER BY display_order, block_code
    """

    lines_sql = """
    SELECT
      block_code,
      line_no,
      line_role,
      line_text
    FROM public.tq_screen_text_line
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
    ORDER BY block_code, line_no
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        block_rows = await conn.fetch(blocks_sql, screen_code, screen_ver, screen_base_year, schl_nm)
        line_rows = await conn.fetch(lines_sql, screen_code, screen_ver, screen_base_year, schl_nm)

    if not block_rows:
        return ThemeTextBlocksResponse(blocks=[])

    lines_by_block: dict[str, list[ThemeTextLine]] = {}
    for r in line_rows:
        block_code = r["block_code"]
        lines_by_block.setdefault(block_code, []).append(
            ThemeTextLine(no=int(r["line_no"]), role=r["line_role"], text=r["line_text"])
        )

    blocks: list[ThemeTextBlock] = []
    for b in block_rows:
        block_code = b["block_code"]
        blocks.append(
            ThemeTextBlock(
                blockCode=block_code,
                areaName=b["block_area_name"],
                title=b["block_title"],
                displayOrder=int(b["display_order"]),
                lines=lines_by_block.get(block_code, []),
            )
        )

    return ThemeTextBlocksResponse(blocks=blocks)


@router.get("/api/theme/source-refs", response_model=ThemeSourceRefsResponse)
async def get_theme_source_refs(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    schl_nm: str = Query(..., min_length=1),
    screen_code: str = "admission_fill",
    screen_ver: str = "v0.1",
):
    sql = """
    SELECT
      ref_order,
      source_table_name,
      source_column_expr,
      source_note
    FROM public.tq_screen_source_ref
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
    ORDER BY ref_order
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, screen_code, screen_ver, screen_base_year, schl_nm)

    if not rows:
        return ThemeSourceRefsResponse(refs=[])

    refs: list[ThemeSourceRefItem] = []
    for r in rows:
        refs.append(
            ThemeSourceRefItem(
                order=int(r["ref_order"]),
                tableName=r["source_table_name"],
                columnExpr=r["source_column_expr"],
                note=r["source_note"],
            )
        )

    return ThemeSourceRefsResponse(refs=refs)

