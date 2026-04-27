from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal, Optional, Sequence

import asyncpg
import pandas as pd
from app.database import fetch_df, get_pool

ContentsType = Literal["chart", "grid", "card", "sql"]


def _norm_contents_type(raw: str) -> ContentsType:
    v = (raw or "").strip().lower()
    if v in ("chart", "차트"):
        return "chart"
    if v in ("grid", "그리드", "table", "테이블"):
        return "grid"
    if v in ("card", "카드"):
        return "card"
    if v in ("sql", "데이터조회", "data", "data_query"):
        return "sql"
    raise ValueError("invalid_cnts_tp")


def _as_str_list(v: Any) -> list[str]:
    if v is None:
        return []
    if isinstance(v, str):
        s = v.strip()
        return [s] if s else []
    if isinstance(v, (list, tuple)):
        out: list[str] = []
        for item in v:
            if item is None:
                continue
            s = str(item).strip()
            if s:
                out.append(s)
        return out
    s = str(v).strip()
    return [s] if s else []


def _grid_sort_to_db(alignment: Any) -> Optional[str]:
    if alignment is None:
        return None
    v = str(alignment).strip().lower()
    if not v:
        return None
    if v in ("left", "l", "좌", "좌측"):
        return "L"
    if v in ("center", "c", "중", "중앙"):
        return "C"
    if v in ("right", "r", "우", "우측"):
        return "R"
    # 기존 DB가 어떤 값이든 수용 가능한 text 이므로, 알 수 없는 값은 원본 보존
    return str(alignment).strip()


def _money_fg_to_db(is_amount: Any) -> str:
    return "Y" if bool(is_amount) else "N"


@dataclass(frozen=True)
class ContentsRow:
    cnts_id: int
    cnts_tp: ContentsType
    cnts_nm: str
    owner_nm: Optional[str]
    reg_dt: Optional[Any]
    del_fg: Optional[str]
    etc_memo: Optional[str]
    chart_title: Optional[str]
    chart_title_pos: Optional[str]
    chart_legend_pos: Optional[str]
    grid_title: Optional[str]
    grid_title_pos: Optional[str]
    grid_col_cnt: Optional[Any]
    card_title: Optional[str]
    card_title_pos: Optional[str]
    card_item_cnt: Optional[Any]
    user_sql: Optional[str]


