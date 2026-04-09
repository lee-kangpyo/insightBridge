from fastapi import APIRouter, Query
from typing import Optional

from ..database import get_pool
from ..schemas import (
    OverviewMatrixResponse,
    OverviewMatrixPoint,
    OverviewKpiComparison,
    OverviewKpisResponse,
    OverviewLargeKpiItem,
    OverviewSmallKpiItem,
    OverviewUnit,
    OverviewRiskTableResponse,
    RiskTableCell,
    RiskTableIndicator,
    RiskTableJudgment,
    RiskTableLegendItem,
    RiskTableRow,
)

router = APIRouter()


def _clamp(v: float, lo: float, hi: float) -> float:
    if v < lo:
        return lo
    if v > hi:
        return hi
    return v


def _status_from_diff(diff: float, comparison_direction_code: str, eps: float = 1e-9) -> str:
    if abs(diff) <= eps:
        return "neutral"
    higher_better = (comparison_direction_code or "").upper() != "LOWER_BETTER"
    is_good = diff > 0 if higher_better else diff < 0
    return "positive" if is_good else "negative"


def _arrow_value(diff: float, unit_suffix: str) -> str:
    if abs(diff) <= 1e-9:
        return f"- 0.0{unit_suffix}"
    arrow = "▲" if diff > 0 else "▼"
    return f"{arrow} {abs(diff):.1f}{unit_suffix}"


def _accent_from_status(status: str) -> str:
    if status == "negative":
        return "error"
    if status == "positive":
        return "primary"
    return "secondary"


@router.get("/api/overview/matrix-points", response_model=OverviewMatrixResponse)
async def get_overview_matrix_points(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    screen_code: str = "overview",
    screen_ver: str = "v0.1",
    metric_year: Optional[int] = Query(None, ge=1900, le=3000),
    schl_nm: Optional[str] = None,
    metric_code: Optional[str] = None,
):
    where = ["screen_code=$1", "screen_ver=$2", "screen_base_year=$3"]
    args: list[object] = [screen_code, screen_ver, screen_base_year]
    i = 4

    if metric_year is not None:
        where.append(f"metric_year=${i}")
        args.append(metric_year)
        i += 1
    if schl_nm:
        where.append(f"schl_nm=${i}")
        args.append(schl_nm)
        i += 1
    if metric_code:
        where.append(f"metric_code=${i}")
        args.append(metric_code)
        i += 1

    sql = f"""
    SELECT
      screen_code,
      screen_ver,
      schl_nm,
      screen_base_year,
      metric_code,
      metric_name,
      metric_year,
      display_order,
      x_axis_label,
      x_value_num,
      x_display_text,
      x_unit_code,
      y_axis_label,
      y_value_num,
      y_display_text,
      y_unit_code,
      quadrant_code,
      quadrant_name,
      point_color_hex
    FROM public.tq_overview_matrix_point
    WHERE {" AND ".join(where)}
    ORDER BY display_order, metric_code
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, *args)

    if not rows:
        return OverviewMatrixResponse(
            title="강점/약점 매트릭스",
            xAxisLabel="",
            yAxisLabel="",
            points=[],
        )

    xs = [float(r["x_value_num"]) for r in rows]
    ys = [float(r["y_value_num"]) for r in rows]
    max_abs_x = max((abs(v) for v in xs), default=0.0) or 1.0
    max_abs_y = max((abs(v) for v in ys), default=0.0) or 1.0

    x_axis_label = rows[0]["x_axis_label"]
    y_axis_label = rows[0]["y_axis_label"]

    points: list[OverviewMatrixPoint] = []
    for r in rows:
        x_raw = float(r["x_value_num"])
        y_raw = float(r["y_value_num"])

        x_pct = _clamp(50.0 + (x_raw / max_abs_x) * 50.0, 0.0, 100.0)
        y_pct = _clamp(50.0 - (y_raw / max_abs_y) * 50.0, 0.0, 100.0)

        pid = f'{r["schl_nm"]}:{r["metric_code"]}:{r["screen_base_year"]}'

        points.append(
            OverviewMatrixPoint(
                id=pid,
                name=r["metric_name"],
                x=x_pct,
                y=y_pct,
                colorHex=r["point_color_hex"],
                quadrantCode=r["quadrant_code"],
                quadrantName=r["quadrant_name"],
                rawX=x_raw,
                rawY=y_raw,
                xDisplayText=r["x_display_text"],
                yDisplayText=r["y_display_text"],
                unit=OverviewUnit(
                    xUnitCode=r["x_unit_code"],
                    yUnitCode=r["y_unit_code"],
                ),
            )
        )

    return OverviewMatrixResponse(
        title="강점/약점 매트릭스",
        xAxisLabel=x_axis_label,
        yAxisLabel=y_axis_label,
        points=points,
    )


@router.get("/api/overview/risk-table", response_model=OverviewRiskTableResponse)
async def get_overview_risk_table(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    screen_code: str = "overview",
    screen_ver: str = "v0.1",
    schl_nm: str = Query(..., min_length=1),
):
    sql = """
    SELECT
      metric_code,
      metric_name,
      metric_year,
      display_order,
      comparison_direction_code,
      region_compare_value_num,
      region_compare_display,
      region_unit_code,
      region_status_code,
      region_status_name,
      region_color_hex,
      national_compare_value_num,
      national_compare_display,
      national_unit_code,
      national_status_code,
      national_status_name,
      national_color_hex,
      judgment_display_text,
      judgment_status_code,
      judgment_status_name,
      judgment_color_hex
    FROM public.tq_overview_risk_analysis
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
        return OverviewRiskTableResponse(
            title="종합 리스크/우위 분석",
            items=[],
            legend=[],
        )

    items: list[RiskTableRow] = []
    legend_map: dict[str, RiskTableLegendItem] = {}

    for r in rows:
        indicator = RiskTableIndicator(
            code=r["metric_code"],
            name=r["metric_name"],
            year=int(r["metric_year"]),
            displayOrder=int(r["display_order"]),
        )

        regional = RiskTableCell(
            valueNum=float(r["region_compare_value_num"]),
            displayText=r["region_compare_display"],
            unitCode=r["region_unit_code"],
            statusCode=r["region_status_code"],
            statusName=r["region_status_name"],
            colorHex=r["region_color_hex"],
            comparisonDirectionCode=r["comparison_direction_code"],
        )

        national = RiskTableCell(
            valueNum=float(r["national_compare_value_num"]),
            displayText=r["national_compare_display"],
            unitCode=r["national_unit_code"],
            statusCode=r["national_status_code"],
            statusName=r["national_status_name"],
            colorHex=r["national_color_hex"],
            comparisonDirectionCode=r["comparison_direction_code"],
        )

        overall = RiskTableJudgment(
            displayText=r["judgment_display_text"],
            statusCode=r["judgment_status_code"],
            statusName=r["judgment_status_name"],
            colorHex=r["judgment_color_hex"],
        )

        items.append(
            RiskTableRow(
                indicator=indicator,
                regional=regional,
                national=national,
                overall=overall,
            )
        )

        for status_code, status_name, color_hex in (
            (regional.statusCode, regional.statusName, regional.colorHex),
            (national.statusCode, national.statusName, national.colorHex),
            (overall.statusCode, overall.statusName, overall.colorHex),
        ):
            if status_code not in legend_map:
                legend_map[status_code] = RiskTableLegendItem(
                    statusCode=status_code,
                    statusName=status_name,
                    colorHex=color_hex,
                )

    legend = sorted(legend_map.values(), key=lambda x: x.statusCode)

    return OverviewRiskTableResponse(
        title="종합 리스크/우위 분석",
        items=items,
        legend=legend,
    )


