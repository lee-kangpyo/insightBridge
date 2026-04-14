from fastapi import APIRouter, Query

from ..database import get_pool
from ..schemas import (
    AdmissionEnrollmentRateItem,
    AdmissionEnrollmentRatesResponse,
    AdmissionInsightItem,
    AdmissionOpportunityBalanceItem,
    AdmissionOpportunityBalanceResponse,
)

router = APIRouter()


def _try_parse_float(v: object):
    # NOTE: `tq_screen_chart_item.item_note_text`는 문자열로 들어오는 케이스가 있어
    #       공통 파서로 숫자 변환을 통일한다(실패 시 None).
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


@router.get(
    "/api/admission/enrollment-rates", response_model=AdmissionEnrollmentRatesResponse
)
async def get_admission_enrollment_rates(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    schl_nm: str = Query(..., min_length=1),
    screen_code: str = "admission",
    screen_ver: str = "v0.1",
    block_code: str = "CHART_LEFT",
):
    # 전형별 최종등록률(막대) 전용 API.
    #
    # - **재사용 포인트**: 동일한 구조의 "전형별 % 막대"는 block_code만 바꿔서 다른 화면에서도 재사용 가능
    # - **원천 테이블**: tq_screen_chart_block(제목/부제), tq_screen_chart_item(막대 항목)
    # - **필수 필터**: screen_code, screen_ver, screen_base_year, schl_nm, block_code
    # - **아이템 매핑 규칙**
    #   - type = item_label
    #   - bar_ratio_num = 비율 표시(%), bar_ratio_display_text = 막대 렌더용(프론트 파싱)
    sql_block = """
    SELECT
      block_title,
      block_subtitle
    FROM public.tq_screen_chart_block
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
      AND block_code=$5
    """

    sql_items = """
    SELECT
      item_order,
      item_label,
      bar_ratio_num,
      bar_ratio_display_text
    FROM public.tq_screen_chart_item
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
      AND block_code=$5
    ORDER BY item_order
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        block_row = await conn.fetchrow(
            sql_block, screen_code, screen_ver, screen_base_year, schl_nm, block_code
        )
        rows = await conn.fetch(
            sql_items, screen_code, screen_ver, screen_base_year, schl_nm, block_code
        )

    title = block_row["block_title"] if block_row else "전형별 최종등록률"
    subtitle = block_row["block_subtitle"] if block_row else None

    if not rows:
        return AdmissionEnrollmentRatesResponse(
            title=title, subtitle=subtitle, items=[]
        )

    def _brt_only(row) -> str | None:
        v = row.get("bar_ratio_display_text")
        if v is None:
            return None
        s = str(v).strip()
        return s if s else None

    items: list[AdmissionEnrollmentRateItem] = []
    for r in rows:
        label = r["item_label"]
        if not label:
            continue

        brn = _try_parse_float(r.get("bar_ratio_num"))
        items.append(
            AdmissionEnrollmentRateItem(
                type=label,
                bar_ratio_num=float(brn) if brn is not None else None,
                bar_ratio_display_text=_brt_only(dict(r)),
            )
        )

    return AdmissionEnrollmentRatesResponse(title=title, subtitle=subtitle, items=items)


@router.get(
    "/api/admission/opportunity-balance",
    response_model=AdmissionOpportunityBalanceResponse,
)
async def get_admission_opportunity_balance(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    schl_nm: str = Query(..., min_length=1),
    screen_code: str = "admission",
    screen_ver: str = "v0.1",
    block_code: str = "CHART_RIGHT",
):
    # 기회균형 선발 구성(구성비) 전용 API.
    #
    # - **재사용 포인트**: "카테고리별 구성비(%)" 형태는 block_code만 바꿔서 다른 화면에도 재사용 가능
    # - **원천 테이블**: tq_screen_chart_block(제목/부제), tq_screen_chart_item(항목)
    # - **아이템 매핑 규칙**
    #   - category = item_label
    #   - bar_ratio_num / bar_ratio_display_text = DB 그대로 (표시 vs 막대는 프론트)
    sql_block = """
    SELECT
      block_title,
      block_subtitle
    FROM public.tq_screen_chart_block
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
      AND block_code=$5
    """

    sql_items = """
    SELECT
      item_order,
      item_label,
      bar_ratio_num,
      bar_ratio_display_text
    FROM public.tq_screen_chart_item
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
      AND block_code=$5
    ORDER BY item_order
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        block_row = await conn.fetchrow(
            sql_block, screen_code, screen_ver, screen_base_year, schl_nm, block_code
        )
        rows = await conn.fetch(
            sql_items, screen_code, screen_ver, screen_base_year, schl_nm, block_code
        )

    title = block_row["block_title"] if block_row else "기회균형 선발 구성"
    subtitle = block_row["block_subtitle"] if block_row else None

    if not rows:
        return AdmissionOpportunityBalanceResponse(
            title=title, subtitle=subtitle, items=[]
        )

    def _brt_only(row: dict) -> str | None:
        v = row.get("bar_ratio_display_text")
        if v is None:
            return None
        s = str(v).strip()
        return s if s else None

    items: list[AdmissionOpportunityBalanceItem] = []
    for r in rows:
        d = dict(r)
        brn = _try_parse_float(d.get("bar_ratio_num"))
        items.append(
            AdmissionOpportunityBalanceItem(
                category=d["item_label"],
                bar_ratio_num=float(brn) if brn is not None else None,
                bar_ratio_display_text=_brt_only(d),
            )
        )

    return AdmissionOpportunityBalanceResponse(
        title=title, subtitle=subtitle, items=items
    )


@router.get("/api/admission/insights", response_model=list[AdmissionInsightItem])
async def get_admission_insights(
    screen_base_year: int = Query(..., ge=1900, le=3000),
    schl_nm: str = Query(..., min_length=1),
    screen_code: str = "admission",
    screen_ver: str = "v0.1",
    line_role: str = "INSIGHT",
):
    # 입시/충원 화면 "샘플 인사이트" 문구 목록.
    # 원천 테이블: tq_screen_text_line
    sql = """
    SELECT
      line_no,
      line_text
    FROM public.tq_screen_text_line
    WHERE screen_code=$1
      AND screen_ver=$2
      AND screen_base_year=$3
      AND schl_nm=$4
      AND line_role=$5
    ORDER BY line_no
    """

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            sql, screen_code, screen_ver, screen_base_year, schl_nm, line_role
        )

    if not rows:
        return []

    items: list[AdmissionInsightItem] = []
    for r in rows:
        text = (r["line_text"] or "").strip()
        if not text:
            continue
        items.append(AdmissionInsightItem(text=text))

    return items