async def create_contents(payload: dict[str, Any]) -> int:
    """
    payload: frontend-like dict
      - contentName, creator, memo, contentType, data{...}
    """
    content_type = _norm_contents_type(str(payload.get("contentType", "")))
    cnts_nm = str(payload.get("contentName", "")).strip()
    if not cnts_nm:
        raise ValueError("missing_cnts_nm")
    owner_nm = payload.get("creator")
    owner_nm = str(owner_nm).strip() if owner_nm is not None and str(owner_nm).strip() else None
    etc_memo = payload.get("memo")
    etc_memo = str(etc_memo).strip() if etc_memo is not None and str(etc_memo).strip() else None

    data = payload.get("data") or {}
    if not isinstance(data, dict):
        raise ValueError("invalid_data")

    master_updates: dict[str, Any] = {}
    detail_plan: tuple[str, Any] | None = None

    if content_type == "chart":
        master_updates["chart_title"] = (
            str(data.get("chartTitle")).strip() if data.get("chartTitle") is not None else None
        )
        master_updates["chart_title_pos"] = (
            str(data.get("chartTitlePosition")).strip()
            if data.get("chartTitlePosition") is not None
            else None
        )
        master_updates["chart_legend_pos"] = (
            str(data.get("legendPosition")).strip() if data.get("legendPosition") is not None else None
        )

        x_cols = _as_str_list(data.get("xAxis"))[:6]
        y_cols = _as_str_list(data.get("yAxis"))[:6]
        while len(x_cols) < 6:
            x_cols.append(None)  # type: ignore[arg-type]
        while len(y_cols) < 6:
            y_cols.append(None)  # type: ignore[arg-type]
        chart_tp = str(data.get("chartType")).strip() if data.get("chartType") is not None else None

        detail_plan = (
            "chart",
            {
                "chart_tp": chart_tp,
                "x_cols": x_cols,
                "y_cols": y_cols,
            },
        )

    elif content_type == "grid":
        master_updates["grid_title"] = (
            str(data.get("sectionTitle")).strip() if data.get("sectionTitle") is not None else None
        )
        master_updates["grid_title_pos"] = None
        cols = data.get("columns") or []
        if not isinstance(cols, list):
            raise ValueError("invalid_grid_columns")
        master_updates["grid_col_cnt"] = len(cols)
        detail_plan = ("grid", cols)

    elif content_type == "card":
        master_updates["card_title"] = (
            str(data.get("cardTitle")).strip() if data.get("cardTitle") is not None else None
        )
        master_updates["card_title_pos"] = (
            str(data.get("titlePosition")).strip() if data.get("titlePosition") is not None else None
        )
        items = data.get("items") or []
        if not isinstance(items, list):
            raise ValueError("invalid_card_items")
        master_updates["card_item_cnt"] = len(items)
        detail_plan = ("card", items)

    elif content_type == "sql":
        sql = data.get("sql")
        sql = str(sql).strip() if sql is not None and str(sql).strip() else None
        master_updates["user_sql"] = sql

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            row = await conn.fetchrow(
                """
                INSERT INTO ts_cnts_info (
                    cnts_tp, cnts_nm, owner_nm, reg_dt, del_fg, etc_memo,
                    chart_title, chart_title_pos, chart_legend_pos,
                    grid_title, grid_title_pos, grid_col_cnt,
                    card_title, card_title_pos, card_item_cnt,
                    user_sql
                )
                VALUES (
                    $1, $2, $3, NOW(), 'N', $4,
                    $5, $6, $7,
                    $8, $9, $10,
                    $11, $12, $13,
                    $14
                )
                RETURNING cnts_id
                """,
                content_type,
                cnts_nm,
                owner_nm,
                etc_memo,
                master_updates.get("chart_title"),
                master_updates.get("chart_title_pos"),
                master_updates.get("chart_legend_pos"),
                master_updates.get("grid_title"),
                master_updates.get("grid_title_pos"),
                master_updates.get("grid_col_cnt"),
                master_updates.get("card_title"),
                master_updates.get("card_title_pos"),
                master_updates.get("card_item_cnt"),
                master_updates.get("user_sql"),
            )
            cnts_id = int(row["cnts_id"])

            if detail_plan is None:
                return cnts_id

            tp, detail = detail_plan
            if tp == "chart":
                x_cols: Sequence[Optional[str]] = detail["x_cols"]
                y_cols: Sequence[Optional[str]] = detail["y_cols"]
                await conn.execute(
                    """
                    INSERT INTO ts_cnts_info_chart (
                        cnts_id, chart_tp,
                        x_col1, x_col2, x_col3, x_col4, x_col5, x_col6,
                        y_col1, y_col2, y_col3, y_col4, y_col5, y_col6
                    )
                    VALUES (
                        $1, $2,
                        $3, $4, $5, $6, $7, $8,
                        $9, $10, $11, $12, $13, $14
                    )
                    """,
                    cnts_id,
                    detail.get("chart_tp"),
                    x_cols[0],
                    x_cols[1],
                    x_cols[2],
                    x_cols[3],
                    x_cols[4],
                    x_cols[5],
                    y_cols[0],
                    y_cols[1],
                    y_cols[2],
                    y_cols[3],
                    y_cols[4],
                    y_cols[5],
                )

            elif tp == "grid":
                cols = detail
                for col in cols:
                    if not isinstance(col, dict):
                        continue
                    data_key = col.get("dataKey")
                    display_name = col.get("displayName")
                    alignment = col.get("alignment")
                    is_amount = col.get("isAmount")
                    await conn.execute(
                        """
                        INSERT INTO ts_cnts_info_grid (cnts_id, col_nm, col_header, col_sort, money_fg)
                        VALUES ($1, $2, $3, $4, $5)
                        """,
                        cnts_id,
                        str(data_key).strip() if data_key is not None else None,
                        str(display_name).strip() if display_name is not None else None,
                        _grid_sort_to_db(alignment),
                        _money_fg_to_db(is_amount),
                    )

            elif tp == "card":
                items = detail
                for idx, item in enumerate(items):
                    if not isinstance(item, dict):
                        continue
                    label = item.get("label")
                    content = item.get("content")
                    await conn.execute(
                        """
                        INSERT INTO ts_cnts_info_card (cnts_id, header_nm, col_nm, pos)
                        VALUES ($1, $2, $3, $4)
                        """,
                        cnts_id,
                        str(label).strip() if label is not None else None,
                        str(content).strip() if content is not None else None,
                        str(idx),
                    )

            return cnts_id


