import json
import logging
import re
from typing import Any

from langchain_core.tools import tool
from . import schema as schema_service

_TABLE_NAME_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")

logger = logging.getLogger(__name__)

_PREVIEW = 400


def _preview(text: str) -> str:
    t = text if isinstance(text, str) else repr(text)
    return t if len(t) <= _PREVIEW else t[:_PREVIEW] + "…"


@tool
async def get_tables() -> str:
    """테이블 목록과 설명을 반환합니다. 스키마 탐색 시 가장 먼저 호출하세요."""
    logger.info("[tool] get_tables 호출")
    tables = await schema_service.get_tables()
    out = json.dumps(tables)
    logger.info("[tool] get_tables 완료: %s개 테이블, 미리보기=%s", len(tables), _preview(out))
    return out


def _parse_table_names_csv(table_names: str) -> list[str]:
    raw = [p.strip() for p in table_names.split(",") if p.strip()]
    return [p for p in raw if _TABLE_NAME_RE.match(p)]


@tool
async def get_full_schema() -> str:
    """public 스키마의 모든 테이블과 컬럼(이름·타입·코멘트)을 JSON 한 덩어리로 반환합니다."""
    logger.info("[tool] get_full_schema 호출")
    rows = await schema_service.get_full_schema()
    out = json.dumps(rows, ensure_ascii=False)
    logger.info(
        "[tool] get_full_schema 완료: %s개 테이블, 미리보기=%s",
        len(rows),
        _preview(out),
    )
    return out


@tool
async def get_columns_batch(table_names: str) -> str:
    """쉼표로 구분된 여러 테이블의 컬럼 정보를 한 번에 JSON으로 반환합니다. 예: tfrshman_enrl_stts,tstt_ind

    Args:
        table_names: 테이블 이름을 쉼표로 구분 (공백 무시)
    """
    logger.info("[tool] get_columns_batch 호출: %r", table_names)
    names = _parse_table_names_csv(table_names)
    if not names:
        return json.dumps(
            {"error": "유효한 테이블 이름이 없습니다. 영문/숫자/밑줄 식별자만 허용됩니다."},
            ensure_ascii=False,
        )
    payload: list[dict[str, Any]] = []
    for name in names:
        cols = await schema_service.get_columns(name)
        payload.append({"table_name": name, "columns": cols})
    out = json.dumps(payload, ensure_ascii=False)
    logger.info(
        "[tool] get_columns_batch 완료: %s개 테이블, 미리보기=%s",
        len(names),
        _preview(out),
    )
    return out


@tool
async def get_columns(table_name: str) -> str:
    """특정 테이블의 컬럼 목록과 설명을 반환합니다.

    Args:
        table_name: 컬럼 정보를 가져올 테이블 이름
    """
    logger.info("[tool] get_columns 호출: table_name=%r", table_name)
    columns = await schema_service.get_columns(table_name)
    out = json.dumps(columns)
    logger.info(
        "[tool] get_columns 완료: %s개 컬럼, 미리보기=%s",
        len(columns),
        _preview(out),
    )
    return out


@tool
def execute_sql(sql: str) -> str:
    """생성된 SQL을 반환합니다. 실제 SQL 실행은 API 레벨에서 처리됩니다.

    Args:
        sql: 실행할 SQL 쿼리 문자열
    """
    logger.info("[tool] execute_sql 호출: SQL 미리보기=%s", _preview(sql.strip()))
    return sql