@router.get("/api/overview/kpis", response_model=OverviewKpisResponse)
async def get_overview_kpis(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    screen_code: str = "overview",
    screen_ver: str = "v0.1",
    schl_nm: str = Query(..., min_length=1),
):
    sql = """
    SELECT
      metric_code,
      metric_name,
      metric_year,
      display_order,
      metric_unit_name,
      my_value_num,
      my_value_display,
      region_avg_num,
      national_avg_num,
      aux_label,
      aux_display_text,
      comparison_direction_code
    FROM public.tq_overview_metric_card
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
        return OverviewKpisResponse(large=[], small=[])

    large: list[OverviewLargeKpiItem] = []
    small: list[OverviewSmallKpiItem] = []

    for r in rows:
        unit_suffix = (r["metric_unit_name"] or "").strip()

        my_num = float(r["my_value_num"])
        region_num = float(r["region_avg_num"])
        national_num = float(r["national_avg_num"])

        region_diff = my_num - region_num
        national_diff = my_num - national_num

        region_status = _status_from_diff(region_diff, r["comparison_direction_code"])
        national_status = _status_from_diff(national_diff, r["comparison_direction_code"])

        kpi_id = str(r["metric_code"])

        # 기본은 "Large KPI 카드"로 내려준다. (Small KPI는 별도 테이블/정의가 생기면 확장)
        large.append(
            OverviewLargeKpiItem(
                id=kpi_id,
                label=r["metric_name"],
                value=r["my_value_display"],
                year=int(r["metric_year"]),
                accentColor=_accent_from_status(region_status),
                regionalComparison=OverviewKpiComparison(
                    value=_arrow_value(region_diff, unit_suffix),
                    status=region_status,
                ),
                nationalComparison=OverviewKpiComparison(
                    value=_arrow_value(national_diff, unit_suffix),
                    status=national_status,
                ),
            )
        )

        # aux_label/aux_display_text를 "small KPI"로도 활용하고 싶으면 여기에서 매핑 가능:
        # small.append(...)

    return OverviewKpisResponse(large=large, small=small)