async def count_contents(include_deleted: bool = False, cnts_tp: Optional[str] = None) -> int:
    where_clauses = []
    params: list[Any] = []
    if not include_deleted:
        where_clauses.append("COALESCE(del_fg, 'N') <> 'Y'")
    if cnts_tp:
        where_clauses.append("cnts_tp = $1")
        params.append(cnts_tp)
    
    where = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    df = await fetch_df(
        f"""
        SELECT COUNT(*) as total
        FROM ts_cnts_info
        {where}
        """,
        tuple(params),
    )
    if df.empty:
        return 0
    return int(df.iloc[0]["total"])


async def list_contents(include_deleted: bool = False, page: Optional[int] = None, limit: Optional[int] = None, cnts_tp: Optional[str] = None) -> list[ContentsRow]:
    where_clauses = []
    params: list[Any] = []
    if not include_deleted:
        where_clauses.append("COALESCE(del_fg, 'N') <> 'Y'")
    if cnts_tp:
        where_clauses.append(f"cnts_tp = ${len(params) + 1}")
        params.append(cnts_tp)
    
    where = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    
    pagination = ""
    if page is not None and limit is not None:
        offset = (page - 1) * limit
        pagination = f" LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}"
        params.extend([limit, offset])
    
    df = await fetch_df(
        f"""
        SELECT
            cnts_id, cnts_tp, cnts_nm, owner_nm, reg_dt, del_fg, etc_memo,
            chart_title, chart_title_pos, chart_legend_pos,
            grid_title, grid_title_pos, grid_col_cnt,
            card_title, card_title_pos, card_item_cnt,
            user_sql
        FROM ts_cnts_info
        {where}
        ORDER BY cnts_id DESC
        {pagination}
        """,
        tuple(params),
    )
    if df.empty:
        return []
    rows: list[ContentsRow] = []
    for r in df.to_dict(orient="records"):
        rows.append(
            ContentsRow(
                cnts_id=int(r["cnts_id"]),
                cnts_tp=_norm_contents_type(str(r.get("cnts_tp") or "")),
                cnts_nm=str(r.get("cnts_nm") or ""),
                owner_nm=r.get("owner_nm"),
                reg_dt=r.get("reg_dt"),
                del_fg=r.get("del_fg"),
                etc_memo=r.get("etc_memo"),
                chart_title=r.get("chart_title"),
                chart_title_pos=r.get("chart_title_pos"),
                chart_legend_pos=r.get("chart_legend_pos"),
                grid_title=r.get("grid_title"),
                grid_title_pos=r.get("grid_title_pos"),
                grid_col_cnt=r.get("grid_col_cnt"),
                card_title=r.get("card_title"),
                card_title_pos=r.get("card_title_pos"),
                card_item_cnt=r.get("card_item_cnt"),
                user_sql=r.get("user_sql"),
            )
        )
    return rows


async def get_contents_master(cnts_id: int) -> ContentsRow:
    df = await fetch_df(
        """
        SELECT
            cnts_id, cnts_tp, cnts_nm, owner_nm, reg_dt, del_fg, etc_memo,
            chart_title, chart_title_pos, chart_legend_pos,
            grid_title, grid_title_pos, grid_col_cnt,
            card_title, card_title_pos, card_item_cnt,
            user_sql
        FROM ts_cnts_info
        WHERE cnts_id = $1
        """,
        (cnts_id,),
    )
    if df.empty:
        raise LookupError("not_found")
    r = df.to_dict(orient="records")[0]
    return ContentsRow(
        cnts_id=int(r["cnts_id"]),
        cnts_tp=_norm_contents_type(str(r.get("cnts_tp") or "")),
        cnts_nm=str(r.get("cnts_nm") or ""),
        owner_nm=r.get("owner_nm"),
        reg_dt=r.get("reg_dt"),
        del_fg=r.get("del_fg"),
        etc_memo=r.get("etc_memo"),
        chart_title=r.get("chart_title"),
        chart_title_pos=r.get("chart_title_pos"),
        chart_legend_pos=r.get("chart_legend_pos"),
        grid_title=r.get("grid_title"),
        grid_title_pos=r.get("grid_title_pos"),
        grid_col_cnt=r.get("grid_col_cnt"),
        card_title=r.get("card_title"),
        card_title_pos=r.get("card_title_pos"),
        card_item_cnt=r.get("card_item_cnt"),
        user_sql=r.get("user_sql"),
    )


