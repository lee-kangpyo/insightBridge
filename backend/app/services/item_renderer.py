import json
from typing import Any, Optional

from app.services.contents import get_contents_master, get_contents_detail, execute_sql_preview
from app.services.screen_items import get_item


def _normalize_mapping_items(mapping_items: Any) -> list[dict]:
    if not mapping_items:
        return []
    if isinstance(mapping_items, list):
        return [item for item in mapping_items if item]
    if isinstance(mapping_items, dict):
        return [v for v in mapping_items.values() if v]
    return []


def _normalize_mapping_columns(mapping_columns: Any) -> list[dict]:
    if not mapping_columns:
        return []
    if isinstance(mapping_columns, list):
        return [col for col in mapping_columns if col]
    if isinstance(mapping_columns, dict):
        return [{"dataKey": k, **(v or {})} for k, v in mapping_columns.items() if v]
    return []


def _normalize_mapping_series(series: Any) -> list[dict]:
    if not series:
        return []
    if isinstance(series, list):
        return [s for s in series if s]
    if isinstance(series, dict):
        return [{"name": k, **(v or {})} for k, v in series.items() if v]
    return []


def _get_row_value(row: dict, field: str) -> Any:
    if not row or field is None:
        return None
    v = row.get(field)
    if v is None:
        return None
    return v


def _resolve_item_type(item: dict, shape_content: dict) -> Optional[str]:
    t = item.get("mapping_json", {}).get("type") if item.get("mapping_json") else None
    if t in ("chart", "grid", "card"):
        return t
    ct = shape_content.get("contentType") if shape_content else None
    if ct in ("chart", "grid", "card"):
        return ct
    return None


def _build_grid_model(item_type: str, item: dict, shape_content: dict, preview: dict) -> dict:
    if item_type != "grid":
        return {"columns": [], "rows": []}

    mj = item.get("mapping_json") if item else None
    m = mj.get("mapping", {}) if mj and isinstance(mj, dict) else {}
    if not m or not isinstance(m, dict):
        return {"columns": [], "rows": []}

    mapped_columns = _normalize_mapping_columns(m.get("columns"))
    usable_mappings = [
        {
            "dataKey": c.get("dataKey") if isinstance(c.get("dataKey"), str) else None,
            "field": c.get("field") if isinstance(c.get("field"), str) else None,
        }
        for c in mapped_columns
    ]
    usable_mappings = [m for m in usable_mappings if m["dataKey"] and m["field"]]

    if not usable_mappings:
        return {"columns": [], "rows": []}

    shape_cols = shape_content.get("data", {}).get("columns", []) if shape_content else []
    shape_by_key = {}
    for c in shape_cols:
        data_key = c.get("dataKey") or c.get("field")
        if not data_key:
            continue
        header = c.get("displayName") or c.get("header") or c.get("title") or data_key
        shape_by_key[str(data_key)] = {"header": str(header), "dataKey": str(data_key)}

    columns = []
    for mapping in usable_mappings:
        data_key = mapping["dataKey"]
        meta = shape_by_key.get(data_key)
        columns.append({"dataKey": data_key, "header": meta.get("header", data_key) if meta else data_key})

    sql_rows = preview.get("rows", []) if preview else []
    rows = []
    for row in sql_rows:
        out = {}
        for mapping in usable_mappings:
            out[mapping["dataKey"]] = _get_row_value(row, mapping["field"])
        rows.append(out)

    return {"columns": columns, "rows": rows}


def _build_chart_model(item_type: str, item: dict, shape_content: dict, preview: dict) -> dict:
    if item_type != "chart":
        return {"chartType": None, "data": [], "chartConfig": None}

    mj = item.get("mapping_json") if item else None
    chart_type = mj.get("chartType") if mj and isinstance(mj, dict) else None
    if not isinstance(chart_type, str) or not chart_type.strip():
        return {"chartType": None, "data": [], "chartConfig": None}

    mapping = mj.get("mapping", {}) if mj and isinstance(mj, dict) else {}
    if not mapping or not isinstance(mapping, dict):
        return {"chartType": chart_type, "data": [], "chartConfig": None}

    category_field = mapping.get("categoryField")
    series_list = _normalize_mapping_series(mapping.get("series"))

    if not isinstance(category_field, str) or not category_field.strip():
        return {"chartType": chart_type, "data": [], "chartConfig": None}

    sql_rows = preview.get("rows", []) if preview else []
    if not sql_rows:
        return {"chartType": chart_type, "data": [], "chartConfig": None}

    title = shape_content.get("data", {}).get("chartTitle") if shape_content else None
    if not title:
        title = item.get("item_nm", "") if item else ""

    long = []
    for row in sql_rows:
        category = _get_row_value(row, category_field)
        if category is None:
            continue

        if not series_list:
            continue

        for s in series_list:
            series_name = str(s.get("name") or s.get("label") or "").strip() or ""
            field = s.get("field")
            if not isinstance(field, str) or not field.strip():
                continue
            v = _get_row_value(row, field)
            long.append({
                "category": str(category),
                "series": series_name or field,
                "value": None if v is None else float(v),
            })

    data = long
    if not data:
        return {"chartType": chart_type, "data": [], "chartConfig": None}

    chart_config = {
        "type": chart_type,
        "title": title,
        "x": "category",
        "y": "value",
        "group": "series",
    }

    return {"chartType": chart_type, "data": data, "chartConfig": chart_config}


