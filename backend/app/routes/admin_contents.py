from __future__ import annotations

from typing import Any, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.dependencies import require_sys_adm
from app.services.contents import (
    ContentsType,
    count_contents,
    create_contents,
    execute_sql_preview,
    get_contents_detail,
    get_contents_master,
    list_contents,
    patch_contents,
    soft_delete_contents,
)

router = APIRouter()


class ContentsCreateBody(BaseModel):
    contentName: str = Field(..., min_length=1)
    creator: Optional[str] = None
    memo: Optional[str] = None
    contentType: Literal["chart", "grid", "card", "sql", "차트", "그리드", "카드", "데이터조회"]
    data: dict[str, Any] = Field(default_factory=dict)


class ContentsPatchBody(BaseModel):
    contentName: Optional[str] = None
    creator: Optional[str] = None
    memo: Optional[str] = None
    contentType: Optional[Literal["chart", "grid", "card", "sql", "차트", "그리드", "카드", "데이터조회"]] = None
    data: Optional[dict[str, Any]] = None


def _to_front_row(master: Any, detail: dict[str, Any]) -> dict[str, Any]:
    # cnts_id bigint → 프론트가 기대하는 contentId(string) 형태로 제공
    content_id = f"CNT-{int(master.cnts_id):03d}" if int(master.cnts_id) < 1000 else f"CNT-{int(master.cnts_id)}"
    created_at = None
    if master.reg_dt is not None:
        try:
            created_at = master.reg_dt.isoformat(timespec="minutes")
        except Exception:
            created_at = str(master.reg_dt)

    data: dict[str, Any] = {}
    tp: ContentsType = master.cnts_tp
    if tp == "chart":
        data = {
            "chartTitle": master.chart_title,
            "chartTitlePosition": master.chart_title_pos,
            "chartType": detail.get("chartType"),
            "xAxis": detail.get("xAxis") or "",
            "yAxis": detail.get("yAxis") or "",
            "legendPosition": master.chart_legend_pos,
        }
    elif tp == "grid":
        data = {
            "sectionTitle": master.grid_title,
            "columns": detail.get("columns") or [],
        }
    elif tp == "card":
        data = {
            "cardTitle": master.card_title,
            "titlePosition": master.card_title_pos,
            "items": detail.get("items") or [],
        }
    elif tp == "sql":
        data = {"sql": master.user_sql or ""}

    return {
        "contentId": content_id,
        "contentName": master.cnts_nm,
        "creator": master.owner_nm or "",
        "createdAt": created_at or "",
        "isDeleted": "Y" if str(master.del_fg or "").upper() == "Y" else "N",
        "generatedAt": "",
        "memo": master.etc_memo or "",
        "contentType": tp,
        "data": data,
        "cnts_id": int(master.cnts_id),  # 내부 식별자도 같이 제공(향후 프론트 교체 대비)
    }


@router.post("/admin/contents", status_code=status.HTTP_201_CREATED)
async def post_admin_contents(body: ContentsCreateBody, _: dict = Depends(require_sys_adm)):
    try:
        cnts_id = await create_contents(body.model_dump())
    except ValueError as e:
        code = str(e)
        if code in ("missing_cnts_nm",):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="contentName은 필수입니다.") from e
        if code in ("invalid_cnts_tp",):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="contentType이 올바르지 않습니다.") from e
        if code in ("invalid_data", "invalid_grid_columns", "invalid_card_items"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="data 형식이 올바르지 않습니다.") from e
        raise
    return {"cnts_id": cnts_id}


@router.get("/admin/contents")
async def get_admin_contents(
    include_deleted: bool = Query(default=False),
    page: Optional[int] = Query(default=None, ge=1),
    limit: Optional[int] = Query(default=None, ge=1, le=1000),
    cnts_tp: Optional[str] = Query(default=None),
    _: dict = Depends(require_sys_adm),
):
    rows = await list_contents(include_deleted=include_deleted, page=page, limit=limit, cnts_tp=cnts_tp)
    total = await count_contents(include_deleted=include_deleted, cnts_tp=cnts_tp)
    out: list[dict[str, Any]] = []
    for r in rows:
        detail = await get_contents_detail(r.cnts_id, r.cnts_tp)
        out.append(_to_front_row(r, detail))
    return {"contents": out, "total": total, "page": page, "limit": limit}


@router.get("/admin/contents/{cnts_id}")
async def get_admin_contents_detail(cnts_id: int, _: dict = Depends(require_sys_adm)):
    try:
        master = await get_contents_master(cnts_id)
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="컨텐츠를 찾을 수 없습니다.")
    detail = await get_contents_detail(master.cnts_id, master.cnts_tp)
    return {"content": _to_front_row(master, detail)}


@router.patch("/admin/contents/{cnts_id}")
async def patch_admin_contents(cnts_id: int, body: ContentsPatchBody, _: dict = Depends(require_sys_adm)):
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    try:
        await patch_contents(cnts_id, data)
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="컨텐츠를 찾을 수 없습니다.")
    except ValueError as e:
        code = str(e)
        if code in ("missing_cnts_nm",):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="contentName은 필수입니다.") from e
        if code in ("invalid_cnts_tp",):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="contentType이 올바르지 않습니다.") from e
        if code in ("invalid_data", "invalid_grid_columns", "invalid_card_items"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="data 형식이 올바르지 않습니다.") from e
        raise
    return {"ok": True}


@router.delete("/admin/contents/{cnts_id}")
async def delete_admin_contents(cnts_id: int, _: dict = Depends(require_sys_adm)):
    try:
        await soft_delete_contents(cnts_id)
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="컨텐츠를 찾을 수 없습니다.")
    return {"ok": True}


@router.get("/admin/contents/{cnts_id}/preview")
async def get_admin_contents_preview(cnts_id: int, _: dict = Depends(require_sys_adm)):
    try:
        result = await execute_sql_preview(cnts_id)
        return result
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="컨텐츠를 찾을 수 없습니다.")
    except ValueError as e:
        code = str(e)
        if code == "not_sql_content":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SQL 콘텐츠가 아닙니다.") from e
        if code == "empty_sql":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SQL 문장이 비어있습니다.") from e
        if code.startswith("unsafe_sql"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="안전하지 않은 SQL 문장입니다.") from e
        if code.startswith("sql_execution_error:"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SQL 실행 중 오류가 발생했습니다.") from e
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="요청이 올바르지 않습니다.") from e