async def get_contents_detail(cnts_id: int, tp: ContentsType) -> dict[str, Any]:
    if tp == "chart":
        df = await fetch_df(
            """
            SELECT chart_tp, x_col1, x_col2, x_col3, x_col4, x_col5, x_col6,
                   y_col1, y_col2, y_col3, y_col4, y_col5, y_col6
            FROM ts_cnts_info_chart
            WHERE cnts_id = $1
            ORDER BY chart_id DESC
            LIMIT 1
            """,
            (cnts_id,),
        )
        if df.empty:
            return {}
        r = df.to_dict(orient="records")[0]
        x_cols = [r.get(f"x_col{i}") for i in range(1, 7) if r.get(f"x_col{i}")]
        y_cols = [r.get(f"y_col{i}") for i in range(1, 7) if r.get(f"y_col{i}")]
        return {"chartType": r.get("chart_tp"), "xAxis": x_cols[0] if len(x_cols) == 1 else x_cols, "yAxis": y_cols[0] if len(y_cols) == 1 else y_cols}

    if tp == "grid":
        df = await fetch_df(
            """
            SELECT col_nm, col_header, col_sort, money_fg
            FROM ts_cnts_info_grid
            WHERE cnts_id = $1
            ORDER BY grid_id
            """,
            (cnts_id,),
        )
        cols: list[dict[str, Any]] = []
        if not df.empty:
            for r in df.to_dict(orient="records"):
                sort = r.get("col_sort")
                alignment = None
                if sort == "L":
                    alignment = "left"
                elif sort == "C":
                    alignment = "center"
                elif sort == "R":
                    alignment = "right"
                else:
                    alignment = sort
                cols.append(
                    {
                        "dataKey": r.get("col_nm"),
                        "displayName": r.get("col_header"),
                        "alignment": alignment,
                        "isAmount": (str(r.get("money_fg") or "").upper() == "Y"),
                    }
                )
        return {"columns": cols}

    if tp == "card":
        df = await fetch_df(
            """
            SELECT header_nm, col_nm, pos
            FROM ts_cnts_info_card
            WHERE cnts_id = $1
            ORDER BY (pos::int) NULLS LAST, card_id
            """,
            (cnts_id,),
        )
        items: list[dict[str, Any]] = []
        if not df.empty:
            for r in df.to_dict(orient="records"):
                items.append(
                    {
                        "label": r.get("header_nm"),
                        "content": r.get("col_nm"),
                        "color": "#002c5a",
                    }
                )
        return {"items": items}

    if tp == "sql":
        # sql은 마스터(user_sql)에서 제공
        return {}

    return {}


async def execute_sql_preview(cnts_id: int) -> dict[str, Any]:
    """
    SQL 콘텐츠의 SQL을 실행하여 preview 결과를 반환합니다.
    최대 100개의 row만 반환하며, truncated 플래그를 포함합니다.
    """
    master = await get_contents_master(cnts_id)
    if master.cnts_tp != "sql":
        raise ValueError("not_sql_content")
    
    sql = master.user_sql
    if not sql:
        raise ValueError("empty_sql")
    
    # SQL injection 방지를 위해 read-only 쿼리만 허용하는 기본 검증
    normalized_sql = sql.strip().lower()
    # 단어 경계를 고려한 검증 (테이블명/컬럼명에 포함된 경우는 허용)
    forbidden_keywords = ['insert', 'update', 'delete', 'drop', 'create', 'alter', 'truncate']
    import re
    for keyword in forbidden_keywords:
        # 단어 경계 패턴: 공백, 줄바꿈, 탭, 괄호, 세미콜론 뒤에 오는 경우
        pattern = r'(^|[\s;(),])' + keyword + r'([\s;(),]|$)'
        if re.search(pattern, normalized_sql):
            raise ValueError(f"unsafe_sql: contains forbidden keyword '{keyword}'")
    
    try:
        # 최대 101개를 조회하여 100개 초과 여부 확인
        # 이미 LIMIT이 있는지 확인
        has_limit = re.search(r'\blimit\s+\d+\b', normalized_sql)
        if has_limit:
            limited_sql = sql
        else:
            limited_sql = f"{sql.rstrip(';')} LIMIT 101"
        
        df = await fetch_df(limited_sql, ())
        
        columns = list(df.columns)
        rows_data = df.head(100).to_dict(orient="records")
        # fetch_df에서 이미 NaN/NA를 None으로 치환했으므로 별도 처리는 생략
        
        result = {
            "columns": columns,
            "rows": rows_data,
            "truncated": len(df) > 100,
        }
        return result
    except asyncpg.exceptions.PostgresError as e:
        raise ValueError(f"sql_execution_error: {str(e)}")
    except Exception as e:
        raise ValueError(f"sql_execution_error: {str(e)}")