def _build_card_model(item_type: str, item: dict, shape_content: dict, preview: dict) -> Optional[dict]:
    rows = preview.get("rows", []) if preview else []
    row0 = rows[0] if rows else None

    if item_type != "card":
        return None

    mj = item.get("mapping_json") if item else None
    m = mj.get("mapping", {}) if mj and isinstance(mj, dict) else {}
    if not m or not isinstance(m, dict):
        return None
    if not row0:
        return None

    title = shape_content.get("data", {}).get("cardTitle") if shape_content else None
    if not title:
        title = item.get("item_nm", "카드") if item else "카드"
    sources = []

    if m.get("value") and isinstance(m.get("value"), str):
        v = _get_row_value(row0, m.get("value"))
        sources.append(f"mapping.value = {m.get('value')}")
        return {"title": title, "headline": v, "rows": [], "sources": sources}

    mapped_items = _normalize_mapping_items(m.get("items"))
    if not mapped_items:
        return None

    headline = None
    headline_taken = False
    out_rows = []

    shape_items = shape_content.get("data", {}).get("items", []) if shape_content else []

    for idx, it in enumerate(mapped_items[:12]):
        field = it.get("field") if isinstance(it.get("field"), str) else None
        label_raw = it.get("label") or (shape_items[idx].get("label") if idx < len(shape_items) and shape_items[idx] else "")
        label = str(label_raw) if isinstance(label_raw, str) else str(label_raw or "")
        label_trim = label.strip()
        v = _get_row_value(row0, field) if field else None

        if field:
            sources.append(f"mapping.items[{idx}].field = {field}")
        else:
            sources.append(f"mapping.items[{idx}]")

        if not label_trim and not headline_taken:
            headline = v
            headline_taken = True
            continue

        out_rows.append({
            "label": label if label_trim else "",
            "value": v,
            "kind": "labeled" if label_trim else "valueOnly",
        })

    return {"title": title, "headline": headline, "rows": out_rows, "sources": sources}


async def render_item(item_id: int) -> dict:
    """
    아이템을 조회하고, shape 콘텐츠와 SQL을 실행하여 렌더링 결과를 반환합니다.
    남겨진 정보는 렌더링에 필요한 최소 정볧만 포함합니다.
    """
    item = await get_item(item_id)
    if item is None:
        raise LookupError("item_not_found")

    # shape 콘텐츠 조회
    shape_content = None
    shape_cnts_id = item.get("shape_cnts_id")
    if shape_cnts_id:
        try:
            master = await get_contents_master(shape_cnts_id)
            detail = await get_contents_detail(shape_cnts_id, master.cnts_tp)
            shape_content = {
                "contentType": master.cnts_tp,
                "data": detail,
            }
        except LookupError:
            shape_content = None

    # SQL 실행
    preview = None
    sql_cnts_id = item.get("sql_cnts_id")
    if sql_cnts_id:
        try:
            preview = await execute_sql_preview(sql_cnts_id)
        except ValueError:
            preview = {"columns": [], "rows": []}

    # 타입 결정
    item_type = _resolve_item_type(item, shape_content or {})

    if not item_type:
        return {
            "item_id": item_id,
            "item_nm": item.get("item_nm", ""),
            "type": None,
        }

    # 타입별 변환
    if item_type == "chart":
        model = _build_chart_model(item_type, item, shape_content or {}, preview or {})
        return {
            "item_id": item_id,
            "item_nm": item.get("item_nm", ""),
            "type": "chart",
            "chartConfig": model.get("chartConfig"),
            "data": model.get("data", []),
        }

    if item_type == "grid":
        model = _build_grid_model(item_type, item, shape_content or {}, preview or {})
        return {
            "item_id": item_id,
            "item_nm": item.get("item_nm", ""),
            "type": "grid",
            "columns": model.get("columns", []),
            "rows": model.get("rows", []),
        }

    if item_type == "card":
        model = _build_card_model(item_type, item, shape_content or {}, preview or {})
        return {
            "item_id": item_id,
            "item_nm": item.get("item_nm", ""),
            "type": "card",
            "title": model.get("title") if model else item.get("item_nm", "카드"),
            "headline": model.get("headline") if model else None,
            "rows": model.get("rows", []) if model else [],
        }

    return {
        "item_id": item_id,
        "item_nm": item.get("item_nm", ""),
        "type": None,
    }