async def soft_delete_contents(cnts_id: int) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = str(
            await conn.execute(
                "UPDATE ts_cnts_info SET del_fg = 'Y' WHERE cnts_id = $1 AND COALESCE(del_fg,'N') <> 'Y'",
                cnts_id,
            )
        )
        if result.strip() == "UPDATE 0":
            raise LookupError("not_found")


async def patch_contents(cnts_id: int, payload: dict[str, Any]) -> None:
    """
    부분 수정:
      - contentName/creator/memo/contentType/data 지원
      - 타입이 바뀌거나 data가 있는 경우: 상세 테이블은 "전체 교체" 정책(DELETE+INSERT)
    """
    updates: dict[str, Any] = {}
    if "contentName" in payload:
        v = payload.get("contentName")
        updates["cnts_nm"] = str(v).strip() if v is not None else ""
        if not updates["cnts_nm"]:
            raise ValueError("missing_cnts_nm")
    if "creator" in payload:
        v = payload.get("creator")
        updates["owner_nm"] = str(v).strip() if v is not None and str(v).strip() else None
    if "memo" in payload:
        v = payload.get("memo")
        updates["etc_memo"] = str(v).strip() if v is not None and str(v).strip() else None

    has_type = "contentType" in payload and payload.get("contentType") is not None
    new_type: ContentsType | None = None
    if has_type:
        new_type = _norm_contents_type(str(payload.get("contentType")))
        updates["cnts_tp"] = new_type

    has_data = "data" in payload
    data = payload.get("data") if has_data else None
    if has_data and data is not None and not isinstance(data, dict):
        raise ValueError("invalid_data")

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            # 현재 타입 조회(상세 교체 판단)
            current = await conn.fetchrow(
                "SELECT cnts_tp FROM ts_cnts_info WHERE cnts_id = $1",
                cnts_id,
            )
            if current is None:
                raise LookupError("not_found")
            cur_tp = _norm_contents_type(str(current.get("cnts_tp") or ""))
            tp = new_type or cur_tp

            # 마스터 업데이트
            fields: list[str] = []
            values: list[Any] = []
            idx = 1
            for k, v in updates.items():
                fields.append(f"{k} = ${idx}")
                values.append(v)
                idx += 1
            if fields:
                values.append(cnts_id)
                q = f"UPDATE ts_cnts_info SET {', '.join(fields)} WHERE cnts_id = ${idx}"
                await conn.execute(q, *values)

            if not has_data and not has_type:
                return

            # 상세 전체 교체(타입 단위로 정리)
            await conn.execute("DELETE FROM ts_cnts_info_chart WHERE cnts_id = $1", cnts_id)
            await conn.execute("DELETE FROM ts_cnts_info_grid WHERE cnts_id = $1", cnts_id)
            await conn.execute("DELETE FROM ts_cnts_info_card WHERE cnts_id = $1", cnts_id)

            d = data or {}
            if tp == "chart":
                await conn.execute(
                    """
                    UPDATE ts_cnts_info
                    SET chart_title = $2, chart_title_pos = $3, chart_legend_pos = $4,
                        grid_title = NULL, grid_title_pos = NULL, grid_col_cnt = NULL,
                        card_title = NULL, card_title_pos = NULL, card_item_cnt = NULL,
                        user_sql = NULL
                    WHERE cnts_id = $1
                    """,
                    cnts_id,
                    str(d.get("chartTitle")).strip() if d.get("chartTitle") is not None else None,
                    str(d.get("chartTitlePosition")).strip()
                    if d.get("chartTitlePosition") is not None
                    else None,
                    str(d.get("legendPosition")).strip() if d.get("legendPosition") is not None else None,
                )
                x_cols = _as_str_list(d.get("xAxis"))[:6]
                y_cols = _as_str_list(d.get("yAxis"))[:6]
                while len(x_cols) < 6:
                    x_cols.append(None)  # type: ignore[arg-type]
                while len(y_cols) < 6:
                    y_cols.append(None)  # type: ignore[arg-type]
                chart_tp = str(d.get("chartType")).strip() if d.get("chartType") is not None else None
                await conn.execute(
                    """
                    INSERT INTO ts_cnts_info_chart (
                        cnts_id, chart_tp,
                        x_col1, x_col2, x_col3, x_col4, x_col5, x_col6,
                        y_col1, y_col2, y_col3, y_col4, y_col5, y_col6
                    )
                    VALUES (
                        $1, $2,
                        $3, $4, $5, $6, $7, $8,
                        $9, $10, $11, $12, $13, $14
                    )
                    """,
                    cnts_id,
                    chart_tp,
                    x_cols[0],
                    x_cols[1],
                    x_cols[2],
                    x_cols[3],
                    x_cols[4],
                    x_cols[5],
                    y_cols[0],
                    y_cols[1],
                    y_cols[2],
                    y_cols[3],
                    y_cols[4],
                    y_cols[5],
                )

            elif tp == "grid":
                cols = d.get("columns") or []
                if not isinstance(cols, list):
                    raise ValueError("invalid_grid_columns")
                await conn.execute(
                    """
                    UPDATE ts_cnts_info
                    SET grid_title = $2, grid_title_pos = NULL, grid_col_cnt = $3,
                        chart_title = NULL, chart_title_pos = NULL, chart_legend_pos = NULL,
                        card_title = NULL, card_title_pos = NULL, card_item_cnt = NULL,
                        user_sql = NULL
                    WHERE cnts_id = $1
                    """,
                    cnts_id,
                    str(d.get("sectionTitle")).strip() if d.get("sectionTitle") is not None else None,
                    len(cols),
                )
                for col in cols:
                    if not isinstance(col, dict):
                        continue
                    await conn.execute(
                        """
                        INSERT INTO ts_cnts_info_grid (cnts_id, col_nm, col_header, col_sort, money_fg)
                        VALUES ($1, $2, $3, $4, $5)
                        """,
                        cnts_id,
                        str(col.get("dataKey")).strip() if col.get("dataKey") is not None else None,
                        str(col.get("displayName")).strip()
                        if col.get("displayName") is not None
                        else None,
                        _grid_sort_to_db(col.get("alignment")),
                        _money_fg_to_db(col.get("isAmount")),
                    )

            elif tp == "card":
                items = d.get("items") or []
                if not isinstance(items, list):
                    raise ValueError("invalid_card_items")
                await conn.execute(
                    """
                    UPDATE ts_cnts_info
                    SET card_title = $2, card_title_pos = $3, card_item_cnt = $4,
                        chart_title = NULL, chart_title_pos = NULL, chart_legend_pos = NULL,
                        grid_title = NULL, grid_title_pos = NULL, grid_col_cnt = NULL,
                        user_sql = NULL
                    WHERE cnts_id = $1
                    """,
                    cnts_id,
                    str(d.get("cardTitle")).strip() if d.get("cardTitle") is not None else None,
                    str(d.get("titlePosition")).strip() if d.get("titlePosition") is not None else None,
                    len(items),
                )
                for idx2, item in enumerate(items):
                    if not isinstance(item, dict):
                        continue
                    await conn.execute(
                        """
                        INSERT INTO ts_cnts_info_card (cnts_id, header_nm, col_nm, pos)
                        VALUES ($1, $2, $3, $4)
                        """,
                        cnts_id,
                        str(item.get("label")).strip() if item.get("label") is not None else None,
                        str(item.get("content")).strip()
                        if item.get("content") is not None
                        else None,
                        str(idx2),
                    )

            elif tp == "sql":
                sql = d.get("sql")
                sql = str(sql).strip() if sql is not None and str(sql).strip() else None
                await conn.execute(
                    """
                    UPDATE ts_cnts_info
                    SET user_sql = $2,
                        chart_title = NULL, chart_title_pos = NULL, chart_legend_pos = NULL,
                        grid_title = NULL, grid_title_pos = NULL, grid_col_cnt = NULL,
                        card_title = NULL, card_title_pos = NULL, card_item_cnt = NULL
                    WHERE cnts_id = $1
                    """,
                    cnts_id,
                    sql,
                )

